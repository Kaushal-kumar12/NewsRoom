import { useState } from "react";
import { LockKeyhole, ShieldCheck, Database, FileWarning } from "lucide-react";

const controls = [
  ["Role-based access control", "RBAC should be enforced through Firebase Security Rules.", ShieldCheck],
  ["Firestore protection", "Client-side UI restrictions are not sufficient for production security.", Database],
  ["Audit logging", "Privileged actions should create immutable audit records.", FileWarning],
  ["Authentication", "Administrative accounts should use Firebase Authentication and strong account protection.", LockKeyhole]
];

export default function SystemSecurityPage() {
  const [settings, setSettings] = useState({
    requireMfa: false,
    auditAdmins: true,
    blockClientRoleChange: true,
    maintenanceMode: false
  });

  return (
    <div className="superadmin-page">
      <header className="superadmin-header">
        <div><p className="superadmin-eyebrow">Security center</p><h1>System Security</h1><p>Review the security controls required for the NewsRoom platform.</p></div>
      </header>

      <section className="security-cards">
        {controls.map(([title, description, Icon]) => (
          <div className="security-card" key={title}>
            <div className="security-icon"><Icon size={19}/></div>
            <div><strong>{title}</strong><p>{description}</p></div>
          </div>
        ))}
      </section>

      <section className="superadmin-panel">
        <h2>Application controls</h2>
        <div className="security-settings">
          <label><input type="checkbox" checked={settings.requireMfa} onChange={(e) => setSettings({...settings, requireMfa: e.target.checked})}/><span><strong>Require MFA for privileged accounts</strong><small>UI flag only until the authentication/security layer is implemented.</small></span></label>
          <label><input type="checkbox" checked={settings.auditAdmins} onChange={(e) => setSettings({...settings, auditAdmins: e.target.checked})}/><span><strong>Audit administrator actions</strong><small>Keep administrative activity recorded.</small></span></label>
          <label><input type="checkbox" checked={settings.blockClientRoleChange} onChange={(e) => setSettings({...settings, blockClientRoleChange: e.target.checked})}/><span><strong>Block client-side role escalation</strong><small>Must ultimately be enforced through Firestore Security Rules.</small></span></label>
          <label><input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}/><span><strong>Maintenance mode</strong><small>Frontend control; connect it to site settings when the maintenance workflow is implemented.</small></span></label>
        </div>
      </section>
    </div>
  );
}
