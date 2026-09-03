import React from "react";
import { ShieldCheck } from "lucide-react";

import { allPermissions } from "../../services/rbac/permissionService";

export default function PermissionManagementPage() {
  return (
    <div className="superadmin-page">

      <div className="superadmin-page-head">

        <div>
          <span className="superadmin-kicker">
            ACCESS CONTROL
          </span>

          <h2>
            Permission Management
          </h2>

          <p>
            View and manage permissions available
            to the NewsRoom role-based access
            control system.
          </p>
        </div>

      </div>


      <div className="superadmin-panel">

        <div className="superadmin-panel-heading">

          <div className="superadmin-panel-icon">
            <ShieldCheck size={20} />
          </div>

          <div>
            <h3>
              Available Permissions
            </h3>

            <p>
              These permissions can be assigned
              to roles through Role Management.
            </p>
          </div>

        </div>


        <div className="permission-management-grid">

          {allPermissions.map((permission) => (

            <div
              className="permission-management-item"
              key={permission.id}
            >

              <div className="permission-management-icon">
                <ShieldCheck size={17} />
              </div>

              <div>
                <strong>
                  {permission.label}
                </strong>

                <span>
                  {permission.id}
                </span>
              </div>

            </div>

          ))}

          {!allPermissions.length && (
            <div className="superadmin-empty">
              No permissions configured.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}