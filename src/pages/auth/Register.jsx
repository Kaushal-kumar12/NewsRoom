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
} from "lucide-react";

import {
  PhoneAuthProvider,
  RecaptchaVerifier,
  linkWithCredential,
} from "firebase/auth";

import {
  auth,
} from "../../services/firebase";

import {
  useAuth,
} from "../../context/AuthContext";

import "../../styles/auth.css";

function normalizePhone(
  value
) {
  const raw =
    String(value || "")
      .trim();

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
  |--------------------------------------------------------------------------
  | India-friendly phone number
  |--------------------------------------------------------------------------
  */

  if (
    digits.length === 10
  ) {
    return `+91${digits}`;
  }

  return `+${digits}`;
}

export default function RegisterPage() {
  const navigate =
    useNavigate();

  const {
    register,
    markPhoneRegistrationVerified,
    loading,
  } = useAuth();

  const recaptchaRef =
    useRef(null);

  const verificationIdRef =
    useRef("");

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    });

  const [otp, setOtp] =
    useState("");

  const [otpMode, setOtpMode] =
    useState(false);

  const [otpLoading, setOtpLoading] =
    useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Cleanup reCAPTCHA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      try {
        recaptchaRef.current?.clear();
      } catch {
        // Ignore cleanup errors.
      }
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Update form
  |--------------------------------------------------------------------------
  */

  const update = (
    field,
    value
  ) => {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Create reCAPTCHA
  |--------------------------------------------------------------------------
  */

  const createRecaptcha =
    () => {
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
            size: "invisible",
          }
        );

      return recaptchaRef.current;
    };

  /*
  |--------------------------------------------------------------------------
  | SEND PHONE OTP
  |--------------------------------------------------------------------------
  */

  const sendPhoneOtp =
    async (
      phoneNumber
    ) => {
      const verifier =
        createRecaptcha();

      const provider =
        new PhoneAuthProvider(
          auth
        );

      const verificationId =
        await provider.verifyPhoneNumber(
          {
            phoneNumber,
          },
          verifier
        );

      verificationIdRef.current =
        verificationId;

      setOtpMode(true);

      setMessage(
        `A verification code was sent to ${phoneNumber}.`
      );
    };

  /*
  |--------------------------------------------------------------------------
  | REGISTRATION
  |--------------------------------------------------------------------------
  */

  const submit =
    async (event) => {
      event.preventDefault();

      setError("");
      setMessage("");

      const name =
        form.name.trim();

      const email =
        form.email
          .trim()
          .toLowerCase();

      const phoneNumber =
        normalizePhone(
          form.phoneNumber
        );

      /*
      |--------------------------------------------------------------------------
      | VALIDATION
      |--------------------------------------------------------------------------
      */

      if (
        !name ||
        name.length < 2
      ) {
        setError(
          "Please enter your full name."
        );

        return;
      }

      if (!email) {
        setError(
          "Please enter your email address."
        );

        return;
      }

      if (
        form.phoneNumber.trim() &&
        !/^\+\d{8,15}$/.test(
          phoneNumber
        )
      ) {
        setError(
          "Please enter a valid mobile number with country code, for example +919876543210."
        );

        return;
      }

      if (
        form.password.length < 6
      ) {
        setError(
          "Password must contain at least 6 characters."
        );

        return;
      }

      if (
        form.password !==
        form.confirmPassword
      ) {
        setError(
          "Passwords do not match."
        );

        return;
      }

      if (
        !form.acceptTerms
      ) {
        setError(
          "Please accept the Terms and Privacy Policy."
        );

        return;
      }

      try {
        const createdUser =
          await register({
            name,
            email,
            password:
              form.password,
            phoneNumber,
          });

        /*
        |--------------------------------------------------------------------------
        | EMAIL + PHONE
        |--------------------------------------------------------------------------
        |
        | Phone OTP is the activation method.
        |
        */

        if (
          createdUser.requiresPhoneVerification
        ) {
          setOtpLoading(true);

          try {
            await sendPhoneOtp(
              phoneNumber
            );
          } finally {
            setOtpLoading(
              false
            );
          }

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | EMAIL ONLY
        |--------------------------------------------------------------------------
        */

        navigate(
          "/verify-email",
          {
            replace: true,

            state: {
              email,
            },
          }
        );
      } catch (err) {
        console.error(
          "Registration failed:",
          err
        );

        let friendly =
          err?.message ||
          "Unable to create your account. Please try again.";

        switch (
          err?.code
        ) {
          case "auth/email-already-in-use":
            friendly =
              "An account with this email already exists. Please sign in instead.";
            break;

          case "auth/invalid-email":
            friendly =
              "Please enter a valid email address.";
            break;

          case "auth/weak-password":
            friendly =
              "Your password is too weak. Please use at least 6 characters.";
            break;

          case "auth/network-request-failed":
            friendly =
              "Network error. Please check your internet connection and try again.";
            break;

          default:
            break;
        }

        setError(
          friendly
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | VERIFY OTP
  |--------------------------------------------------------------------------
  */

  const verifyOtp =
    async () => {
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
        !verificationIdRef.current
      ) {
        setError(
          "The OTP session has expired. Please start registration again."
        );

        return;
      }

      if (
        !auth.currentUser
      ) {
        setError(
          "Your registration session has expired. Please start again."
        );

        return;
      }

      setOtpLoading(true);

      try {
        const credential =
          PhoneAuthProvider.credential(
            verificationIdRef.current,
            otp.trim()
          );

        /*
        |--------------------------------------------------------------------------
        | LINK VERIFIED PHONE TO SAME ACCOUNT
        |--------------------------------------------------------------------------
        */

        await linkWithCredential(
          auth.currentUser,
          credential
        );

        await markPhoneRegistrationVerified(
          normalizePhone(
            form.phoneNumber
          )
        );

        setMessage(
          "Mobile number verified. Your account is now active."
        );

        setTimeout(
          () => {
            navigate(
              "/",
              {
                replace: true,
              }
            );
          },
          700
        );
      } catch (err) {
        console.error(
          "Phone verification failed:",
          err
        );

        if (
          err?.code ===
          "auth/credential-already-in-use"
        ) {
          setError(
            "This mobile number is already linked to another account."
          );
        } else {
          setError(
            err?.message ||
              "Invalid or expired OTP. Please try again."
          );
        }
      } finally {
        setOtpLoading(
          false
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | RESEND OTP
  |--------------------------------------------------------------------------
  */

  const resendOtp =
    async () => {
      setError("");
      setMessage("");
      setOtpLoading(true);

      try {
        await sendPhoneOtp(
          normalizePhone(
            form.phoneNumber
          )
        );
      } catch (err) {
        setError(
          err?.message ||
            "Unable to resend the OTP."
        );
      } finally {
        setOtpLoading(
          false
        );
      }
    };

  return (
    <main className="auth-page">
      <section className="auth-card auth-card-wide">

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
            Join NewsRoom
          </p>

          <h1>
            Create your account
          </h1>

          <p>
            Register as a normal NewsRoom user.
            Editorial and administrative roles
            are assigned separately.
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
            {message}
          </div>
        )}

        {!otpMode ? (
          <form
            onSubmit={submit}
            className="auth-form"
          >
            <label>
              Full name

              <div className="input-with-icon">
                <User size={18} />

                <input
                  type="text"
                  name="name"
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
                    otpLoading
                  }
                />
              </div>
            </label>

            <label>
              Email address

              <div className="input-with-icon">
                <Mail size={18} />

                <input
                  type="email"
                  name="email"
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
                    otpLoading
                  }
                />
              </div>
            </label>

            <label>
              Mobile number

              <span
                style={{
                  marginLeft: 6,
                  color:
                    "#98a2b3",
                  fontWeight:
                    400,
                }}
              >
                (optional)
              </span>

              <div className="input-with-icon">
                <Phone size={18} />

                <input
                  type="tel"
                  name="phoneNumber"
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
                    loading ||
                    otpLoading
                  }
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

            <label>
              Confirm password

              <div className="input-with-icon">
                <Lock size={18} />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
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
                  disabled={loading}
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
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  disabled={loading}
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
                disabled={loading}
              />

              <span>
                I agree to the{" "}
                <Link to="/terms">
                  Terms
                </Link>{" "}
                and{" "}
                <Link to="/privacy">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            <button
              className="auth-submit"
              disabled={
                loading ||
                otpLoading
              }
              type="submit"
            >
              <UserPlus
                size={18}
              />

              {loading ||
              otpLoading
                ? "Creating account..."
                : "Create account"}

              <ArrowRight
                size={18}
              />
            </button>
          </form>
        ) : (
          <div className="auth-form">

            <div
              style={{
                padding:
                  "16px",
                borderRadius:
                  10,
                background:
                  "#f0f9ff",
                border:
                  "1px solid #cbeafe",
              }}
            >
              <ShieldCheck
                size={22}
              />

              <strong
                style={{
                  display:
                    "block",
                  marginTop: 8,
                }}
              >
                Verify your mobile number
              </strong>

              <p
                style={{
                  margin:
                    "6px 0 0",
                  color:
                    "#475569",
                  fontSize:
                    13,
                  lineHeight:
                    1.5,
                }}
              >
                Enter the 6-digit OTP sent to{" "}
                {normalizePhone(
                  form.phoneNumber
                )}
                .
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
                  autoComplete="one-time-code"
                  placeholder="123456"
                  value={otp}
                  onChange={
                    (event) =>
                      setOtp(
                        event.target.value.replace(
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
                verifyOtp
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
                : "Verify mobile"}

              <ArrowRight
                size={18}
              />
            </button>

            <button
              className="auth-secondary"
              type="button"
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
          </div>
        )}

        <div
          id="registration-recaptcha"
          aria-hidden="true"
        />

        {!otpMode && (
          <>
            <div className="auth-divider">
              <span>
                Already registered?
              </span>
            </div>

            <Link
              className="auth-secondary"
              to="/login"
            >
              Sign in instead
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