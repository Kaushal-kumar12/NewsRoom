import React, {
  useEffect,
  useState,
} from "react";

import {
  getSecurityLogs,
} from "../../services/superAdminService";

export default function SuperAdminSecurityPage() {

  const [logs, setLogs] =
    useState([]);

  const [error, setError] =
    useState("");


  useEffect(() => {

    getSecurityLogs()

      .then(setLogs)

      .catch((err) => {

        setError(
          err?.message ||
          "Unable to load security logs."
        );

      });

  }, []);


  return (

    <div>

      <div className="super-admin-page-head">

        <div>

          <span className="super-admin-kicker">
            SECURITY
          </span>

          <h2>
            Security Logs
          </h2>

          <p>
            Audit privileged account
            and role changes.
          </p>

        </div>

      </div>


      {error && (
        <div className="super-admin-alert error">
          {error}
        </div>
      )}


      <div className="super-admin-table-wrap">

        <table className="super-admin-table">

          <thead>

            <tr>

              <th>
                Action
              </th>

              <th>
                Actor
              </th>

              <th>
                Details
              </th>

              <th>
                Time
              </th>

            </tr>

          </thead>


          <tbody>

            {logs.map(
              (log) => (

                <tr key={log.id}>

                  <td>
                    {log.action}
                  </td>

                  <td>
                    {log.actorEmail ||
                      log.actorId}
                  </td>

                  <td>
                    <code>
                      {JSON.stringify(
                        log.metadata ||
                        {}
                      )}
                    </code>
                  </td>

                  <td>
                    {log.createdAt?.toDate
                      ? log.createdAt
                          .toDate()
                          .toLocaleString()
                      : "Pending"}
                  </td>

                </tr>

              )
            )}


            {!logs.length && (

              <tr>

                <td colSpan="4">
                  No security events found.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>

  );
}