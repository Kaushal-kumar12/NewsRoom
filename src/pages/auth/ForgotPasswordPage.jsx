// src/pages/auth/ForgotPasswordPage.jsx

import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {

  Mail,

  Send,

  ArrowLeft,

  CheckCircle2,

} from "lucide-react";

import {

  sendPasswordResetEmail,

} from "firebase/auth";

import {

  auth,

} from "../../services/firebase";

import "../../styles/auth.css";


export default function ForgotPasswordPage() {

  const [

    email,

    setEmail,

  ] =
    useState("");


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

    loading,

    setLoading,

  ] =
    useState(false);


  async function submit(
    event
  ) {

    event.preventDefault();


    setMessage("");

    setError("");


    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    if (
      !normalizedEmail
    ) {

      setError(
        "Please enter your email address."
      );

      return;

    }


    try {

      setLoading(
        true
      );


      await sendPasswordResetEmail(

        auth,

        normalizedEmail,

        {

          url:
            `${window.location.origin}/reset-password`,

          handleCodeInApp:
            false,

        }

      );


      setMessage(

        "If an account exists for this email, a password reset link has been sent."

      );

    } catch (
      err
    ) {

      console.error(
        "Password reset request failed:",
        err
      );


      setError(

        err?.message ||

        "Unable to send the password-reset email."

      );

    } finally {

      setLoading(
        false
      );

    }

  }


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
              Account recovery
            </span>

          </div>

        </div>


        <div className="auth-heading">

          <p className="eyebrow">
            Password recovery
          </p>


          <h1>
            Forgot your password?
          </h1>


          <p>
            Enter the email address associated with your NewsRoom account.
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


        {message && (

          <div
            className="auth-success"
            role="status"
          >

            <CheckCircle2
              size={18}
            />

            {message}

          </div>

        )}


        <form

          onSubmit={submit}

          className="auth-form"

        >

          <label>

            Email address


            <div className="input-with-icon">

              <Mail
                size={18}
              />


              <input

                type="email"

                autoComplete="email"

                placeholder="you@example.com"

                value={email}

                onChange={
                  (event) =>
                    setEmail(
                      event.target.value
                    )
                }

                disabled={loading}

              />

            </div>

          </label>


          <button

            className="auth-submit"

            type="submit"

            disabled={loading}

          >

            <Send
              size={18}
            />


            {loading

              ? "Sending..."

              : "Send reset link"
            }

          </button>

        </form>


        <Link

          className="auth-back"

          to="/login"

        >

          <ArrowLeft
            size={16}
          />

          Back to sign in

        </Link>


      </section>

    </main>

  );

}