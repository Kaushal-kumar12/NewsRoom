import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { getSiteSettings, saveSiteSettings } from "../../services/admin/adminService";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({ siteName: "NewsRoom", tagline: "", logo: "", contactEmail: "", breakingNews: true });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getSiteSettings().then((data) => data && setSettings((current) => ({ ...current, ...data }))).catch((e) => setError(e?.message || "Unable to load settings."));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    try { await saveSiteSettings(settings); setMessage("Site settings saved."); }
    catch (e) { setError(e?.message || "Unable to save settings."); }
  };

  return (
    <div className="admin-page">
      <header className="admin-header"><div><p className="eyebrow">Configuration</p><h1>Site Settings</h1><p>Manage the basic configuration used by the NewsRoom frontend.</p></div></header>
      {message && <div className="admin-success">{message}</div>}
      {error && <div className="admin-error">{error}</div>}
      <section className="admin-panel">
        <form className="admin-form" onSubmit={save}>
          <label>Site name<input value={settings.siteName || ""} onChange={(e) => setSettings({...settings, siteName: e.target.value})}/></label>
          <label>Tagline<input value={settings.tagline || ""} onChange={(e) => setSettings({...settings, tagline: e.target.value})}/></label>
          <label>Logo URL<input value={settings.logo || ""} onChange={(e) => setSettings({...settings, logo: e.target.value})}/></label>
          <label>Contact email<input type="email" value={settings.contactEmail || ""} onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}/></label>
          <label className="admin-checkbox"><input type="checkbox" checked={Boolean(settings.breakingNews)} onChange={(e) => setSettings({...settings, breakingNews: e.target.checked})}/> Enable breaking-news module</label>
          <button className="admin-primary" type="submit"><Save size={16}/> Save settings</button>
        </form>
      </section>
    </div>
  );
}
