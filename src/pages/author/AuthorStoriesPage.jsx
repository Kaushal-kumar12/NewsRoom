import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Send,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  deleteAuthorStory,
  getAuthorStories,
} from "../../services/news/newsServices";

export default function AuthorStoriesPage({
  filter,
}) {
  const {
    firebaseUser,
  } = useAuth();

  const [
    searchParams,
  ] = useSearchParams();

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

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  const queryFilter =
    searchParams.get(
      "status"
    );

  const activeFilter =
    filter ||
    queryFilter ||
    "";

  async function load() {
    if (!firebaseUser?.uid) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result =
        await getAuthorStories(
          firebaseUser.uid
        );

      setStories(
        Array.isArray(result)
          ? result
          : []
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load stories."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [firebaseUser]);

  const visible =
    useMemo(() => {
      if (!activeFilter) {
        return stories;
      }

      return stories.filter(
        (story) =>
          story.status ===
          activeFilter
      );
    }, [
      stories,
      activeFilter,
    ]);

  const title =
    activeFilter === "DRAFT"
      ? "Drafts"
      : activeFilter === "SUBMITTED"
        ? "Submitted Stories"
        : activeFilter ===
            "PUBLISHED"
          ? "Published Stories"
          : activeFilter ===
              "REJECTED"
            ? "Rejected Stories"
            : "My Stories";

  async function remove(id) {
    if (
      !window.confirm(
        "Delete this draft? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await deleteAuthorStory(
        id,
        firebaseUser
      );

      setStories(
        (items) =>
          items.filter(
            (item) =>
              item.id !== id
          )
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to delete story."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="author-page">
        <div className="author-panel">
          Loading stories...
        </div>
      </div>
    );
  }

  return (
    <div className="author-page">

      <header className="author-header">

        <div>
          <p className="eyebrow">
            Content management
          </p>

          <h1>{title}</h1>

          <p>
            Manage stories written
            and submitted from your
            author account.
          </p>
        </div>

        <Link
          className="author-primary"
          to="/author/create"
        >
          <Plus size={17} />
          New story
        </Link>

      </header>

      {error && (
        <div className="author-error">
          {error}
        </div>
      )}

      <section className="author-panel">

        <div className="author-story-filters">

          <FilterLink
            to="/author/stories"
            active={!activeFilter}
            label="All"
          />

          <FilterLink
            to="/author/stories?status=DRAFT"
            active={
              activeFilter === "DRAFT"
            }
            label="Drafts"
          />

          <FilterLink
            to="/author/stories?status=SUBMITTED"
            active={
              activeFilter ===
              "SUBMITTED"
            }
            label="Submitted"
          />

          <FilterLink
            to="/author/stories?status=PUBLISHED"
            active={
              activeFilter ===
              "PUBLISHED"
            }
            label="Published"
          />

          <FilterLink
            to="/author/stories?status=REJECTED"
            active={
              activeFilter ===
              "REJECTED"
            }
            label="Rejected"
          />

        </div>

        {!visible.length ? (
          <div className="author-empty">
            <FileText size={34} />

            <h3>
              No stories found
            </h3>

            <p>
              {activeFilter
                ? `There are no ${activeFilter.toLowerCase()} stories.`
                : "Create your first story to get started."}
            </p>

            <Link to="/author/create">
              Create story
            </Link>
          </div>
        ) : (
          <div className="author-story-table">

            {visible.map(
              (story) => (
                <div
                  className="author-story-row"
                  key={story.id}
                >

                  <div className="author-story-main">

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
                        {story.category ||
                          "Uncategorized"}

                        {" · "}

                        {story.subcategory ||
                          "General"}
                      </span>
                    </div>

                  </div>

                  <StatusBadge
                    status={
                      story.status
                    }
                  />

                  <div className="author-row-actions">

                    <Link
                      to={`/author/edit/${story.id}`}
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </Link>

                    {story.status ===
                      "DRAFT" && (
                      <button
                        onClick={() =>
                          remove(
                            story.id
                          )
                        }
                        disabled={
                          deletingId ===
                          story.id
                        }
                        title="Delete"
                      >
                        <Trash2
                          size={16}
                        />
                      </button>
                    )}

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </section>
    </div>
  );
}

function FilterLink({
  to,
  label,
  active,
}) {
  return (
    <Link
      to={to}
      className={`author-filter ${
        active
          ? "active"
          : ""
      }`}
    >
      {label}
    </Link>
  );
}

function StatusBadge({
  status,
}) {
  const value =
    status || "DRAFT";

  const map = {
    DRAFT: [
      Clock3,
      "Draft",
    ],

    SUBMITTED: [
      Send,
      "Submitted",
    ],

    PENDING_ADMIN_REVIEW: [
      Send,
      "Admin review",
    ],

    PENDING_SUPERADMIN_REVIEW: [
      Send,
      "Final review",
    ],

    PUBLISHED: [
      CheckCircle2,
      "Published",
    ],

    REJECTED: [
      XCircle,
      "Rejected",
    ],

    CHANGES_REQUESTED: [
      AlertCircle,
      "Changes requested",
    ],

    REVISION_REQUIRED: [
      AlertCircle,
      "Revision required",
    ],
  };

  const [
    Icon,
    label,
  ] =
    map[value] || [
      Clock3,
      value,
    ];

  return (
    <span
      className={`status-pill status-${String(
        value
      ).toLowerCase()}`}
    >
      <Icon size={13} />
      {label}
    </span>
  );
}