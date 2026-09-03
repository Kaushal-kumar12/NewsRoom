import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  MailCheck,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import {
  applyActionCode,
} from "firebase/auth";

import {
  auth,
} from "../../services/firebase";

import {
  useAuth,
} from "../../context/AuthContext";

import "../../styles/auth.css";

export default function VerifyEmailPage() {
  const location =
    useLocation();

  const {
    firebaseUser,
    resendEmailActivation,
  } = useAuth();

  const [
    processing,
    setProcessing,
  ] = useState(true);

  const [
    verified,
    setVerified,
  ] = useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [
    resending,
    setResending,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | PROCESS FIREBASE EMAIL ACTION LINK
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    async function verifyActionCode() {
      const params =
        new URLSearchParams(
          location.search
        );

      const mode =
        params.get("mode");

      const oobCode =
        params.get("oobCode");

      /*
      |--------------------------------------------------------------------------
      | No Firebase action code
      |--------------------------------------------------------------------------
      */

      if (
        mode !== "verifyEmail" ||
        !oobCode
      ) {
        if (mounted) {
          setProcessing(
            false
          );
        }

        return;
      }

      try {
        await applyActionCode(
          auth,
          oobCode
        );

        /*
        |--------------------------------------------------------------------------
        | Refresh current account if open
        |--------------------------------------------------------------------------
        */

        if (
          auth.currentUser
        ) {
          await auth.currentUser.reload();
        }

        if (mounted) {
          setVerified(true);

          setMessage(
            "Your email address has been verified successfully. You can now sign in."
          );
        }
      } catch (err) {
        console.error(
          "Email verification failed:",
          err
        );

        if (mounted) {
          if (
            err?.code ===
            "auth/invalid-action-code"
          ) {
            setError(
              "This activation link is invalid or has already been used."
            );
          } else {
            setError(
              err?.message ||
                "Unable to verify this email address."
            );
          }
        }
      } finally {
        if (mounted) {
          setProcessing(
            false
          );
        }
      }
    }

    verifyActionCode();

    return () => {
      mounted = false;
    };
  }, [
    location.search,
  ]);

  /*
  |--------------------------------------------------------------------------
  | RESEND
  |--------------------------------------------------------------------------
  */

  const resend =
    async () => {
      setMessage("");
      setError("");
      setResending(true);

      try {
        if (
          !firebaseUser
        ) {
          throw new Error(
            "Please sign in again to resend the activation email."
          );
        }

        await firebaseUser.reload();

        if (
          firebaseUser.emailVerified
        ) {
          setVerified(true);

          setMessage(
            "Your email address is already verified. Please sign in."
          );

          return;
        }

        await resendEmailActivation();

        setMessage(
          "A new activation email has been sent. Please check your inbox."
        );
      } catch (err) {
        setError(
          err?.message ||
            "Unable to resend the activation email."
        );
      } finally {
        setResending(false);
      }
    };

  return (
    <main className="auth-page">
      <section className="auth-card auth-centered">

        {processing ? (
          <>
            <MailCheck
              size={52}
            />

            <p className="eyebrow">
              VERIFYING EMAIL
            </p>

            <h1>
              Please wait
            </h1>

            <p>
              We are verifying your
              email activation link.
            </p>
          </>
        ) : verified ? (
          <>
            <ShieldCheck
              size={52}
            />

            <p className="eyebrow">
              EMAIL VERIFIED
            </p>

            <h1>
              Your email is verified
            </h1>

            {message && (
              <div className="auth-success">
                {message}
              </div>
            )}

            <Link
              className="auth-submit"
              to="/login"
            >
              Continue to Sign in
            </Link>
          </>
        ) : (
          <>
            <MailCheck
              size={52}
            />

            <p className="eyebrow">
              VERIFY YOUR EMAIL
            </p>

            <h1>
              Check your inbox
            </h1>

            <p>
              We sent an activation link
              to your email address.
              Open that link to activate
              your NewsRoom account.
            </p>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {message && (
              <div className="auth-success">
                {message}
              </div>
            )}

            <button
              className="auth-secondary"
              type="button"
              onClick={resend}
              disabled={resending}
            >
              <RefreshCw
                size={17}
              />

              {resending
                ? "Sending..."
                : "Resend activation email"}
            </button>

            <Link
              className="auth-back"
              to="/login"
            >
              ← Back to Login
            </Link>
          </>
        )}

      </section>
    </main>
  );
}