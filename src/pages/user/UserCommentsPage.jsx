import { useEffect, useState } from "react";
import { MessageSquare, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase/firebaseClient";
import { useAuth } from "../../context/AuthContext";

export default function UserCommentsPage() {
  const { firebaseUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!db || !firebaseUser) return;
    getDocs(query(collection(db, "comments"), where("userId", "==", firebaseUser.uid), orderBy("createdAt", "desc")))
      .then((snap) => setComments(snap.docs.map((x) => ({id: x.id, ...x.data()}))))
      .catch((err) => setError(err?.message || "Unable to load comments."));
  }, [firebaseUser]);

  return (
    <div className="portal-page">
      <header className="portal-header"><div><p className="eyebrow">Your activity</p><h1>My Comments</h1><p>Review comments you have posted on NewsRoom stories.</p></div></header>
      {error && <div className="portal-error">{error}</div>}
      <section className="portal-list">
        {!comments.length && !error && <div className="empty-state"><MessageSquare size={34}/><h3>No comments yet</h3><p>Join the conversation on a story.</p><Link to="/">Read news</Link></div>}
        {comments.map((comment) => (
          <article className="comment-card" key={comment.id}>
            <div><small>{comment.status || "PENDING"}</small><p>{comment.text}</p><span>{comment.newsId}</span></div>
            <Link to={`/news/${comment.newsId}`}><ExternalLink size={16}/></Link>
          </article>
        ))}
      </section>
    </div>
  );
}
