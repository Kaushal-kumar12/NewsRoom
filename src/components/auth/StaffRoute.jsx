// src/components/auth/StaffRoute.jsx

import React from "react";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  ROLES,
  normalizeRole,
  hasPermission,
  isStaffRole,
  isAdminRole,
  isSuperAdminRole,
} from "../../config/rolePermissions";

/*
|--------------------------------------------------------------------------
| useStaffAuth
|--------------------------------------------------------------------------
|
| Central authentication/authorization hook for all staff applications.
|
| Supported roles:
|
| SUPER_ADMIN
| ADMIN / ADMINISTRATOR
| EDITOR
| AUTHOR
|
|--------------------------------------------------------------------------
*/

export function useStaffAuth() {
  const {
    user,
    loading,
    role: contextRole,
    isAuthenticated,
  } = useAuth();

  const role = normalizeRole(
    contextRole ||
      user?.role ||
      user?.roleName
  );

  return {
    user,

    profile: user,

    firebaseUser: user,

    loading,

    isAuthenticated,

    role,

    isStaff: isStaffRole(role),

    isAdmin: isAdminRole(role),

    isSuperAdmin:
      isSuperAdminRole(role),

    isEditor:
      role === ROLES.EDITOR,

    isAuthor:
      role === ROLES.AUTHOR,
  };
}

/*
|--------------------------------------------------------------------------
| StaffRoute
|--------------------------------------------------------------------------
|
| Generic protected staff route.
|
| IMPORTANT:
|
| Any route under /admin/* is a staff application.
|
| If the user is not authenticated:
|
|     → /admin/login
|
| NOT:
|
|     → /login
|
| This keeps the two login systems separate.
|
|--------------------------------------------------------------------------
*/

export default function StaffRoute({
  children,
  roles = [],
  permission,
  redirectTo = "/",
}) {
  const {
    user,
    loading,
    role,
  } = useStaffAuth();

  const location = useLocation();

  /*
  |--------------------------------------------------------------------------
  | AUTH LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="staff-route-loading">
        <div className="staff-loading-spinner" />

        <h3>
          Loading NewsRoom
        </h3>

        <p>
          Please wait...
        </p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | NOT AUTHENTICATED
  |--------------------------------------------------------------------------
  |
  | Staff users must use /admin/login.
  |
  */

  if (!user) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from:
            location.pathname +
            location.search,
        }}
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ACCOUNT STATUS
  |--------------------------------------------------------------------------
  |
  | Disabled / blocked staff accounts must not enter
  | protected staff pages.
  |
  */

  const accountStatus = String(
    user?.accountStatus ||
      user?.status ||
      "ACTIVE"
  )
    .trim()
    .toUpperCase();

  if (
    [
      "DISABLED",
      "BLOCKED",
      "SUSPENDED",
      "DEACTIVATED",
    ].includes(accountStatus)
  ) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          reason:
            "Your staff account is currently disabled.",
        }}
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | STAFF CHECK
  |--------------------------------------------------------------------------
  */

  if (!isStaffRole(role)) {
    return (
      <Navigate
        to={redirectTo}
        replace
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ROLE CHECK
  |--------------------------------------------------------------------------
  */

  if (
    Array.isArray(roles) &&
    roles.length > 0
  ) {
    const normalizedAllowedRoles =
      roles.map(normalizeRole);

    if (
      !normalizedAllowedRoles.includes(
        role
      )
    ) {
      return (
        <Navigate
          to={redirectTo}
          replace
        />
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | PERMISSION CHECK
  |--------------------------------------------------------------------------
  */

  if (
    permission &&
    !hasPermission(
      role,
      permission
    )
  ) {
    return (
      <Navigate
        to={redirectTo}
        replace
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CHILDREN / OUTLET
  |--------------------------------------------------------------------------
  */

  if (children) {
    return children;
  }

  return <Outlet />;
}

/*
|--------------------------------------------------------------------------
| SUPER ADMIN ROUTE
|--------------------------------------------------------------------------
*/

export function SuperAdminRoute({
  children,
}) {
  return (
    <StaffRoute
      roles={[
        ROLES.SUPER_ADMIN,
      ]}
      redirectTo="/"
    >
      {children}
    </StaffRoute>
  );
}

/*
|--------------------------------------------------------------------------
| ADMIN ROUTE
|--------------------------------------------------------------------------
|
| Super Admin is included because Super Admin has
| administrator-level access.
|
|--------------------------------------------------------------------------
*/

export function AdminRoute({
  children,
}) {
  return (
    <StaffRoute
      roles={[
        ROLES.SUPER_ADMIN,
        ROLES.ADMIN,
      ]}
      redirectTo="/"
    >
      {children}
    </StaffRoute>
  );
}

/*
|--------------------------------------------------------------------------
| EDITOR ROUTE
|--------------------------------------------------------------------------
*/

export function EditorRoute({
  children,
}) {
  return (
    <StaffRoute
      roles={[
        ROLES.EDITOR,
      ]}
      redirectTo="/"
    >
      {children}
    </StaffRoute>
  );
}

/*
|--------------------------------------------------------------------------
| AUTHOR ROUTE
|--------------------------------------------------------------------------
*/

export function AuthorRoute({
  children,
}) {
  return (
    <StaffRoute
      roles={[
        ROLES.AUTHOR,
      ]}
      redirectTo="/"
    >
      {children}
    </StaffRoute>
  );
}

/*
|--------------------------------------------------------------------------
| EDITORIAL ACCESS
|--------------------------------------------------------------------------
|
| Admin, Editor and Super Admin.
|
|--------------------------------------------------------------------------
*/

export function EditorialRoute({
  children,
}) {
  return (
    <StaffRoute
      roles={[
        ROLES.SUPER_ADMIN,
        ROLES.ADMIN,
        ROLES.EDITOR,
      ]}
      redirectTo="/"
    >
      {children}
    </StaffRoute>
  );
}

/*
|--------------------------------------------------------------------------
| ADMIN OR ABOVE
|--------------------------------------------------------------------------
*/

export function AdminOrAboveRoute({
  children,
}) {
  return (
    <StaffRoute
      roles={[
        ROLES.SUPER_ADMIN,
        ROLES.ADMIN,
      ]}
      redirectTo="/"
    >
      {children}
    </StaffRoute>
  );
}