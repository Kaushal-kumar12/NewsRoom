import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  Activity,
  LayoutDashboard,
  Users,
  UserCog,
  ShieldCheck,
  UserRound,
  KeyRound,
  Newspaper,
  Shield,
  Settings,
  UserCircle,
  LogOut,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function SuperAdminSidebar({ onClose }) {
  const navigate = useNavigate();

  const { user, signOut } = useAuth();

  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = async () => {
    try {
      if (signOut) {
        await signOut();
      }

      navigate("/admin/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Super Admin logout failed:",
        error
      );
    }
  };

  /* =========================================
     SIDEBAR MENU
  ========================================= */

  const menuGroups = [
    {
      title: "OVERVIEW",

      items: [
        {
          label: "Dashboard",
          path: "/super-admin/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },

    {
      title: "USER MANAGEMENT",

      items: [
        {
          label: "All Users",
          path: "/super-admin/users",
          icon: Users,
        },

        {
          label: "Administrators",
          path: "/super-admin/admins",
          icon: UserCog,
        },

        {
          label: "Super Administrators",

          // IMPORTANT:
          // This must match AppRoutes.jsx
          path: "/super-admin/super-admins",

          icon: ShieldCheck,
        },
      ],
    },

    {
      title: "ACCESS CONTROL",

      items: [
        {
          label: "Roles",
          path: "/super-admin/roles",
          icon: UserRound,
        },

        {
          label: "Permissions",
          path: "/super-admin/permissions",
          icon: KeyRound,
        },
      ],
    },

    {
      title: "EDITORIAL",

      items: [
        {
          label: "Editorial Control",
          path: "/super-admin/editorial",
          icon: Newspaper,
        },
      ],
    },

    {
      title: "SECURITY",

      items: [
        {
          label: "Security & Audit",
          path: "/super-admin/security",
          icon: Shield,
        },
      ],
    },

    {
      title: "SYSTEM",

      items: [
        {
          label: "System Settings",
          path: "/super-admin/settings",
          icon: Settings,
        },

        {
          label: "My Profile",
          path: "/super-admin/profile",
          icon: UserCircle,
        },
      ],
    },
  ];

  return (
    <aside className="sa-sidebar">

      {/* =====================================
          BRAND
      ====================================== */}

      <div className="sa-sidebar-brand">

        <div className="sa-brand-icon">
          <Activity size={22} />
        </div>

        <div className="sa-brand-text">
          <strong>
            NewsRoom
          </strong>

          <span>
            SUPER ADMINISTRATION
          </span>
        </div>

        {/* Mobile close button */}

        <button
          type="button"
          className="sa-sidebar-close"
          aria-label="Close sidebar"
          onClick={onClose}
        >
          <X size={18} />
        </button>

      </div>


      {/* =====================================
          CURRENT USER
      ====================================== */}

      <div className="sa-sidebar-user">

        <div className="sa-user-avatar">

          {user?.displayName
            ?.charAt(0)
            ?.toUpperCase() || "SA"}

        </div>


        <div className="sa-user-info">

          <strong>
            {user?.displayName || "Super Admin"}
          </strong>

          <span>
            SUPER ADMINISTRATOR
          </span>

          {user?.email && (
            <small>
              {user.email}
            </small>
          )}

        </div>

      </div>


      {/* =====================================
          NAVIGATION
      ====================================== */}

      <nav
        className="sa-sidebar-nav"
        aria-label="Super Admin Navigation"
      >

        {menuGroups.map((group) => (

          <div
            className="sa-nav-group"
            key={group.title}
          >

            <div className="sa-nav-group-title">
              {group.title}
            </div>


            <div className="sa-nav-items">

              {group.items.map((item) => {

                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `sa-nav-link ${
                        isActive
                          ? "active"
                          : ""
                      }`
                    }
                    onClick={() => {
                      /*
                       * Close sidebar on mobile
                       * after selecting a page.
                       *
                       * Desktop remains unaffected.
                       */
                      if (
                        typeof onClose ===
                        "function"
                      ) {
                        onClose();
                      }
                    }}
                  >

                    <Icon
                      size={18}
                      className="sa-nav-icon"
                    />

                    <span>
                      {item.label}
                    </span>

                  </NavLink>
                );

              })}

            </div>

          </div>

        ))}

      </nav>


      {/* =====================================
          LOGOUT
      ====================================== */}

      <div className="sa-sidebar-footer">

        <button
          type="button"
          className="sa-logout-button"
          onClick={handleLogout}
        >

          <LogOut size={18} />

          <span>
            Logout
          </span>

        </button>

      </div>

    </aside>
  );
}