// src/pages/auth/Login.jsx

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {

  Mail,

  Phone,

  Lock,

  Eye,

  EyeOff,

  LogIn,

  ArrowRight,

  ShieldCheck,

  RefreshCw,

} from "lucide-react";

import {

  RecaptchaVerifier,

  signInWithPhoneNumber,

} from "firebase/auth";

import {

  auth,

} from "../../services/firebase";

import {

  useAuth,

} from "../../context/AuthContext";

import {

  ROLES,

  normalizeRole,

  getDashboardPath,

} from "../../config/rolePermissions";

import "../../styles/auth.css";


/* ============================================================
   PHONE NORMALIZATION
============================================================ */

function normalizePhone(
  value
) {

  const raw =
    String(
      value || ""
    ).trim();


  if (!raw) {
    return "";
  }


  if (
    raw.startsWith("+")
  ) {

    return raw;

  }


  const digits =
    raw.replace(
      /\D/g,
      ""
    );


  if (
    digits.length === 10
  ) {

    return `+91${digits}`;

  }


  return `+${digits}`;

}


/* ============================================================
   COMPONENT
============================================================ */

export default function LoginPage() {

  const navigate =
    useNavigate();


  const {

    login,

    logout,

    completePhoneLogin,

    loading,

  } = useAuth();


  /* ==========================================================
     LOGIN METHOD
  ========================================================== */

  const [

    loginMethod,

    setLoginMethod,

  ] =
    useState(
      "email"
    );


  /* ==========================================================
     EMAIL FORM
  ========================================================== */

  const [

    form,

    setForm,

  ] =
    useState({

      email: "",

      password: "",

    });


  /* ==========================================================
     PHONE
  ========================================================== */

  const [

    phoneNumber,

    setPhoneNumber,

  ] =
    useState("");


  const [

    otp,

    setOtp,

  ] =
    useState("");


  const [

    otpMode,

    setOtpMode,

  ] =
    useState(false);


  const confirmationResultRef =
    useRef(null);


  const recaptchaRef =
    useRef(null);


  /* ==========================================================
     UI
  ========================================================== */

  const [

    submitting,

    setSubmitting,

  ] =
    useState(false);


  const [

    otpLoading,

    setOtpLoading,

  ] =
    useState(false);


  const [

    showPassword,

    setShowPassword,

  ] =
    useState(false);


  const [

    error,

    setError,

  ] =
    useState("");


  const [

    message,

    setMessage,

  ] =
    useState("");


  /* ==========================================================
     CLEANUP
  ========================================================== */

  useEffect(() => {

    return () => {

      try {

        recaptchaRef.current?.clear();

      } catch {

        // Ignore.

      }

    };

  }, []);


  /* ==========================================================
     UPDATE EMAIL FORM
  ========================================================== */

  function handleChange(
    event
  ) {

    const {

      name,

      value,

    } =
      event.target;


    setForm(
      (previous) => ({

        ...previous,

        [name]:
          value,

      })
    );

  }


  /* ==========================================================
     CHANGE LOGIN METHOD
  ========================================================== */

  function changeLoginMethod(
    method
  ) {

    setLoginMethod(
      method
    );


    setOtpMode(
      false
    );


    setOtp("");

    setError("");

    setMessage("");

    confirmationResultRef.current =
      null;

  }


  /* ==========================================================
     CREATE RECAPTCHA
  ========================================================== */

  function createRecaptcha() {

    if (
      recaptchaRef.current
    ) {

      return recaptchaRef.current;

    }


    recaptchaRef.current =
      new RecaptchaVerifier(

        auth,

        "login-recaptcha",

        {

          size:
            "invisible",

        }

      );


    return recaptchaRef.current;

  }


  /* ==========================================================
     RESET RECAPTCHA
  ========================================================== */

  function resetRecaptcha() {

    try {

      recaptchaRef.current?.clear();

    } catch {

      // Ignore.

    }


    recaptchaRef.current =
      null;

  }


  /* ==========================================================
     EMAIL LOGIN
  ========================================================== */

  async function submitEmailLogin(
    event
  ) {

    event.preventDefault();


    setError("");

    setMessage("");


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

      setSubmitting(
        true
      );


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
      |--------------------------------------------------------
      | STAFF ACCOUNTS
      |--------------------------------------------------------
      */

      if (

        [

          ROLES.SUPER_ADMIN,

          ROLES.ADMIN,

          ROLES.EDITOR,

          ROLES.AUTHOR,

        ].includes(
          role
        )

      ) {

        await logout();


        throw new Error(

          "This is a staff account. Please use the Staff / Admin Login page."

        );

      }


      navigate(

        getDashboardPath(
          role
        ),

        {

          replace:
            true,

        }

      );

    } catch (
      err
    ) {

      console.error(
        "Email login failed:",
        err
      );


      try {

        await logout();

      } catch {

        // Ignore.

      }


      let friendlyMessage =
        err?.message ||
        "Unable to sign in. Please check your credentials.";


      switch (
        err?.code
      ) {

        case "auth/invalid-credential":

          friendlyMessage =
            "Incorrect email or password.";

          break;


        case "auth/user-not-found":

          friendlyMessage =
            "No account was found with this email address.";

          break;


        case "auth/wrong-password":

          friendlyMessage =
            "Incorrect password.";

          break;


        default:

          break;

      }


      setError(
        friendlyMessage
      );

    } finally {

      setSubmitting(
        false
      );

    }

  }


  /* ==========================================================
     SEND PHONE OTP
  ========================================================== */

  async function sendPhoneOtp(
    event
  ) {

    event.preventDefault();


    setError("");

    setMessage("");


    try {

      setSubmitting(
        true
      );


      const normalizedPhone =
        normalizePhone(
          phoneNumber
        );


      if (

        !normalizedPhone ||

        !/^\+\d{8,15}$/.test(
          normalizedPhone
        )

      ) {

        throw new Error(
          "Please enter a valid mobile number."
        );

      }


      resetRecaptcha();


      const verifier =
        createRecaptcha();


      const confirmationResult =
        await signInWithPhoneNumber(

          auth,

          normalizedPhone,

          verifier

        );


      confirmationResultRef.current =
        confirmationResult;


      setOtpMode(
        true
      );


      setMessage(
        `An OTP has been sent to ${normalizedPhone}.`
      );

    } catch (
      err
    ) {

      console.error(
        "Phone OTP failed:",
        err
      );


      let friendlyMessage =
        err?.message ||
        "Unable to send OTP.";


      switch (
        err?.code
      ) {

        case "auth/invalid-phone-number":

          friendlyMessage =
            "Please enter a valid mobile number.";

          break;


        case "auth/too-many-requests":

          friendlyMessage =
            "Too many OTP requests. Please try again later.";

          break;


        case "auth/quota-exceeded":

          friendlyMessage =
            "SMS quota has been exceeded.";

          break;


        default:

          break;

      }


      setError(
        friendlyMessage
      );


      resetRecaptcha();

    } finally {

      setSubmitting(
        false
      );

    }

  }


  /* ==========================================================
     VERIFY LOGIN OTP
  ========================================================== */

  async function verifyPhoneOtp() {

    setError("");

    setMessage("");


    if (
      !/^\d{6}$/.test(
        otp.trim()
      )
    ) {

      setError(
        "Please enter the 6-digit OTP."
      );

      return;

    }


    if (
      !confirmationResultRef.current
    ) {

      setError(
        "OTP session has expired. Please send OTP again."
      );

      return;

    }


    try {

      setOtpLoading(
        true
      );


      const credential =
        await confirmationResultRef.current.confirm(
          otp.trim()
        );


      const profile =
        await completePhoneLogin(
          credential.user
        );


      const role =
        normalizeRole(
          profile?.role
        );


      /*
      |--------------------------------------------------------
      | PHONE LOGIN IS NORMAL USER LOGIN
      |--------------------------------------------------------
      */

      if (

        [

          ROLES.SUPER_ADMIN,

          ROLES.ADMIN,

          ROLES.EDITOR,

          ROLES.AUTHOR,

        ].includes(
          role
        )

      ) {

        await logout();


        throw new Error(
          "Please use the Staff / Admin Login page."
        );

      }


      navigate(

        getDashboardPath(
          role
        ),

        {

          replace:
            true,

        }

      );

    } catch (
      err
    ) {

      console.error(
        "Phone login failed:",
        err
      );


      try {

        await logout();

      } catch {

        // Ignore.

      }


      let friendlyMessage =
        err?.message ||
        "Unable to sign in using OTP.";


      switch (
        err?.code
      ) {

        case "auth/invalid-verification-code":

          friendlyMessage =
            "The OTP is incorrect.";

          break;


        case "auth/code-expired":

          friendlyMessage =
            "OTP has expired. Please request a new OTP.";

          break;


        default:

          break;

      }


      setError(
        friendlyMessage
      );

    } finally {

      setOtpLoading(
        false
      );

    }

  }


  /* ==========================================================
     RESEND OTP
  ========================================================== */

  async function resendOtp() {

    setError("");

    setMessage("");


    try {

      setOtpLoading(
        true
      );


      const normalizedPhone =
        normalizePhone(
          phoneNumber
        );


      resetRecaptcha();


      const verifier =
        createRecaptcha();


      const confirmationResult =
        await signInWithPhoneNumber(

          auth,

          normalizedPhone,

          verifier

        );


      confirmationResultRef.current =
        confirmationResult;


      setOtp("");

      setMessage(
        "A new OTP has been sent."
      );

    } catch (
      err
    ) {

      setError(

        err?.message ||
        "Unable to resend OTP."

      );

    } finally {

      setOtpLoading(
        false
      );

    }

  }


  /* ==========================================================
     BACK
  ========================================================== */

  function backToPhone() {

    setOtpMode(
      false
    );


    setOtp("");

    setError("");

    setMessage("");

    confirmationResultRef.current =
      null;


    resetRecaptcha();

  }


  /* ==========================================================
     RENDER
  ========================================================== */

  return (

    <main className="auth-page">

      <section className="auth-card">


        {/* BRAND */}

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


        {/* HEADING */}

        <div className="auth-heading">

          <p className="eyebrow">
            Welcome back
          </p>


          <h1>
            Sign in
          </h1>


          <p>
            Sign in using your email or mobile number.
          </p>

        </div>


        {/* LOGIN METHOD */}

        {!otpMode && (

          <div

            style={{

              display:
                "grid",

              gridTemplateColumns:
                "1fr 1fr",

              gap:
                "10px",

              marginBottom:
                "24px",

            }}

          >

            <button

              type="button"

              className={
                loginMethod ===
                "email"

                  ? "auth-secondary"

                  : "auth-method-button"
              }

              onClick={() =>
                changeLoginMethod(
                  "email"
                )
              }

            >

              <Mail
                size={17}
              />

              Email

            </button>


            <button

              type="button"

              className={
                loginMethod ===
                "phone"

                  ? "auth-secondary"

                  : "auth-method-button"
              }

              onClick={() =>
                changeLoginMethod(
                  "phone"
                )
              }

            >

              <Phone
                size={17}
              />

              Mobile OTP

            </button>

          </div>

        )}


        {/* ERROR */}

        {error && (

          <div
            className="auth-error"
            role="alert"
          >

            {error}

          </div>

        )}


        {/* SUCCESS */}

        {message && (

          <div
            className="auth-success"
            role="status"
          >

            {message}

          </div>

        )}


        {/* ====================================================
            EMAIL LOGIN
        ==================================================== */}

        {!otpMode &&

          loginMethod ===
            "email" && (

            <form

              onSubmit={
                submitEmailLogin
              }

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

                    name="email"

                    autoComplete="email"

                    placeholder="you@example.com"

                    value={
                      form.email
                    }

                    onChange={
                      handleChange
                    }

                    disabled={
                      loading ||
                      submitting
                    }

                  />

                </div>

              </label>


              <label>

                Password


                <div className="input-with-icon">

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

                    autoComplete="current-password"

                    placeholder="Enter your password"

                    value={
                      form.password
                    }

                    onChange={
                      handleChange
                    }

                    disabled={
                      loading ||
                      submitting
                    }

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

                    disabled={
                      loading ||
                      submitting
                    }

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


                <Link
                  to="/forgot-password"
                >

                  Forgot password?

                </Link>

              </div>


              <button

                className="auth-submit"

                disabled={
                  loading ||
                  submitting
                }

                type="submit"

              >

                <LogIn
                  size={18}
                />


                {submitting

                  ? "Signing in..."

                  : "Sign in"
                }


                <ArrowRight
                  size={18}
                />

              </button>

            </form>

          )}


        {/* ====================================================
            PHONE LOGIN
        ==================================================== */}

        {!otpMode &&

          loginMethod ===
            "phone" && (

            <form

              onSubmit={
                sendPhoneOtp
              }

              className="auth-form"

            >

              <label>

                Mobile number


                <div className="input-with-icon">

                  <Phone
                    size={18}
                  />


                  <input

                    type="tel"

                    autoComplete="tel"

                    placeholder="+919876543210"

                    value={
                      phoneNumber
                    }

                    onChange={
                      (event) =>
                        setPhoneNumber(
                          event.target
                            .value
                        )
                    }

                    disabled={
                      submitting
                    }

                  />

                </div>

              </label>


              <button

                className="auth-submit"

                disabled={
                  submitting
                }

                type="submit"

              >

                <Phone
                  size={18}
                />


                {submitting

                  ? "Sending OTP..."

                  : "Send OTP"
                }


                <ArrowRight
                  size={18}
                />

              </button>

            </form>

          )}


        {/* ====================================================
            OTP LOGIN
        ==================================================== */}

        {otpMode && (

          <div
            className="auth-form"
          >

            <div className="auth-heading">

              <ShieldCheck
                size={36}
              />


              <h2>
                Verify OTP
              </h2>


              <p>
                Enter the OTP sent to your mobile number.
              </p>

            </div>


            <label>

              OTP


              <div className="input-with-icon">

                <ShieldCheck
                  size={18}
                />


                <input

                  type="text"

                  inputMode="numeric"

                  maxLength={6}

                  placeholder="Enter 6-digit OTP"

                  value={otp}

                  onChange={
                    (event) =>
                      setOtp(

                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )

                      )
                  }

                  disabled={
                    otpLoading
                  }

                />

              </div>

            </label>


            <button

              type="button"

              className="auth-submit"

              onClick={
                verifyPhoneOtp
              }

              disabled={
                otpLoading
              }

            >

              <ShieldCheck
                size={18}
              />


              {otpLoading

                ? "Verifying..."

                : "Verify and sign in"
              }

            </button>


            <button

              type="button"

              className="auth-secondary"

              onClick={
                resendOtp
              }

              disabled={
                otpLoading
              }

            >

              <RefreshCw
                size={17}
              />

              Resend OTP

            </button>


            <button

              type="button"

              className="auth-back"

              onClick={
                backToPhone
              }

            >

              ← Change mobile number

            </button>

          </div>

        )}


        {/* RECAPTCHA */}

        <div
          id="login-recaptcha"
        />


        {/* REGISTER */}

        {!otpMode && (

          <>

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

          </>

        )}


        {/* STAFF */}

        <div
          style={{

            marginTop:
              "18px",

            textAlign:
              "center",

          }}
        >

          <Link

            to="/admin/login"

            style={{

              fontSize:
                "13px",

              color:
                "#64748b",

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