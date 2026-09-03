import React from "react";
import { Link } from "react-router-dom";
import { Newspaper } from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer">

      <div className="footer-container">

        <div className="footer-grid">

          {/* Brand */}
          <div className="footer-about">

            <Link to="/" className="footer-brand">

              <span className="footer-brand-icon">
                <Newspaper size={20} />
              </span>

              <span>NewsRoom</span>

            </Link>

            <p>
              Independent, fast and reader-focused digital news
              publishing. Bringing important stories, breaking
              developments and trusted information to readers.
            </p>

          </div>


          {/* News */}
          <div className="footer-column">

            <h4>News</h4>

            <Link to="/latest">
              Latest News
            </Link>

            <Link to="/breaking">
              Breaking News
            </Link>

            <Link to="/videos">
              Videos
            </Link>

            <Link to="/photos">
              Photos
            </Link>

          </div>


          {/* Company */}
          <div className="footer-column">

            <h4>Company</h4>

            <Link to="/about">
              About Us
            </Link>

            <Link to="/contact">
              Contact
            </Link>

            <Link to="/privacy">
              Privacy Policy
            </Link>

            <Link to="/terms">
              Terms & Conditions
            </Link>

          </div>


          {/* Categories */}
          <div className="footer-column">

            <h4>Categories</h4>

            <Link to="/category/india">
              India
            </Link>

            <Link to="/category/world">
              World
            </Link>

            <Link to="/category/bihar">
              Bihar
            </Link>

            <Link to="/category/technology">
              Technology
            </Link>

          </div>

        </div>


        <div className="footer-bottom">

          <p>
            © {new Date().getFullYear()} NewsRoom.
            All rights reserved.
          </p>

          <div>
            <Link to="/privacy">
              Privacy
            </Link>

            <Link to="/terms">
              Terms
            </Link>
          </div>

        </div>

      </div>

    </footer>
  );
}