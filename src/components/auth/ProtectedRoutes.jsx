import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoutes({
  children,
  allowedRoles = []
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait until Firebase authentication state is resolved
  if (loading) {
    return (
      <div
        style={{
          minHeight: "50vh",
          display: "grid",
          placeItems: "center",
          fontSize: "14px",
          color: "#64748b"
        }}
      >
        Checking authentication...
      </div>
    );
  }

  // User is not logged in
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Route has role restrictions
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}