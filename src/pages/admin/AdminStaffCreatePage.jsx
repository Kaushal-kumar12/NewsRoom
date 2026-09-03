import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  UserPlus,
  ShieldCheck,
} from "lucide-react";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  ROLES,
} from "../../config/rolePermissions";

import {
  createStaffUser,
} from "../../services/users/staffUserService";

export default function AdminStaffCreatePage() {
  const {
    user,
  } = useAuth();

  const navigate =
    useNavigate();

  const [
    form,
    setForm,
  ] = useState({
    name: "",
    email: "",
    password: "",
    role: ROLES.AUTHOR,
  });

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  function update(
    field,
    value
  ) {
    setForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );
  }

  async function submit(
    event
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await createStaffUser({
        ...form,
        currentUser:
          user,
      });

      setMessage(
        `${
          form.role ===
          ROLES.EDITOR
            ? "Editor"
            : "Author"
        } account created successfully.`
      );

      setForm({
        name: "",
        email: "",
        password: "",
        role: ROLES.AUTHOR,
      });
    } catch (err) {
      setError(
        err?.message ||
          "Unable to create staff account."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="staff-page">

      <header className="staff-page-header">

        <div>

          <Link
            className="staff-back-link"
            to="/admin/users"
          >
            <ArrowLeft size={16} />
            Back to users
          </Link>

          <span className="staff-eyebrow">
            STAFF MANAGEMENT
          </span>

          <h1>
            Create Staff Account
          </h1>

          <p>
            Create an Author or Editor
            account for the NewsRoom
            editorial team.
          </p>

        </div>

      </header>

      {message && (
        <div className="staff-alert staff-alert-success">
          {message}
        </div>
      )}

      {error && (
        <div className="staff-alert staff-alert-error">
          {error}
        </div>
      )}

      <div className="staff-create-grid">

        <section className="staff-panel">

          <div className="staff-panel-heading">

            <div>
              <span className="staff-eyebrow">
                NEW ACCOUNT
              </span>

              <h2>
                Staff details
              </h2>
            </div>

          </div>

          <form
            className="staff-create-form"
            onSubmit={submit}
          >

            <label>
              Full name

              <input
                required
                value={form.name}
                placeholder="Enter full name"
                onChange={(event) =>
                  update(
                    "name",
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              Email address

              <input
                required
                type="email"
                value={form.email}
                placeholder="staff@example.com"
                onChange={(event) =>
                  update(
                    "email",
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              Temporary password

              <input
                required
                type="password"
                minLength={6}
                value={form.password}
                placeholder="Minimum 6 characters"
                onChange={(event) =>
                  update(
                    "password",
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              Staff role

              <select
                value={form.role}
                onChange={(event) =>
                  update(
                    "role",
                    event.target.value
                  )
                }
              >
                <option
                  value={
                    ROLES.AUTHOR
                  }
                >
                  Author
                </option>

                <option
                  value={
                    ROLES.EDITOR
                  }
                >
                  Editor
                </option>
              </select>
            </label>

            <button
              type="submit"
              className="staff-primary-button"
              disabled={saving}
            >
              <UserPlus size={17} />

              {saving
                ? "Creating..."
                : "Create Account"}
            </button>

          </form>

        </section>

        <aside className="staff-panel staff-security-card">

          <div className="staff-security-icon">
            <ShieldCheck size={25} />
          </div>

          <h2>
            Role & security
          </h2>

          <p>
            The account will be created
            as an authenticated Firebase
            user and a corresponding
            Firestore profile.
          </p>

          <ul>
            <li>
              Authors manage their own
              stories.
            </li>

            <li>
              Editors review submitted
              stories.
            </li>

            <li>
              Administrators retain
              management access.
            </li>

            <li>
              Super Administrator access
              cannot be created here.
            </li>
          </ul>

        </aside>

      </div>
    </div>
  );
}