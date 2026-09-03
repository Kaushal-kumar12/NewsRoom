// src/components/admin/StaffSidebar.jsx

import React from "react";

import {
  NavLink,
  useLocation,
} from "react-router-dom";

import {
  BarChart3,
  CalendarClock,
  CheckCircle2,
  FileText,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Newspaper,
  PenSquare,
  Send,
  Tags,
  UserCircle,
  Users,
  XCircle,
  Inbox,
  MessageSquare,
} from "lucide-react";

import {
  getRoleLabel,
  hasPermission,
  normalizeRole,
  PERMISSIONS,
  ROLES,
} from "../../config/rolePermissions";

import {
  useStaffAuth,
} from "../auth/StaffRoute";

import {
  signOut,
} from "firebase/auth";

import {
  auth,
} from "../../services/firebase";


/* ============================================================
   ADMIN MENU
============================================================ */

const ADMIN_MENU = [

  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
    permission:
      PERMISSIONS.DASHBOARD_VIEW,
  },

  {
    label: "News Management",
    path: "/admin/news",
    icon: Newspaper,
    permission:
      PERMISSIONS.NEWS_READ,
  },

  {
    label: "Create News",
    path: "/admin/news/new",
    icon: PenSquare,
    permission:
      PERMISSIONS.NEWS_CREATE,
    forceVisible: true,
  },

  {
    label: "Users",
    path: "/admin/users",
    icon: Users,
    permission:
      PERMISSIONS.USERS_READ,
  },

  {
    label: "Comments",
    path: "/admin/comments",
    icon: MessageSquare,
    permission:
      PERMISSIONS.COMMENTS_READ,
  },

  {
    label: "Categories",
    path: "/admin/categories",
    icon: FolderTree,
    permission:
      PERMISSIONS.CATEGORIES_READ,
  },

  {
    label: "Tags",
    path: "/admin/tags",
    icon: Tags,
    permission:
      PERMISSIONS.TAGS_READ,
  },

  {
    label: "Advertisements",
    path: "/admin/advertisements",
    icon: Megaphone,
    permission:
      PERMISSIONS.ADS_READ,
  },

  {
    label: "Analytics",
    path: "/admin/analytics",
    icon: BarChart3,
    permission:
      PERMISSIONS.ANALYTICS_VIEW,
  },

  {
    label: "My Profile",
    path: "/admin/profile",
    icon: UserCircle,
    permission:
      PERMISSIONS.STAFF_PROFILE,
  },

];


/* ============================================================
   AUTHOR MENU
============================================================ */

const AUTHOR_MENU = [

  {
    label: "Dashboard",
    path: "/author/dashboard",
    icon: LayoutDashboard,
    forceVisible: true,
  },

  {
    label: "My Stories",
    path: "/author/stories",
    icon: FileText,
    forceVisible: true,
  },

  {
    label: "Create Story",
    path: "/author/create",
    icon: PenSquare,
    forceVisible: true,
  },

  {
    label: "Drafts",
    path: "/author/drafts",
    icon: FileText,
    forceVisible: true,
  },

  {
    label: "Submitted",
    path: "/author/submitted",
    icon: Send,
    forceVisible: true,
  },

  {
    label: "Changes Requested",
    path: "/author/changes",
    icon: Inbox,
    forceVisible: true,
  },

  {
    label: "Published",
    path: "/author/published",
    icon: CheckCircle2,
    forceVisible: true,
  },

  {
    label: "Analytics",
    path: "/author/analytics",
    icon: BarChart3,
    forceVisible: true,
  },

  {
    label: "My Profile",
    path: "/author/profile",
    icon: UserCircle,
    forceVisible: true,
  },

];


/* ============================================================
   EDITOR MENU
============================================================ */

const EDITOR_MENU = [

  {
    label: "Dashboard",
    path: "/editor/dashboard",
    icon: LayoutDashboard,
    forceVisible: true,
  },


  /*
   * IMPORTANT:
   *
   * Editor can create news.
   */

  {
    label: "Create News",
    path: "/editor/create",
    icon: PenSquare,
    forceVisible: true,
  },


  {
    label: "Review Queue",
    path: "/editor/review",
    icon: Inbox,
    forceVisible: true,
  },

  {
    label: "Changes Requested",
    path: "/editor/changes-requested",
    icon: Send,
    forceVisible: true,
  },

  {
    label: "Published",
    path: "/editor/published",
    icon: CheckCircle2,
    forceVisible: true,
  },

  {
    label: "Rejected",
    path: "/editor/rejected",
    icon: XCircle,
    forceVisible: true,
  },

  {
    label: "Scheduled",
    path: "/editor/scheduled",
    icon: CalendarClock,
    forceVisible: true,
  },

  {
    label: "Analytics",
    path: "/editor/analytics",
    icon: BarChart3,
    forceVisible: true,
  },

  {
    label: "My Profile",
    path: "/editor/profile",
    icon: UserCircle,
    forceVisible: true,
  },

];


/* ============================================================
   GET MENU
============================================================ */

function getMenuForRole(role) {

  const normalizedRole =
    normalizeRole(role);


  switch (normalizedRole) {

    case ROLES.ADMIN:
      return ADMIN_MENU;

    case ROLES.EDITOR:
      return EDITOR_MENU;

    case ROLES.AUTHOR:
      return AUTHOR_MENU;

    default:
      return [];

  }

}


/* ============================================================
   WORKSPACE LABEL
============================================================ */

function getWorkspaceLabel(role) {

  const normalizedRole =
    normalizeRole(role);


  if (
    normalizedRole ===
    ROLES.ADMIN
  ) {

    return "Administrator Workspace";

  }


  if (
    normalizedRole ===
    ROLES.EDITOR
  ) {

    return "Editorial Workspace";

  }


  if (
    normalizedRole ===
    ROLES.AUTHOR
  ) {

    return "Author Workspace";

  }


  return "Staff Workspace";

}


/* ============================================================
   COMPONENT
============================================================ */

export default function StaffSidebar() {

  const {
    role,
    profile,
  } = useStaffAuth();


  const location =
    useLocation();


  const normalizedRole =
    normalizeRole(role);


  const menu =
    getMenuForRole(
      normalizedRole
    );


  const displayName =
    profile?.name ||
    profile?.displayName ||
    profile?.email ||
    "Staff User";


  const avatarLetter =
    String(displayName)
      .charAt(0)
      .toUpperCase() || "S";


  function isItemActive(item) {

    const currentPath =
      location.pathname;


    const itemPath =
      item.path;


    if (
      itemPath.endsWith(
        "/dashboard"
      )
    ) {

      return (
        currentPath ===
        itemPath
      );

    }


    if (
      itemPath.endsWith(
        "/create"
      ) ||
      itemPath.endsWith(
        "/new"
      )
    ) {

      return (
        currentPath ===
        itemPath
      );

    }


    return (
      currentPath ===
        itemPath ||
      currentPath.startsWith(
        `${itemPath}/`
      )
    );

  }


  async function handleLogout() {

    try {

      await signOut(auth);

      window.location.href =
        "/admin/login";

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

    }

  }


  return (
    <aside className="staff-sidebar">


      {/* BRAND */}

      <div className="staff-sidebar-brand">

        <div className="staff-brand-icon">
          N
        </div>


        <div className="staff-brand-text">

          <strong>
            NewsRoom
          </strong>

          <span>
            {getWorkspaceLabel(
              normalizedRole
            )}
          </span>

        </div>

      </div>


      {/* PROFILE */}

      <div className="staff-profile-mini">

        <div className="staff-avatar">

          {avatarLetter}

        </div>


        <div className="staff-profile-info">

          <strong>
            {displayName}
          </strong>

          <span>
            {getRoleLabel(
              normalizedRole
            )}
          </span>

        </div>

      </div>


      {/* NAVIGATION */}

      <nav className="staff-navigation">

        <div className="staff-nav-title">
          WORKSPACE
        </div>


        {menu.map(
          (item) => {

            const canShow =
              item.forceVisible ||
              !item.permission ||
              hasPermission(
                normalizedRole,
                item.permission
              );


            if (!canShow) {

              return null;

            }


            const Icon =
              item.icon;


            const active =
              isItemActive(item);


            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={
                  active
                    ? "staff-nav-link active"
                    : "staff-nav-link"
                }
              >

                <Icon size={18} />

                <span>
                  {item.label}
                </span>

              </NavLink>
            );

          }
        )}

      </nav>


      {/* FOOTER */}

      <div className="staff-sidebar-footer">


        <div className="staff-role-note">

          {getRoleLabel(
            normalizedRole
          )}

        </div>


        <button
          type="button"
          className="staff-logout"
          onClick={handleLogout}
        >

          <LogOut size={18} />

          <span>
            Sign out
          </span>

        </button>

      </div>

    </aside>
  );

}