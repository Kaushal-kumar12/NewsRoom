// src/pages/auth/AdminLoginPage.jsx

import React, {
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  ROLES,
  normalizeRole,
} from "../../config/rolePermissions";

import "../../styles/auth.css";


/*
|--------------------------------------------------------------------------
| STAFF LOGIN ROLES
|--------------------------------------------------------------------------
|
| /admin/login is the common login portal for:
|
| SUPER_ADMIN
| ADMINISTRATOR
| EDITOR
| AUTHOR
|
|--------------------------------------------------------------------------
*/

const STAFF_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.EDITOR,
  ROLES.AUTHOR,
];


/*
|--------------------------------------------------------------------------
| ROLE DESTINATION
|--------------------------------------------------------------------------
*/

function getRoleDestination(
  role
) {

  const normalized =
    normalizeRole(role);

  switch (
    normalized
  ) {

    case ROLES.SUPER_ADMIN:

      return "/super-admin/dashboard";


    case ROLES.ADMIN:

      return "/admin/dashboard";


    case ROLES.EDITOR:

      return "/editor/dashboard";


    case ROLES.AUTHOR:

      return "/author/dashboard";


    default:

      return null;
  }
}


/*
|--------------------------------------------------------------------------
| ROLE LABEL
|--------------------------------------------------------------------------
*/

function getRoleLabel(
  role
) {

  const normalized =
    normalizeRole(role);

  switch (
    normalized
  ) {

    case ROLES.SUPER_ADMIN:
      return "Super Administrator";

    case ROLES.ADMIN:
      return "Administrator";

    case ROLES.EDITOR:
      return "Editor";

    case ROLES.AUTHOR:
      return "Author";

    default:
      return "Staff";
  }
}


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function AdminLoginPage() {

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    login,
    logout,
    loading,
  } = useAuth();


  const [
    form,
    setForm,
  ] = useState({
    email: "",
    password: "",
  });


  const [
    showPassword,
    setShowPassword,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  /*
  |--------------------------------------------------------------------------
  | INPUT CHANGE
  |--------------------------------------------------------------------------
  */

  const handleChange = (
    event
  ) => {

    const {
      name,
      value,
    } = event.target;

    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };


  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  const submit = async (
    event
  ) => {

    event.preventDefault();

    setError("");


    const email =
      form.email
        .trim()
        .toLowerCase();

    const password =
      form.password;


    if (
      !email ||
      !password
    ) {

      setError(
        "Please enter your email and password."
      );

      return;
    }


    try {

      /*
      |--------------------------------------------------------------------------
      | FIREBASE LOGIN
      |--------------------------------------------------------------------------
      */

      const profile =
        await login(
          email,
          password
        );


      const role =
        normalizeRole(
          profile?.role
        );


      console.log(
        "Staff login profile:",
        profile
      );


      /*
      |--------------------------------------------------------------------------
      | STAFF ROLE CHECK
      |--------------------------------------------------------------------------
      */

      if (
        !STAFF_ROLES.includes(
          role
        )
      ) {

        try {
          await logout();
        } catch {
          // Ignore cleanup error.
        }

        setError(
          "Access denied. This account does not have staff privileges."
        );

        return;
      }


      /*
      |--------------------------------------------------------------------------
      | ACCOUNT STATUS CHECK
      |--------------------------------------------------------------------------
      */

      const status =
        String(
          profile?.status ||
          "ACTIVE"
        )
          .trim()
          .toUpperCase();


      if (
        status !== "ACTIVE" &&
        status !== "ENABLED"
      ) {

        try {
          await logout();
        } catch {
          // Ignore.
        }

        setError(
          `Your staff account is currently ${status.toLowerCase()}. Please contact an administrator.`
        );

        return;
      }


      /*
      |--------------------------------------------------------------------------
      | ROLE DESTINATION
      |--------------------------------------------------------------------------
      */

      const destination =
        getRoleDestination(
          role
        );


      if (!destination) {

        try {
          await logout();
        } catch {
          // Ignore.
        }

        setError(
          "Your account does not have a valid staff role."
        );

        return;
      }


      /*
      |--------------------------------------------------------------------------
      | RETURN TO REQUESTED STAFF PAGE
      |--------------------------------------------------------------------------
      |
      | If StaffRoute redirected the user here from:
      |
      | /author/create
      |
      | /editor/review
      |
      | etc.
      |
      | We can return them there after successful login.
      |
      |--------------------------------------------------------------------------
      */

      const requestedFrom =
        location.state?.from;


      if (
        requestedFrom &&
        typeof requestedFrom ===
          "string" &&
        requestedFrom.startsWith(
          "/"
        ) &&
        !requestedFrom.startsWith(
          "/login"
        ) &&
        !requestedFrom.startsWith(
          "/register"
        ) &&
        !requestedFrom.startsWith(
          "/admin/login"
        )
      ) {

        /*
        | Only return to a route that belongs to
        | the user's own staff application.
        */

        const belongsToRole =
          (
            role === ROLES.SUPER_ADMIN &&
            requestedFrom.startsWith(
              "/super-admin"
            )
          ) ||
          (
            role === ROLES.ADMIN &&
            requestedFrom.startsWith(
              "/admin"
            )
          ) ||
          (
            role === ROLES.EDITOR &&
            requestedFrom.startsWith(
              "/editor"
            )
          ) ||
          (
            role === ROLES.AUTHOR &&
            requestedFrom.startsWith(
              "/author"
            )
          );


        if (
          belongsToRole
        ) {

          navigate(
            requestedFrom,
            {
              replace: true,
            }
          );

          return;
        }
      }


      /*
      |--------------------------------------------------------------------------
      | DEFAULT ROLE DASHBOARD
      |--------------------------------------------------------------------------
      */

      navigate(
        destination,
        {
          replace: true,
        }
      );

    } catch (err) {

      console.error(
        "Staff login failed:",
        err
      );


      /*
      |--------------------------------------------------------------------------
      | FRIENDLY FIREBASE ERRORS
      |--------------------------------------------------------------------------
      */

      let message =
        "Unable to sign in. Please check your credentials.";


      switch (
        err?.code
      ) {

        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":

          message =
            "Invalid email or password.";

          break;


        case "auth/invalid-email":

          message =
            "Please enter a valid email address.";

          break;


        case "auth/user-disabled":

          message =
            "This Firebase account has been disabled.";

          break;


        case "auth/too-many-requests":

          message =
            "Too many login attempts. Please try again later.";

          break;


        case "auth/network-request-failed":

          message =
            "Network error. Please check your internet connection.";

          break;


        default:

          message =
            err?.message ||
            message;
      }


      setError(
        message
      );
    }
  };


  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <main
      className="auth-page admin-auth-page"
    >

      <section
        className="auth-card"
      >

        {/* ====================================================
            BRAND
        ==================================================== */}

        <div
          className="auth-brand"
        >

          <div
            className="auth-brand-mark"
          >
            <ShieldCheck
              size={24}
            />
          </div>

          <div>

            <strong>
              NewsRoom Staff
            </strong>

            <span>
              Administration & Editorial Center
            </span>

          </div>

        </div>


        {/* ====================================================
            HEADING
        ==================================================== */}

        <div
          className="auth-heading"
        >

          <p className="eyebrow">
            Secure staff access
          </p>

          <h1>
            Staff Login
          </h1>

          <p>
            Sign in with your authorized
            Administrator, Editor, Author or
            Super Administrator account.
          </p>

        </div>


        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (

          <div
            className="auth-error"
            role="alert"
          >
            {error}
          </div>

        )}


        {/* ====================================================
            FORM
        ==================================================== */}

        <form
          onSubmit={submit}
          className="auth-form"
        >

          {/* EMAIL */}

          <label>

            Staff Email

            <div
              className="input-with-icon"
            >

              <Mail
                size={18}
              />

              <input
                type="email"
                name="email"
                required
                autoComplete="username"
                placeholder="staff@newsroom.com"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
              />

            </div>

          </label>


          {/* PASSWORD */}

          <label>

            Password

            <div
              className="input-with-icon"
            >

              <Lock
                size={18}
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
              />


              <button
                type="button"
                className="input-action"
                onClick={() =>
                  setShowPassword(
                    (value) =>
                      !value
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                disabled={loading}
              >

                {showPassword ? (
                  <EyeOff
                    size={18}
                  />
                ) : (
                  <Eye
                    size={18}
                  />
                )}

              </button>

            </div>

          </label>


          {/* SUBMIT */}

          <button
            className="auth-submit"
            disabled={loading}
            type="submit"
          >

            <LogIn
              size={18}
            />

            {loading
              ? "Authenticating..."
              : "Staff Sign in"}

            <ArrowRight
              size={18}
            />

          </button>

        </form>


        {/* ====================================================
            SECURITY NOTE
        ==================================================== */}

        <div
          className="admin-security-note"
        >

          <ShieldCheck
            size={17}
          />

          <span>
            Staff access is controlled by
            NewsRoom administrators according
            to assigned roles and permissions.
          </span>

        </div>


        {/* ====================================================
            NORMAL USER LOGIN
        ==================================================== */}

        <Link
          className="auth-back"
          to="/login"
        >
          ← Normal User Login
        </Link>

      </section>

    </main>
  );
}