import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Menu,
  X,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useApp,
} from "../../context/AppContext";


export default function MobileMenu() {

  const [
    open,
    setOpen,
  ] = useState(false);


  const {
    categories = [],
  } = useApp();


  const menuRef =
    useRef(null);


  function closeMenu() {

    setOpen(false);

  }


  useEffect(() => {

    function handleOutsideClick(event) {

      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target
        )
      ) {

        closeMenu();

      }

    }


    function handleEscape(event) {

      if (
        event.key === "Escape"
      ) {

        closeMenu();

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


  return (

    <div
      className="ph-mobile-menu"
      ref={menuRef}
    >

      {/* MENU BUTTON */}

      <button
        type="button"
        className={`ph-mobile-menu-trigger ${
          open
            ? "is-open"
            : ""
        }`}
        onClick={() =>
          setOpen(
            (value) => !value
          )
        }
        aria-label={
          open
            ? "Close navigation"
            : "Open navigation"
        }
        aria-expanded={open}
      >

        {open ? (

          <X size={21} />

        ) : (

          <Menu size={21} />

        )}

      </button>


      {/* MENU PANEL */}

      {open && (

        <div className="ph-mobile-menu-panel">

          {/* HEADER */}

          <div className="ph-mobile-menu-header">

            <div>

              <span>
                NEWSROOM
              </span>

              <strong>
                Explore News
              </strong>

            </div>

          </div>


          {/* MAIN NAVIGATION */}

          <div className="ph-mobile-menu-section">

            <span className="ph-mobile-menu-label">
              MAIN MENU
            </span>


            <Link
              to="/"
              onClick={closeMenu}
            >
              Home
            </Link>


            <Link
              to="/latest"
              onClick={closeMenu}
            >
              Latest News
            </Link>


            <Link
              to="/breaking"
              onClick={closeMenu}
            >
              Breaking News
            </Link>


            <Link
              to="/videos"
              onClick={closeMenu}
            >
              Videos
            </Link>


            <Link
              to="/photos"
              onClick={closeMenu}
            >
              Photos
            </Link>

          </div>


          {/* CATEGORIES */}

          {categories.length > 0 && (

            <div className="ph-mobile-menu-section ph-category-menu-section">

              <span className="ph-mobile-menu-label">
                EXPLORE CATEGORIES
              </span>


              <div className="ph-mobile-category-list">

                {categories.map(
                  (category) => (

                    <Link
                      key={category}
                      to={`/category/${encodeURIComponent(
                        String(
                          category
                        ).toLowerCase()
                      )}`}
                      onClick={closeMenu}
                    >

                      {category}

                    </Link>

                  )
                )}

              </div>

            </div>

          )}

        </div>

      )}

    </div>

  );

}