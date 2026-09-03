import { useEffect, useMemo, useState } from "react";
import { BarChart3, Eye, Heart, MessageSquare, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAuthorStories } from "../../services/news/NewsService";

export default function AuthorAnalyticsPage() {
  const { firebaseUser } = useAuth();
  const [stories, setStories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!firebaseUser) return;
    getAuthorStories(firebaseUser.uid)
      .then(setStories)
      .catch((err) => setError(err?.message || "Unable to load analytics."));
  }, [firebaseUser]);

  const totals = useMemo(() => ({
    stories: stories.length,
    published: stories.filter((x) => x.status === "PUBLISHED").length,
    views: stories.reduce((sum, x) => sum + Number(x.views || 0), 0),
    likes: stories.reduce((sum, x) => sum + Number(x.likesCount || 0), 0),
    comments: stories.reduce((sum, x) => sum + Number(x.commentsCount || 0), 0),
  }), [stories]);

  return (
    <div className="author-page">
      <header className="author-header">
        <div>
          <p className="eyebrow">Performance</p>
          <h1>Analytics</h1>
          <p>Overview of your story publication and engagement metrics.</p>
        </div>
      </header>

      {error && <div className="author-error">{error}</div>}

      <section className="author-stats analytics-stats">
        {[
          ["Stories", totals.stories, FileText],
          ["Published", totals.published, BarChart3],
          ["Views", totals.views, Eye],
          ["Likes", totals.likes, Heart],
          ["Comments", totals.comments, MessageSquare],
        ].map(([label, value, Icon]) => (
          <div className="author-stat" key={label}>
            <div className="author-stat-icon"><Icon size={19} /></div>
            <div><strong>{value}</strong><span>{label}</span></div>
          </div>
        ))}
      </section>

      <section className="author-panel">
        <div className="author-panel-heading">
          <div>
            <p className="eyebrow">Story performance</p>
            <h2>Published story metrics</h2>
          </div>
        </div>

        {!stories.filter((x) => x.status === "PUBLISHED").length ? (
          <div className="author-empty">
            <BarChart3 size={32} />
            <h3>No published stories yet</h3>
            <p>Analytics will become meaningful after your stories are published.</p>
          </div>
        ) : (
          <div className="author-story-table">
            {stories.filter((x) => x.status === "PUBLISHED").map((story) => (
              <div className="analytics-row" key={story.id}>
                <strong>{story.title || "Untitled story"}</strong>
                <span><Eye size={14}/> {story.views || 0}</span>
                <span><Heart size={14}/> {story.likesCount || 0}</span>
                <span><MessageSquare size={14}/> {story.commentsCount || 0}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
