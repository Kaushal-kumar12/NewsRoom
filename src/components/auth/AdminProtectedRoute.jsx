import { Navigate, useLocation } from "react-router-dom";
import { useAuth, ROLES } from "../../context/AuthContext";

const ADMIN_ROLES = [
  ROLES.AUTHOR,
  ROLES.EDITOR,
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN
];

export default function AdminProtectedRoute({
  children
}) {
  const {
    user,
    loading
  } = useAuth();

  const location = useLocation();

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        <p>Checking administrator access...</p>
      </div>
    );
  }

  /*
   * No Firebase user.
   */

  if (!user) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location.pathname
        }}
      />
    );
  }

  /*
   * Normal user trying to access admin.
   */

  if (!ADMIN_ROLES.includes(user.role)) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  return children;
}