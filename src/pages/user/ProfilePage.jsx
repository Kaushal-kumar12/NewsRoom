import { useEffect, useState } from "react";
import { Save, UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { updateUserProfile } from "../../services/users/userService";

export default function ProfilePage() {
  const { currentUser, firebaseUser } = useAuth();
  const [form, setForm] = useState({ name: "", avatar: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      name: currentUser?.name || firebaseUser?.displayName || "",
      avatar: currentUser?.avatar || "",
    });
  }, [currentUser, firebaseUser]);

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      await updateUserProfile(firebaseUser.uid, form);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err?.message || "Unable to update profile.");
    }
  };

  return (
    <div className="portal-page">
      <header className="portal-header"><div><p className="eyebrow">Account</p><h1>My Profile</h1><p>Update the public information attached to your NewsRoom account.</p></div></header>

      <section className="portal-panel">
        {message && <div className="portal-success">{message}</div>}
        {error && <div className="portal-error">{error}</div>}
        <form className="portal-form" onSubmit={submit}>
          <div className="profile-preview">
            {form.avatar ? <img src={form.avatar} alt="" /> : <div className="account-avatar"><UserRound size={24}/></div>}
            <div><strong>{form.name || "Your name"}</strong><span>{currentUser?.email}</span></div>
          </div>
          <label>Full name<input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}/></label>
          <label>Avatar URL<input value={form.avatar} placeholder="https://..." onChange={(e) => setForm({...form, avatar: e.target.value})}/></label>
          <label>Email address<input value={currentUser?.email || ""} disabled /></label>
          <button className="portal-primary" type="submit"><Save size={17}/> Save changes</button>
        </form>
      </section>
    </div>
  );
}
