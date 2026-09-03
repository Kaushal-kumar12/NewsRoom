import React, { useEffect, useMemo, useState } from "react";

import {
  Search,
  UserPlus,
  Users,
  ShieldCheck,
  Newspaper,
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  BriefcaseBusiness,
  GraduationCap,
  MapPin,
  FileText,
  UserCheck,
  UserX,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import {
  listUsers,
  updateUserRole,
  updateUserStatus,
  ROLES,
} from "../../services/superAdminService";


const STAFF_ROLES = [
  {
    value: ROLES.ADMIN,
    label: "Administrator",
    description: "Administrative staff member",
    icon: ShieldCheck,
    className: "admin",
  },
  {
    value: ROLES.AUTHOR,
    label: "Author",
    description: "Creates and manages news content",
    icon: Newspaper,
    className: "author",
  },
  {
    value: ROLES.EDITOR,
    label: "Editor",
    description: "Reviews and edits editorial content",
    icon: UserRound,
    className: "editor",
  },
];


const getRoleInfo = (role) => {
  return (
    STAFF_ROLES.find(
      (item) => item.value === role
    ) || {
      value: role,
      label: role || "Staff",
      description: "Staff member",
      icon: Users,
      className: "staff",
    }
  );
};


export default function SuperAdminAdministratorsPage() {

  const [users, setUsers] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [staffSearch, setStaffSearch] =
    useState("");

  const [userSearch, setUserSearch] =
    useState("");

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] = useState({
    role: ROLES.ADMIN,
    experience: "",
    joiningDate: "",
    activeDate: "",
    mobile: "",
    department: "",
    qualification: "",
    address: "",
    notes: "",
  });


  /* ============================================================
     LOAD USERS
  ============================================================ */

  const loadUsers = async () => {

    setLoading(true);
    setError("");

    try {

      const result =
        await listUsers();

      setUsers(
        Array.isArray(result)
          ? result
          : []
      );

    } catch (err) {

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


  /* ============================================================
     STAFF USERS
  ============================================================ */

  const staffUsers = useMemo(() => {

    return users.filter((user) => {

      return STAFF_ROLES.some(
        (role) =>
          role.value === user.role
      );

    });

  }, [users]);


  /* ============================================================
     FILTER STAFF LIST
  ============================================================ */

  const filteredStaff = useMemo(() => {

    const query =
      staffSearch
        .trim()
        .toLowerCase();

    if (!query) {
      return staffUsers;
    }

    return staffUsers.filter(
      (user) => {

        const name =
          user.displayName ||
          user.name ||
          "";

        const email =
          user.email ||
          "";

        const id =
          user.id ||
          "";

        const role =
          user.role ||
          "";

        return (
          name.toLowerCase().includes(query) ||
          email.toLowerCase().includes(query) ||
          id.toLowerCase().includes(query) ||
          role.toLowerCase().includes(query)
        );

      }
    );

  }, [
    staffUsers,
    staffSearch,
  ]);


  /* ============================================================
     USER SEARCH FOR NEW STAFF
  ============================================================ */

  const userSearchResults = useMemo(() => {

    const query =
      userSearch
        .trim()
        .toLowerCase();

    if (!query) {
      return [];
    }

    return users
      .filter((user) => {

        const name =
          user.displayName ||
          user.name ||
          "";

        const email =
          user.email ||
          "";

        const id =
          user.id ||
          "";

        return (
          name.toLowerCase().includes(query) ||
          email.toLowerCase().includes(query) ||
          id.toLowerCase().includes(query)
        );

      })
      .slice(0, 8);

  }, [
    users,
    userSearch,
  ]);


  /* ============================================================
     SELECT USER FOR STAFF CREATION
  ============================================================ */

  const selectUser = (user) => {

    setSelectedUser(user);

    setUserSearch(
      user.email ||
      user.displayName ||
      user.name ||
      user.id ||
      ""
    );

    setMessage("");
    setError("");

  };


  /* ============================================================
     CLEAR STAFF FORM
  ============================================================ */

  const clearSelection = () => {

    setSelectedUser(null);

    setUserSearch("");

    setForm({
      role: ROLES.ADMIN,
      experience: "",
      joiningDate: "",
      activeDate: "",
      mobile: "",
      department: "",
      qualification: "",
      address: "",
      notes: "",
    });

    setMessage("");
    setError("");

  };


  /* ============================================================
     FORM CHANGE
  ============================================================ */

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  /* ============================================================
     CREATE / PROMOTE STAFF
  ============================================================ */

  const createStaff = async (event) => {

    event.preventDefault();

    setError("");
    setMessage("");

    if (!selectedUser) {

      setError(
        "Please search and select a registered user first."
      );

      return;
    }

    if (
      selectedUser.role &&
      STAFF_ROLES.some(
        (item) =>
          item.value === selectedUser.role
      )
    ) {

      setError(
        "This user is already a staff member."
      );

      return;
    }

    setSaving(true);

    try {

      /*
       * This changes the user's designation.
       *
       * Optional staff information is kept in the
       * form state for the next service-layer update.
       */
      await updateUserRole(
        selectedUser.id,
        form.role
      );

      /*
       * NOTE:
       * The existing updateUserRole() service only changes
       * the role. The additional staff fields below need to
       * be persisted through your Firebase service.
       *
       * Do NOT put Firebase writes directly inside this page.
       */

      setMessage(
        `${selectedUser.displayName || selectedUser.name || "User"} has been added as ${getRoleInfo(form.role).label}.`
      );

      await loadUsers();

      clearSelection();

    } catch (err) {

      setError(
        err?.message ||
        "Unable to create staff member."
      );

    } finally {

      setSaving(false);

    }
  };


  /* ============================================================
     ENABLE / DISABLE STAFF
  ============================================================ */

  const toggleStatus = async (user) => {

    setError("");
    setMessage("");

    try {

      await updateUserStatus(
        user.id,
        user.disabled !== true
      );

      setMessage(
        `${user.displayName || user.name || "Staff member"} is now ${
          user.disabled
            ? "active"
            : "disabled"
        }.`
      );

      await loadUsers();

    } catch (err) {

      setError(
        err?.message ||
        "Unable to update staff status."
      );

    }
  };


  /* ============================================================
     RENDER
  ============================================================ */

  return (

    <div className="sa-admin-page">

      {/* ========================================================
          PAGE HEADER
      ======================================================== */}

      <section className="sa-admin-page-header">

        <div>

          <span className="sa-admin-eyebrow">
            STAFF MANAGEMENT
          </span>

          <h1>
            Administrators & Staff
          </h1>

          <p>
            Manage administrators, authors and editors
            across the NewsRoom administration system.
          </p>

        </div>


        <button
          type="button"
          className="sa-admin-refresh"
          onClick={loadUsers}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={
              loading
                ? "sa-admin-spin"
                : ""
            }
          />

          Refresh
        </button>

      </section>


      {/* ========================================================
          ALERTS
      ======================================================== */}

      {error && (

        <div className="sa-admin-alert sa-admin-alert-error">

          <AlertCircle size={18} />

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <X size={15} />
          </button>

        </div>

      )}


      {message && (

        <div className="sa-admin-alert sa-admin-alert-success">

          <CheckCircle2 size={18} />

          <span>
            {message}
          </span>

          <button
            type="button"
            onClick={() => setMessage("")}
          >
            <X size={15} />
          </button>

        </div>

      )}


      {/* ========================================================
          STAFF SUMMARY
      ======================================================== */}

      <section className="sa-admin-summary">

        {STAFF_ROLES.map((role) => {

          const Icon = role.icon;

          const count =
            staffUsers.filter(
              (user) =>
                user.role === role.value
            ).length;

          return (

            <div
              className={`sa-admin-summary-card ${role.className}`}
              key={role.value}
            >

              <div className="sa-admin-summary-icon">

                <Icon size={20} />

              </div>

              <div>

                <strong>
                  {count}
                </strong>

                <span>
                  {role.label}
                </span>

              </div>

            </div>

          );

        })}


        <div className="sa-admin-summary-card total">

          <div className="sa-admin-summary-icon">

            <Users size={20} />

          </div>

          <div>

            <strong>
              {staffUsers.length}
            </strong>

            <span>
              Total Staff
            </span>

          </div>

        </div>

      </section>


      {/* ========================================================
          CREATE STAFF + STAFF LIST
      ======================================================== */}

      <section className="sa-admin-management-grid">


        {/* ======================================================
            CREATE STAFF
        ====================================================== */}

        <div className="sa-admin-create-card">

          <div className="sa-admin-card-header">

            <div className="sa-admin-card-icon">

              <UserPlus size={19} />

            </div>

            <div>

              <h2>
                Add Staff Member
              </h2>

              <p>
                Promote an existing registered user.
              </p>

            </div>

          </div>


          <form
            onSubmit={createStaff}
            className="sa-admin-create-form"
          >

            {/* USER SEARCH */}

            <div className="sa-admin-field">

              <label>
                Search Registered User
              </label>

              <div className="sa-admin-search-box">

                <Search size={17} />

                <input
                  type="text"
                  value={userSearch}
                  onChange={(event) =>
                    setUserSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search by user ID, email or name..."
                />

              </div>


              {userSearch &&
                !selectedUser &&
                userSearchResults.length > 0 && (

                <div className="sa-admin-user-results">

                  {userSearchResults.map(
                    (user) => (

                      <button
                        type="button"
                        key={user.id}
                        className="sa-admin-user-result"
                        onClick={() =>
                          selectUser(user)
                        }
                      >

                        <div className="sa-admin-result-avatar">

                          {(user.displayName ||
                            user.name ||
                            "U")
                            .charAt(0)
                            .toUpperCase()}

                        </div>

                        <div>

                          <strong>
                            {user.displayName ||
                              user.name ||
                              "Unnamed User"}
                          </strong>

                          <span>
                            {user.email ||
                              user.id}
                          </span>

                        </div>

                      </button>

                    )
                  )}

                </div>

              )}


              {userSearch &&
                !selectedUser &&
                userSearchResults.length === 0 && (

                <div className="sa-admin-no-results">

                  No registered user found.

                </div>

              )}

            </div>


            {/* SELECTED USER */}

            {selectedUser && (

              <div className="sa-admin-selected-user">

                <div className="sa-admin-selected-avatar">

                  {(selectedUser.displayName ||
                    selectedUser.name ||
                    "U")
                    .charAt(0)
                    .toUpperCase()}

                </div>


                <div className="sa-admin-selected-info">

                  <strong>
                    {selectedUser.displayName ||
                      selectedUser.name ||
                      "Unnamed User"}
                  </strong>

                  <span>
                    {selectedUser.email ||
                      "No email"}
                  </span>

                  <small>
                    ID: {selectedUser.id}
                  </small>

                </div>


                <button
                  type="button"
                  className="sa-admin-clear-user"
                  onClick={clearSelection}
                  title="Remove selected user"
                >
                  <X size={17} />
                </button>

              </div>

            )}


            {/* DESIGNATION */}

            <div className="sa-admin-field">

              <label>
                Designation
              </label>

              <div className="sa-admin-role-grid">

                {STAFF_ROLES.map(
                  (role) => {

                    const Icon =
                      role.icon;

                    const active =
                      form.role ===
                      role.value;

                    return (

                      <button
                        type="button"
                        key={role.value}
                        className={`sa-admin-role-option ${
                          active
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          setForm(
                            (previous) => ({
                              ...previous,
                              role: role.value,
                            })
                          )
                        }
                      >

                        <Icon size={18} />

                        <span>

                          <strong>
                            {role.label}
                          </strong>

                          <small>
                            {role.description}
                          </small>

                        </span>

                      </button>

                    );

                  }
                )}

              </div>

            </div>


            {/* DETAILS */}

            <div className="sa-admin-form-divider">

              <span>
                Staff Details
              </span>

              <small>
                Optional information
              </small>

            </div>


            <div className="sa-admin-form-grid">


              <div className="sa-admin-field">

                <label>
                  Experience
                </label>

                <div className="sa-admin-input-icon">

                  <BriefcaseBusiness size={16} />

                  <input
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    placeholder="e.g. 5 years"
                  />

                </div>

              </div>


              <div className="sa-admin-field">

                <label>
                  Mobile Number
                </label>

                <div className="sa-admin-input-icon">

                  <Phone size={16} />

                  <input
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="Mobile number"
                  />

                </div>

              </div>


              <div className="sa-admin-field">

                <label>
                  Joining Date
                </label>

                <div className="sa-admin-input-icon">

                  <CalendarDays size={16} />

                  <input
                    type="date"
                    name="joiningDate"
                    value={form.joiningDate}
                    onChange={handleChange}
                  />

                </div>

              </div>


              <div className="sa-admin-field">

                <label>
                  Active Date
                </label>

                <div className="sa-admin-input-icon">

                  <CalendarDays size={16} />

                  <input
                    type="date"
                    name="activeDate"
                    value={form.activeDate}
                    onChange={handleChange}
                  />

                </div>

              </div>


              <div className="sa-admin-field">

                <label>
                  Department
                </label>

                <div className="sa-admin-input-icon">

                  <BriefcaseBusiness size={16} />

                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="e.g. Editorial"
                  />

                </div>

              </div>


              <div className="sa-admin-field">

                <label>
                  Qualification
                </label>

                <div className="sa-admin-input-icon">

                  <GraduationCap size={16} />

                  <input
                    name="qualification"
                    value={form.qualification}
                    onChange={handleChange}
                    placeholder="Qualification"
                  />

                </div>

              </div>


              <div className="sa-admin-field full">

                <label>
                  Address
                </label>

                <div className="sa-admin-input-icon textarea">

                  <MapPin size={16} />

                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Complete address"
                    rows="2"
                  />

                </div>

              </div>


              <div className="sa-admin-field full">

                <label>
                  Notes
                </label>

                <div className="sa-admin-input-icon textarea">

                  <FileText size={16} />

                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Additional staff information..."
                    rows="3"
                  />

                </div>

              </div>

            </div>


            <button
              type="submit"
              className="sa-admin-create-button"
              disabled={
                saving ||
                !selectedUser
              }
            >

              {saving ? (

                <>
                  <RefreshCw
                    size={17}
                    className="sa-admin-spin"
                  />

                  Adding Staff...
                </>

              ) : (

                <>
                  <UserPlus size={17} />

                  Add Staff Member
                </>

              )}

            </button>

          </form>

        </div>


        {/* ======================================================
            STAFF LIST
        ====================================================== */}

        <div className="sa-admin-list-card">

          <div className="sa-admin-card-header">

            <div className="sa-admin-card-icon">

              <Users size={19} />

            </div>

            <div>

              <h2>
                Staff Directory
              </h2>

              <p>
                All administrators, authors and editors.
              </p>

            </div>

          </div>


          {/* SEARCH */}

          <div className="sa-admin-list-toolbar">

            <div className="sa-admin-search-box">

              <Search size={17} />

              <input
                type="text"
                value={staffSearch}
                onChange={(event) =>
                  setStaffSearch(
                    event.target.value
                  )
                }
                placeholder="Search staff by name, email, ID or designation..."
              />

            </div>

            <span className="sa-admin-result-count">

              {filteredStaff.length}
              {" "}
              staff

            </span>

          </div>


          {/* LIST */}

          <div className="sa-admin-table-wrap">

            <table className="sa-admin-table">

              <thead>

                <tr>

                  <th>
                    Staff Member
                  </th>

                  <th>
                    Designation
                  </th>

                  <th>
                    Contact
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan="5"
                      className="sa-admin-table-empty"
                    >

                      <RefreshCw
                        size={18}
                        className="sa-admin-spin"
                      />

                      Loading staff directory...

                    </td>

                  </tr>

                ) : filteredStaff.length === 0 ? (

                  <tr>

                    <td
                      colSpan="5"
                      className="sa-admin-table-empty"
                    >

                      <Users size={25} />

                      <strong>
                        No staff members found
                      </strong>

                      <span>
                        Administrators, authors and editors
                        will appear here.
                      </span>

                    </td>

                  </tr>

                ) : (

                  filteredStaff.map(
                    (user) => {

                      const roleInfo =
                        getRoleInfo(
                          user.role
                        );

                      const RoleIcon =
                        roleInfo.icon;

                      const name =
                        user.displayName ||
                        user.name ||
                        "Unnamed User";

                      return (

                        <tr
                          key={user.id}
                        >

                          <td>

                            <div className="sa-admin-staff-cell">

                              <div className="sa-admin-avatar">

                                {name
                                  .charAt(0)
                                  .toUpperCase()}

                              </div>

                              <div>

                                <strong>
                                  {name}
                                </strong>

                                <span>
                                  {user.id}
                                </span>

                              </div>

                            </div>

                          </td>


                          <td>

                            <span
                              className={`sa-admin-designation ${roleInfo.className}`}
                            >

                              <RoleIcon
                                size={14}
                              />

                              {roleInfo.label}

                            </span>

                          </td>


                          <td>

                            <div className="sa-admin-contact">

                              <span>

                                <Mail size={13} />

                                {user.email ||
                                  "No email"}

                              </span>

                              {user.mobile && (

                                <span>

                                  <Phone size={13} />

                                  {user.mobile}

                                </span>

                              )}

                            </div>

                          </td>


                          <td>

                            <span
                              className={`sa-admin-status ${
                                user.disabled
                                  ? "disabled"
                                  : "active"
                              }`}
                            >

                              {user.disabled ? (

                                <>
                                  <UserX
                                    size={13}
                                  />

                                  Disabled
                                </>

                              ) : (

                                <>
                                  <UserCheck
                                    size={13}
                                  />

                                  Active
                                </>

                              )}

                            </span>

                          </td>


                          <td>

                            <button
                              type="button"
                              className={`sa-admin-status-button ${
                                user.disabled
                                  ? "enable"
                                  : "disable"
                              }`}
                              onClick={() =>
                                toggleStatus(
                                  user
                                )
                              }
                            >

                              {user.disabled
                                ? "Enable"
                                : "Disable"}

                            </button>

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

      </section>

    </div>
  );
}