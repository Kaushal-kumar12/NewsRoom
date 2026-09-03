import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  FileText,
  Send,
  CheckCircle2,
  Clock3,
  Plus,
  ArrowRight,
  Eye,
} from "lucide-react";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  getAuthorStories
} from "../../services/news/newsServices";

export default function AuthorDashboardPage() {
  const {
    firebaseUser,
    user,
  } = useAuth();

  const [stories, setStories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setLoading(false);
      return;
    }

    getAuthorStories(firebaseUser.uid)
      .then(setStories)
      .catch((err) => {
        setError(
          err?.message ||
            "Unable to load dashboard."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [firebaseUser]);

  const stats = useMemo(
    () => ({
      total: stories.length,

      drafts: stories.filter(
        (item) =>
          item.status === "DRAFT"
      ).length,

      submitted: stories.filter(
        (item) =>
          item.status === "SUBMITTED" ||
          item.status ===
            "PENDING_ADMIN_REVIEW" ||
          item.status ===
            "PENDING_SUPERADMIN_REVIEW"
      ).length,

      published: stories.filter(
        (item) =>
          item.status === "PUBLISHED"
      ).length,

      views: stories.reduce(
        (sum, item) =>
          sum +
          Number(item.views || 0),
        0
      ),
    }),
    [stories]
  );

  const latestStories = useMemo(
    () =>
      [...stories]
        .sort(
          (a, b) =>
            getTimestamp(
              b.updatedAt
            ) -
            getTimestamp(
              a.updatedAt
            )
        )
        .slice(0, 5),
    [stories]
  );

  const name =
    user?.name ||
    user?.displayName ||
    "Author";

  if (loading) {
    return (
      <div className="author-page">
        <div className="author-panel">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="author-page">

      <header className="author-dashboard-hero">
        <div>
          <p className="eyebrow">
            Author workspace
          </p>

          <h1>
            Welcome back, {name}
          </h1>

          <p>
            Write, manage and track
            your NewsRoom stories.
          </p>
        </div>

        <Link
          to="/author/create"
          className="author-primary"
        >
          <Plus size={17} />
          Create story
        </Link>
      </header>

      {error && (
        <div className="author-error">
          {error}
        </div>
      )}

      <section className="author-stats">

        <StatCard
          icon={FileText}
          label="Total stories"
          value={stats.total}
        />

        <StatCard
          icon={Clock3}
          label="Drafts"
          value={stats.drafts}
        />

        <StatCard
          icon={Send}
          label="Submitted"
          value={stats.submitted}
        />

        <StatCard
          icon={CheckCircle2}
          label="Published"
          value={stats.published}
        />

        <StatCard
          icon={Eye}
          label="Total views"
          value={stats.views.toLocaleString()}
        />

      </section>

      <section className="author-dashboard-grid">

        <div className="author-panel">

          <div className="author-panel-heading">
            <div>
              <p className="eyebrow">
                Recent work
              </p>

              <h2>
                Latest stories
              </h2>
            </div>

            <Link to="/author/stories">
              View all
              <ArrowRight size={15} />
            </Link>
          </div>

          {!latestStories.length ? (
            <div className="author-empty">
              <FileText size={32} />

              <h3>
                No stories yet
              </h3>

              <p>
                Create your first
                story to begin.
              </p>

              <Link to="/author/create">
                Create story
              </Link>
            </div>
          ) : (
            <div className="author-story-list">

              {latestStories.map(
                (story) => (
                  <div
                    className="author-dashboard-story"
                    key={story.id}
                  >
                    <div>
                      <strong>
                        {story.title ||
                          "Untitled story"}
                      </strong>

                      <span>
                        {story.category ||
                          "Uncategorized"}
                        {" · "}
                        {story.status ||
                          "DRAFT"}
                      </span>
                    </div>

                    <Link
                      to={`/author/edit/${story.id}`}
                    >
                      Open
                    </Link>
                  </div>
                )
              )}

            </div>
          )}

        </div>

        <div className="author-panel author-quick-panel">

          <p className="eyebrow">
            Quick actions
          </p>

          <h2>
            Continue writing
          </h2>

          <p>
            Start a new article or
            continue one of your
            drafts.
          </p>

          <Link
            to="/author/create"
            className="author-primary"
          >
            <Plus size={17} />
            New story
          </Link>

          <Link
            to="/author/stories?status=DRAFT"
            className="author-secondary"
          >
            <FileText size={17} />
            View drafts
          </Link>

        </div>

      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="author-stat">
      <div className="author-stat-icon">
        <Icon size={19} />
      </div>

      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function getTimestamp(value) {
  if (!value) return 0;

  if (
    typeof value.toMillis ===
    "function"
  ) {
    return value.toMillis();
  }

  if (
    value instanceof Date
  ) {
    return value.getTime();
  }

  const parsed =
    new Date(value).getTime();

  return Number.isNaN(parsed)
    ? 0
    : parsed;
}