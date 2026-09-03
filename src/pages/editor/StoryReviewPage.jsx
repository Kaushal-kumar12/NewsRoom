// src/pages/editor/StoryReviewPage.jsx

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MessageSquare,
  CalendarClock,
} from "lucide-react";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  getEditorialStories,
  publishStory,
  rejectStory,
  requestStoryChanges,
  scheduleStory,
} from "../../services/editorial/editorialService";


export default function StoryReviewPage() {

  const {
    storyId,
  } = useParams();

  const navigate =
    useNavigate();

  const {
    firebaseUser,
  } = useAuth();


  const [story, setStory] =
    useState(null);

  const [feedback, setFeedback] =
    useState("");

  const [scheduleDate, setScheduleDate] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  /*
  |--------------------------------------------------------------------------
  | LOAD STORY
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    let mounted = true;


    async function load() {

      try {

        setLoading(true);
        setError("");

        const items =
          await getEditorialStories();

        const found =
          items.find(
            (item) =>
              item.id === storyId
          );


        if (!mounted) {
          return;
        }


        if (!found) {

          setError(
            "Story not found."
          );

          setStory(null);

          return;
        }


        setStory(found);

      } catch (err) {

        if (mounted) {

          setError(
            err?.message ||
            "Unable to load story."
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

  }, [storyId]);


  /*
  |--------------------------------------------------------------------------
  | ACTION
  |--------------------------------------------------------------------------
  */

  const action =
    async (
      fn,
      successMessage
    ) => {

      setSaving(true);
      setError("");
      setMessage("");


      try {

        await fn();


        setMessage(
          successMessage
        );


        const items =
          await getEditorialStories();


        const updated =
          items.find(
            (item) =>
              item.id === storyId
          );


        if (updated) {
          setStory(updated);
        }

      } catch (err) {

        setError(
          err?.message ||
          "Editorial action failed."
        );

      } finally {

        setSaving(false);
      }
    };


  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {

    return (
      <div className="editor-page">

        <div className="editor-panel">
          Loading story...
        </div>

      </div>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | NOT FOUND
  |--------------------------------------------------------------------------
  */

  if (!story) {

    return (
      <div className="editor-page">

        <div className="editor-error">

          {error ||
            "Story not found."}

        </div>

      </div>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="editor-page">

      <header className="editor-header">

        <div>

          <button
            className="editor-back"
            onClick={() =>
              navigate(
                "/editor/review"
              )
            }
          >

            <ArrowLeft size={16} />

            Back to review queue

          </button>


          <p className="eyebrow">
            Editorial review
          </p>


          <h1>
            {story.title ||
              "Untitled story"}
          </h1>


          <p>
            By{" "}
            {story.authorName ||
              "Unknown author"}

            {" · "}

            {story.category ||
              "Uncategorized"}
          </p>

        </div>


        <span
          className={
            `editor-status editor-status-${String(
              story.status ||
              ""
            ).toLowerCase()}`
          }
        >
          {story.status}
        </span>

      </header>


      {message && (
        <div className="editor-success">
          {message}
        </div>
      )}


      {error && (
        <div className="editor-error">
          {error}
        </div>
      )}


      <div className="editor-review-grid">

        <article className="editor-panel editor-article-preview">

          {story.image && (
            <img
              className="editor-featured-image"
              src={story.image}
              alt={
                story.title ||
                "Story"
              }
            />
          )}


          {story.excerpt && (
            <p className="editor-excerpt">
              {story.excerpt}
            </p>
          )}


          <div className="editor-article-content">

            {(story.content || "")
              .split(/\n+/)
              .filter(Boolean)
              .map(
                (
                  paragraph,
                  index
                ) => (
                  <p
                    key={index}
                  >
                    {paragraph}
                  </p>
                )
              )}

          </div>

        </article>


        <aside className="editor-panel editor-actions-panel">

          <h2>
            Editorial Actions
          </h2>


          <p>
            Choose the next workflow
            state for this story.
          </p>


          <button
            className="editor-action editor-action-publish"
            disabled={saving}
            onClick={() =>
              action(
                () =>
                  publishStory(
                    story.id,
                    firebaseUser
                  ),
                "Story published successfully."
              )
            }
          >

            <CheckCircle2 size={17} />

            Publish now

          </button>


          <label className="editor-field">

            Schedule publication

            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(event) =>
                setScheduleDate(
                  event.target.value
                )
              }
            />

          </label>


          <button
            className="editor-action"
            disabled={
              saving ||
              !scheduleDate
            }
            onClick={() =>
              action(
                () =>
                  scheduleStory(
                    story.id,
                    firebaseUser,
                    scheduleDate
                  ),
                "Story scheduled successfully."
              )
            }
          >

            <CalendarClock size={17} />

            Schedule

          </button>


          <label className="editor-field">

            Editorial feedback

            <textarea
              rows="5"
              value={feedback}
              placeholder="Add feedback for the author..."
              onChange={(event) =>
                setFeedback(
                  event.target.value
                )
              }
            />

          </label>


          <button
            className="editor-action"
            disabled={saving}
            onClick={() =>
              action(
                () =>
                  requestStoryChanges(
                    story.id,
                    firebaseUser,
                    feedback
                  ),
                "Changes requested from the author."
              )
            }
          >

            <MessageSquare size={17} />

            Request changes

          </button>


          <button
            className="editor-action editor-action-reject"
            disabled={saving}
            onClick={() =>
              action(
                () =>
                  rejectStory(
                    story.id,
                    firebaseUser,
                    feedback
                  ),
                "Story rejected."
              )
            }
          >

            <XCircle size={17} />

            Reject story

          </button>

        </aside>

      </div>

    </div>
  );
}