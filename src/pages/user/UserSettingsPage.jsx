import { Link } from "react-router-dom";
export default function UserSettingsPage() {
  return (
    <div className="portal-page">
      <header className="portal-header"><div><p className="eyebrow">Account</p><h1>Settings</h1><p>Manage your NewsRoom profile and notification preferences.</p></div></header>
      <section className="portal-panel settings-links">
        <Link to="/user/profile"><strong>Profile</strong><span>Update your name and avatar.</span></Link>
        <Link to="/user/notification-settings"><strong>Notifications</strong><span>Choose which alerts you receive.</span></Link>
      </section>
    </div>
  );
}
