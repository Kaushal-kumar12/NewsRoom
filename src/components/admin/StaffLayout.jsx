// src/components/admin/StaffLayout.jsx

import React, {
  useState,
} from "react";

import {
  Outlet,
} from "react-router-dom";

import StaffSidebar
  from "./StaffSidebar";

import StaffTopbar
  from "./StaffTopbar";


export default function StaffLayout() {

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(true);


  function toggleSidebar() {

    setSidebarOpen(
      (previous) =>
        !previous
    );

  }


  return (
    <div
      className={
        sidebarOpen
          ? "staff-app"
          : "staff-app staff-sidebar-hidden"
      }
    >

      <StaffSidebar
        isOpen={sidebarOpen}
      />


      <div className="staff-main">

        <StaffTopbar
          onToggleSidebar={
            toggleSidebar
          }
          sidebarOpen={
            sidebarOpen
          }
        />


        <main className="staff-content">

          <Outlet />

        </main>

      </div>

    </div>
  );

}