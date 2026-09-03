import React from "react";
import { Link } from "react-router-dom";

export default function SuperAdminSettingsPage() {

  return (

    <div className="super-admin-narrow">

      <div className="super-admin-page-head">

        <div>

          <span className="super-admin-kicker">
            CONFIGURATION
          </span>

          <h2>
            Settings
          </h2>

          <p>
            Manage your administrator
            preferences.
          </p>

        </div>

      </div>


      <div className="super-admin-panel">

        <h3>
          Profile
        </h3>

        <p>
          Update your name, phone
          number and profile image.
        </p>

        <Link
          className="super-admin-btn primary"
          to="/super-admin/profile"
        >
          Open profile
        </Link>

      </div>


      <div className="super-admin-panel">

        <h3>
          Security
        </h3>

        <p>
          Review privileged account
          and role activity.
        </p>

        <Link
          className="super-admin-btn secondary"
          to="/super-admin/security"
        >
          Open security logs
        </Link>

      </div>

    </div>

  );
}