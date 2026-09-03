import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Send, ArrowLeft, CheckCircle2 } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../lib/firebase/firebaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      if (!auth) throw new Error("Firebase Authentication is not configured.");
      await sendPasswordResetEmail(auth, email.trim());
      setMessage("If an account exists for this email, a password-reset link has been sent.");
    } catch (err) {
      setError(err?.message || "Unable to send the password-reset email.");
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-mark">N</div>
          <div><strong>NewsRoom</strong><span>Account recovery</span></div>
        </div>

        <div className="auth-heading">
          <p className="eyebrow">Password recovery</p>
          <h1>Forgot your password?</h1>
          <p>Enter the email address associated with your NewsRoom account.</p>
        </div>

        {error && <div className="auth-error" role="alert">{error}</div>}
        {message && <div className="auth-success" role="status"><CheckCircle2 size={18} />{message}</div>}

        <form onSubmit={submit} className="auth-form">
          <label>
            Email address
            <div className="input-with-icon">
              <Mail size={18} />
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </label>

          <button className="auth-submit" type="submit">
            <Send size={18} />
            Send reset link
          </button>
        </form>

        <Link className="auth-back" to="/login"><ArrowLeft size={16} /> Back to sign in</Link>
      </section>
    </main>
  );
}
