import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Save, CheckCircle2 } from "lucide-react";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../../lib/firebase/firebaseClient";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = params.get("oobCode");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (!oobCode) return setError("This password-reset link is invalid or incomplete.");
    if (password.length < 6) return setError("Password must contain at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    try {
      if (!auth) throw new Error("Firebase Authentication is not configured.");
      await confirmPasswordReset(auth, oobCode, password);
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 1800);
    } catch (err) {
      setError(err?.message || "This reset link may have expired.");
    }
  };

  if (done) {
    return (
      <main className="auth-page">
        <section className="auth-card auth-centered">
          <CheckCircle2 size={48} />
          <h1>Password updated</h1>
          <p>Your password has been changed successfully. Redirecting you to sign in...</p>
          <Link className="auth-secondary" to="/login">Go to sign in</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand"><div className="auth-brand-mark">N</div><strong>NewsRoom</strong></div>
        <div className="auth-heading">
          <p className="eyebrow">New password</p>
          <h1>Set a new password</h1>
          <p>Choose a strong password for your NewsRoom account.</p>
        </div>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <form onSubmit={submit} className="auth-form">
          <label>
            New password
            <div className="input-with-icon">
              <Lock size={18} />
              <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </label>

          <label>
            Confirm password
            <div className="input-with-icon">
              <Lock size={18} />
              <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
          </label>

          <button className="auth-submit" type="submit"><Save size={18} />Update password</button>
        </form>

        <Link className="auth-back" to="/login">← Back to sign in</Link>
      </section>
    </main>
  );
}
