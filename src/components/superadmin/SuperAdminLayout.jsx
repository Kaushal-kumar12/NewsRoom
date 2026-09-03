import React from "react";
import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "./SuperAdminSidebar";

export default function SuperAdminLayout() {
  return (
    <div className="sa-layout">

      {/* =========================
          SIDEBAR
      ========================== */}
      <SuperAdminSidebar />

      {/* =========================
          RIGHT SIDE APPLICATION
      ========================== */}
      <div className="sa-main">

        {/* TOP HEADER */}
        <header className="sa-header">

          <div className="sa-header-left">
            <button
              type="button"
              className="sa-mobile-menu"
              aria-label="Open menu"
            >
              ☰
            </button>

            <div className="sa-header-title">
              NewsRoom
            </div>
          </div>

          <div className="sa-header-right">
            <span className="sa-header-role">
              Super Administration
            </span>
          </div>

        </header>

        {/* =========================
            PAGE CONTENT
        ========================== */}
        <main className="sa-content">
          <Outlet />
        </main>

        {/* =========================
            FOOTER
        ========================== */}
        <footer className="sa-footer">

          <div className="sa-footer-left">
            © {new Date().getFullYear()} NewsRoom. All rights reserved.
          </div>

          <div className="sa-footer-right">
            <span>NewsRoom Administration</span>
            <span>•</span>
            <span>Super Admin Panel</span>
          </div>

        </footer>

      </div>

    </div>
  );
}