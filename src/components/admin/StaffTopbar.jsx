// src/components/admin/StaffTopbar.jsx

import React from "react";

import {
  Bell,
  Menu,
  Search,
  X,
} from "lucide-react";

import {
  getRoleLabel,
} from "../../config/rolePermissions";

import {
  useStaffAuth,
} from "../auth/StaffRoute";


export default function StaffTopbar({
  onToggleSidebar,
  sidebarOpen = true,
}) {

  const {
    role,
    profile,
  } = useStaffAuth();


  const displayName =
    profile?.name ||
    profile?.displayName ||
    profile?.email ||
    "Staff User";


  const avatarLetter =
    String(displayName)
      .charAt(0)
      .toUpperCase();


  return (
    <header className="staff-topbar">


      <div className="staff-topbar-left">


        <button
          type="button"
          className="staff-menu-button"
          onClick={onToggleSidebar}
          aria-label={
            sidebarOpen
              ? "Hide sidebar"
              : "Show sidebar"
          }
          title={
            sidebarOpen
              ? "Hide sidebar"
              : "Show sidebar"
          }
        >

          {sidebarOpen
            ? <X size={20} />
            : <Menu size={20} />}

        </button>


        <div>

          <div className="staff-topbar-title">
            NewsRoom
          </div>

          <div className="staff-topbar-subtitle">
            Editorial & Administration
          </div>

        </div>

      </div>


      <div className="staff-topbar-actions">


        <div className="staff-search">

          <Search size={17} />

          <input
            type="search"
            placeholder="Search..."
            aria-label="Search"
          />

        </div>


        <button
          type="button"
          className="staff-icon-button"
          aria-label="Notifications"
        >

          <Bell size={18} />

        </button>


        <div className="staff-top-user">


          <div className="staff-avatar small">

            {avatarLetter || "S"}

          </div>


          <div className="staff-top-user-info">

            <strong>
              {displayName}
            </strong>

            <span>
              {getRoleLabel(role)}
            </span>

          </div>

        </div>

      </div>

    </header>
  );

}