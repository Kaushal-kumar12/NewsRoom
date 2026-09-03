// src/components/navigation/Header.jsx

import React from "react";

import {
  Newspaper,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";


import SearchBar
  from "./SearchBar";

import NotificationBell
  from "./NotificationBell";

import UserMenu
  from "./UserMenu";

import MobileMenu
  from "./MobileMenu";

import CurrentDateTime
  from "./CurrentDateTime";


import {
  useApp,
} from "../../context/AppContext";


function createCategorySlug(category) {

  return String(
    category || ""
  )
    .trim()
    .toLowerCase()
    .replace(
      /\s+/g,
      "-"
    );

}


export default function Header() {


  const {
    categories = [],
  } = useApp();


  return (

    <>


      {/* =====================================================
          TOP INFORMATION BAR
      ===================================================== */}

      <div className="news-topbar">

        <div className="news-topbar-inner">


          <div className="live-news">

            <span className="live-dot" />

            LIVE NEWS

          </div>


          <CurrentDateTime />


        </div>

      </div>



      {/* =====================================================
          MAIN HEADER
      ===================================================== */}

      <header className="site-header">


        <div className="header-inner">


          {/* =================================================
              BRAND
          ================================================= */}

          <Link
            className="brand"
            to="/"
          >

            <span className="brand-mark">

              <Newspaper
                size={22}
              />

            </span>


            <span className="brand-name">

              NewsRoom

            </span>

          </Link>



          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

          <nav
            className="desktop-nav"
            aria-label="Main navigation"
          >


            <Link to="/">

              Home

            </Link>


            <Link to="/latest">

              Latest

            </Link>


            <Link to="/breaking">

              Breaking

            </Link>


            <Link
              className="desktop-nav-media"
              to="/videos"
            >

              Videos

            </Link>


            <Link
              className="desktop-nav-media"
              to="/photos"
            >

              Photos

            </Link>



            {categories.map(
              (category) => (

                <Link
                  key={category}
                  to={`/category/${createCategorySlug(
                    category
                  )}`}
                >

                  {category}

                </Link>

              )
            )}


          </nav>



          {/* =================================================
              HEADER ACTIONS
          ================================================= */}

          <div className="header-actions">


            {/* Search Field */}

            <SearchBar />



            {/* Notifications */}

            <NotificationBell />



            {/* User Profile */}

            <UserMenu />



            {/* Mobile Menu */}

            <MobileMenu />


          </div>


        </div>


      </header>


    </>

  );

}