import { useState } from "react";
import { Heart, Plus, X, Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { updateFollowedCategories } from "../../services/following/followingService";

const suggestions = ["India", "World", "Bihar", "Technology", "Business", "Sports", "Science", "Entertainment"];

export default function FollowingPage() {
  const { currentUser, firebaseUser } = useAuth();
  const [selected, setSelected] = useState(currentUser?.followed || []);
  const [message, setMessage] = useState("");

  const toggle = (category) => setSelected((list) => list.includes(category) ? list.filter((x) => x !== category) : [...list, category]);

  const save = async () => {
    try {
      await updateFollowedCategories(firebaseUser.uid, selected);
      setMessage("Your followed topics have been updated.");
    } catch (err) { setMessage(err?.message || "Unable to update followed topics."); }
  };

  return (
    <div className="portal-page">
      <header className="portal-header"><div><p className="eyebrow">Personalization</p><h1>Following</h1><p>Choose the categories you want NewsRoom to prioritize.</p></div></header>
      {message && <div className="portal-success">{message}</div>}
      <section className="portal-panel">
        <div className="topic-chips">
          {suggestions.map((item) => (
            <button key={item} className={selected.includes(item) ? "selected" : ""} onClick={() => toggle(item)}>
              {selected.includes(item) ? <X size={15}/> : <Plus size={15}/>} {item}
            </button>
          ))}
        </div>
        <button className="portal-primary" onClick={save}><Save size={17}/> Save preferences</button>
      </section>
    </div>
  );
}
