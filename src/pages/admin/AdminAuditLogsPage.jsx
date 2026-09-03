import { useEffect, useState } from "react";
import { getAuditLogs } from "../../services/admin/adminService";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getAuditLogs().then(setLogs).catch((e) => setError(e?.message || "Unable to load audit logs."));
  }, []);

  return (
    <div className="admin-page">
      <header className="admin-header"><div><p className="eyebrow">Security & compliance</p><h1>Audit Logs</h1><p>Review administrative activity recorded by the system.</p></div></header>
      {error && <div className="admin-error">{error}</div>}
      <section className="admin-panel">
        <div className="admin-table">
          {logs.map((log) => (
            <div className="admin-row" key={log.id}>
              <div>
                <strong>{log.action || "System action"}</strong>
                <span>{log.userName || log.userId || "Unknown user"} · {log.target || log.targetId || "—"}</span>
              </div>
              <span>{log.createdAt?.toDate ? log.createdAt.toDate().toLocaleString() : String(log.createdAt || "—")}</span>
            </div>
          ))}
          {!logs.length && <div className="admin-empty">No audit records found.</div>}
        </div>
      </section>
    </div>
  );
}
