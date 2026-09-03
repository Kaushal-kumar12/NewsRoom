import { useEffect, useState } from "react";
import { Save, BellRing } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { updateUserProfile } from "../../services/users/userService";

export default function NotificationSettingsPage() {
  const { currentUser, firebaseUser } = useAuth();
  const [form, setForm] = useState({ notifyBreaking: true, notifyCategory: true });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (currentUser) setForm({
      notifyBreaking: currentUser.notifyBreaking !== false,
      notifyCategory: currentUser.notifyCategory !== false,
    });
  }, [currentUser]);

  const save = async () => {
    try {
      await updateUserProfile(firebaseUser.uid, form);
      setMessage("Notification preferences saved.");
    } catch (err) { setMessage(err?.message || "Unable to save preferences."); }
  };

  return (
    <div className="portal-page">
      <header className="portal-header"><div><p className="eyebrow">Preferences</p><h1>Notification Settings</h1><p>Control the alerts you receive from NewsRoom.</p></div></header>
      {message && <div className="portal-success">{message}</div>}
      <section className="portal-panel settings-list">
        <label><span><BellRing size={18}/><strong>Breaking news</strong><small>Receive important breaking-news alerts.</small></span><input type="checkbox" checked={form.notifyBreaking} onChange={(e) => setForm({...form, notifyBreaking: e.target.checked})}/></label>
        <label><span><BellRing size={18}/><strong>Followed categories</strong><small>Receive updates from categories you follow.</small></span><input type="checkbox" checked={form.notifyCategory} onChange={(e) => setForm({...form, notifyCategory: e.target.checked})}/></label>
        <button className="portal-primary" onClick={save}><Save size={17}/> Save settings</button>
      </section>
    </div>
  );
}
