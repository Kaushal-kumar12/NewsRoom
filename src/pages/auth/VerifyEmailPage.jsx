// src/pages/auth/VerifyEmailPage.jsx

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

  } =
    useAuth();


  const [

    processing,

    setProcessing,

  ] =
    useState(true);


  const [

    verified,

    setVerified,

  ] =
    useState(false);


  const [

    message,

    setMessage,

  ] =
    useState("");


  const [

    error,

    setError,

  ] =
    useState("");


  const [

    resending,

    setResending,

  ] =
    useState(false);


  /* ==========================================================
     PROCESS EMAIL ACTIVATION LINK
  ========================================================== */

  useEffect(() => {

    let mounted =
      true;


    async function processVerification() {

      const params =
        new URLSearchParams(
          location.search
        );


      const mode =
        params.get(
          "mode"
        );


      const oobCode =
        params.get(
          "oobCode"
        );


      /*
      |--------------------------------------------------------
      | NORMAL VISIT
      |
      | User arrives here immediately after registration.
      |--------------------------------------------------------
      */

      if (

        mode !==
          "verifyEmail" ||

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
        |------------------------------------------------------
        | REFRESH CURRENT USER IF AVAILABLE
        |------------------------------------------------------
        */

        if (
          auth.currentUser
        ) {

          await auth.currentUser.reload();

        }


        if (mounted) {

          setVerified(
            true
          );


          setMessage(

            "Your email address has been verified successfully. Your account is now active."

          );

        }

      } catch (
        err
      ) {

        console.error(
          "Email verification failed:",
          err
        );


        if (mounted) {

          let friendlyMessage =
            err?.message ||
            "Unable to verify your email address.";


          switch (
            err?.code
          ) {

            case "auth/invalid-action-code":

              friendlyMessage =
                "This activation link is invalid, expired, or has already been used.";

              break;


            case "auth/expired-action-code":

              friendlyMessage =
                "This activation link has expired. Please request a new one.";

              break;


            default:

              break;

          }


          setError(
            friendlyMessage
          );

        }

      } finally {

        if (mounted) {

          setProcessing(
            false
          );

        }

      }

    }


    processVerification();


    return () => {

      mounted =
        false;

    };

  }, [

    location.search,

  ]);


  /* ==========================================================
     RESEND EMAIL
  ========================================================== */

  async function resend() {

    setMessage("");

    setError("");

    setResending(
      true
    );


    try {

      if (
        !firebaseUser
      ) {

        throw new Error(

          "Your registration session is no longer active. Please register again or sign in."

        );

      }


      await firebaseUser.reload();


      if (
        firebaseUser.emailVerified
      ) {

        setVerified(
          true
        );


        setMessage(
          "Your email address is already verified."
        );

        return;

      }


      await resendEmailActivation();


      setMessage(
        "A new activation email has been sent. Please check your inbox."
      );

    } catch (
      err
    ) {

      setError(

        err?.message ||

        "Unable to resend the activation email."

      );

    } finally {

      setResending(
        false
      );

    }

  }


  /* ==========================================================
     RENDER
  ========================================================== */

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
              We are verifying your account activation link.
            </p>

          </>

        ) : verified ? (

          <>

            <ShieldCheck
              size={52}
            />


            <p className="eyebrow">
              ACCOUNT ACTIVATED
            </p>


            <h1>
              Your account is active
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

              We sent an account activation link
              to your email address.

              Open the link to activate
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

              onClick={
                resend
              }

              disabled={
                resending
              }

            >

              <RefreshCw
                size={17}
              />


              {resending

                ? "Sending..."

                : "Resend activation email"
              }

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