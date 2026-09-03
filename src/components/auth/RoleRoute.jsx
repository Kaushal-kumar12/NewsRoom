import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { normalizeRole } from "../../config/rolePermissions";

export default function RoleRoute({ allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="workspace-loading">
        <div className="workspace-loading-spinner" />
        <h3>Loading NewsRoom</h3>
        <p>Please wait...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  const currentRole = normalizeRole(user.role);

  const allowed = allowedRoles.some(
    (role) => normalizeRole(role) === currentRole
  );

  if (!allowed) {
    if (currentRole === "SUPER_ADMIN") {
      return <Navigate to="/super-admin/dashboard" replace />;
    }

    if (currentRole === "ADMINISTRATOR") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (currentRole === "EDITOR") {
      return <Navigate to="/editor/dashboard" replace />;
    }

    if (currentRole === "AUTHOR") {
      return <Navigate to="/author/dashboard" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}