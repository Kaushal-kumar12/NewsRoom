import React, {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ArrowRight,
} from "lucide-react";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  ROLES,
  normalizeRole,
  getDashboardPath,
} from "../../config/rolePermissions";

import "../../styles/auth.css";

export default function LoginPage() {
  const navigate =
    useNavigate();

  const {
    login,
    logout,
    loading,
  } = useAuth();

  const [form, setForm] =
    useState({
      email: "",
      password: "",
    });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const handleChange =
    (event) => {
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

  const submit =
    async (event) => {
      event.preventDefault();

      setError("");

      const email =
        form.email
          .trim()
          .toLowerCase();

      if (
        !email ||
        !form.password
      ) {
        setError(
          "Please enter your email and password."
        );

        return;
      }

      try {
        const profile =
          await login(
            email,
            form.password
          );

        const role =
          normalizeRole(
            profile?.role
          );

        /*
        |--------------------------------------------------------------------------
        | STAFF ACCOUNTS MUST USE /admin/login
        |--------------------------------------------------------------------------
        */

        if (
          [
            ROLES.SUPER_ADMIN,
            ROLES.ADMIN,
            ROLES.EDITOR,
            ROLES.AUTHOR,
          ].includes(role)
        ) {
          await logout();

          setError(
            "This is a staff account. Please use the Staff / Admin Login page."
          );

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | NORMAL USER
        |--------------------------------------------------------------------------
        */

        navigate(
          getDashboardPath(role),
          {
            replace: true,
          }
        );
      } catch (err) {
        console.error(
          "Normal user login failed:",
          err
        );

        try {
          await logout();
        } catch {
          // Ignore cleanup errors.
        }

        setError(
          err?.message ||
            "Unable to sign in. Please check your credentials."
        );
      }
    };

  return (
    <main className="auth-page">
      <section className="auth-card">

        <div className="auth-brand">
          <div className="auth-brand-mark">
            N
          </div>

          <div>
            <strong>
              NewsRoom
            </strong>

            <span>
              Trusted news. Clear perspective.
            </span>
          </div>
        </div>

        <div className="auth-heading">
          <p className="eyebrow">
            Welcome back
          </p>

          <h1>
            Sign in
          </h1>

          <p>
            Sign in to your NewsRoom account.
          </p>
        </div>

        {error && (
          <div
            className="auth-error"
            role="alert"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={submit}
          className="auth-form"
        >
          <label>
            Email address

            <div className="input-with-icon">
              <Mail size={18} />

              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={
                  handleChange
                }
                disabled={loading}
              />
            </div>
          </label>

          <label>
            Password

            <div className="input-with-icon">
              <Lock size={18} />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={
                  form.password
                }
                onChange={
                  handleChange
                }
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

          <div className="auth-row">
            <span />

            <Link to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          <button
            className="auth-submit"
            disabled={loading}
            type="submit"
          >
            <LogIn size={18} />

            {loading
              ? "Signing in..."
              : "Sign in"}

            <ArrowRight
              size={18}
            />
          </button>
        </form>

        <div className="auth-divider">
          <span>
            New to NewsRoom?
          </span>
        </div>

        <Link
          className="auth-secondary"
          to="/register"
        >
          Create a free account
        </Link>

        <div
          style={{
            marginTop: "18px",
            textAlign: "center",
          }}
        >
          <Link
            to="/admin/login"
            style={{
              fontSize: "13px",
              color: "#64748b",
              textDecoration:
                "none",
            }}
          >
            Staff / Admin / Editor / Author Login
          </Link>
        </div>

        <Link
          className="auth-back"
          to="/"
        >
          ← Back to NewsRoom
        </Link>

      </section>
    </main>
  );
}