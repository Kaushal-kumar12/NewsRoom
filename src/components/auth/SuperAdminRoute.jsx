// src/components/auth/SuperAdminRoute.jsx

import React from "react";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function SuperAdminRoute({
  children,
}) {
  const location = useLocation();

  const {
    user,
    loading,
    isSuperAdmin,
  } = useAuth();

  // ------------------------------------------------------------
  // AUTHENTICATION LOADING
  // ------------------------------------------------------------

  if (loading) {
    return (
      <div className="super-admin-route-loading">
        Checking authorization...
      </div>
    );
  }

  // ------------------------------------------------------------
  // NOT LOGGED IN
  // ------------------------------------------------------------

  if (!user) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // ------------------------------------------------------------
  // NOT SUPER ADMIN
  // ------------------------------------------------------------

  if (!isSuperAdmin) {
    console.warn(
      "Super Admin access denied.",
      {
        uid: user.uid,
        email: user.email,
        role: user.role,
      }
    );

    return (
      <Navigate
        to="/404"
        replace
      />
    );
  }

  // ------------------------------------------------------------
  // AUTHORIZED
  // ------------------------------------------------------------

  if (children) {
    return children;
  }

  return <Outlet />;
}