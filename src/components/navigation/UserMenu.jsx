import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  UserRound,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";


export default function UserMenu() {

  const {
    user,
    logout,
  } = useAuth();


  const navigate =
    useNavigate();


  const menuRef =
    useRef(null);


  const [
    open,
    setOpen,
  ] = useState(false);


  useEffect(() => {

    function handleOutsideClick(event) {

      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target
        )
      ) {

        setOpen(false);

      }

    }


    function handleEscape(event) {

      if (
        event.key === "Escape"
      ) {

        setOpen(false);

      }

    }


    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );


    document.addEventListener(
      "keydown",
      handleEscape
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );


      document.removeEventListener(
        "keydown",
        handleEscape
      );

    };

  }, []);


  if (!user) {

    return (

      <Link
        className="ph-login-button"
        to="/login"
      >

        <LogIn size={17} />

        <span>
          Login
        </span>

      </Link>

    );

  }


  const firstLetter =
    user.name
      ?.charAt(0)
      ?.toUpperCase()
    ||
    "U";


  const userName =
    user.name
    ||
    "User";


  const userEmail =
    user.email
    ||
    "NewsRoom Member";


  const userAvatar =
    user.avatar;


  async function handleLogout() {

    try {

      setOpen(false);

      await logout();

      navigate("/");

    }

    catch (error) {

      console.error(
        "Logout failed:",
        error
      );

    }

  }


  return (

    <div
      className="ph-user-menu"
      ref={menuRef}
    >

      {/* PROFILE BUTTON */}

      <button
        type="button"
        className={`ph-user-trigger ${
          open
            ? "is-open"
            : ""
        }`}
        onClick={() =>
          setOpen(
            (value) => !value
          )
        }
        aria-label="Open user menu"
        aria-expanded={open}
      >

        <span className="ph-user-avatar">

          {userAvatar ? (

            <img
              src={userAvatar}
              alt={userName}
            />

          ) : (

            firstLetter

          )}

        </span>


        <span className="ph-user-trigger-info">

          <strong>
            {userName}
          </strong>

        </span>


        <ChevronDown
          size={16}
          className="ph-user-chevron"
        />

      </button>


      {/* PROFILE DROPDOWN */}

      {open && (

        <div
          className="ph-user-dropdown"
        >

          {/* USER INFORMATION */}

          <div className="ph-user-dropdown-header">

            <span className="ph-user-dropdown-avatar">

              {userAvatar ? (

                <img
                  src={userAvatar}
                  alt={userName}
                />

              ) : (

                firstLetter

              )}

            </span>


            <div className="ph-user-dropdown-details">

              <strong>
                {userName}
              </strong>


              <span>
                {userEmail}
              </span>

            </div>

          </div>


          {/* MENU */}

          <div className="ph-user-dropdown-menu">

            <Link
              to="/user/dashboard"
              onClick={() =>
                setOpen(false)
              }
            >

              <span className="ph-menu-icon">

                <LayoutDashboard
                  size={18}
                />

              </span>


              <span>
                Dashboard
              </span>


              <span className="ph-menu-arrow">
                ›
              </span>

            </Link>


            <Link
              to="/user/profile"
              onClick={() =>
                setOpen(false)
              }
            >

              <span className="ph-menu-icon">

                <UserRound
                  size={18}
                />

              </span>


              <span>
                My Profile
              </span>


              <span className="ph-menu-arrow">
                ›
              </span>

            </Link>

          </div>


          {/* LOGOUT */}

          <div className="ph-user-dropdown-footer">

            <button
              type="button"
              onClick={handleLogout}
            >

              <LogOut size={18} />

              <span>
                Sign Out
              </span>

            </button>

          </div>

        </div>

      )}

    </div>

  );

}