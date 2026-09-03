// src/pages/admin/AdminUsersPage.jsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  UserCheck,
  UserX,
  UserPlus,
  X,
  ShieldCheck,
  RefreshCw,
  Users,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

import {
  initializeApp,
  getApps,
  getApp,
} from "firebase/app";

import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";

import { auth, db } from "../../services/firebase";

import {
  PERMISSIONS,
  ROLES,
  hasPermission,
  normalizeRole,
  getRoleLabel,
  canAdminManageRole,
} from "../../config/rolePermissions";

import {
  useStaffAuth,
} from "../../components/auth/StaffRoute";

import ProfileChangeRequestCard
  from "../../components/profile/ProfileChangeRequestCard";

import {
  approveContactChangeRequest,
  getPendingRequestsForApprover,
  rejectContactChangeRequest,
} from "../../services/contactChangeRequestService";


/*
|--------------------------------------------------------------------------
| ADMIN MANAGED ROLES
|--------------------------------------------------------------------------
|
| Administrator can create/manage only:
|
| - AUTHOR
| - EDITOR
|
| Administrator cannot create:
|
| - ADMINISTRATOR
| - SUPER_ADMIN
|
|--------------------------------------------------------------------------
*/

const MANAGED_ROLES = [
  ROLES.AUTHOR,
  ROLES.EDITOR,
];


/*
|--------------------------------------------------------------------------
| EMPTY CREATE FORM
|--------------------------------------------------------------------------
*/

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: ROLES.AUTHOR,
};


/*
|--------------------------------------------------------------------------
| SECONDARY AUTH
|--------------------------------------------------------------------------
|
| Firebase Auth signs the newly created account in automatically.
|
| We must NOT replace the currently logged-in Administrator.
|
| Therefore a secondary Firebase Auth instance is used only for
| creating the new staff account.
|
|--------------------------------------------------------------------------
*/

function getSecondaryAuth() {

  if (!auth) {
    throw new Error(
      "Firebase Authentication is not configured."
    );
  }

  const appName =
    "newsroom-admin-user-creator";

  const existingApp =
    getApps().find(
      (app) =>
        app.name === appName
    );

  const secondaryApp =
    existingApp ||
    initializeApp(
      auth.app.options,
      appName
    );

  return getAuth(
    secondaryApp
  );
}


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function AdminUsersPage() {

  const {
    role,
    profile,
  } = useStaffAuth();


  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [
    users,
    setUsers,
  ] = useState([]);


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    roleFilter,
    setRoleFilter,
  ] = useState("ALL");


  const [
    statusFilter,
    setStatusFilter,
  ] = useState("ALL");


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    message,
    setMessage,
  ] = useState("");


  const [
    showCreate,
    setShowCreate,
  ] = useState(false);


  const [
    creating,
    setCreating,
  ] = useState(false);


  const [
    showPassword,
    setShowPassword,
  ] = useState(false);


  const [
    form,
    setForm,
  ] = useState(
    EMPTY_FORM
  );

  /* ==========================================================
     CONTACT CHANGE REQUESTS
  ========================================================== */

  const [
    pendingRequests,
    setPendingRequests,
  ] = useState([]);


  const [
    requestsLoading,
    setRequestsLoading,
  ] = useState(true);


  const [
    requestActionLoading,
    setRequestActionLoading,
  ] = useState("");


  /*
  |--------------------------------------------------------------------------
  | PERMISSION CHECKS
  |--------------------------------------------------------------------------
  */

  const canReadUsers =
    hasPermission(
      role,
      PERMISSIONS.USERS_READ
    );


  const canCreateUsers =
    hasPermission(
      role,
      PERMISSIONS.USERS_CREATE
    );


  const canUpdateUsers =
    hasPermission(
      role,
      PERMISSIONS.USERS_UPDATE_ANY
    );


  const canChangeRoles =
    hasPermission(
      role,
      PERMISSIONS.USERS_ROLE_CHANGE
    );


  /*
  |--------------------------------------------------------------------------
  | CURRENT CONTACT-CHANGE APPROVER
  |--------------------------------------------------------------------------
  */

  function getCurrentApprover() {

    const uid =
      auth?.currentUser?.uid ||
      profile?.uid ||
      profile?.id ||
      "";


    return {
      uid,

      id: uid,

      name:
        profile?.name ||
        profile?.displayName ||
        auth?.currentUser?.displayName ||
        auth?.currentUser?.email ||
        "Administrator",

      displayName:
        profile?.displayName ||
        profile?.name ||
        auth?.currentUser?.displayName ||
        "",

      email:
        profile?.email ||
        auth?.currentUser?.email ||
        "",

      role:
        normalizeRole(
          role ||
          profile?.role ||
          ""
        ),
    };
  }


  /*
  |--------------------------------------------------------------------------
  | LOAD USERS
  |--------------------------------------------------------------------------
  */

  async function loadUsers(
    isRefresh = false
  ) {

    if (!canReadUsers) {
      setLoading(false);
      return;
    }

    try {

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const usersQuery =
        query(
          collection(
            db,
            "users"
          ),
          orderBy(
            "createdAt",
            "desc"
          )
        );

      const snapshot =
        await getDocs(
          usersQuery
        );


      const items =
        snapshot.docs.map(
          (item) => ({
            id: item.id,
            ...item.data(),
          })
        );


      setUsers(items);

    } catch (err) {

      /*
      |--------------------------------------------------------------------------
      | FALLBACK
      |--------------------------------------------------------------------------
      |
      | If createdAt does not exist on old records, load normally.
      |
      |--------------------------------------------------------------------------
      */

      try {

        const snapshot =
          await getDocs(
            collection(
              db,
              "users"
            )
          );


        setUsers(
          snapshot.docs.map(
            (item) => ({
              id: item.id,
              ...item.data(),
            })
          )
        );

      } catch (fallbackError) {

        console.error(
          "Users error:",
          fallbackError
        );

        setError(
          fallbackError?.message ||
          err?.message ||
          "Unable to load users."
        );

      }

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  }


  useEffect(() => {

    loadUsers();

  }, [canReadUsers]);

  /* ==========================================================
     LOAD PENDING CONTACT CHANGE REQUESTS

     ADMIN CAN HANDLE ONLY:
     - AUTHOR
     - EDITOR
  ========================================================== */

  async function loadPendingRequests() {

    try {

      setRequestsLoading(true);

      const approver = {

        uid:
          auth?.currentUser?.uid ||
          profile?.uid ||
          profile?.id ||
          "",

        name:
          profile?.name ||
          profile?.displayName ||
          auth?.currentUser?.displayName ||
          auth?.currentUser?.email ||
          "Administrator",

        displayName:
          profile?.displayName ||
          profile?.name ||
          auth?.currentUser?.displayName ||
          "",

        email:
          profile?.email ||
          auth?.currentUser?.email ||
          "",

        role,

      };


      if (!approver.uid) {

        setPendingRequests([]);

        return;

      }


      const requests =
        await getPendingRequestsForApprover({

          approver,

        });


      setPendingRequests(

        Array.isArray(requests)

          ? requests

          : []

      );

    } catch (err) {

      console.error(
        "Pending contact change requests error:",
        err
      );

      setError(
        err?.message ||
        "Unable to load pending contact change requests."
      );

    } finally {

      setRequestsLoading(false);

    }

  }


  useEffect(() => {

    if (

      normalizeRole(role) !==
      ROLES.ADMIN

    ) {

      setPendingRequests([]);
      setRequestsLoading(false);

      return;

    }


    loadPendingRequests();

  }, [

    role,

    profile?.uid,

    profile?.id,

  ]);


  /* ==========================================================
     APPROVE CONTACT CHANGE REQUEST
  ========================================================== */

  async function handleApproveRequest(
    request
  ) {

    if (!request?.id) {
      return;
    }


    const confirmed =
      window.confirm(
        "Are you sure you want to approve this contact change request?"
      );


    if (!confirmed) {
      return;
    }


    try {

      setError("");
      setMessage("");
      setRequestActionLoading(request.id);


      const approver =
        getCurrentApprover();


      if (!approver.uid) {
        throw new Error(
          "Unable to identify the current Administrator."
        );
      }


      await approveContactChangeRequest({
        requestId: request.id,
        approver,
      });


      setMessage(
        "Contact change request approved successfully."
      );


      await Promise.all([
        loadPendingRequests(),
        loadUsers(true),
      ]);

    } catch (err) {

      console.error(
        "Unable to approve contact change request:",
        err
      );

      setError(
        err?.message ||
        "Unable to approve the contact change request."
      );

    } finally {

      setRequestActionLoading("");

    }
  }


  /* ==========================================================
     REJECT CONTACT CHANGE REQUEST
  ========================================================== */

  async function handleRejectRequest(
    request,
    rejectionReason = ""
  ) {

    if (!request?.id) {
      return;
    }


    try {

      setError("");
      setMessage("");
      setRequestActionLoading(request.id);


      const approver =
        getCurrentApprover();


      if (!approver.uid) {
        throw new Error(
          "Unable to identify the current Administrator."
        );
      }


      await rejectContactChangeRequest({
        requestId: request.id,
        approver,
        rejectionReason:
          String(rejectionReason || "").trim(),
      });


      setMessage(
        "Contact change request rejected successfully."
      );


      await loadPendingRequests();

    } catch (err) {

      console.error(
        "Unable to reject contact change request:",
        err
      );

      setError(
        err?.message ||
        "Unable to reject the contact change request."
      );

    } finally {

      setRequestActionLoading("");

    }
  }


  /* ==========================================================
     VIEW REQUEST USER
  ========================================================== */

  function handleViewRequestUser(
    request
  ) {

    if (!request?.userId) {
      return;
    }


    const requestUser =
      users.find(
        (user) =>
          user.id === request.userId ||
          user.uid === request.userId
      );


    if (requestUser) {
      setSearch(
        requestUser.email ||
        requestUser.name ||
        requestUser.displayName ||
        ""
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | FILTER USERS
  |--------------------------------------------------------------------------
  */

  const filtered =
    useMemo(() => {

      const normalizedSearch =
        search
          .trim()
          .toLowerCase();


      return users.filter(
        (user) => {

          const name =
            (
              user.name ||
              user.displayName ||
              ""
            )
              .toLowerCase();


          const email =
            (
              user.email ||
              ""
            )
              .toLowerCase();


          const userRole =
            normalizeRole(
              user.role
            );


          const roleLabel =
            getRoleLabel(
              userRole
            ).toLowerCase();


          const matchesSearch =
            !normalizedSearch ||
            name.includes(
              normalizedSearch
            ) ||
            email.includes(
              normalizedSearch
            ) ||
            roleLabel.includes(
              normalizedSearch
            );


          const matchesRole =
            roleFilter === "ALL" ||
            userRole ===
              roleFilter;


          const disabled =
            user.disabled === true ||
            user.status ===
              "DISABLED";


          const matchesStatus =
            statusFilter === "ALL" ||
            (
              statusFilter ===
                "ACTIVE" &&
              !disabled
            ) ||
            (
              statusFilter ===
                "DISABLED" &&
              disabled
            );


          return (
            matchesSearch &&
            matchesRole &&
            matchesStatus
          );

        }
      );

    }, [
      users,
      search,
      roleFilter,
      statusFilter,
    ]);


  /*
  |--------------------------------------------------------------------------
  | STATISTICS
  |--------------------------------------------------------------------------
  */

  const statistics =
    useMemo(() => {

      const total =
        users.length;


      const active =
        users.filter(
          (user) =>
            user.disabled !== true &&
            user.status !==
              "DISABLED"
        ).length;


      const disabled =
        total - active;


      const authors =
        users.filter(
          (user) =>
            normalizeRole(
              user.role
            ) === ROLES.AUTHOR
        ).length;


      const editors =
        users.filter(
          (user) =>
            normalizeRole(
              user.role
            ) === ROLES.EDITOR
        ).length;


      return {
        total,
        active,
        disabled,
        authors,
        editors,
      };

    }, [users]);


  /*
  |--------------------------------------------------------------------------
  | FORM HANDLER
  |--------------------------------------------------------------------------
  */

  function updateForm(
    field,
    value
  ) {

    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );

  }


  /*
  |--------------------------------------------------------------------------
  | OPEN CREATE
  |--------------------------------------------------------------------------
  */

  function openCreate() {

    setError("");
    setMessage("");

    setForm(
      EMPTY_FORM
    );

    setShowPassword(false);
    setShowCreate(true);

  }


  /*
  |--------------------------------------------------------------------------
  | CLOSE CREATE
  |--------------------------------------------------------------------------
  */

  function closeCreate() {

    if (creating) {
      return;
    }

    setShowCreate(false);
    setForm(
      EMPTY_FORM
    );
    setShowPassword(false);

  }


  /*
  |--------------------------------------------------------------------------
  | PASSWORD VALIDATION
  |--------------------------------------------------------------------------
  */

  function validateCreateForm() {

    if (
      !form.name.trim()
    ) {
      return "Staff member name is required.";
    }


    if (
      !form.email.trim()
    ) {
      return "Email address is required.";
    }


    if (
      !form.password
    ) {
      return "Temporary password is required.";
    }


    if (
      form.password.length < 6
    ) {
      return "Password must contain at least 6 characters.";
    }


    const selectedRole =
      normalizeRole(
        form.role
      );


    if (
      !canAdminManageRole(
        selectedRole
      )
    ) {
      return "Administrator can create only Author and Editor accounts.";
    }


    if (
      !MANAGED_ROLES.includes(
        selectedRole
      )
    ) {
      return "Invalid staff role.";
    }


    return "";

  }


  /*
  |--------------------------------------------------------------------------
  | CREATE AUTHOR / EDITOR
  |--------------------------------------------------------------------------
  */

  async function createStaffAccount(
    event
  ) {

    event.preventDefault();


    if (!canCreateUsers) {

      setError(
        "You do not have permission to create staff accounts."
      );

      return;
    }


    const validation =
      validateCreateForm();


    if (validation) {

      setError(
        validation
      );

      return;
    }


    setCreating(true);
    setError("");
    setMessage("");


    const selectedRole =
      normalizeRole(
        form.role
      );


    let secondaryAuth = null;
    let createdFirebaseUser = null;


    try {

      /*
      |--------------------------------------------------------------------------
      | SECONDARY AUTH
      |--------------------------------------------------------------------------
      */

      secondaryAuth =
        getSecondaryAuth();


      /*
      |--------------------------------------------------------------------------
      | CREATE FIREBASE AUTH ACCOUNT
      |--------------------------------------------------------------------------
      */

      const result =
        await createUserWithEmailAndPassword(
          secondaryAuth,
          form.email.trim(),
          form.password
        );


      createdFirebaseUser =
        result.user;


      /*
      |--------------------------------------------------------------------------
      | UPDATE AUTH PROFILE
      |--------------------------------------------------------------------------
      */

      await updateProfile(
        createdFirebaseUser,
        {
          displayName:
            form.name.trim(),
        }
      );


      /*
      |--------------------------------------------------------------------------
      | CREATE FIRESTORE PROFILE
      |--------------------------------------------------------------------------
      */

      await setDoc(
        doc(
          db,
          "users",
          createdFirebaseUser.uid
        ),
        {
          uid:
            createdFirebaseUser.uid,

          id:
            createdFirebaseUser.uid,

          name:
            form.name.trim(),

          displayName:
            form.name.trim(),

          email:
            form.email.trim(),

          role:
            selectedRole,

          roleName:
            selectedRole,

          status:
            "ACTIVE",

          disabled:
            false,

          isStaff:
            true,

          isAdmin:
            false,

          isSuperAdmin:
            false,

          createdByUid:
            auth?.currentUser?.uid ||
            profile?.uid ||
            profile?.id ||
            "",

          createdBy:
            profile?.name ||
            profile?.displayName ||
            auth?.currentUser?.email ||
            "Administrator",

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );


      /*
      |--------------------------------------------------------------------------
      | SIGN OUT SECONDARY AUTH
      |--------------------------------------------------------------------------
      */

      await signOut(
        secondaryAuth
      );


      /*
      |--------------------------------------------------------------------------
      | SUCCESS
      |--------------------------------------------------------------------------
      */

      setMessage(
        `${getRoleLabel(
          selectedRole
        )} account created successfully.`
      );


      setForm(
        EMPTY_FORM
      );

      setShowCreate(false);


      await loadUsers(
        true
      );

    } catch (err) {

      console.error(
        "Create staff account error:",
        err
      );


      /*
      |--------------------------------------------------------------------------
      | CLEAN SECONDARY AUTH
      |--------------------------------------------------------------------------
      */

      try {

        if (secondaryAuth) {
          await signOut(
            secondaryAuth
          );
        }

      } catch {
        // Ignore secondary sign-out failure.
      }


      /*
      |--------------------------------------------------------------------------
      | CLEANUP FIRESTORE PROFILE
      |--------------------------------------------------------------------------
      |
      | We intentionally do not delete Firebase Auth users from the client.
      | If Firestore creation fails, the Auth account may remain and can
      | be handled from Firebase Authentication/Admin SDK.
      |
      |--------------------------------------------------------------------------
      */

      setError(
        err?.code ===
          "auth/email-already-in-use"
          ? "An account already exists with this email address."
          : err?.code ===
              "auth/invalid-email"
            ? "Please enter a valid email address."
            : err?.code ===
                "auth/weak-password"
              ? "The password is too weak."
              : err?.message ||
                "Unable to create staff account."
      );

    } finally {

      setCreating(false);

    }
  }


  /*
  |--------------------------------------------------------------------------
  | CHANGE STATUS
  |--------------------------------------------------------------------------
  */

  async function changeStatus(
    userId,
    status
  ) {

    if (!canUpdateUsers) {

      setError(
        "You do not have permission to update users."
      );

      return;
    }


    try {

      setError("");
      setMessage("");


      const disabled =
        status ===
        "DISABLED";


      await updateDoc(
        doc(
          db,
          "users",
          userId
        ),
        {
          status,
          disabled,
          updatedAt:
            serverTimestamp(),
        }
      );


      setMessage(
        disabled
          ? "User account disabled."
          : "User account activated."
      );


      await loadUsers(
        true
      );

    } catch (err) {

      console.error(
        "Status update error:",
        err
      );


      setError(
        err?.message ||
        "Unable to update user status."
      );

    }

  }


  /*
  |--------------------------------------------------------------------------
  | CHANGE ROLE
  |--------------------------------------------------------------------------
  |
  | Administrator can ONLY move users between:
  |
  | AUTHOR <-> EDITOR
  |
  | It cannot assign:
  |
  | ADMINISTRATOR
  | SUPER_ADMIN
  |
  |--------------------------------------------------------------------------
  */

  async function changeRole(
    userId,
    newRole,
    currentUser
  ) {

    if (!canChangeRoles) {

      setError(
        "You do not have permission to change user roles."
      );

      return;
    }


    const normalizedRole =
      normalizeRole(
        newRole
      );


    if (
      !canAdminManageRole(
        normalizedRole
      )
    ) {

      setError(
        "Administrator can assign only Author or Editor roles."
      );

      return;
    }


    const currentRole =
      normalizeRole(
        currentUser.role
      );


    if (
      currentRole ===
        ROLES.SUPER_ADMIN ||
      currentRole ===
        ROLES.ADMIN
    ) {

      setError(
        "Administrator cannot modify Administrator or Super Administrator roles."
      );

      return;
    }


    if (
      currentRole ===
      normalizedRole
    ) {
      return;
    }


    try {

      setError("");
      setMessage("");


      await updateDoc(
        doc(
          db,
          "users",
          userId
        ),
        {
          role:
            normalizedRole,

          roleName:
            normalizedRole,

          updatedAt:
            serverTimestamp(),
        }
      );


      setMessage(
        `User role changed to ${getRoleLabel(
          normalizedRole
        )}.`
      );


      await loadUsers(
        true
      );

    } catch (err) {

      console.error(
        "Role update error:",
        err
      );


      setError(
        err?.message ||
        "Unable to change user role."
      );

    }

  }


  /*
  |--------------------------------------------------------------------------
  | NOT AUTHORIZED
  |--------------------------------------------------------------------------
  */

  if (!canReadUsers) {

    return (
      <div className="staff-page">

        <div className="staff-page-header">

          <div>

            <span className="staff-eyebrow">
              USER MANAGEMENT
            </span>

            <h1>
              Users
            </h1>

            <p>
              You do not have permission to view users.
            </p>

          </div>

        </div>

        <div className="staff-panel">

          <div
            style={{
              padding: "50px",
              textAlign: "center",
            }}
          >

            <ShieldCheck
              size={40}
            />

            <h3>
              Access restricted
            </h3>

            <p>
              Your current role does not have user-management access.
            </p>

          </div>

        </div>

      </div>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="staff-page">

      {/* ==========================================================
          HEADER
      ========================================================== */}

      <div className="staff-page-header">

        <div>

          <span className="staff-eyebrow">
            USER MANAGEMENT
          </span>

          <h1>
            Users & Staff
          </h1>

          <p>
            Manage newsroom users and create Author and Editor accounts.
          </p>

        </div>


        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >

          <button
            type="button"
            className="staff-secondary"
            onClick={() =>
              loadUsers(true)
            }
            disabled={refreshing}
          >

            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "staff-spin"
                  : ""
              }
            />

            Refresh

          </button>


          {canCreateUsers && (
            <button
              type="button"
              className="staff-primary"
              onClick={
                openCreate
              }
            >

              <UserPlus
                size={17}
              />

              New Author / Editor

            </button>
          )}

        </div>

      </div>


      {/* ==========================================================
          ALERTS
      ========================================================== */}

      {error && (
        <div
          className="staff-alert staff-alert-error"
          role="alert"
        >
          {error}
        </div>
      )}


      {message && (
        <div
          className="staff-alert staff-alert-success"
          role="status"
        >
          {message}
        </div>
      )}


      {/* ==========================================================
          PENDING CONTACT CHANGE REQUESTS
      ========================================================== */}

      <div
        className="staff-panel"
        style={{
          marginBottom:
            "20px",
        }}
      >

        <div
          style={{
            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "space-between",

            gap:
              "12px",

            flexWrap:
              "wrap",

            marginBottom:
              "16px",
          }}
        >

          <div>

            <span className="staff-eyebrow">

              PENDING APPROVALS

            </span>


            <h2
              style={{
                margin:
                  "4px 0 0",

                fontSize:
                  "20px",
              }}
            >

              Contact Change Requests

            </h2>


            <p
              style={{
                margin:
                  "6px 0 0",

                color:
                  "#71809a",
              }}
            >

              Review email and phone number changes requested by Authors and Editors.

            </p>

          </div>


          <button
            type="button"
            className="staff-secondary"
            onClick={
              loadPendingRequests
            }
            disabled={
              requestsLoading
            }
          >

            <RefreshCw
              size={16}
              className={
                requestsLoading
                  ? "staff-spin"
                  : ""
              }
            />

            Refresh requests

          </button>

        </div>


        {requestsLoading ? (

          <div
            style={{
              padding:
                "24px 0",

              color:
                "#71809a",
            }}
          >

            Loading pending requests...

          </div>

        ) : pendingRequests.length === 0 ? (

          <div
            style={{
              padding:
                "18px",

              border:
                "1px dashed #d9e1ec",

              borderRadius:
                "10px",

              color:
                "#71809a",
            }}
          >

            No pending contact change requests.

          </div>

        ) : (

          <div
            style={{
              display:
                "grid",

              gap:
                "14px",
            }}
          >

            {pendingRequests.map(

              (request) => (

                <ProfileChangeRequestCard

                  key={
                    request.id
                  }

                  request={{
                    ...request,

                    /* Normalize service request fields for the preview card.
                       The service stores one contact change per request as:
                       type + currentValue + requestedValue. */
                    emailChanged:
                      String(request?.type || "").toUpperCase() === "EMAIL",

                    phoneChanged:
                      String(request?.type || "").toUpperCase() === "PHONE",

                    currentEmail:
                      String(request?.type || "").toUpperCase() === "EMAIL"
                        ? (request.currentValue || request.userEmail || "")
                        : "",

                    requestedEmail:
                      String(request?.type || "").toUpperCase() === "EMAIL"
                        ? (request.requestedValue || "")
                        : "",

                    currentPhone:
                      String(request?.type || "").toUpperCase() === "PHONE"
                        ? (request.currentValue || request.currentPhone || "")
                        : "",

                    requestedPhone:
                      String(request?.type || "").toUpperCase() === "PHONE"
                        ? (request.requestedValue || "")
                        : "",
                  }}

                  loading={

                    requestActionLoading ===
                    request.id

                  }

                  onApprove={
                    handleApproveRequest
                  }

                  onReject={
                    handleRejectRequest
                  }

                  onViewUser={
                    handleViewRequestUser
                  }

                />

              )

            )}

          </div>

        )}

      </div>


      {/* ==========================================================
          STATISTICS
      ========================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "14px",
          marginBottom: "20px",
        }}
      >

        <div className="staff-panel">

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >

            <Users
              size={22}
            />

            <div>

              <strong
                style={{
                  display: "block",
                  fontSize: "22px",
                }}
              >
                {statistics.total}
              </strong>

              <span>
                Total users
              </span>

            </div>

          </div>

        </div>


        <div className="staff-panel">

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >

            <UserCheck
              size={22}
            />

            <div>

              <strong
                style={{
                  display: "block",
                  fontSize: "22px",
                }}
              >
                {statistics.active}
              </strong>

              <span>
                Active
              </span>

            </div>

          </div>

        </div>


        <div className="staff-panel">

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >

            <ShieldCheck
              size={22}
            />

            <div>

              <strong
                style={{
                  display: "block",
                  fontSize: "22px",
                }}
              >
                {statistics.editors}
              </strong>

              <span>
                Editors
              </span>

            </div>

          </div>

        </div>


        <div className="staff-panel">

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >

            <UserPlus
              size={22}
            />

            <div>

              <strong
                style={{
                  display: "block",
                  fontSize: "22px",
                }}
              >
                {statistics.authors}
              </strong>

              <span>
                Authors
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* ==========================================================
          USER TABLE
      ========================================================== */}

      <div className="staff-panel">

        <div className="staff-toolbar">

          <div className="staff-search-box">

            <Search
              size={18}
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search name, email or role..."
            />

          </div>


          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(
                event.target.value
              )
            }
            className="staff-select"
          >

            <option value="ALL">
              All roles
            </option>

            <option value={ROLES.AUTHOR}>
              Authors
            </option>

            <option value={ROLES.EDITOR}>
              Editors
            </option>

            <option value={ROLES.ADMIN}>
              Administrators
            </option>

            <option value={ROLES.SUPER_ADMIN}>
              Super Administrators
            </option>

            <option value={ROLES.USER}>
              Registered Users
            </option>

          </select>


          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="staff-select"
          >

            <option value="ALL">
              All statuses
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="DISABLED">
              Disabled
            </option>

          </select>

        </div>


        <div className="staff-table-wrapper">

          <table className="staff-table">

            <thead>

              <tr>

                <th>
                  User
                </th>

                <th>
                  Email
                </th>

                <th>
                  Role
                </th>

                <th>
                  Status
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                    }}
                  >
                    Loading users...
                  </td>

                </tr>

              ) : filtered.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                    }}
                  >
                    No users found.
                  </td>

                </tr>

              ) : (

                filtered.map(
                  (user) => {

                    const normalizedUserRole =
                      normalizeRole(
                        user.role
                      );


                    const disabled =
                      user.disabled ===
                        true ||
                      user.status ===
                        "DISABLED";


                    const canModifyTarget =
                      normalizedUserRole !==
                        ROLES.ADMIN &&
                      normalizedUserRole !==
                        ROLES.SUPER_ADMIN;


                    return (
                      <tr
                        key={
                          user.id
                        }
                      >

                        <td>

                          <strong>
                            {user.name ||
                              user.displayName ||
                              "Unnamed User"}
                          </strong>

                        </td>


                        <td>

                          {user.email ||
                            "-"}

                        </td>


                        <td>

                          {canChangeRoles &&
                          canModifyTarget ? (

                            <select
                              value={
                                normalizedUserRole
                              }
                              onChange={(event) =>
                                changeRole(
                                  user.id,
                                  event.target.value,
                                  user
                                )
                              }
                              className="staff-select"
                              style={{
                                minWidth:
                                  "150px",
                              }}
                            >

                              <option
                                value={
                                  ROLES.AUTHOR
                                }
                              >
                                Author / Reporter
                              </option>

                              <option
                                value={
                                  ROLES.EDITOR
                                }
                              >
                                Editor
                              </option>

                              {normalizedUserRole ===
                                ROLES.USER && (
                                <option
                                  value={
                                    ROLES.USER
                                  }
                                >
                                  Registered User
                                </option>
                              )}

                            </select>

                          ) : (

                            <span>
                              {getRoleLabel(
                                normalizedUserRole
                              )}
                            </span>

                          )}

                        </td>


                        <td>

                          <span
                            className={
                              disabled
                                ? "staff-status staff-status-disabled"
                                : "staff-status staff-status-active"
                            }
                          >
                            {disabled
                              ? "DISABLED"
                              : "ACTIVE"}
                          </span>

                        </td>


                        <td>

                          {canUpdateUsers &&
                          canModifyTarget ? (

                            <div className="staff-row-actions">

                              {!disabled ? (

                                <button
                                  type="button"
                                  onClick={() =>
                                    changeStatus(
                                      user.id,
                                      "DISABLED"
                                    )
                                  }
                                  title="Disable user"
                                >

                                  <UserX
                                    size={16}
                                  />

                                </button>

                              ) : (

                                <button
                                  type="button"
                                  onClick={() =>
                                    changeStatus(
                                      user.id,
                                      "ACTIVE"
                                    )
                                  }
                                  title="Activate user"
                                >

                                  <UserCheck
                                    size={16}
                                  />

                                </button>

                              )}

                            </div>

                          ) : (

                            <span
                              style={{
                                color:
                                  "#98a2b3",
                                fontSize:
                                  "12px",
                              }}
                            >
                              Protected
                            </span>

                          )}

                        </td>

                      </tr>
                    );

                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* ==========================================================
          CREATE STAFF MODAL
      ========================================================== */}

      {showCreate && (

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-staff-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background:
              "rgba(15, 23, 42, 0.48)",
            display: "grid",
            placeItems: "center",
            padding: "20px",
          }}
        >

          <div
            style={{
              width: "100%",
              maxWidth: "560px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: "16px",
              boxShadow:
                "0 24px 70px rgba(15,23,42,.20)",
            }}
          >

            {/* HEADER */}

            <div
              style={{
                padding:
                  "22px 24px",
                borderBottom:
                  "1px solid #e8edf3",
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "flex-start",
                gap: "15px",
              }}
            >

              <div>

                <span
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing:
                      "1.2px",
                    color: "#2463eb",
                    marginBottom:
                      "6px",
                  }}
                >
                  STAFF ACCOUNT
                </span>

                <h2
                  id="create-staff-title"
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    color:
                      "#152542",
                  }}
                >
                  Create Author / Editor
                </h2>

                <p
                  style={{
                    margin:
                      "7px 0 0",
                    color:
                      "#71809a",
                    fontSize:
                      "13px",
                    lineHeight:
                      1.5,
                  }}
                >
                  Create a newsroom staff account without affecting your current Administrator session.
                </p>

              </div>


              <button
                type="button"
                onClick={
                  closeCreate
                }
                disabled={
                  creating
                }
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius:
                    "8px",
                  border:
                    "1px solid #e2e8f0",
                  background:
                    "#fff",
                  display: "grid",
                  placeItems:
                    "center",
                  cursor:
                    creating
                      ? "not-allowed"
                      : "pointer",
                }}
              >

                <X
                  size={18}
                />

              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={
                createStaffAccount
              }
            >

              <div
                style={{
                  padding:
                    "24px",
                  display:
                    "grid",
                  gap:
                    "18px",
                }}
              >

                {/* NAME */}

                <label
                  style={{
                    display:
                      "grid",
                    gap:
                      "7px",
                  }}
                >

                  <span
                    style={{
                      fontSize:
                        "13px",
                      fontWeight:
                        700,
                      color:
                        "#344054",
                    }}
                  >
                    Full name
                  </span>

                  <input
                    type="text"
                    value={
                      form.name
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "name",
                        event.target
                          .value
                      )
                    }
                    placeholder="Enter staff member name"
                    autoComplete="name"
                    disabled={
                      creating
                    }
                    style={{
                      minHeight:
                        "42px",
                      padding:
                        "0 12px",
                      border:
                        "1px solid #d9e1ec",
                      borderRadius:
                        "8px",
                      outline:
                        "none",
                    }}
                  />

                </label>


                {/* EMAIL */}

                <label
                  style={{
                    display:
                      "grid",
                    gap:
                      "7px",
                  }}
                >

                  <span
                    style={{
                      fontSize:
                        "13px",
                      fontWeight:
                        700,
                      color:
                        "#344054",
                    }}
                  >
                    Email address
                  </span>

                  <div
                    style={{
                      position:
                        "relative",
                    }}
                  >

                    <Mail
                      size={17}
                      style={{
                        position:
                          "absolute",
                        left:
                          "12px",
                        top:
                          "50%",
                        transform:
                          "translateY(-50%)",
                        color:
                          "#98a2b3",
                      }}
                    />

                    <input
                      type="email"
                      value={
                        form.email
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "email",
                          event.target
                            .value
                        )
                      }
                      placeholder="staff@example.com"
                      autoComplete="email"
                      disabled={
                        creating
                      }
                      style={{
                        width:
                          "100%",
                        boxSizing:
                          "border-box",
                        minHeight:
                          "42px",
                        padding:
                          "0 12px 0 38px",
                        border:
                          "1px solid #d9e1ec",
                        borderRadius:
                          "8px",
                        outline:
                          "none",
                      }}
                    />

                  </div>

                </label>


                {/* ROLE */}

                <label
                  style={{
                    display:
                      "grid",
                    gap:
                      "7px",
                  }}
                >

                  <span
                    style={{
                      fontSize:
                        "13px",
                      fontWeight:
                        700,
                      color:
                        "#344054",
                    }}
                  >
                    Staff role
                  </span>

                  <select
                    value={
                      form.role
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "role",
                        event.target
                          .value
                      )
                    }
                    disabled={
                      creating
                    }
                    style={{
                      minHeight:
                        "42px",
                      padding:
                        "0 12px",
                      border:
                        "1px solid #d9e1ec",
                      borderRadius:
                        "8px",
                      background:
                        "#fff",
                    }}
                  >

                    <option
                      value={
                        ROLES.AUTHOR
                      }
                    >
                      Author / Reporter
                    </option>

                    <option
                      value={
                        ROLES.EDITOR
                      }
                    >
                      Editor
                    </option>

                  </select>

                  <span
                    style={{
                      fontSize:
                        "11px",
                      color:
                        "#7a879b",
                    }}
                  >
                    Administrators can create Authors and Editors only.
                  </span>

                </label>


                {/* PASSWORD */}

                <label
                  style={{
                    display:
                      "grid",
                    gap:
                      "7px",
                  }}
                >

                  <span
                    style={{
                      fontSize:
                        "13px",
                      fontWeight:
                        700,
                      color:
                        "#344054",
                    }}
                  >
                    Temporary password
                  </span>

                  <div
                    style={{
                      position:
                        "relative",
                    }}
                  >

                    <KeyRound
                      size={17}
                      style={{
                        position:
                          "absolute",
                        left:
                          "12px",
                        top:
                          "50%",
                        transform:
                          "translateY(-50%)",
                        color:
                          "#98a2b3",
                      }}
                    />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        form.password
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "password",
                          event.target
                            .value
                        )
                      }
                      placeholder="Minimum 6 characters"
                      autoComplete="new-password"
                      disabled={
                        creating
                      }
                      style={{
                        width:
                          "100%",
                        boxSizing:
                          "border-box",
                        minHeight:
                          "42px",
                        padding:
                          "0 42px 0 38px",
                        border:
                          "1px solid #d9e1ec",
                        borderRadius:
                          "8px",
                        outline:
                          "none",
                      }}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) =>
                            !value
                        )
                      }
                      disabled={
                        creating
                      }
                      style={{
                        position:
                          "absolute",
                        right:
                          "8px",
                        top:
                          "50%",
                        transform:
                          "translateY(-50%)",
                        border:
                          "none",
                        background:
                          "transparent",
                        cursor:
                          "pointer",
                        padding:
                          "6px",
                      }}
                    >

                      {showPassword ? (
                        <EyeOff
                          size={17}
                        />
                      ) : (
                        <Eye
                          size={17}
                        />
                      )}

                    </button>

                  </div>

                </label>


                {/* SECURITY NOTE */}

                <div
                  style={{
                    display:
                      "flex",
                    gap:
                      "10px",
                    padding:
                      "12px 14px",
                    borderRadius:
                      "9px",
                    background:
                      "#f5f8ff",
                    border:
                      "1px solid #dce7ff",
                    color:
                      "#475467",
                    fontSize:
                      "12px",
                    lineHeight:
                      1.5,
                  }}
                >

                  <ShieldCheck
                    size={18}
                    style={{
                      color:
                        "#2463eb",
                      flexShrink:
                        0,
                    }}
                  />

                  <span>
                    The new account will be stored as an active newsroom staff account. Give the temporary password securely to the staff member.
                  </span>

                </div>

              </div>


              {/* FOOTER */}

              <div
                style={{
                  padding:
                    "16px 24px 22px",
                  display:
                    "flex",
                  justifyContent:
                    "flex-end",
                  gap:
                    "10px",
                  borderTop:
                    "1px solid #edf1f6",
                }}
              >

                <button
                  type="button"
                  onClick={
                    closeCreate
                  }
                  disabled={
                    creating
                  }
                  className="staff-secondary"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={
                    creating
                  }
                  className="staff-primary"
                >

                  {creating ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="staff-spin"
                      />

                      Creating...

                    </>
                  ) : (
                    <>
                      <UserPlus
                        size={16}
                      />

                      Create account

                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}