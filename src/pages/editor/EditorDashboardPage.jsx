import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  Inbox,
  Send,
  CheckCircle2,
  XCircle,
  CalendarClock,
  ArrowRight,
  Plus,
} from "lucide-react";

import {
  getEditorialStories,
} from "../../services/editorial/editorialService";

export default function EditorDashboardPage() {
  const [
    stories,
    setStories,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");

      const result =
        await getEditorialStories();

      setStories(
        Array.isArray(result)
          ? result
          : []
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load editorial data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const stats =
    useMemo(
      () => ({
        submitted:
          stories.filter(
            (item) =>
              item.status ===
              "SUBMITTED"
          ).length,

        changes:
          stories.filter(
            (item) =>
              item.status ===
              "CHANGES_REQUESTED"
          ).length,

        published:
          stories.filter(
            (item) =>
              item.status ===
              "PUBLISHED"
          ).length,

        rejected:
          stories.filter(
            (item) =>
              item.status ===
              "REJECTED"
          ).length,

        scheduled:
          stories.filter(
            (item) =>
              item.status ===
              "SCHEDULED"
          ).length,
      }),
      [stories]
    );

  const queue =
    stories
      .filter(
        (item) =>
          [
            "SUBMITTED",
            "CHANGES_REQUESTED",
            "PENDING_ADMIN_REVIEW",
          ].includes(
            item.status
          )
      )
      .sort(
        (a, b) =>
          getTimestamp(
            b.updatedAt
          ) -
          getTimestamp(
            a.updatedAt
          )
      )
      .slice(0, 6);

  if (loading) {
    return (
      <div className="editor-page">
        <div className="editor-panel">
          Loading editorial dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="editor-page">

      <header className="editor-dashboard-hero">

        <div>
          <p className="eyebrow">
            Editorial workspace
          </p>

          <h1>
            Editorial Dashboard
          </h1>

          <p>
            Review incoming stories,
            request changes and
            manage publication workflow.
          </p>
        </div>

        <Link
          className="editor-primary"
          to="/editor/review"
        >
          <Inbox size={17} />
          Open review queue
        </Link>

      </header>

      {error && (
        <div className="editor-error">
          {error}
        </div>
      )}

      <section className="editor-stats">

        <Stat
          label="Review queue"
          value={stats.submitted}
          icon={Inbox}
          to="/editor/review"
        />

        <Stat
          label="Changes requested"
          value={stats.changes}
          icon={Send}
          to="/editor/review"
        />

        <Stat
          label="Published"
          value={stats.published}
          icon={CheckCircle2}
          to="/editor/published"
        />

        <Stat
          label="Rejected"
          value={stats.rejected}
          icon={XCircle}
          to="/editor/rejected"
        />

        <Stat
          label="Scheduled"
          value={stats.scheduled}
          icon={CalendarClock}
          to="/editor/scheduled"
        />

      </section>

      <section className="editor-panel">

        <div className="editor-panel-heading">

          <div>
            <p className="eyebrow">
              Needs attention
            </p>

            <h2>
              Latest review items
            </h2>
          </div>

          <Link to="/editor/review">
            View queue
            <ArrowRight size={15} />
          </Link>

        </div>

        {!queue.length ? (
          <div className="editor-empty">

            <CheckCircle2 size={32} />

            <h3>
              Review queue is clear
            </h3>

            <p>
              There are no stories
              waiting for editorial
              action.
            </p>

          </div>
        ) : (
          <div className="editor-table">

            {queue.map(
              (story) => (
                <div
                  className="editor-row"
                  key={story.id}
                >

                  <div>
                    <strong>
                      {story.title ||
                        "Untitled story"}
                    </strong>

                    <span>
                      {story.authorName ||
                        "Unknown author"}

                      {" · "}

                      {story.category ||
                        "Uncategorized"}
                    </span>
                  </div>

                  <span
                    className={`editor-status editor-status-${String(
                      story.status
                    ).toLowerCase()}`}
                  >
                    {story.status}
                  </span>

                  <Link
                    to={`/editor/review/${story.id}`}
                  >
                    Review
                  </Link>

                </div>
              )
            )}

          </div>
        )}

      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  to,
}) {
  return (
    <Link
      className="editor-stat"
      to={to}
    >
      <div className="editor-stat-icon">
        <Icon size={19} />
      </div>

      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>

      <ArrowRight size={15} />
    </Link>
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

  const result =
    new Date(value).getTime();

  return Number.isNaN(result)
    ? 0
    : result;
}