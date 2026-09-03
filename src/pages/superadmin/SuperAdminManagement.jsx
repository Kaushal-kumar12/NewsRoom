// superadminmanagement.jsx

import React, { useEffect, useMemo, useState } from "react";

import {
  Search,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  Users,
  UserCheck,
  UserX,
  CalendarDays,
  Phone,
  BriefcaseBusiness,
  MapPin,
  Mail,
  MoreHorizontal,
  X,
  CheckCircle2,
} from "lucide-react";

import {
  listUsers,
  updateUserRole,
  updateUserStatus,
  ROLES,
} from "../../services/superAdminService";

const SUPER_ADMIN_ROLE =
  ROLES?.SUPER_ADMIN || "SUPER_ADMIN";

/*
|--------------------------------------------------------------------------
| SAFE DATE FORMATTER
|--------------------------------------------------------------------------
| Firebase Timestamp objects cannot be rendered directly by React.
| This function converts Timestamp / Date / string / number safely.
*/
function formatDate(value) {
  if (!value) return "—";

  try {
    // Firestore Timestamp
    if (
      typeof value === "object" &&
      typeof value.toDate === "function"
    ) {
      return value
        .toDate()
        .toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
    }

    // Firestore timestamp-like object
    if (
      typeof value === "object" &&
      typeof value.seconds === "number"
    ) {
      return new Date(
        value.seconds * 1000
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    // JavaScript Date
    if (value instanceof Date) {
      return value.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    // Number timestamp
    if (typeof value === "number") {
      return new Date(value).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    }

    // String date
    if (typeof value === "string") {
      const date = new Date(value);

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }

      return value;
    }

    return "—";
  } catch {
    return "—";
  }
}

export default function SuperAdminManagement() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [directorySearch, setDirectorySearch] =
    useState("");

  const [userSearch, setUserSearch] =
    useState("");

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [showCreatePanel, setShowCreatePanel] =
    useState(false);

  const [promoting, setPromoting] =
    useState(false);

  const [details, setDetails] = useState({
    mobile: "",
    experience: "",
    joiningDate: "",
    activeDate: "",
    address: "",
    bio: "",
  });

  /*
  |--------------------------------------------------------------------------
  | LOAD USERS
  |--------------------------------------------------------------------------
  */

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await listUsers();

      setUsers(
        Array.isArray(result)
          ? result
          : []
      );
    } catch (err) {
      console.error(
        "Unable to load users:",
        err
      );

      setError(
        err?.message ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | SUPER ADMIN LIST
  |--------------------------------------------------------------------------
  */

  const superAdmins = useMemo(() => {
    return users.filter(
      (user) =>
        user?.role === SUPER_ADMIN_ROLE
    );
  }, [users]);

  const activeSuperAdmins =
    useMemo(() => {
      return superAdmins.filter(
        (user) =>
          user?.disabled !== true
      );
    }, [superAdmins]);

  const disabledSuperAdmins =
    useMemo(() => {
      return superAdmins.filter(
        (user) =>
          user?.disabled === true
      );
    }, [superAdmins]);

  /*
  |--------------------------------------------------------------------------
  | DIRECTORY SEARCH
  |--------------------------------------------------------------------------
  */

  const filteredSuperAdmins =
    useMemo(() => {
      const query =
        directorySearch
          .trim()
          .toLowerCase();

      if (!query) {
        return superAdmins;
      }

      return superAdmins.filter(
        (user) => {
          const name =
            user?.displayName ||
            user?.name ||
            "";

          const email =
            user?.email || "";

          const id =
            user?.id ||
            user?.uid ||
            "";

          return (
            name
              .toLowerCase()
              .includes(query) ||
            email
              .toLowerCase()
              .includes(query) ||
            id
              .toLowerCase()
              .includes(query)
          );
        }
      );
    }, [
      superAdmins,
      directorySearch,
    ]);

  /*
  |--------------------------------------------------------------------------
  | REGISTERED USER SEARCH
  |--------------------------------------------------------------------------
  */

  const matchingUsers = useMemo(() => {
    const query =
      userSearch
        .trim()
        .toLowerCase();

    if (!query) {
      return [];
    }

    return users
      .filter(
        (user) =>
          user?.role !==
          SUPER_ADMIN_ROLE
      )
      .filter((user) => {
        const name =
          user?.displayName ||
          user?.name ||
          "";

        const email =
          user?.email ||
          "";

        const id =
          user?.id ||
          user?.uid ||
          "";

        return (
          name
            .toLowerCase()
            .includes(query) ||
          email
            .toLowerCase()
            .includes(query) ||
          id
            .toLowerCase()
            .includes(query)
        );
      })
      .slice(0, 8);
  }, [
    users,
    userSearch,
  ]);

  /*
  |--------------------------------------------------------------------------
  | SELECT USER
  |--------------------------------------------------------------------------
  */

  const selectUser = (user) => {
    setSelectedUser(user);

    setUserSearch(
      user?.displayName ||
        user?.name ||
        user?.email ||
        ""
    );

    setError("");
    setMessage("");
  };

  /*
  |--------------------------------------------------------------------------
  | RESET FORM
  |--------------------------------------------------------------------------
  */

  const resetCreateForm = () => {
    setSelectedUser(null);

    setUserSearch("");

    setDetails({
      mobile: "",
      experience: "",
      joiningDate: "",
      activeDate: "",
      address: "",
      bio: "",
    });

    setError("");
    setMessage("");
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE DETAILS
  |--------------------------------------------------------------------------
  */

  const updateDetails = (
    field,
    value
  ) => {
    setDetails((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | PROMOTE USER
  |--------------------------------------------------------------------------
  */

  const promoteToSuperAdmin =
    async () => {
      if (!selectedUser) {
        setError(
          "Please search and select a registered user first."
        );
        return;
      }

      if (
        selectedUser.role ===
        SUPER_ADMIN_ROLE
      ) {
        setError(
          "This user is already a Super Administrator."
        );
        return;
      }

      const userId =
        selectedUser.id ||
        selectedUser.uid;

      if (!userId) {
        setError(
          "Selected user does not have a valid user ID."
        );
        return;
      }

      setPromoting(true);
      setError("");
      setMessage("");

      try {
        /*
        |--------------------------------------------------------------------------
        | Update account role
        |--------------------------------------------------------------------------
        */

        await updateUserRole(
          userId,
          SUPER_ADMIN_ROLE
        );

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        |--------------------------------------------------------------------------
        | These details are currently prepared for your staff/profile system.
        |
        | Your existing service only exposes updateUserRole(), so we cannot
        | permanently save these fields until a profile/staff update service
        | is added.
        |
        | For now we keep them available for that integration.
        |--------------------------------------------------------------------------
        */

        console.log(
          "Super Administrator details:",
          {
            userId,
            designation:
              "Super Administrator",
            role:
              SUPER_ADMIN_ROLE,
            ...details,
          }
        );

        const name =
          selectedUser.displayName ||
          selectedUser.name ||
          "User";

        setMessage(
          `${name} has been promoted to Super Administrator successfully.`
        );

        resetCreateForm();

        await loadUsers();
      } catch (err) {
        console.error(
          "Promotion failed:",
          err
        );

        setError(
          err?.message ||
            "Unable to promote user."
        );
      } finally {
        setPromoting(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | ENABLE / DISABLE
  |--------------------------------------------------------------------------
  */

  const toggleStatus =
    async (user) => {
      const userId =
        user?.id ||
        user?.uid;

      if (!userId) {
        setError(
          "Invalid user ID."
        );
        return;
      }

      try {
        setError("");
        setMessage("");

        await updateUserStatus(
          userId,
          user.disabled !== true
        );

        await loadUsers();

        setMessage(
          user.disabled
            ? "Super Administrator account enabled."
            : "Super Administrator account disabled."
        );
      } catch (err) {
        setError(
          err?.message ||
            "Unable to update account status."
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="sam-page">

      {/* HEADER */}
      <header className="sam-header">

        <div>
          <p className="sam-eyebrow">
            SECURITY & ACCESS
          </p>

          <h1>
            Super Administrators
          </h1>

          <p className="sam-description">
            Manage users with the highest
            level of administrative access
            to NewsRoom.
          </p>
        </div>

        <div className="sam-header-actions">

          <button
            type="button"
            className="sam-refresh-btn"
            onClick={loadUsers}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "sam-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            className="sam-create-btn"
            onClick={() => {
              setShowCreatePanel(
                (previous) =>
                  !previous
              );

              setError("");
              setMessage("");
            }}
          >
            <UserPlus size={17} />

            {showCreatePanel
              ? "Close"
              : "Add Super Admin"}
          </button>

        </div>
      </header>

      {/* ALERTS */}

      {error && (
        <div className="sam-alert sam-alert-error">
          <X size={17} />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="sam-alert sam-alert-success">
          <CheckCircle2 size={17} />
          <span>{message}</span>
        </div>
      )}

      {/* STATISTICS */}

      <section className="sam-stat-grid">

        <div className="sam-stat-card">
          <div className="sam-stat-icon blue">
            <ShieldCheck size={21} />
          </div>

          <div>
            <strong>
              {superAdmins.length}
            </strong>

            <span>
              Super Administrators
            </span>
          </div>
        </div>

        <div className="sam-stat-card">
          <div className="sam-stat-icon green">
            <UserCheck size={21} />
          </div>

          <div>
            <strong>
              {activeSuperAdmins.length}
            </strong>

            <span>
              Active Accounts
            </span>
          </div>
        </div>

        <div className="sam-stat-card">
          <div className="sam-stat-icon red">
            <UserX size={21} />
          </div>

          <div>
            <strong>
              {disabledSuperAdmins.length}
            </strong>

            <span>
              Disabled Accounts
            </span>
          </div>
        </div>

        <div className="sam-stat-card">
          <div className="sam-stat-icon purple">
            <ShieldCheck size={21} />
          </div>

          <div>
            <strong>
              SUPER
            </strong>

            <span>
              Access Level
            </span>
          </div>
        </div>

      </section>

      {/* CREATE SUPER ADMIN */}

      {showCreatePanel && (
        <section className="sam-create-panel">

          <div className="sam-panel-heading">

            <div className="sam-panel-title-icon">
              <UserPlus size={20} />
            </div>

            <div>
              <h2>
                Add Super Administrator
              </h2>

              <p>
                Search an existing registered
                user and promote them to
                Super Administrator.
              </p>
            </div>

          </div>

          <div className="sam-create-body">

            {/* USER SEARCH */}

            <div className="sam-form-section">

              <label className="sam-form-label">
                Search Registered User
              </label>

              <div className="sam-search-box">

                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search by user ID, email or name..."
                  value={userSearch}
                  onChange={(event) => {
                    setUserSearch(
                      event.target.value
                    );

                    setSelectedUser(null);
                  }}
                />

              </div>

              {matchingUsers.length >
                0 && (
                <div className="sam-user-results">

                  {matchingUsers.map(
                    (user) => {
                      const name =
                        user?.displayName ||
                        user?.name ||
                        "Unnamed User";

                      const id =
                        user?.id ||
                        user?.uid ||
                        "";

                      return (
                        <button
                          type="button"
                          className="sam-user-result"
                          key={id}
                          onClick={() =>
                            selectUser(user)
                          }
                        >

                          <div className="sam-result-avatar">
                            {name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="sam-result-info">

                            <strong>
                              {name}
                            </strong>

                            <span>
                              {user?.email ||
                                "No email"}
                            </span>

                            <small>
                              ID:{" "}
                              {id ||
                                "—"}
                            </small>

                          </div>

                        </button>
                      );
                    }
                  )}

                </div>
              )}

              {selectedUser && (
                <div className="sam-selected-user">

                  <div className="sam-selected-avatar">
                    {(
                      selectedUser?.displayName ||
                      selectedUser?.name ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="sam-selected-info">

                    <strong>
                      {selectedUser?.displayName ||
                        selectedUser?.name ||
                        "Unnamed User"}
                    </strong>

                    <span>
                      {selectedUser?.email ||
                        "No email"}
                    </span>

                    <small>
                      User ID:{" "}
                      {selectedUser?.id ||
                        selectedUser?.uid ||
                        "—"}
                    </small>

                  </div>

                  <button
                    type="button"
                    className="sam-clear-user"
                    onClick={() =>
                      setSelectedUser(null)
                    }
                    aria-label="Remove selected user"
                  >
                    <X size={16} />
                  </button>

                </div>
              )}

            </div>

            {/* DESIGNATION */}

            <div className="sam-form-section">

              <label className="sam-form-label">
                Designation
              </label>

              <div className="sam-fixed-designation">

                <div className="sam-fixed-icon">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <strong>
                    Super Administrator
                  </strong>

                  <span>
                    Highest administrative
                    access level
                  </span>
                </div>

                <div className="sam-fixed-badge">
                  SUPER
                </div>

              </div>

            </div>

            {/* ADDITIONAL DETAILS */}

            <div className="sam-details-section">

              <div className="sam-section-heading">

                <div>
                  <h3>
                    Additional Details
                  </h3>

                  <p>
                    Optional staff information.
                    Fill only the details available.
                  </p>
                </div>

              </div>

              <div className="sam-form-grid">

                <label>
                  <span>
                    Mobile Number
                  </span>

                  <div className="sam-input-with-icon">
                    <Phone size={17} />

                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={
                        details.mobile
                      }
                      onChange={(event) =>
                        updateDetails(
                          "mobile",
                          event.target.value
                        )
                      }
                    />
                  </div>
                </label>

                <label>
                  <span>
                    Experience
                  </span>

                  <div className="sam-input-with-icon">
                    <BriefcaseBusiness
                      size={17}
                    />

                    <input
                      type="text"
                      placeholder="e.g. 5 years"
                      value={
                        details.experience
                      }
                      onChange={(event) =>
                        updateDetails(
                          "experience",
                          event.target.value
                        )
                      }
                    />
                  </div>
                </label>

                <label>
                  <span>
                    Joining Date
                  </span>

                  <div className="sam-input-with-icon">
                    <CalendarDays
                      size={17}
                    />

                    <input
                      type="date"
                      value={
                        details.joiningDate
                      }
                      onChange={(event) =>
                        updateDetails(
                          "joiningDate",
                          event.target.value
                        )
                      }
                    />
                  </div>
                </label>

                <label>
                  <span>
                    Active Date
                  </span>

                  <div className="sam-input-with-icon">
                    <CalendarDays
                      size={17}
                    />

                    <input
                      type="date"
                      value={
                        details.activeDate
                      }
                      onChange={(event) =>
                        updateDetails(
                          "activeDate",
                          event.target.value
                        )
                      }
                    />
                  </div>
                </label>

                <label className="sam-full-width">
                  <span>
                    Complete Address
                  </span>

                  <div className="sam-input-with-icon">
                    <MapPin size={17} />

                    <input
                      type="text"
                      placeholder="Complete address"
                      value={
                        details.address
                      }
                      onChange={(event) =>
                        updateDetails(
                          "address",
                          event.target.value
                        )
                      }
                    />
                  </div>
                </label>

                <label className="sam-full-width">
                  <span>
                    Additional Information
                  </span>

                  <textarea
                    rows="4"
                    placeholder="Qualification, experience, responsibility or any other relevant information..."
                    value={
                      details.bio
                    }
                    onChange={(event) =>
                      updateDetails(
                        "bio",
                        event.target.value
                      )
                    }
                  />
                </label>

              </div>

            </div>

          </div>

          {/* ACTIONS */}

          <div className="sam-create-actions">

            <button
              type="button"
              className="sam-cancel-btn"
              onClick={() => {
                resetCreateForm();
                setShowCreatePanel(
                  false
                );
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              className="sam-promote-btn"
              disabled={
                !selectedUser ||
                promoting
              }
              onClick={
                promoteToSuperAdmin
              }
            >

              {promoting ? (
                <>
                  <RefreshCw
                    size={16}
                    className="sam-spin"
                  />

                  Promoting...
                </>
              ) : (
                <>
                  <ShieldCheck
                    size={17}
                  />

                  Promote to Super Administrator
                </>
              )}

            </button>

          </div>

        </section>
      )}

      {/* DIRECTORY */}

      <section className="sam-directory">

        <div className="sam-directory-header">

          <div className="sam-directory-title">

            <div className="sam-directory-icon">
              <Users size={20} />
            </div>

            <div>
              <h2>
                Super Administrator Directory
              </h2>

              <p>
                Users currently assigned
                Super Administrator access.
              </p>
            </div>

          </div>

          <span className="sam-count">
            {filteredSuperAdmins.length} users
          </span>

        </div>

        {/* DIRECTORY SEARCH */}

        <div className="sam-directory-search">

          <div className="sam-search-box">

            <Search size={18} />

            <input
              type="search"
              placeholder="Search by name, email or user ID..."
              value={
                directorySearch
              }
              onChange={(event) =>
                setDirectorySearch(
                  event.target.value
                )
              }
            />

          </div>

        </div>

        {/* TABLE */}

        <div className="sam-table-wrap">

          <table className="sam-table">

            <thead>
              <tr>
                <th>
                  ADMINISTRATOR
                </th>

                <th>
                  EMAIL
                </th>

                <th>
                  DESIGNATION
                </th>

                <th>
                  STATUS
                </th>

                <th>
                  ACCOUNT
                </th>

                <th>
                  ACTION
                </th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="sam-table-empty"
                  >
                    <RefreshCw
                      size={20}
                      className="sam-spin"
                    />

                    <span>
                      Loading Super
                      Administrators...
                    </span>
                  </td>
                </tr>
              ) : filteredSuperAdmins.length ===
                0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="sam-table-empty"
                  >
                    <ShieldCheck
                      size={30}
                    />

                    <strong>
                      No Super Administrators found
                    </strong>

                    <span>
                      Use "Add Super Admin"
                      to promote a registered
                      user.
                    </span>
                  </td>
                </tr>
              ) : (
                filteredSuperAdmins.map(
                  (user) => {
                    const name =
                      user?.displayName ||
                      user?.name ||
                      "Unnamed";

                    const userId =
                      user?.id ||
                      user?.uid ||
                      "";

                    const accountDate =
                      user?.activeDate ||
                      user?.createdAt;

                    return (
                      <tr
                        key={userId}
                      >

                        <td>
                          <div className="sam-member">

                            <div className="sam-member-avatar">
                              {name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {name}
                              </strong>

                              <small>
                                ID:{" "}
                                {userId ||
                                  "—"}
                              </small>
                            </div>

                          </div>
                        </td>

                        <td>
                          <div className="sam-email">
                            <Mail size={15} />

                            {user?.email ||
                              "—"}
                          </div>
                        </td>

                        <td>
                          <span className="sam-role-badge">
                            <ShieldCheck
                              size={13}
                            />

                            Super Administrator
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              user?.disabled
                                ? "sam-status disabled"
                                : "sam-status active"
                            }
                          >
                            <span />

                            {user?.disabled
                              ? "Disabled"
                              : "Active"}
                          </span>
                        </td>

                        <td>
                          <span className="sam-account-date">
                            <CalendarDays
                              size={14}
                            />

                            {formatDate(
                              accountDate
                            )}
                          </span>
                        </td>

                        <td>
                          <div className="sam-actions">

                            <button
                              type="button"
                              className={
                                user?.disabled
                                  ? "sam-enable-btn"
                                  : "sam-disable-btn"
                              }
                              onClick={() =>
                                toggleStatus(
                                  user
                                )
                              }
                            >
                              {user?.disabled
                                ? "Enable"
                                : "Disable"}
                            </button>

                            <button
                              type="button"
                              className="sam-more-btn"
                              title="More actions"
                            >
                              <MoreHorizontal
                                size={17}
                              />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}