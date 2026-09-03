// src/pages/superadmin/SuperAdminUserDetailsPage.jsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";


import {

  ArrowLeft,

  Save,

  RefreshCw,

  ShieldCheck,

  User,

  Mail,

  Phone,

  BriefcaseBusiness,

  CalendarDays,

  MapPin,

  FileText,

  CheckCircle2,

  AlertTriangle,

  Clock,

} from "lucide-react";


import {

  getUserById,

  updateUserDetails,

  updateUserRole,

  updateUserStatus,

  ROLES,

} from "../../services/superAdminService";


import {

  useNavigate,

  useParams,

} from "react-router-dom";


import {

  useAuth,

} from "../../context/AuthContext";


import {

  approveContactChangeRequest,

  getPendingRequestsForApprover,

  getUserRole,

  rejectContactChangeRequest,

} from "../../services/contactChangeRequestService";


import ProfileChangeRequestCard
  from "../../components/profile/ProfileChangeRequestCard";


export default function SuperAdminUserDetailsPage() {


  /* =========================================================
     NAVIGATION
  ========================================================= */

  const navigate =
    useNavigate();


  const {
    userId,
  } =
    useParams();


  /* =========================================================
     AUTH
  ========================================================= */

  const {

    user: currentUser,

  } =
    useAuth();


  /* =========================================================
     USER STATE
  ========================================================= */

  const [

    user,

    setUser,

  ] =
    useState(null);


  /* =========================================================
     FORM STATE
  ========================================================= */

  const [

    form,

    setForm,

  ] =
    useState({

      name:
        "",


      phone:
        "",


      experience:
        "",


      joiningDate:
        "",


      activeDate:
        "",


      address:
        "",


      city:
        "",


      state:
        "",


      country:
        "",


      pincode:
        "",


      bio:
        "",


      designation:
        "",


      role:
        ROLES.USER,

    });


  /* =========================================================
     PAGE STATE
  ========================================================= */

  const [

    loading,

    setLoading,

  ] =
    useState(true);


  const [

    saving,

    setSaving,

  ] =
    useState(false);


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


  /* =========================================================
     CONTACT CHANGE REQUEST STATE
  ========================================================= */

  const [

    pendingRequests,

    setPendingRequests,

  ] =
    useState([]);


  const [

    requestsLoading,

    setRequestsLoading,

  ] =
    useState(false);


  const [

    requestActionLoading,

    setRequestActionLoading,

  ] =
    useState("");


  /* =========================================================
     CURRENT APPROVER

     The logged-in Super Admin.
  ========================================================= */

  const approver =
    useMemo(() => {

      if (
        !currentUser
      ) {

        return null;

      }


      return {

        ...currentUser,


        uid:

          currentUser.uid,


        id:

          currentUser.uid,


        role:

          currentUser.role ||

          currentUser.userRole ||

          "SUPER_ADMIN",


        displayName:

          currentUser.displayName ||

          currentUser.name ||

          currentUser.email ||

          "Super Administrator",


        name:

          currentUser.displayName ||

          currentUser.name ||

          currentUser.email ||

          "Super Administrator",

      };

    }, [

      currentUser,

    ]);


  /* =========================================================
     LOAD USER
  ========================================================= */

  async function loadUser() {


    if (
      !userId
    ) {

      setUser(null);

      setLoading(false);

      return;

    }


    setLoading(true);

    setError("");


    try {


      const result =
        await getUserById(
          userId
        );


      if (
        !result
      ) {


        setError(
          "User account was not found."
        );


        setUser(null);

        return;

      }


      setUser(
        result
      );


      setForm({

        name:

          result.name ||

          result.displayName ||

          "",


        phone:

          result.phone ||

          result.phoneNumber ||

          result.mobile ||

          result.mobileNumber ||

          "",


        experience:

          result.experience ||

          "",


        joiningDate:

          result.joiningDate ||

          "",


        activeDate:

          result.activeDate ||

          "",


        address:

          result.address ||

          "",


        city:

          result.city ||

          "",


        state:

          result.state ||

          "",


        country:

          result.country ||

          "",


        pincode:

          result.pincode ||

          "",


        bio:

          result.bio ||

          "",


        designation:

          result.designation ||

          "",


        role:

          result.role ||

          ROLES.USER,

      });


    } catch (
      err
    ) {


      console.error(
        "User details error:",
        err
      );


      setError(

        err?.message ||

        "Unable to load user details."

      );


    } finally {


      setLoading(false);

    }

  }


  /* =========================================================
     LOAD USER ON PAGE OPEN
  ========================================================= */

  useEffect(() => {


    loadUser();


  }, [

    userId,

  ]);


  /* =========================================================
     LOAD PENDING CONTACT CHANGE REQUESTS

     Get all requests the current Super Admin
     is allowed to approve and filter only
     the requests belonging to this user.
  ========================================================= */

  async function loadPendingRequests() {


    if (
      !userId
    ) {

      setPendingRequests([]);

      return;

    }


    if (
      !approver?.uid
    ) {

      setPendingRequests([]);

      return;

    }


    try {


      setRequestsLoading(
        true
      );


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


      const userRequests =

        Array.isArray(
          requests
        )

          ? requests.filter(

              (
                request
              ) =>

                request.userId ===
                userId

            )

          : [];


      setPendingRequests(
        userRequests
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


      setPendingRequests(
        []
      );


    } finally {


      setRequestsLoading(
        false
      );

    }

  }


  /* =========================================================
     LOAD PENDING REQUESTS
  ========================================================= */

  useEffect(() => {


    loadPendingRequests();


  }, [

    userId,

    approver?.uid,

  ]);


  /* =========================================================
     FORM CHANGE
  ========================================================= */

  function updateField(

    field,

    value

  ) {


    setForm(

      (
        previous
      ) => ({

        ...previous,


        [field]:

          value,

      })

    );

  }


  /* =========================================================
     SAVE USER DETAILS
  ========================================================= */

  async function handleSave() {


    if (
      !user
    ) {

      return;

    }


    const confirmed =
      window.confirm(

        `Are you sure you want to update the details of ${

          user.name ||

          user.displayName ||

          user.email ||

          "this user"

        }?`

      );


    if (
      !confirmed
    ) {

      return;

    }


    setSaving(
      true
    );


    setError(
      ""
    );


    setMessage(
      ""
    );


    try {


      /* =============================================
         PROFILE DETAILS
      ============================================= */

      await updateUserDetails(

        user.id,

        {

          name:

            form.name,


          phone:

            form.phone,


          experience:

            form.experience,


          joiningDate:

            form.joiningDate,


          activeDate:

            form.activeDate,


          address:

            form.address,


          city:

            form.city,


          state:

            form.state,


          country:

            form.country,


          pincode:

            form.pincode,


          bio:

            form.bio,


          designation:

            form.designation,

        }

      );


      /* =============================================
         ROLE
      ============================================= */

      if (

        form.role !==
        user.role

      ) {


        await updateUserRole(

          user.id,

          form.role

        );

      }


      /* =============================================
         RELOAD
      ============================================= */

      await loadUser();


      setMessage(

        "User details updated successfully."

      );


      window.scrollTo({

        top:
          0,


        behavior:
          "smooth",

      });


    } catch (
      err
    ) {


      console.error(

        "Unable to update user:",

        err

      );


      setError(

        err?.message ||

        "Unable to update user details."

      );


    } finally {


      setSaving(
        false
      );

    }

  }


  /* =========================================================
     APPROVE CONTACT CHANGE REQUEST
  ========================================================= */

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


      setError(
        ""
      );


      setMessage(
        ""
      );


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


      /*
       * Reload user details.
       *
       * Phone or Firestore email
       * information may have changed.
       */

      await Promise.all([

        loadUser(),

        loadPendingRequests(),

      ]);


      window.scrollTo({

        top:
          0,


        behavior:
          "smooth",

      });


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


      setRequestActionLoading(
        ""
      );

    }

  }


  /* =========================================================
     REJECT CONTACT CHANGE REQUEST
  ========================================================= */

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


      setError(
        ""
      );


      setMessage(
        ""
      );


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


      /*
       * Reload requests.
       *
       * Rejected request will disappear
       * because only pending requests
       * are loaded.
       */

      await loadPendingRequests();


      window.scrollTo({

        top:
          0,


        behavior:
          "smooth",

      });


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


      setRequestActionLoading(
        ""
      );

    }

  }


  /* =========================================================
     TOGGLE ACCOUNT STATUS
  ========================================================= */

  async function toggleStatus() {


    if (
      !user
    ) {

      return;

    }


    const disabled =
      user.disabled ===
      true;


    const action =

      disabled

        ? "enable"

        : "disable";


    const confirmed =
      window.confirm(

        `Are you sure you want to ${action} this user account?`

      );


    if (
      !confirmed
    ) {

      return;

    }


    try {


      setError(
        ""
      );


      setMessage(
        ""
      );


      await updateUserStatus(

        user.id,

        !disabled

      );


      await loadUser();


      setMessage(

        disabled

          ? "User account enabled."

          : "User account disabled."

      );


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


  /* =========================================================
     DATE FORMAT
  ========================================================= */

  function formatDate(

    value

  ) {


    if (
      !value
    ) {

      return "—";

    }


    try {


      if (

        typeof value ===
        "object"

        &&

        typeof value?.toDate ===
        "function"

      ) {


        return value

          .toDate()

          .toLocaleString();

      }


      if (

        typeof value ===
        "object"

        &&

        value?.seconds

      ) {


        return new Date(

          value.seconds *
          1000

        ).toLocaleString();

      }


      const date =
        new Date(
          value
        );


      if (

        Number.isNaN(

          date.getTime()

        )

      ) {

        return String(
          value
        );

      }


      return date.toLocaleString();


    } catch {


      return String(
        value
      );

    }

  }


  /* =========================================================
     LOADING
  ========================================================= */

  if (
    loading
  ) {


    return (

      <div className="sa-user-details-loading">


        <RefreshCw

          size={22}

          className="sa-spin"

        />


        <span>

          Loading user details...

        </span>


      </div>

    );

  }


  /* =========================================================
     NOT FOUND
  ========================================================= */

  if (
    !user
  ) {


    return (

      <div className="sa-user-details-page">


        <button

          type="button"

          className="sa-user-details-back"

          onClick={() =>

            navigate(

              "/super-admin/users"

            )

          }

        >


          <ArrowLeft
            size={16}
          />


          Back to Users


        </button>


        <div className="sa-user-details-alert error">


          <AlertTriangle
            size={18}
          />


          <span>

            {

              error ||

              "User account was not found."

            }

          </span>


        </div>


      </div>

    );

  }


  /* =========================================================
     USER NAME
  ========================================================= */

  const name =

    user.name ||

    user.displayName ||

    "Unnamed User";


  /* =========================================================
     PAGE
  ========================================================= */

  return (

    <div className="sa-user-details-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sa-user-details-header">


        <div>


          <button

            type="button"

            className="sa-user-details-back"

            onClick={() =>

              navigate(

                "/super-admin/users"

              )

            }

          >


            <ArrowLeft
              size={16}
            />


            Back to Users


          </button>


          <p className="sa-user-details-eyebrow">

            USER MANAGEMENT

          </p>


          <h1>

            User Details

          </h1>


          <p>

            View and manage the complete
            profile and access information
            for this account.

          </p>


        </div>


        <div className="sa-user-details-header-actions">


          <button

            type="button"

            className={

              user.disabled

                ? "sa-user-enable"

                : "sa-user-disable"

            }

            onClick={
              toggleStatus
            }

          >


            {

              user.disabled

                ? "Enable Account"

                : "Disable Account"

            }


          </button>


          <button

            type="button"

            className="sa-user-save"

            onClick={
              handleSave
            }

            disabled={
              saving
            }

          >


            {

              saving

                ? (

                  <RefreshCw

                    size={16}

                    className="sa-spin"

                  />

                )

                : (

                  <Save
                    size={16}
                  />

                )

            }


            {

              saving

                ? "Saving..."

                : "Save Changes"

            }


          </button>


        </div>


      </header>


      {/* =====================================================
          ALERTS
      ===================================================== */}

      {error && (

        <div className="sa-user-details-alert error">


          <AlertTriangle
            size={17}
          />


          <span>

            {error}

          </span>


        </div>

      )}


      {message && (

        <div className="sa-user-details-alert success">


          <CheckCircle2
            size={17}
          />


          <span>

            {message}

          </span>


        </div>

      )}


      {/* =====================================================
          PENDING CONTACT CHANGE REQUESTS

          MUST STAY AT TOP UNTIL
          APPROVED OR REJECTED
      ===================================================== */}

      <section

        className="sa-user-details-card"

        style={{

          marginBottom:
            "24px",

        }}

      >


        <div className="sa-user-details-card-header">


          <div className="sa-user-details-card-icon">


            <Clock
              size={18}
            />


          </div>


          <div>


            <h2>

              Pending Contact Change Requests

            </h2>


            <span>

              Review pending email or phone number
              change requests for this user.

            </span>


          </div>


        </div>


        {requestsLoading ? (

          <div className="sa-user-details-loading">


            <RefreshCw

              size={20}

              className="sa-spin"

            />


            <span>

              Loading contact change requests...

            </span>


          </div>

        ) : pendingRequests.length === 0 ? (

          <div

            style={{

              padding:
                "8px 0",

            }}

          >


            <p

              style={{

                margin:
                  0,

              }}

            >

              No pending contact change requests.

            </p>


          </div>

        ) : (

          <div

            style={{

              display:
                "grid",

              gap:
                "16px",

              marginTop:
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


                  onViewUser={() => {

                    window.scrollTo({

                      top:
                        0,


                      behavior:
                        "smooth",

                    });

                  }}

                />

              )

            )}


          </div>

        )}


      </section>


      {/* =====================================================
          ACCOUNT SUMMARY
      ===================================================== */}

      <section className="sa-user-profile-card">


        <div className="sa-user-profile-avatar">


          {

            name

              .charAt(
                0
              )

              .toUpperCase()

          }


        </div>


        <div className="sa-user-profile-main">


          <h2>

            {name}

          </h2>


          <span>

            {

              user.email ||

              "No email available"

            }

          </span>


          <small>

            User ID: {user.id}

          </small>


        </div>


        <div className="sa-user-profile-status">


          <span

            className={

              user.disabled

                ? "sa-status-badge disabled"

                : "sa-status-badge active"

            }

          >


            <span />


            {

              user.disabled

                ? "Disabled"

                : "Active"

            }


          </span>


        </div>


      </section>


      {/* =====================================================
          GRID
      ===================================================== */}

      <div className="sa-user-details-grid">


        {/* ===================================================
            BASIC INFORMATION
        =================================================== */}

        <section className="sa-user-details-card">


          <div className="sa-user-details-card-header">


            <div className="sa-user-details-card-icon">

              <User
                size={18}
              />

            </div>


            <div>


              <h2>

                Basic Information

              </h2>


              <span>

                Personal account details

              </span>


            </div>


          </div>


          <div className="sa-user-form-grid">


            <label>


              Full Name


              <input

                value={
                  form.name
                }

                onChange={

                  (
                    event
                  ) =>

                    updateField(

                      "name",

                      event.target.value

                    )

                }

              />


            </label>


            <label>


              Email


              <div className="sa-readonly-field">


                <Mail
                  size={15}
                />


                <input

                  value={

                    user.email ||

                    ""

                  }

                  readOnly

                />


              </div>


              <small>

                Email change requests are handled
                through the approval workflow.

              </small>


            </label>


            <label>


              Mobile Number


              <div className="sa-input-icon">


                <Phone
                  size={15}
                />


                <input

                  value={
                    form.phone
                  }

                  onChange={

                    (
                      event
                    ) =>

                      updateField(

                        "phone",

                        event.target.value

                      )

                  }

                  placeholder="Enter mobile number"

                />


              </div>


            </label>


            <label>


              Designation


              <div className="sa-input-icon">


                <BriefcaseBusiness
                  size={15}
                />


                <input

                  value={

                    form.designation

                  }

                  onChange={

                    (
                      event
                    ) =>

                      updateField(

                        "designation",

                        event.target.value

                      )

                  }

                  placeholder="e.g. Author, Editor"

                />


              </div>


            </label>


          </div>


        </section>


        {/* ===================================================
            ACCESS CONTROL
        =================================================== */}

        <section className="sa-user-details-card">


          <div className="sa-user-details-card-header">


            <div className="sa-user-details-card-icon">


              <ShieldCheck
                size={18}
              />


            </div>


            <div>


              <h2>

                Access Control

              </h2>


              <span>

                Role and account access

              </span>


            </div>


          </div>


          <div className="sa-user-form-grid">


            <label>


              Role


              <select

                value={
                  form.role
                }

                onChange={

                  (
                    event
                  ) =>

                    updateField(

                      "role",

                      event.target.value

                    )

                }

              >


                <option value={ROLES.USER}>

                  Registered User

                </option>


                <option value={ROLES.AUTHOR}>

                  Author

                </option>


                <option value={ROLES.EDITOR}>

                  Editor

                </option>


                <option value={ROLES.ADMIN}>

                  Administrator

                </option>


                <option
                  value={ROLES.SUPER_ADMIN}
                >

                  Super Administrator

                </option>


              </select>


            </label>


            <label>


              Current Status


              <input

                value={

                  user.disabled

                    ? "Disabled"

                    : "Active"

                }

                readOnly

              />


            </label>


            <label>


              Account Created


              <input

                value={

                  formatDate(

                    user.createdAt

                  )

                }

                readOnly

              />


            </label>


            <label>


              Role Updated


              <input

                value={

                  formatDate(

                    user.roleUpdatedAt

                  )

                }

                readOnly

              />


            </label>


          </div>


        </section>


        {/* ===================================================
            PROFESSIONAL INFORMATION
        =================================================== */}

        <section className="sa-user-details-card">


          <div className="sa-user-details-card-header">


            <div className="sa-user-details-card-icon">


              <BriefcaseBusiness
                size={18}
              />


            </div>


            <div>


              <h2>

                Professional Information

              </h2>


              <span>

                Staff and experience information

              </span>


            </div>


          </div>


          <div className="sa-user-form-grid">


            <label>


              Experience


              <input

                value={
                  form.experience
                }

                onChange={

                  (
                    event
                  ) =>

                    updateField(

                      "experience",

                      event.target.value

                    )

                }

                placeholder="e.g. 5 years"

              />


            </label>


            <label>


              Joining Date


              <div className="sa-input-icon">


                <CalendarDays
                  size={15}
                />


                <input

                  type="date"

                  value={
                    form.joiningDate
                  }

                  onChange={

                    (
                      event
                    ) =>

                      updateField(

                        "joiningDate",

                        event.target.value

                      )

                  }

                />


              </div>


            </label>


            <label>


              Active Date


              <div className="sa-input-icon">


                <CalendarDays
                  size={15}
                />


                <input

                  type="date"

                  value={
                    form.activeDate
                  }

                  onChange={

                    (
                      event
                    ) =>

                      updateField(

                        "activeDate",

                        event.target.value

                      )

                  }

                />


              </div>


            </label>


          </div>


        </section>


        {/* ===================================================
            ADDRESS
        =================================================== */}

        <section className="sa-user-details-card">


          <div className="sa-user-details-card-header">


            <div className="sa-user-details-card-icon">


              <MapPin
                size={18}
              />


            </div>


            <div>


              <h2>

                Address

              </h2>


              <span>

                User location information

              </span>


            </div>


          </div>


          <div className="sa-user-form-grid">


            <label className="full">


              Address


              <input

                value={
                  form.address
                }

                onChange={

                  (
                    event
                  ) =>

                    updateField(

                      "address",

                      event.target.value

                    )

                }

                placeholder="Full address"

              />


            </label>


            <label>


              City


              <input

                value={
                  form.city
                }

                onChange={

                  (
                    event
                  ) =>

                    updateField(

                      "city",

                      event.target.value

                    )

                }

              />


            </label>


            <label>


              State


              <input

                value={
                  form.state
                }

                onChange={

                  (
                    event
                  ) =>

                    updateField(

                      "state",

                      event.target.value

                    )

                }

              />


            </label>


            <label>


              Country


              <input

                value={
                  form.country
                }

                onChange={

                  (
                    event
                  ) =>

                    updateField(

                      "country",

                      event.target.value

                    )

                }

              />


            </label>


            <label>


              PIN / Postal Code


              <input

                value={
                  form.pincode
                }

                onChange={

                  (
                    event
                  ) =>

                    updateField(

                      "pincode",

                      event.target.value

                    )

                }

              />


            </label>


          </div>


        </section>


        {/* ===================================================
            BIO
        =================================================== */}

        <section className="sa-user-details-card full-width">


          <div className="sa-user-details-card-header">


            <div className="sa-user-details-card-icon">


              <FileText
                size={18}
              />


            </div>


            <div>


              <h2>

                Biography / Notes

              </h2>


              <span>

                Additional information about
                this user

              </span>


            </div>


          </div>


          <label>


            Biography / Administrative Notes


            <textarea

              value={
                form.bio
              }

              onChange={

                (
                  event
                ) =>

                  updateField(

                    "bio",

                    event.target.value

                  )

              }

              placeholder="Enter additional information..."

            />


          </label>


        </section>


      </div>


      {/* =====================================================
          BOTTOM SAVE
      ===================================================== */}

      <div className="sa-user-details-bottom-actions">


        <button

          type="button"

          className="sa-user-details-cancel"

          onClick={() =>

            navigate(

              "/super-admin/users"

            )

          }

        >

          Cancel

        </button>


        <button

          type="button"

          className="sa-user-save"

          onClick={
            handleSave
          }

          disabled={
            saving
          }

        >


          {

            saving

              ? (

                <RefreshCw

                  size={16}

                  className="sa-spin"

                />

              )

              : (

                <Save
                  size={16}
                />

              )

          }


          {

            saving

              ? "Saving..."

              : "Save Changes"

          }


        </button>


      </div>


    </div>

  );

}