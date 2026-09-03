// src/components/auth/PermissionRoute.jsx

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import {
  hasPermission,
} from "../../config/rolePermissions";

import {
  useStaffAuth,
} from "./StaffRoute";

export default function PermissionRoute({
  permission,
  children,
}) {
  const location = useLocation();

  const {
    role,
    loading,
  } = useStaffAuth();

  if (loading) {
    return null;
  }

  const allowed =
    hasPermission(
      role,
      permission
    );

  if (!allowed) {
    return (
      <div className="staff-access-denied">
        <div className="staff-access-card">

          <h1>Access Restricted</h1>

          <p>
            Your role does not have permission
            to access this page.
          </p>

          <button
            type="button"
            onClick={() =>
              window.history.back()
            }
          >
            Go Back
          </button>

        </div>
      </div>
    );
  }

  if (children) {
    return children;
  }

  return <Outlet />;
}