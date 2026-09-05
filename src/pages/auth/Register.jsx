// src/pages/auth/Register.jsx

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
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Smartphone,
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


  /*
  |------------------------------------------------------------
  | INDIA DEFAULT
  |
  | 9876543210
  |
  | becomes
  |
  | +919876543210
  |------------------------------------------------------------
  */

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

export default function RegisterPage() {

  const navigate =
    useNavigate();


  const {

    register,

    completePhoneRegistration,

    logout,

    loading,

  } = useAuth();


  /* ==========================================================
     REGISTRATION METHOD
  ========================================================== */

  const [

    registrationMethod,

    setRegistrationMethod,

  ] =
    useState(
      "email"
    );


  /* ==========================================================
     FORM
  ========================================================== */

  const [

    form,

    setForm,

  ] =
    useState({

      name: "",

      email: "",

      phoneNumber: "",

      password: "",

      confirmPassword: "",

      acceptTerms: false,

    });


  /* ==========================================================
     OTP
  ========================================================== */

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
     UI STATES
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

    showConfirmPassword,

    setShowConfirmPassword,

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

        // Ignore cleanup errors.

      }

    };

  }, []);


  /* ==========================================================
     UPDATE FIELD
  ========================================================== */

  function update(
    field,
    value
  ) {

    setForm(
      (current) => ({

        ...current,

        [field]:
          value,

      })
    );

  }


  /* ==========================================================
     CHANGE REGISTRATION METHOD
  ========================================================== */

  function changeMethod(
    method
  ) {

    setRegistrationMethod(
      method
    );


    setOtpMode(false);

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

        "registration-recaptcha",

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
     VALIDATE COMMON DATA
  ========================================================== */

  function validateCommonData() {

    const name =
      form.name.trim();


    if (
      !name ||
      name.length < 2
    ) {

      throw new Error(
        "Please enter your full name."
      );

    }


    if (
      !form.acceptTerms
    ) {

      throw new Error(
        "Please accept the Terms and Privacy Policy."
      );

    }


    return name;

  }


  /* ==========================================================
     EMAIL REGISTRATION
  ========================================================== */

  async function submitEmailRegistration(
    event
  ) {

    event.preventDefault();


    setError("");

    setMessage("");


    try {

      setSubmitting(true);


      const name =
        validateCommonData();


      const email =
        form.email
          .trim()
          .toLowerCase();


      if (!email) {

        throw new Error(
          "Please enter your email address."
        );

      }


      if (
        form.password.length < 6
      ) {

        throw new Error(
          "Password must contain at least 6 characters."
        );

      }


      if (
        form.password !==
        form.confirmPassword
      ) {

        throw new Error(
          "Passwords do not match."
        );

      }


      await register({

        name,

        email,

        password:
          form.password,

      });


      navigate(

        "/verify-email",

        {

          replace:
            true,

          state: {

            email,

          },

        }

      );

    } catch (
      err
    ) {

      console.error(
        "Email registration failed:",
        err
      );


      let friendlyMessage =
        err?.message ||
        "Unable to create your account.";


      switch (
        err?.code
      ) {

        case "auth/email-already-in-use":

          friendlyMessage =
            "An account with this email already exists.";

          break;


        case "auth/invalid-email":

          friendlyMessage =
            "Please enter a valid email address.";

          break;


        case "auth/weak-password":

          friendlyMessage =
            "Password must contain at least 6 characters.";

          break;


        case "auth/network-request-failed":

          friendlyMessage =
            "Network error. Please check your internet connection.";

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
     SEND MOBILE OTP
  ========================================================== */

  async function sendMobileOtp(
    event
  ) {

    event.preventDefault();


    setError("");

    setMessage("");


    try {

      setSubmitting(true);


      validateCommonData();


      const phoneNumber =
        normalizePhone(
          form.phoneNumber
        );


      if (
        !phoneNumber ||
        !/^\+\d{8,15}$/.test(
          phoneNumber
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

          phoneNumber,

          verifier

        );


      confirmationResultRef.current =
        confirmationResult;


      setOtpMode(
        true
      );


      setMessage(
        `A 6-digit OTP has been sent to ${phoneNumber}.`
      );

    } catch (
      err
    ) {

      console.error(
        "OTP sending failed:",
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
            "SMS quota has been exceeded. Please try again later.";

          break;


        case "auth/network-request-failed":

          friendlyMessage =
            "Network error. Please check your internet connection.";

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
     VERIFY REGISTRATION OTP
  ========================================================== */

  async function verifyMobileOtp() {

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


      /*
      |--------------------------------------------------------
      | VERIFY OTP
      |
      | Firebase creates/signs in the phone account.
      |--------------------------------------------------------
      */

      const credential =
        await confirmationResultRef.current.confirm(
          otp.trim()
        );


      const firebaseAccount =
        credential.user;


      const name =
        form.name.trim();


      const phoneNumber =
        normalizePhone(
          form.phoneNumber
        );


      /*
      |--------------------------------------------------------
      | CREATE NEWSROOM PROFILE
      |--------------------------------------------------------
      */

      await completePhoneRegistration({

        firebaseAccount,

        name,

        phoneNumber,

      });


      setMessage(
        "Your mobile number has been verified. Your account is now active."
      );


      setTimeout(

        () => {

          navigate(

            "/",

            {

              replace:
                true,

            }

          );

        },

        1000

      );

    } catch (
      err
    ) {

      console.error(
        "OTP verification failed:",
        err
      );


      let friendlyMessage =
        err?.message ||
        "Invalid or expired OTP.";


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


      /*
      |--------------------------------------------------------
      | CLEANUP
      |--------------------------------------------------------
      */

      try {

        await logout();

      } catch {

        // Ignore.

      }

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


      const phoneNumber =
        normalizePhone(
          form.phoneNumber
        );


      resetRecaptcha();


      const verifier =
        createRecaptcha();


      const confirmationResult =
        await signInWithPhoneNumber(

          auth,

          phoneNumber,

          verifier

        );


      confirmationResultRef.current =
        confirmationResult;


      setOtp("");

      setMessage(
        "A new OTP has been sent to your mobile number."
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
     BACK TO MOBILE FORM
  ========================================================== */

  function backToPhoneForm() {

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

      <section className="auth-card auth-card-wide">


        {/* ====================================================
            BRAND
        ==================================================== */}

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


        {/* ====================================================
            HEADING
        ==================================================== */}

        <div className="auth-heading">

          <p className="eyebrow">
            Join NewsRoom
          </p>


          <h1>
            Create your account
          </h1>


          <p>

            Choose email or mobile number
            to create your NewsRoom account.

          </p>

        </div>


        {/* ====================================================
            METHOD SELECTOR
        ==================================================== */}

        {!otpMode && (

          <div
            className="auth-method-selector"
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

              onClick={() =>
                changeMethod(
                  "email"
                )
              }

              className={
                registrationMethod ===
                "email"

                  ? "auth-secondary"

                  : "auth-method-button"
              }

            >

              <Mail
                size={18}
              />

              Email

            </button>


            <button

              type="button"

              onClick={() =>
                changeMethod(
                  "phone"
                )
              }

              className={
                registrationMethod ===
                "phone"

                  ? "auth-secondary"

                  : "auth-method-button"
              }

            >

              <Smartphone
                size={18}
              />

              Mobile

            </button>

          </div>

        )}


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
            SUCCESS
        ==================================================== */}

        {message && (

          <div
            className="auth-success"
            role="status"
          >

            {message}

          </div>

        )}


        {/* ====================================================
            EMAIL REGISTRATION
        ==================================================== */}

        {!otpMode &&

          registrationMethod ===
            "email" && (

            <form

              onSubmit={
                submitEmailRegistration
              }

              className="auth-form"

            >


              {/* NAME */}

              <label>

                Full name


                <div className="input-with-icon">

                  <User
                    size={18}
                  />


                  <input

                    type="text"

                    autoComplete="name"

                    placeholder="Your name"

                    value={
                      form.name
                    }

                    onChange={
                      (event) =>
                        update(

                          "name",

                          event.target
                            .value

                        )
                    }

                    disabled={
                      loading ||
                      submitting
                    }

                  />

                </div>

              </label>


              {/* EMAIL */}

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

                    value={
                      form.email
                    }

                    onChange={
                      (event) =>
                        update(

                          "email",

                          event.target
                            .value

                        )
                    }

                    disabled={
                      loading ||
                      submitting
                    }

                  />

                </div>

              </label>


              {/* PASSWORD */}

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

                    autoComplete="new-password"

                    placeholder="At least 6 characters"

                    value={
                      form.password
                    }

                    onChange={
                      (event) =>
                        update(

                          "password",

                          event.target
                            .value

                        )
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


              {/* CONFIRM PASSWORD */}

              <label>

                Confirm password


                <div className="input-with-icon">

                  <Lock
                    size={18}
                  />


                  <input

                    type={
                      showConfirmPassword

                        ? "text"

                        : "password"
                    }

                    autoComplete="new-password"

                    placeholder="Repeat your password"

                    value={
                      form.confirmPassword
                    }

                    onChange={
                      (event) =>
                        update(

                          "confirmPassword",

                          event.target
                            .value

                        )
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
                      setShowConfirmPassword(
                        (value) =>
                          !value
                      )
                    }

                  >

                    {showConfirmPassword ? (

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


              {/* TERMS */}

              <label className="checkbox-row">

                <input

                  type="checkbox"

                  checked={
                    form.acceptTerms
                  }

                  onChange={
                    (event) =>
                      update(

                        "acceptTerms",

                        event.target
                          .checked

                      )
                  }

                />


                <span>

                  I agree to the{" "}

                  <Link to="/terms">
                    Terms
                  </Link>

                  {" "}and{" "}

                  <Link to="/privacy">
                    Privacy Policy
                  </Link>

                  .

                </span>

              </label>


              {/* SUBMIT */}

              <button

                className="auth-submit"

                disabled={
                  loading ||
                  submitting
                }

                type="submit"

              >

                <UserPlus
                  size={18}
                />


                {submitting

                  ? "Creating account..."

                  : "Create account"
                }


                <ArrowRight
                  size={18}
                />

              </button>

            </form>

          )}


        {/* ====================================================
            MOBILE REGISTRATION
        ==================================================== */}

        {!otpMode &&

          registrationMethod ===
            "phone" && (

            <form

              onSubmit={
                sendMobileOtp
              }

              className="auth-form"

            >


              {/* NAME */}

              <label>

                Full name


                <div className="input-with-icon">

                  <User
                    size={18}
                  />


                  <input

                    type="text"

                    autoComplete="name"

                    placeholder="Your name"

                    value={
                      form.name
                    }

                    onChange={
                      (event) =>
                        update(

                          "name",

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


              {/* PHONE */}

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
                      form.phoneNumber
                    }

                    onChange={
                      (event) =>
                        update(

                          "phoneNumber",

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


              {/* TERMS */}

              <label className="checkbox-row">

                <input

                  type="checkbox"

                  checked={
                    form.acceptTerms
                  }

                  onChange={
                    (event) =>
                      update(

                        "acceptTerms",

                        event.target
                          .checked

                      )
                  }

                />


                <span>

                  I agree to the{" "}

                  <Link to="/terms">
                    Terms
                  </Link>

                  {" "}and{" "}

                  <Link to="/privacy">
                    Privacy Policy
                  </Link>

                  .

                </span>

              </label>


              {/* SUBMIT */}

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
            OTP SCREEN
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
                Verify mobile number
              </h2>


              <p>

                Enter the 6-digit OTP
                sent to your mobile number.

              </p>

            </div>


            <label>

              Verification code


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

              className="auth-submit"

              type="button"

              onClick={
                verifyMobileOtp
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

                : "Verify OTP"
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
                backToPhoneForm
              }

            >

              ← Change mobile number

            </button>

          </div>

        )}


        {/* INVISIBLE RECAPTCHA */}

        <div
          id="registration-recaptcha"
        />


        {/* ====================================================
            LOGIN LINK
        ==================================================== */}

        {!otpMode && (

          <>

            <div className="auth-divider">

              <span>
                Already have an account?
              </span>

            </div>


            <Link

              className="auth-secondary"

              to="/login"

            >

              Sign in

            </Link>

          </>

        )}


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