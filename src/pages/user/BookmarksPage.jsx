import { useEffect, useState } from "react";
import { Bookmark, Trash2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserBookmarks, removeBookmark } from "../../services/bookmarks/bookmarkService";

export default function BookmarksPage() {
  const { firebaseUser } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try { setItems(await getUserBookmarks(firebaseUser.uid)); }
    catch (err) { setError(err?.message || "Unable to load bookmarks."); }
  };

  useEffect(() => { if (firebaseUser) load(); }, [firebaseUser]);

  const remove = async (id) => {
    try { await removeBookmark(id); setItems((list) => list.filter((item) => item.id !== id)); }
    catch (err) { setError(err?.message || "Unable to remove bookmark."); }
  };

  return (
    <div className="portal-page">
      <header className="portal-header"><div><p className="eyebrow">Saved stories</p><h1>Bookmarks</h1><p>Stories you saved for later.</p></div></header>
      {error && <div className="portal-error">{error}</div>}
      <section className="portal-list">
        {!items.length && !error && <div className="empty-state"><Bookmark size={34}/><h3>No bookmarks yet</h3><p>Save a story from NewsRoom and it will appear here.</p><Link to="/">Explore news</Link></div>}
        {items.map((item) => (
          <article className="saved-story" key={item.id}>
            {item.image && <img src={item.image} alt="" />}
            <div><small>{item.category || "News"}</small><h3>{item.title || "Saved story"}</h3><Link to={`/news/${item.newsId}`}>Open story <ExternalLink size={14}/></Link></div>
            <button onClick={() => remove(item.id)} title="Remove bookmark"><Trash2 size={17}/></button>
          </article>
        ))}
      </section>
    </div>
  );
}
