// src/components/editor/EditorLayout.jsx

import React, {
  useState,
} from "react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Inbox,
  CheckCircle2,
  XCircle,
  CalendarClock,
  BarChart3,
  UserCircle,
  LogOut,
  Menu,
  X,
  Newspaper,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import "../../styles/workspace.css";


export default function EditorLayout() {

  const {
    user,
    logout,
  } = useAuth();

  const navigate =
    useNavigate();


  const [
    sidebarVisible,
    setSidebarVisible,
  ] = useState(true);


  const toggleSidebar = () => {

    setSidebarVisible(
      (value) => !value
    );

  };


  const closeMobile = () => {

    if (
      window.innerWidth <= 768
    ) {

      setSidebarVisible(false);

    }

  };


  async function handleLogout() {

    try {

      await logout();

      navigate(
        "/admin/login",
        {
          replace: true,
        }
      );

    } catch (error) {

      console.error(
        "Logout failed:",
        error
      );

    }

  }


  const links = [

    {
      to:
        "/editor/dashboard",

      label:
        "Dashboard",

      icon:
        LayoutDashboard,
    },


    {
      to:
        "/editor/review",

      label:
        "Review Queue",

      icon:
        Inbox,
    },


    {
      to:
        "/editor/published",

      label:
        "Published",

      icon:
        CheckCircle2,
    },


    {
      to:
        "/editor/rejected",

      label:
        "Rejected",

      icon:
        XCircle,
    },


    {
      to:
        "/editor/scheduled",

      label:
        "Scheduled",

      icon:
        CalendarClock,
    },


    {
      to:
        "/editor/analytics",

      label:
        "Analytics",

      icon:
        BarChart3,
    },


    {
      to:
        "/editor/profile",

      label:
        "Profile",

      icon:
        UserCircle,
    },

  ];


  const userName =

    user?.name ||
    user?.displayName ||
    user?.email ||
    "Editor";


  return (

    <div
      className={`workspace-layout editor-workspace ${
        sidebarVisible
          ? "sidebar-visible"
          : "sidebar-hidden"
      }`}
    >


      {/* =====================================================
          SIDEBAR TOGGLE
      ===================================================== */}

      <button
        type="button"
        className="workspace-sidebar-toggle"
        onClick={toggleSidebar}
        aria-label={
          sidebarVisible
            ? "Hide sidebar"
            : "Show sidebar"
        }
      >

        {sidebarVisible ? (

          <X size={21} />

        ) : (

          <Menu size={21} />

        )}

      </button>


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className="workspace-sidebar editor-sidebar"
      >


        {/* BRAND */}

        <div className="workspace-brand editor-brand">

          <div className="workspace-brand-icon">

            <Newspaper size={21} />

          </div>


          <div className="workspace-brand-text">

            <strong>
              NewsRoom
            </strong>

            <span>
              Editorial Workspace
            </span>

          </div>

        </div>


        {/* NAVIGATION */}

        <nav className="workspace-navigation editor-navigation">

          {links.map(

            ({
              to,
              label,
              icon: Icon,
            }) => (

              <NavLink
                key={to}
                to={to}
                onClick={closeMobile}
                className={
                  ({
                    isActive,
                  }) =>

                    `workspace-nav-link editor-nav-link ${
                      isActive
                        ? "active"
                        : ""
                    }`
                }
              >

                <Icon size={19} />

                <span>
                  {label}
                </span>

              </NavLink>

            )

          )}

        </nav>


        {/* FOOTER */}

        <div className="workspace-sidebar-footer editor-sidebar-footer">


          <div className="workspace-user-card editor-user-card">

            <div className="workspace-avatar editor-avatar">

              {userName
                .charAt(0)
                .toUpperCase()}

            </div>


            <div className="workspace-user-details">

              <strong>
                {userName}
              </strong>

              <span>
                Editor
              </span>

            </div>

          </div>


          <button
            type="button"
            className="workspace-logout editor-logout"
            onClick={handleLogout}
          >

            <LogOut size={18} />

            <span>
              Sign out
            </span>

          </button>


        </div>


      </aside>


      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {sidebarVisible && (

        <button
          type="button"
          className="workspace-sidebar-overlay"
          onClick={closeMobile}
          aria-label="Close sidebar"
        />

      )}


      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}

      <main className="workspace-main editor-workspace-main">

        <Outlet />

      </main>


    </div>

  );

}