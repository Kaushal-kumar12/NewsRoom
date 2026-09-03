import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShieldCheck,
  Users,
  UserCog,
  UserRound,
  Crown,
  RefreshCw,
  RotateCcw,
  ChevronDown,
} from "lucide-react";

import {
  listUsers,
  updateUserRole,
  ROLES,
} from "../../services/superAdminService";

import { useAuth } from "../../context/AuthContext";

export default function RoleManagementPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /*
   * ---------------------------------------------------------
   * LOAD USERS
   * ---------------------------------------------------------
   */

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await listUsers();
      setUsers(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Unable to load users:", err);

      setError(
        err?.message ||
          "Unable to load users and their roles."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /*
   * ---------------------------------------------------------
   * NORMALIZE ROLE
   * ---------------------------------------------------------
   */

  const getRole = (user) => {
    return user?.role || ROLES.USER || "USER";
  };

  /*
   * ---------------------------------------------------------
   * ROLE COUNTS
   * ---------------------------------------------------------
   */

  const roleCounts = useMemo(() => {
    const counts = {
      SUPER_ADMIN: 0,
      ADMIN: 0,
      EDITOR: 0,
      AUTHOR: 0,
      USER: 0,
    };

    users.forEach((user) => {
      const role = getRole(user);

      if (counts[role] !== undefined) {
        counts[role] += 1;
      }
    });

    return counts;
  }, [users]);

  /*
   * ---------------------------------------------------------
   * SEARCH + FILTER
   * ---------------------------------------------------------
   */

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const role = getRole(user);

      const matchesRole =
        roleFilter === "ALL" ||
        role === roleFilter;

      if (!matchesRole) {
        return false;
      }

      if (!term) {
        return true;
      }

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
        String(name).toLowerCase().includes(term) ||
        String(email).toLowerCase().includes(term) ||
        String(id).toLowerCase().includes(term) ||
        String(role).toLowerCase().includes(term)
      );
    });
  }, [users, search, roleFilter]);

  /*
   * ---------------------------------------------------------
   * ROLE UPDATE
   * ---------------------------------------------------------
   */

  const changeRole = async (user, newRole) => {
    if (!user?.id) {
      setError("User ID is missing.");
      return;
    }

    /*
     * Do not allow the currently logged-in Super Admin
     * to accidentally remove their own Super Admin access.
     */
    const currentUid =
      currentUser?.uid ||
      currentUser?.id;

    const targetUid =
      user?.uid ||
      user?.id;

    if (
      currentUid &&
      targetUid &&
      currentUid === targetUid &&
      newRole !== "SUPER_ADMIN"
    ) {
      setError(
        "You cannot remove or change your own Super Administrator role."
      );

      return;
    }

    const oldRole = getRole(user);

    if (oldRole === newRole) {
      return;
    }

    setUpdatingId(user.id);
    setError("");
    setMessage("");

    try {
      await updateUserRole(
        user.id,
        newRole
      );

      setMessage(
        `${user.displayName || user.email || "User"} role changed to ${formatRole(
          newRole
        )}.`
      );

      await loadUsers();
    } catch (err) {
      console.error("Role update failed:", err);

      setError(
        err?.message ||
          "Unable to update user role."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /*
   * ---------------------------------------------------------
   * REVOKE ROLE
   * ---------------------------------------------------------
   */

  const revokeRole = async (user) => {
    const currentRole = getRole(user);

    if (currentRole === "USER") {
      return;
    }

    const name =
      user?.displayName ||
      user?.name ||
      user?.email ||
      "this user";

    const confirmed = window.confirm(
      `Revoke the ${formatRole(
        currentRole
      )} role from ${name}?\n\nThe user will be returned to the Registered User role.`
    );

    if (!confirmed) {
      return;
    }

    await changeRole(
      user,
      ROLES.USER || "USER"
    );
  };

  /*
   * ---------------------------------------------------------
   * ROLE DISPLAY
   * ---------------------------------------------------------
   */

  const formatRole = (role) => {
    if (!role) {
      return "User";
    }

    return String(role)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const getRoleClass = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "role-badge super-admin";

      case "ADMIN":
        return "role-badge administrator";

      case "EDITOR":
        return "role-badge editor";

      case "AUTHOR":
        return "role-badge author";

      default:
        return "role-badge user";
    }
  };

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <div className="role-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="role-page-header">

        <div>
          <p className="role-page-eyebrow">
            ACCESS CONTROL
          </p>

          <h1>
            Role Management
          </h1>

          <p className="role-page-description">
            Manage user roles, administrative access,
            and permissions across the NewsRoom system.
          </p>
        </div>

        <button
          type="button"
          className="role-refresh-button"
          onClick={loadUsers}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "role-spin" : ""}
          />

          Refresh
        </button>

      </header>


      {/* =====================================================
          ALERTS
      ====================================================== */}

      {error && (
        <div className="role-alert role-alert-error">
          {error}
        </div>
      )}

      {message && (
        <div className="role-alert role-alert-success">
          {message}
        </div>
      )}


      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <section className="role-stat-grid">

        <div className="role-stat-card">

          <div className="role-stat-icon blue">
            <Users size={20} />
          </div>

          <div>
            <strong>
              {users.length}
            </strong>

            <span>
              Total Users
            </span>
          </div>

        </div>


        <div className="role-stat-card">

          <div className="role-stat-icon purple">
            <Crown size={20} />
          </div>

          <div>
            <strong>
              {roleCounts.SUPER_ADMIN}
            </strong>

            <span>
              Super Administrators
            </span>
          </div>

        </div>


        <div className="role-stat-card">

          <div className="role-stat-icon orange">
            <ShieldCheck size={20} />
          </div>

          <div>
            <strong>
              {roleCounts.ADMIN}
            </strong>

            <span>
              Administrators
            </span>
          </div>

        </div>


        <div className="role-stat-card">

          <div className="role-stat-icon green">
            {roleCounts.AUTHOR + roleCounts.EDITOR}
          </div>

          <div>
            <strong>
              {roleCounts.AUTHOR + roleCounts.EDITOR}
            </strong>

            <span>
              Editorial Staff
            </span>
          </div>

        </div>

      </section>


      {/* =====================================================
          ROLE SUMMARY
      ====================================================== */}

      <section className="role-summary-panel">

        <div className="role-summary-header">

          <div className="role-summary-title">

            <div className="role-summary-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <h2>
                System Roles
              </h2>

              <p>
                Overview of the roles currently available
                in NewsRoom.
              </p>
            </div>

          </div>

        </div>


        <div className="role-summary-grid">

          <button
            type="button"
            className={`role-summary-card ${
              roleFilter === "SUPER_ADMIN"
                ? "selected"
                : ""
            }`}
            onClick={() =>
              setRoleFilter(
                roleFilter === "SUPER_ADMIN"
                  ? "ALL"
                  : "SUPER_ADMIN"
              )
            }
          >
            <Crown size={18} />

            <div>
              <strong>
                Super Administrator
              </strong>

              <span>
                {roleCounts.SUPER_ADMIN} users
              </span>
            </div>
          </button>


          <button
            type="button"
            className={`role-summary-card ${
              roleFilter === "ADMIN"
                ? "selected"
                : ""
            }`}
            onClick={() =>
              setRoleFilter(
                roleFilter === "ADMIN"
                  ? "ALL"
                  : "ADMIN"
              )
            }
          >
            <ShieldCheck size={18} />

            <div>
              <strong>
                Administrator
              </strong>

              <span>
                {roleCounts.ADMIN} users
              </span>
            </div>
          </button>


          <button
            type="button"
            className={`role-summary-card ${
              roleFilter === "EDITOR"
                ? "selected"
                : ""
            }`}
            onClick={() =>
              setRoleFilter(
                roleFilter === "EDITOR"
                  ? "ALL"
                  : "EDITOR"
              )
            }
          >
            <UserCog size={18} />

            <div>
              <strong>
                Editor
              </strong>

              <span>
                {roleCounts.EDITOR} users
              </span>
            </div>
          </button>


          <button
            type="button"
            className={`role-summary-card ${
              roleFilter === "AUTHOR"
                ? "selected"
                : ""
            }`}
            onClick={() =>
              setRoleFilter(
                roleFilter === "AUTHOR"
                  ? "ALL"
                  : "AUTHOR"
              )
            }
          >
            <UserRound size={18} />

            <div>
              <strong>
                Author
              </strong>

              <span>
                {roleCounts.AUTHOR} users
              </span>
            </div>
          </button>

        </div>

      </section>


      {/* =====================================================
          USER ROLE DIRECTORY
      ====================================================== */}

      <section className="role-directory-panel">

        <div className="role-directory-header">

          <div className="role-directory-title">

            <div className="role-directory-icon">
              <Users size={20} />
            </div>

            <div>
              <h2>
                User Role Directory
              </h2>

              <p>
                Assign, change or revoke roles
                for registered users.
              </p>
            </div>

          </div>

          <span className="role-user-count">
            {filteredUsers.length} users
          </span>

        </div>


        {/* SEARCH */}

        <div className="role-directory-tools">

          <div className="role-search-box">

            <Search size={18} />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, email, user ID or role..."
            />

          </div>


          <div className="role-filter-box">

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value)
              }
            >
              <option value="ALL">
                All roles
              </option>

              <option value="SUPER_ADMIN">
                Super Administrator
              </option>

              <option value="ADMIN">
                Administrator
              </option>

              <option value="EDITOR">
                Editor
              </option>

              <option value="AUTHOR">
                Author
              </option>

              <option value="USER">
                Registered User
              </option>
            </select>

            <ChevronDown size={15} />

          </div>

        </div>


        {/* TABLE */}

        <div className="role-table-wrap">

          <table className="role-table">

            <thead>

              <tr>
                <th>
                  USER
                </th>

                <th>
                  EMAIL
                </th>

                <th>
                  CURRENT ROLE
                </th>

                <th>
                  STATUS
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
                    colSpan="5"
                    className="role-table-empty"
                  >
                    <RefreshCw
                      size={22}
                      className="role-spin"
                    />

                    <span>
                      Loading users...
                    </span>
                  </td>
                </tr>

              ) : filteredUsers.length === 0 ? (

                <tr>
                  <td
                    colSpan="5"
                    className="role-table-empty"
                  >
                    <Users size={28} />

                    <strong>
                      No users found
                    </strong>

                    <span>
                      Try changing your search
                      or role filter.
                    </span>
                  </td>
                </tr>

              ) : (

                filteredUsers.map((user) => {

                  const role =
                    getRole(user);

                  const userId =
                    user?.uid ||
                    user?.id;

                  const isCurrentUser =
                    currentUser?.uid &&
                    currentUser.uid === userId;

                  const isUpdating =
                    updatingId === user.id;

                  return (

                    <tr key={user.id}>

                      {/* USER */}

                      <td>

                        <div className="role-user-cell">

                          <div className="role-avatar">

                            {(
                              user?.displayName ||
                              user?.name ||
                              user?.email ||
                              "U"
                            )
                              .charAt(0)
                              .toUpperCase()}

                          </div>

                          <div>

                            <strong>
                              {user?.displayName ||
                                user?.name ||
                                "Unnamed User"}
                            </strong>

                            <small>
                              ID:{" "}
                              {user?.id ||
                                user?.uid ||
                                "—"}
                            </small>

                          </div>

                        </div>

                      </td>


                      {/* EMAIL */}

                      <td>
                        <span className="role-email">
                          {user?.email || "—"}
                        </span>
                      </td>


                      {/* ROLE */}

                      <td>

                        <span
                          className={getRoleClass(
                            role
                          )}
                        >
                          {formatRole(role)}
                        </span>

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={`role-status ${
                            user?.disabled
                              ? "disabled"
                              : "active"
                          }`}
                        >
                          <i />
                          {user?.disabled
                            ? "Disabled"
                            : "Active"}
                        </span>

                      </td>


                      {/* ACTION */}

                      <td>

                        <div className="role-actions">

                          <select
                            value={role}
                            disabled={
                              isUpdating ||
                              isCurrentUser
                            }
                            onChange={(event) =>
                              changeRole(
                                user,
                                event.target.value
                              )
                            }
                            title={
                              isCurrentUser
                                ? "You cannot change your own role"
                                : "Change role"
                            }
                          >

                            <option value="USER">
                              Registered User
                            </option>

                            <option value="AUTHOR">
                              Author
                            </option>

                            <option value="EDITOR">
                              Editor
                            </option>

                            <option value="ADMIN">
                              Administrator
                            </option>

                            <option value="SUPER_ADMIN">
                              Super Administrator
                            </option>

                          </select>


                          {role !== "USER" &&
                            !isCurrentUser && (
                              <button
                                type="button"
                                className="role-revoke-button"
                                onClick={() =>
                                  revokeRole(user)
                                }
                                disabled={isUpdating}
                                title="Revoke elevated role"
                              >
                                <RotateCcw
                                  size={15}
                                />

                                Revoke
                              </button>
                            )}

                        </div>

                      </td>

                    </tr>

                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}