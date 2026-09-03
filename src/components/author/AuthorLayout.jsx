// src/components/author/AuthorLayout.jsx

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
  FileText,
  PlusCircle,
  Send,
  BarChart3,
  UserCircle,
  LogOut,
  Menu,
  X,
  Newspaper,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import "../../styles/workspace.css";


export default function AuthorLayout() {

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
        "/author/dashboard",

      label:
        "Dashboard",

      icon:
        LayoutDashboard,
    },


    {
      to:
        "/author/stories",

      label:
        "My Stories",

      icon:
        FileText,
    },


    {
      to:
        "/author/create",

      label:
        "Create Story",

      icon:
        PlusCircle,
    },


    {
      to:
        "/author/submitted",

      label:
        "Submitted",

      icon:
        Send,
    },


    {
      to:
        "/author/analytics",

      label:
        "Analytics",

      icon:
        BarChart3,
    },


    {
      to:
        "/author/profile",

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
    "Author";


  return (

    <div
      className={`workspace-layout author-workspace ${
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
        className="workspace-sidebar author-sidebar"
      >


        {/* BRAND */}

        <div className="workspace-brand author-brand">

          <div className="workspace-brand-icon">

            <Newspaper size={21} />

          </div>


          <div className="workspace-brand-text">

            <strong>
              NewsRoom
            </strong>

            <span>
              Author Workspace
            </span>

          </div>

        </div>


        {/* NAVIGATION */}

        <nav className="workspace-navigation author-navigation">

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

                    `workspace-nav-link author-nav-link ${
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

        <div className="workspace-sidebar-footer author-sidebar-footer">


          <div className="workspace-user-card author-user-card">

            <div className="workspace-avatar author-avatar">

              {userName
                .charAt(0)
                .toUpperCase()}

            </div>


            <div className="workspace-user-details">

              <strong>
                {userName}
              </strong>

              <span>
                Author
              </span>

            </div>

          </div>


          <button
            type="button"
            className="workspace-logout author-logout"
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

      <main className="workspace-main author-workspace-main">

        <Outlet />

      </main>


    </div>

  );

}