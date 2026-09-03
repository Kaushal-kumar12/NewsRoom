// src/pages/superadmin/SuperAdminUsersPage.jsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";


import {

  Search,

  Users,

  UserCheck,

  UserX,

  ShieldCheck,

  RefreshCw,

  Mail,

  MoreHorizontal,

  Eye,

  Clock,

} from "lucide-react";


import {

  useNavigate,

} from "react-router-dom";


import {

  listUsers,

  updateUserStatus,

  ROLES,

} from "../../services/superAdminService";


import {

  useStaffAuth,

} from "../../components/auth/StaffRoute";


import {

  approveContactChangeRequest,

  getPendingRequestsForApprover,

  getUserRole,

  rejectContactChangeRequest,

} from "../../services/contactChangeRequestService";


import ProfileChangeRequestCard
  from "../../components/profile/ProfileChangeRequestCard";


/* ============================================================
   COMPONENT
============================================================ */

export default function SuperAdminUsersPage() {


  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const navigate =
    useNavigate();


  /* ==========================================================
     STAFF AUTH
  ========================================================== */

  const {

    user,

    profile,

    role,

  } =
    useStaffAuth();


  /* ==========================================================
     USER STATE
  ========================================================== */

  const [

    users,

    setUsers,

  ] =
    useState([]);


  const [

    error,

    setError,

  ] =
    useState("");


  const [

    message,

    setMessage,

  ] =
    useState("");


  const [

    loading,

    setLoading,

  ] =
    useState(true);


  const [

    search,

    setSearch,

  ] =
    useState("");


  const [

    statusFilter,

    setStatusFilter,

  ] =
    useState("all");


  const [

    openMenu,

    setOpenMenu,

  ] =
    useState(null);


  /* ==========================================================
     CONTACT CHANGE REQUEST STATE
  ========================================================== */

  const [

    pendingRequests,

    setPendingRequests,

  ] =
    useState([]);


  const [

    requestsLoading,

    setRequestsLoading,

  ] =
    useState(true);


  const [

    requestActionLoading,

    setRequestActionLoading,

  ] =
    useState("");


  /* ==========================================================
     LOAD USERS
  ========================================================== */

  async function loadUsers() {


    setLoading(true);


    setError("");


    try {


      const result =
        await listUsers();


      setUsers(

        Array.isArray(
          result
        )

          ? result

          : []

      );


    } catch (

      err

    ) {


      console.error(

        "Unable to load users:",

        err

      );


      setError(

        err?.message ||

        "Unable to load users."

      );


      setUsers([]);


    } finally {


      setLoading(false);

    }

  }


  /* ==========================================================
     LOAD USERS ON START
  ========================================================== */

  useEffect(() => {


    loadUsers();


  }, []);


  /* ==========================================================
     CURRENT APPROVER
  ========================================================== */

  const approver =
    useMemo(() => {


      const uid =

        user?.uid ||

        profile?.uid ||

        profile?.id ||

        "";


      const displayName =

        profile?.displayName ||

        profile?.name ||

        user?.displayName ||

        user?.email ||

        "Super Administrator";


      const email =

        profile?.email ||

        user?.email ||

        "";


      return {

        ...(user || {}),

        ...(profile || {}),


        uid,


        id:
          uid,


        displayName,


        name:
          displayName,


        email,


        role:

          role ||

          profile?.role ||

          "SUPER_ADMIN",

      };


    }, [

      user,

      profile,

      role,

    ]);


  /* ==========================================================
     LOAD PENDING CONTACT CHANGE REQUESTS

     SUPER ADMIN CAN HANDLE:

     AUTHOR
     EDITOR
     ADMIN
  ========================================================== */

  async function loadPendingRequests() {


    try {


      setRequestsLoading(true);


      if (

        !approver?.uid

      ) {


        setPendingRequests([]);

        return;

      }


      const approverRole =

        getUserRole(
          approver
        );


      if (

        approverRole !==
        "SUPER_ADMIN"

      ) {


        setPendingRequests([]);

        return;

      }


      const requests =

        await getPendingRequestsForApprover({

          approver,

        });


      setPendingRequests(

        Array.isArray(
          requests
        )

          ? requests

          : []

      );


    } catch (

      err

    ) {


      console.error(

        "Unable to load pending contact change requests:",

        err

      );


      setError(

        err?.message ||

        "Unable to load pending contact change requests."

      );


      setPendingRequests([]);


    } finally {


      setRequestsLoading(false);

    }

  }


  /* ==========================================================
     LOAD REQUESTS
  ========================================================== */

  useEffect(() => {


    if (

      !approver?.uid

    ) {


      setPendingRequests([]);


      setRequestsLoading(false);


      return;

    }


    loadPendingRequests();


  }, [

    approver?.uid,

    role,

  ]);


  /* ==========================================================
     REFRESH EVERYTHING
  ========================================================== */

  async function handleRefresh() {


    setMessage("");


    setError("");


    await Promise.all([

      loadUsers(),

      loadPendingRequests(),

    ]);

  }


  /* ==========================================================
     APPROVE CONTACT CHANGE REQUEST
  ========================================================== */

  async function handleApproveRequest(

    request

  ) {


    if (

      !request?.id

    ) {

      return;

    }


    const confirmed =

      window.confirm(

        "Are you sure you want to approve this contact change request?"

      );


    if (

      !confirmed

    ) {

      return;

    }


    try {


      setError("");


      setMessage("");


      setRequestActionLoading(

        request.id

      );


      await approveContactChangeRequest({

        requestId:

          request.id,


        approver,

      });


      setMessage(

        "Contact change request approved successfully."

      );


      await Promise.all([

        loadPendingRequests(),

        loadUsers(),

      ]);


    } catch (

      err

    ) {


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


    if (

      !request?.id

    ) {

      return;

    }


    try {


      setError("");


      setMessage("");


      setRequestActionLoading(

        request.id

      );


      await rejectContactChangeRequest({

        requestId:

          request.id,


        approver,


        rejectionReason,

      });


      setMessage(

        "Contact change request rejected successfully."

      );


      await loadPendingRequests();


    } catch (

      err

    ) {


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


    if (

      !request?.userId

    ) {

      return;

    }


    navigate(

      `/super-admin/users/${request.userId}`

    );

  }


  /* ==========================================================
     TOGGLE USER STATUS
  ========================================================== */

  async function toggleStatus(

    selectedUser

  ) {


    const disabled =

      selectedUser.disabled ===
      true;


    const action =

      disabled

        ? "enable"

        : "disable";


    const name =

      selectedUser.displayName ||

      selectedUser.name ||

      "this user";


    const confirmed =

      window.confirm(

        `Are you sure you want to ${action} ${name}'s account?`

      );


    if (

      !confirmed

    ) {

      return;

    }


    try {


      setError("");


      setMessage("");


      await updateUserStatus(

        selectedUser.id,

        !disabled

      );


      setMessage(

        `User account ${

          disabled

            ? "enabled"

            : "disabled"

        } successfully.`

      );


      await loadUsers();


    } catch (

      err

    ) {


      console.error(

        "Unable to update account status:",

        err

      );


      setError(

        err?.message ||

        "Unable to update account status."

      );

    }

  }


  /* ==========================================================
     FILTER USERS
  ========================================================== */

  const filteredUsers =
    useMemo(() => {


      const query =

        search

          .trim()

          .toLowerCase();


      return users.filter(

        (

          selectedUser

        ) => {


          const name =

            (

              selectedUser.displayName ||

              selectedUser.name ||

              ""

            )

              .toLowerCase();


          const email =

            (

              selectedUser.email ||

              ""

            )

              .toLowerCase();


          const userRole =

            (

              selectedUser.role ||

              ROLES.USER ||

              ""

            )

              .toLowerCase();


          const uid =

            (

              selectedUser.id ||

              selectedUser.uid ||

              ""

            )

              .toLowerCase();


          const matchesSearch =

            !query ||

            name.includes(
              query
            ) ||

            email.includes(
              query
            ) ||

            userRole.includes(
              query
            ) ||

            uid.includes(
              query
            );


          const matchesStatus =

            statusFilter ===
            "all"

            ||

            (

              statusFilter ===
              "active"

              &&

              selectedUser.disabled !==
              true

            )

            ||

            (

              statusFilter ===
              "disabled"

              &&

              selectedUser.disabled ===
              true

            );


          return (

            matchesSearch &&

            matchesStatus

          );

        }

      );


    }, [

      users,

      search,

      statusFilter,

    ]);


  /* ==========================================================
     STATISTICS
  ========================================================== */

  const totalUsers =

    users.length;


  const activeUsers =

    users.filter(

      (

        selectedUser

      ) =>

        selectedUser.disabled !==
        true

    ).length;


  const disabledUsers =

    users.filter(

      (

        selectedUser

      ) =>

        selectedUser.disabled ===
        true

    ).length;


  /* ==========================================================
     ROLE LABEL
  ========================================================== */

  function getRoleLabel(

    userRole

  ) {


    if (

      !userRole

    ) {

      return "REGISTERED USER";

    }


    return String(
      userRole
    )

      .replaceAll(
        "_",
        " "
      )

      .toUpperCase();

  }


  /* ==========================================================
     ROLE CLASS
  ========================================================== */

  function getRoleClass(

    userRole

  ) {


    const normalized =

      String(

        userRole ||

        ""

      )

        .toLowerCase();


    if (

      normalized.includes(
        "super"
      )

    ) {

      return "super-admin";

    }


    if (

      normalized.includes(
        "admin"
      )

    ) {

      return "admin";

    }


    if (

      normalized.includes(
        "editor"
      )

    ) {

      return "editor";

    }


    if (

      normalized.includes(
        "author"
      )

    ) {

      return "author";

    }


    return "user";

  }


  /* ==========================================================
     VIEW USER DETAILS
  ========================================================== */

  function viewDetails(

    selectedUser

  ) {


    setOpenMenu(
      null
    );


    navigate(

      `/super-admin/users/${selectedUser.id}`

    );

  }


  /* ==========================================================
     RENDER
  ========================================================== */

  return (

    <div className="sa-users-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sa-users-header">


        <div className="sa-users-heading">


          <span className="sa-users-eyebrow">

            DIRECTORY

          </span>


          <h1>

            All Users

          </h1>


          <p>

            Review platform accounts,
            roles, account status and
            pending contact change requests.

          </p>


        </div>


        <button

          type="button"

          className="sa-users-refresh"

          onClick={
            handleRefresh
          }

          disabled={

            loading ||

            requestsLoading

          }

        >


          <RefreshCw

            size={16}

            className={

              loading ||

              requestsLoading

                ? "sa-spin"

                : ""

            }

          />


          Refresh


        </button>


      </header>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="sa-users-alert">


          <strong>

            Something went wrong

          </strong>


          <span>

            {error}

          </span>


        </div>

      )}


      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {message && (

        <div className="sa-users-alert">


          <strong>

            Update successful

          </strong>


          <span>

            {message}

          </span>


        </div>

      )}


      {/* =====================================================
          PENDING CONTACT CHANGE REQUESTS
      ===================================================== */}

      <section

        className="sa-users-panel"

        style={{

          marginBottom:
            "24px",

        }}

      >


        <div className="sa-users-toolbar">


          <div className="sa-users-toolbar-title">


            <div className="sa-users-panel-icon">


              <Clock
                size={18}
              />


            </div>


            <div>


              <h2>

                Pending Contact Change Requests

              </h2>


              <span>

                Super Administrators can approve requests from
                Authors, Editors and Administrators.

              </span>


            </div>


          </div>


          <button

            type="button"

            className="sa-users-refresh"

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

                  ? "sa-spin"

                  : ""

              }

            />


            Refresh Requests


          </button>


        </div>


        {requestsLoading ? (

          <div

            className="sa-users-state"

            style={{

              padding:
                "32px",

            }}

          >


            <RefreshCw

              size={20}

              className="sa-spin"

            />


            <span>

              Loading pending requests...

            </span>


          </div>

        ) : pendingRequests.length === 0 ? (

          <div

            className="sa-users-state"

            style={{

              padding:
                "32px",

            }}

          >


            <div className="sa-users-empty">


              <div className="sa-users-empty-icon">


                <Clock
                  size={24}
                />


              </div>


              <strong>

                No pending contact change requests

              </strong>


              <span>

                All contact change requests have been processed.

              </span>


            </div>


          </div>

        ) : (

          <div

            style={{

              display:
                "grid",

              gap:
                "16px",

              paddingTop:
                "16px",

            }}

          >


            {pendingRequests.map(

              (

                request

              ) => (

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


      </section>


      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <section className="sa-users-summary">


        <div className="sa-users-summary-card">


          <div className="sa-users-summary-icon users">

            <Users
              size={19}
            />

          </div>


          <div>


            <span>

              Total Users

            </span>


            <strong>

              {totalUsers}

            </strong>


          </div>


        </div>


        <div className="sa-users-summary-card">


          <div className="sa-users-summary-icon active">

            <UserCheck
              size={19}
            />

          </div>


          <div>


            <span>

              Active Accounts

            </span>


            <strong>

              {activeUsers}

            </strong>


          </div>


        </div>


        <div className="sa-users-summary-card">


          <div className="sa-users-summary-icon disabled">

            <UserX
              size={19}
            />

          </div>


          <div>


            <span>

              Disabled Accounts

            </span>


            <strong>

              {disabledUsers}

            </strong>


          </div>


        </div>


      </section>


      {/* =====================================================
          USER DIRECTORY
      ===================================================== */}

      <section className="sa-users-panel">


        <div className="sa-users-toolbar">


          <div className="sa-users-toolbar-title">


            <div className="sa-users-panel-icon">

              <Users
                size={18}
              />

            </div>


            <div>


              <h2>

                User Directory

              </h2>


              <span>

                {filteredUsers.length}{" "}

                {filteredUsers.length === 1

                  ? "account"

                  : "accounts"}{" "}

                shown

              </span>


            </div>


          </div>


          <div className="sa-users-controls">


            <div className="sa-users-search">


              <Search
                size={17}
              />


              <input

                type="search"

                placeholder="Search users by name, email, ID or role..."

                value={
                  search
                }

                onChange={

                  (event) =>

                    setSearch(

                      event.target.value

                    )

                }

              />


            </div>


            <select

              className="sa-users-filter"

              value={
                statusFilter
              }

              onChange={

                (event) =>

                  setStatusFilter(

                    event.target.value

                  )

              }

            >


              <option value="all">

                All Status

              </option>


              <option value="active">

                Active

              </option>


              <option value="disabled">

                Disabled

              </option>


            </select>


          </div>


        </div>


        {/* ===================================================
            TABLE
        =================================================== */}

        <div className="sa-users-table-container">


          <table className="sa-users-table">


            <thead>


              <tr>


                <th>

                  USER

                </th>


                <th>

                  EMAIL

                </th>


                <th>

                  ROLE

                </th>


                <th>

                  STATUS

                </th>


                <th className="sa-users-action-column">

                  ACTION

                </th>


              </tr>


            </thead>


            <tbody>


              {/* LOADING */}

              {loading && (

                <tr>


                  <td

                    colSpan="5"

                    className="sa-users-state"

                  >


                    <RefreshCw

                      size={20}

                      className="sa-spin"

                    />


                    <span>

                      Loading users...

                    </span>


                  </td>


                </tr>

              )}


              {/* EMPTY */}

              {!loading &&

                filteredUsers.length === 0 && (

                  <tr>


                    <td

                      colSpan="5"

                      className="sa-users-state"

                    >


                      <div className="sa-users-empty">


                        <div className="sa-users-empty-icon">


                          <Users
                            size={24}
                          />


                        </div>


                        <strong>

                          No users found

                        </strong>


                        <span>

                          Try changing your
                          search or filter.

                        </span>


                      </div>


                    </td>


                  </tr>

                )}


              {/* USERS */}

              {!loading &&

                filteredUsers.map(

                  (

                    selectedUser

                  ) => {


                    const name =

                      selectedUser.displayName ||

                      selectedUser.name ||

                      "Unnamed User";


                    const email =

                      selectedUser.email ||

                      "No email available";


                    const userRole =

                      selectedUser.role ||

                      ROLES.USER;


                    const disabled =

                      selectedUser.disabled ===
                      true;


                    return (

                      <tr

                        key={
                          selectedUser.id
                        }

                        className="sa-user-row"

                      >


                        {/* USER */}

                        <td>


                          <div className="sa-user-identity">


                            <div className="sa-user-avatar">


                              {name

                                .charAt(0)

                                .toUpperCase()}


                            </div>


                            <div>


                              <strong>

                                {name}

                              </strong>


                              <span>

                                User ID:{" "}

                                {selectedUser.id}

                              </span>


                            </div>


                          </div>


                        </td>


                        {/* EMAIL */}

                        <td>


                          <div className="sa-user-email">


                            <Mail
                              size={15}
                            />


                            <span>

                              {email}

                            </span>


                          </div>


                        </td>


                        {/* ROLE */}

                        <td>


                          <div

                            className={

                              `sa-user-role ${

                                getRoleClass(

                                  userRole

                                )

                              }`

                            }

                          >


                            <ShieldCheck
                              size={14}
                            />


                            <span>

                              {getRoleLabel(

                                userRole

                              )}

                            </span>


                          </div>


                        </td>


                        {/* STATUS */}

                        <td>


                          <span

                            className={

                              `sa-user-status ${

                                disabled

                                  ? "disabled"

                                  : "active"

                              }`

                            }

                          >


                            <span className="sa-status-dot" />


                            {disabled

                              ? "Disabled"

                              : "Active"}


                          </span>


                        </td>


                        {/* ACTION */}

                        <td>


                          <div className="sa-user-actions">


                            <button

                              type="button"

                              className={

                                `sa-user-status-button ${

                                  disabled

                                    ? "enable"

                                    : "disable"

                                }`

                              }

                              onClick={() =>

                                toggleStatus(

                                  selectedUser

                                )

                              }

                            >


                              {disabled

                                ? "Enable"

                                : "Disable"}


                            </button>


                            <div className="sa-user-menu-wrapper">


                              <button

                                type="button"

                                className="sa-user-more-button"

                                aria-label={

                                  `Actions for ${name}`

                                }

                                onClick={() =>

                                  setOpenMenu(

                                    openMenu ===
                                    selectedUser.id

                                      ? null

                                      : selectedUser.id

                                  )

                                }

                              >


                                <MoreHorizontal
                                  size={18}
                                />


                              </button>


                              {openMenu ===

                                selectedUser.id && (

                                  <div className="sa-user-menu">


                                    <button

                                      type="button"

                                      onClick={() =>

                                        viewDetails(

                                          selectedUser

                                        )

                                      }

                                    >


                                      <Eye
                                        size={15}
                                      />


                                      View Details


                                    </button>


                                  </div>

                                )}


                            </div>


                          </div>


                        </td>


                      </tr>

                    );

                  }

                )}


            </tbody>


          </table>


        </div>


        {/* ===================================================
            FOOTER
        =================================================== */}

        {!loading &&

          filteredUsers.length > 0 && (

            <div className="sa-users-table-footer">


              <span>


                Showing{" "}


                <strong>

                  {filteredUsers.length}

                </strong>{" "}


                of{" "}


                <strong>

                  {users.length}

                </strong>{" "}


                users


              </span>


              <span>

                Roles are managed from
                Role Management.

              </span>


            </div>

          )}


      </section>


    </div>

  );

}