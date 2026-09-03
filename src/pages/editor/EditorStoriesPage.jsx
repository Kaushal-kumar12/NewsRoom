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
  CheckCircle2,
  XCircle,
  CalendarClock,
  FileText,
} from "lucide-react";

import {
  getStoriesByStatus,
  getEditorialStories,
} from "../../services/editorial/editorialService";

export default function EditorStoriesPage({
  status,
}) {
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

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const result =
          status
            ? await getStoriesByStatus(
                status
              )
            : await getEditorialStories();

        if (mounted) {
          setStories(
            Array.isArray(result)
              ? result
              : []
          );
        }
      } catch (err) {
        if (mounted) {
          setError(
            err?.message ||
              "Unable to load stories."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [status]);

  const titleMap = {
    SUBMITTED:
      "Pending Stories",

    PENDING_ADMIN_REVIEW:
      "Pending Stories",

    PUBLISHED:
      "Published Stories",

    REJECTED:
      "Rejected Stories",

    SCHEDULED:
      "Scheduled Stories",

    CHANGES_REQUESTED:
      "Changes Requested",
  };

  const iconMap = {
    SUBMITTED: Inbox,
    PENDING_ADMIN_REVIEW: Inbox,
    PUBLISHED: CheckCircle2,
    REJECTED: XCircle,
    SCHEDULED: CalendarClock,
    CHANGES_REQUESTED: FileText,
  };

  const Icon =
    iconMap[status] ||
    Inbox;

  const title =
    titleMap[status] ||
    "Editorial Review Queue";

  const sorted =
    useMemo(
      () =>
        [...stories].sort(
          (a, b) =>
            getTimestamp(
              b.updatedAt
            ) -
            getTimestamp(
              a.updatedAt
            )
        ),
      [stories]
    );

  if (loading) {
    return (
      <div className="editor-page">
        <div className="editor-panel">
          Loading stories...
        </div>
      </div>
    );
  }

  return (
    <div className="editor-page">

      <header className="editor-header">

        <div>
          <p className="eyebrow">
            Content workflow
          </p>

          <h1>{title}</h1>

          <p>
            Inspect stories and open
            an item for editorial action.
          </p>
        </div>

      </header>

      {error && (
        <div className="editor-error">
          {error}
        </div>
      )}

      <section className="editor-panel">

        {!sorted.length ? (
          <div className="editor-empty">

            <Icon size={32} />

            <h3>
              No stories found
            </h3>

            <p>
              There are currently no
              stories in this workflow.
            </p>

          </div>
        ) : (
          <div className="editor-table">

            {sorted.map(
              (story) => (
                <div
                  className="editor-row"
                  key={story.id}
                >

                  <div className="editor-story-main">

                    {(
                      story.image ||
                      story.featuredImage
                    ) && (
                      <img
                        src={
                          story.image ||
                          story.featuredImage
                        }
                        alt=""
                      />
                    )}

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
                    Open
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