// superadminnewsdetailspage.jsx

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Edit3,
  Eye,
  ShieldAlert,
  User,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getNewsById,
} from "../../services/editorial/editorialService";

import NewsStatusBadge from "../../components/superadmin/editorial/NewsStatusBadge";
import ArticlePreview from "../../components/superadmin/editorial/ArticlePreview";
import ApprovalTimeline from "../../components/superadmin/editorial/ApprovalTimeline";

export default function SuperAdminNewsDetailsPage() {
  const { newsId } = useParams();
  const navigate = useNavigate();

  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getNewsById(newsId);

        if (!result) {
          throw new Error("Article not found.");
        }

        setNews(result);
      } catch (error) {
        setError(error?.message || "Unable to load article.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [newsId]);

  if (loading) {
    return (
      <div className="editorial-page">
        <div className="editorial-loading">
          Loading article...
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="editorial-page">
        <div className="editorial-alert editorial-alert-danger">
          {error || "Article not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="editorial-page">

      <button
        className="editorial-back-button"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <header className="editorial-detail-header">

        <div>

          <div className="editorial-detail-meta">
            <NewsStatusBadge status={news.status} />

            {news.sensitive && (
              <span className="editorial-sensitive-badge">
                <ShieldAlert size={14} />
                Sensitive
              </span>
            )}
          </div>

          <h1>{news.title}</h1>

          <p>
            {news.subtitle || "No subtitle provided."}
          </p>

        </div>

        <Link
          to={`/super-admin/editorial/news/${news.id}/edit`}
          className="editorial-btn editorial-btn-primary"
        >
          <Edit3 size={16} />
          Edit Article
        </Link>

      </header>

      <div className="editorial-detail-layout">

        <main>

          <ArticlePreview
            article={news}
          />

        </main>

        <aside className="editorial-detail-sidebar">

          <section className="editorial-side-card">

            <h3>Publication information</h3>

            <InfoRow
              icon={User}
              label="Author"
              value={news.authorName}
            />

            <InfoRow
              icon={Calendar}
              label="Created"
              value={formatDate(news.createdAt)}
            />

            <InfoRow
              icon={Eye}
              label="Views"
              value={news.views || 0}
            />

          </section>

          <ApprovalTimeline news={news} />

        </aside>

      </div>

    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="editorial-info-row">
      <Icon size={16} />
      <div>
        <span>{label}</span>
        <strong>{value || "—"}</strong>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date =
    typeof value?.toDate === "function"
      ? value.toDate()
      : new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString();
}