// SuperAdminNewsEditorPage.jsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Eye,
  Save,
  Send,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Video,
  Youtube,
  Quote,
  Link as LinkIcon,
  Minus,
  Heading,
  Type,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  createNewsDraft,
  updateNewsDraft,
  getNewsById,
  submitNewsForReview,
  publishNewsDirect,
} from "../../services/editorial/newsWorkflowService";

import { useAuth } from "../../context/AuthContext";
import { uploadNewsMedia } from "../../services/editorial/newsMediaService";


/* =========================================================
   BLOCK FACTORY
   ========================================================= */

const createBlock = (type) => {
  switch (type) {
    case "heading":
      return {
        type: "heading",
        text: "",
      };

    case "image":
      return {
        type: "image",
        url: "",
        caption: "",
        alt: "",
      };

    case "youtube":
      return {
        type: "youtube",
        url: "",
        caption: "",
      };

    case "short-video":
      return {
        type: "short-video",
        url: "",
        caption: "",
      };

    case "quote":
      return {
        type: "quote",
        text: "",
        author: "",
      };

    case "link":
      return {
        type: "link",
        text: "",
        url: "",
      };

    case "divider":
      return {
        type: "divider",
      };

    default:
      return {
        type: "paragraph",
        text: "",
      };
  }
};


/* =========================================================
   NORMALIZE ARTICLE
   ========================================================= */

function normalizeArticle(article) {
  return {
    title: article?.title || "",
    subtitle: article?.subtitle || "",
    category: article?.category || "General",

    tags: Array.isArray(article?.tags)
      ? article.tags
      : [],

    featuredImage:
      article?.featuredImage ||
      article?.featuredImageUrl ||
      "",

    blocks:
      Array.isArray(article?.blocks) &&
      article.blocks.length
        ? article.blocks
        : [
            {
              type: "paragraph",
              text: "",
            },
          ],
  };
}


/* =========================================================
   MAIN
   ========================================================= */

export default function SuperAdminNewsEditorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  /*
   * IMPORTANT:
   *
   * Support BOTH:
   *
   * /news/:newsId/edit
   *
   * and
   *
   * /news/edit?id=...
   */
  const { newsId: routeNewsId } = useParams();

  const searchParams = new URLSearchParams(
    window.location.search
  );

  const queryNewsId = searchParams.get("id");

  const editId =
    routeNewsId ||
    queryNewsId ||
    null;

  const [newsId, setNewsId] =
    useState(editId);

  const [loading, setLoading] =
    useState(Boolean(editId));

  const [saving, setSaving] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [publishing, setPublishing] =
    useState(false);

  const [showPreview, setShowPreview] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [tagInput, setTagInput] =
    useState("");

  // Tracks Firebase Storage uploads by block index.
  const [uploadingMedia, setUploadingMedia] =
    useState({});

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    category: "General",
    tags: [],
    featuredImage: "",
    blocks: [
      {
        type: "paragraph",
        text: "",
      },
    ],
  });


  /* =======================================================
     LOAD EXISTING ARTICLE
     ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadArticle() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      if (!editId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const existing =
          await getNewsById(editId);

        if (!existing) {
          throw new Error(
            "News article was not found."
          );
        }

        if (!mounted) return;

        setForm(
          normalizeArticle(existing)
        );

        setNewsId(editId);
      } catch (err) {
        console.error(
          "Unable to load article:",
          err
        );

        if (mounted) {
          setError(
            err?.message ||
              "Unable to load the article."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadArticle();

    return () => {
      mounted = false;
    };
  }, [editId, user?.uid]);


  /* =======================================================
     FIELD UPDATE
     ======================================================= */

  const updateField = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
    setMessage("");
  };


  /* =======================================================
     BLOCK UPDATE
     ======================================================= */

  const updateBlock = (
    index,
    field,
    value
  ) => {
    setForm((previous) => {
      const blocks = [
        ...previous.blocks,
      ];

      blocks[index] = {
        ...blocks[index],
        [field]: value,
      };

      return {
        ...previous,
        blocks,
      };
    });

    setError("");
    setMessage("");
  };


  /* =======================================================
     LOCAL MEDIA UPLOAD
     ======================================================= */

  const onMediaUpload = async (index, file, mediaType) => {
    if (!file) return;

    const isImage = mediaType === "image";
    const maxSize = isImage
      ? 10 * 1024 * 1024
      : 100 * 1024 * 1024;

    const allowedTypes = isImage
      ? ["image/jpeg", "image/png", "image/webp"]
      : ["video/mp4", "video/webm"];

    if (!allowedTypes.includes(file.type)) {
      setError(
        isImage
          ? "Unsupported image format. Please use JPG, PNG or WebP."
          : "Unsupported video format. Please use MP4 or WebM."
      );
      return;
    }

    if (file.size > maxSize) {
      setError(
        isImage
          ? "Image is too large. Maximum size is 10 MB."
          : "Video is too large. Maximum size is 100 MB."
      );
      return;
    }

    if (!user?.uid) {
      setError("You must be signed in before uploading media.");
      return;
    }

    try {
      setError("");
      setMessage("");
      setUploadingMedia((previous) => ({
        ...previous,
        [index]: true,
      }));

      const uploaded = await uploadNewsMedia(
        file,
        user.uid,
        newsId || undefined
      );

      updateBlock(index, "url", uploaded.url);
      updateBlock(index, "mediaPath", uploaded.path);
      updateBlock(index, "mediaName", uploaded.name);
      updateBlock(index, "mediaType", uploaded.type);
      updateBlock(index, "mediaSize", uploaded.size);
      updateBlock(index, "uploadedBy", uploaded.uploadedBy);

      setMessage(
        `${isImage ? "Image" : "Video"} uploaded successfully.`
      );
    } catch (err) {
      console.error("News media upload failed:", err);
      setError(
        err?.message ||
          `Unable to upload the ${isImage ? "image" : "video"}.`
      );
    } finally {
      setUploadingMedia((previous) => ({
        ...previous,
        [index]: false,
      }));
    }
  };


  /* =======================================================
     ADD BLOCK
     ======================================================= */

  const addBlock = (type) => {
    setForm((previous) => ({
      ...previous,

      blocks: [
        ...previous.blocks,
        createBlock(type),
      ],
    }));

    setError("");
    setMessage("");
  };


  /* =======================================================
     REMOVE BLOCK
     ======================================================= */

  const removeBlock = (index) => {
    if (form.blocks.length === 1) {
      setError(
        "A news article must contain at least one content block."
      );

      return;
    }

    setForm((previous) => ({
      ...previous,

      blocks: previous.blocks.filter(
        (_, itemIndex) =>
          itemIndex !== index
      ),
    }));
  };


  /* =======================================================
     MOVE BLOCK
     ======================================================= */

  const moveBlock = (
    index,
    direction
  ) => {
    setForm((previous) => {
      const blocks = [
        ...previous.blocks,
      ];

      const targetIndex =
        direction === "up"
          ? index - 1
          : index + 1;

      if (
        targetIndex < 0 ||
        targetIndex >= blocks.length
      ) {
        return previous;
      }

      [
        blocks[index],
        blocks[targetIndex],
      ] = [
        blocks[targetIndex],
        blocks[index],
      ];

      return {
        ...previous,
        blocks,
      };
    });
  };


  /* =======================================================
     TAGS
     ======================================================= */

  const addTag = () => {
    const value =
      tagInput.trim();

    if (!value) return;

    const alreadyExists =
      form.tags.some(
        (tag) =>
          tag.toLowerCase() ===
          value.toLowerCase()
      );

    if (alreadyExists) {
      setTagInput("");
      return;
    }

    setForm((previous) => ({
      ...previous,

      tags: [
        ...previous.tags,
        value,
      ],
    }));

    setTagInput("");
  };


  const removeTag = (tag) => {
    setForm((previous) => ({
      ...previous,

      tags:
        previous.tags.filter(
          (item) => item !== tag
        ),
    }));
  };


  /* =======================================================
     VALIDATION
     ======================================================= */

  const validate = () => {
    if (!form.title.trim()) {
      return "Headline is required.";
    }

    const hasContent =
      form.blocks.some((block) => {
        if (
          block.type === "divider"
        ) {
          return true;
        }

        return Boolean(
          block.text?.trim() ||
          block.url?.trim()
        );
      });

    if (!hasContent) {
      return (
        "Please add content to the story."
      );
    }

    return null;
  };


  /* =======================================================
     PAYLOAD
     ======================================================= */

  const buildPayload = useMemo(
    () => ({
      title:
        form.title.trim(),

      subtitle:
        form.subtitle.trim(),

      summary: "",

      category:
        form.category,

      tags:
        form.tags,

      featuredImage:
        form.featuredImage.trim(),

      blocks:
        form.blocks,

      contentType:
        form.blocks.some(
          (block) =>
            block.type === "image" ||
            block.type === "youtube" ||
            block.type === "short-video"
        )
          ? "MULTIMEDIA"
          : "WRITTEN",
    }),
    [form]
  );


  /* =======================================================
     SAVE DRAFT
     ======================================================= */

  const requireAuthenticatedUser = () => {
    if (!user?.uid) {
      const error = new Error(
        "Your session is not ready. Please sign in again and retry."
      );
      setError(error.message);
      return false;
    }

    return true;
  };

  const saveDraft = async () => {
    setError("");
    setMessage("");

    if (!requireAuthenticatedUser()) return;

    const validationError =
      validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      let currentId =
        newsId;

      if (currentId) {
        await updateNewsDraft(
          currentId,
          buildPayload,
          user
        );
      } else {
        currentId =
          await createNewsDraft(
            buildPayload,
            user
          );

        if (currentId) {
          setNewsId(currentId);
        }
      }

      setMessage(
        "Draft saved successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to save the draft."
      );
    } finally {
      setSaving(false);
    }
  };


  /* =======================================================
     OPEN PREVIEW PAGE
     ======================================================= */

  const openPreviewPage = async () => {
    setError("");
    setMessage("");

    if (!requireAuthenticatedUser()) return;

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      let currentId = newsId;

      // Preview reads from Firestore, so make sure the latest editor
      // state is saved before navigating to the preview page.
      if (currentId) {
        await updateNewsDraft(currentId, buildPayload, user);
      } else {
        currentId = await createNewsDraft(buildPayload, user);
        if (currentId) {
          setNewsId(currentId);
        }
      }

      if (!currentId) {
        throw new Error("Unable to create the draft for preview.");
      }

      navigate(
        `/super-admin/editorial/news/${currentId}/preview`
      );
    } catch (err) {
      console.error("Unable to open preview:", err);
      setError(
        err?.message ||
          "Unable to open the article preview."
      );
    } finally {
      setSaving(false);
    }
  };


  /* =======================================================
     SUBMIT
     ======================================================= */

  const submitForReview =
    async () => {
      setError("");
      setMessage("");

      if (!requireAuthenticatedUser()) return;

      const validationError =
        validate();

      if (validationError) {
        setError(validationError);
        return;
      }

      try {
        setSubmitting(true);

        let currentId =
          newsId;

        if (!currentId) {
          currentId =
            await createNewsDraft(
              buildPayload,
              user
            );

          setNewsId(currentId);
        } else {
          await updateNewsDraft(
            currentId,
            buildPayload,
            user
          );
        }

        if (!currentId) {
          throw new Error(
            "Unable to determine the news article ID."
          );
        }

        await submitNewsForReview(
          currentId,
          user
        );

        setMessage(
          "News submitted successfully for editorial review."
        );
      } catch (err) {
        console.error(err);

        setError(
          err?.message ||
            "Unable to submit the article."
        );
      } finally {
        setSubmitting(false);
      }
    };


  /* =======================================================
     PUBLISH NOW (SUPER ADMIN ONLY)
     ======================================================= */

  const publishNow = async () => {
    setError("");
    setMessage("");

    if (!requireAuthenticatedUser()) return;

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setPublishing(true);

      let currentId = newsId;

      // Always save the latest editor state before publishing.
      if (currentId) {
        await updateNewsDraft(
          currentId,
          buildPayload,
          user
        );
      } else {
        currentId = await createNewsDraft(
          buildPayload,
          user
        );

        if (currentId) {
          setNewsId(currentId);
        }
      }

      if (!currentId) {
        throw new Error(
          "Unable to determine the news article ID."
        );
      }

      // Super Admin can bypass the editorial review workflow
      // and publish directly.
      await publishNewsDirect(
        currentId,
        user
      );

      setMessage(
        "News published successfully."
      );

      navigate(
        "/super-admin/editorial"
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to publish the article."
      );
    } finally {
      setPublishing(false);
    }
  };


  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <div className="editorial-loading-page">
        <Loader2
          size={32}
          className="editorial-spin"
        />

        <h2>
          Loading newsroom studio
        </h2>

        <p>
          Loading saved publication...
        </p>
      </div>
    );
  }


  /* =======================================================
     EDITOR
     ======================================================= */

  return (
    <div className="editorial-page editorial-studio-page">

      {/* TOP BAR */}
      <div className="editorial-studio-topbar">

        <Link
          to="/super-admin/editorial"
          className="editorial-back-link"
        >
          <ArrowLeft size={17} />
          Back to Editorial
        </Link>

        <div className="editorial-topbar-actions">

          <button
            type="button"
            className="editorial-btn ghost"
            onClick={() =>
              navigate(
                "/super-admin/editorial"
              )
            }
          >
            Cancel
          </button>

          <button
            type="button"
            className="editorial-btn secondary"
            onClick={openPreviewPage}
          >
            <Eye size={16} />
            Preview
          </button>

          <button
            type="button"
            className="editorial-btn secondary"
            onClick={saveDraft}
            disabled={
              saving ||
              submitting ||
              publishing
            }
          >
            {saving ? (
              <Loader2
                size={16}
                className="editorial-spin"
              />
            ) : (
              <Save size={16} />
            )}

            {saving
              ? "Saving..."
              : "Save Draft"}
          </button>

          <button
            type="button"
            className="editorial-btn primary"
            onClick={publishNow}
            disabled={
              saving ||
              submitting ||
              publishing
            }
            title="Publish immediately without sending for review"
          >
            {publishing ? (
              <Loader2
                size={16}
                className="editorial-spin"
              />
            ) : (
              <CheckCircle2 size={16} />
            )}

            {publishing
              ? "Publishing..."
              : "Publish Now"}
          </button>

          <button
            type="button"
            className="editorial-btn primary"
            onClick={
              submitForReview
            }
            disabled={
              saving ||
              submitting ||
              publishing
            }
          >
            {submitting ? (
              <Loader2
                size={16}
                className="editorial-spin"
              />
            ) : (
              <Send size={16} />
            )}

            {submitting
              ? "Submitting..."
              : "Submit for Review"}
          </button>

        </div>
      </div>


      {/* PAGE HEADER */}
      <div className="editorial-studio-heading">

        <span className="editorial-kicker">
          NEWSROOM STUDIO
        </span>

        <h1>
          {newsId
            ? "Edit News"
            : "Create News"}
        </h1>

        <p>
          Create, edit, preview and submit
          your NewsRoom publication.
        </p>

      </div>


      {/* ALERTS */}
      {error && (
        <div className="editorial-alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="editorial-alert success">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}


      {/* MAIN LAYOUT */}
      <div className="editorial-studio-layout">

        <main className="editorial-editor-column">

          {/* STORY INFORMATION */}
          <section className="editorial-card">

            <div className="editorial-card-header">

              <div>
                <span className="editorial-section-label">
                  STORY INFORMATION
                </span>

                <h2>
                  Publication details
                </h2>

                <p>
                  Basic information readers
                  will see.
                </p>
              </div>

            </div>


            <div className="editorial-form-grid">

              {/* TITLE */}
              <label className="editorial-field full">
                <span>
                  Headline *
                </span>

                <input
                  value={form.title}
                  onChange={(event) =>
                    updateField(
                      "title",
                      event.target.value
                    )
                  }
                  placeholder="Write a clear, accurate headline..."
                />
              </label>


              {/* SUBTITLE */}
              <label className="editorial-field">
                <span>
                  Subheadline
                </span>

                <input
                  value={
                    form.subtitle
                  }
                  onChange={(event) =>
                    updateField(
                      "subtitle",
                      event.target.value
                    )
                  }
                  placeholder="Optional supporting headline"
                />
              </label>


              {/* CATEGORY */}
              <label className="editorial-field">
                <span>
                  Category
                </span>

                <select
                  value={
                    form.category
                  }
                  onChange={(event) =>
                    updateField(
                      "category",
                      event.target.value
                    )
                  }
                >
                  <option>
                    General
                  </option>

                  <option>
                    Breaking News
                  </option>

                  <option>
                    Politics
                  </option>

                  <option>
                    Technology
                  </option>

                  <option>
                    Business
                  </option>

                  <option>
                    Sports
                  </option>

                  <option>
                    Entertainment
                  </option>

                  <option>
                    World
                  </option>

                  <option>
                    India
                  </option>

                  <option>
                    Local
                  </option>

                  <option>
                    Opinion
                  </option>
                </select>
              </label>


              {/* FEATURED IMAGE */}
              <label className="editorial-field full">
                <span>
                  Featured image URL
                </span>

                <input
                  type="url"
                  value={
                    form.featuredImage
                  }
                  onChange={(event) =>
                    updateField(
                      "featuredImage",
                      event.target.value
                    )
                  }
                  placeholder="https://..."
                />
              </label>


              {/* TAGS */}
              <div className="editorial-field full">

                <span>
                  Tags
                </span>

                <div className="editorial-tag-input">

                  <input
                    value={tagInput}
                    onChange={(event) =>
                      setTagInput(
                        event.target.value
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        event.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Type a tag and press Enter"
                  />

                  <button
                    type="button"
                    onClick={addTag}
                  >
                    Add
                  </button>

                </div>

                {form.tags.length >
                  0 && (
                  <div className="editorial-tags">

                    {form.tags.map(
                      (tag) => (
                        <button
                          type="button"
                          key={tag}
                          onClick={() =>
                            removeTag(
                              tag
                            )
                          }
                        >
                          {tag}
                          <X
                            size={13}
                          />
                        </button>
                      )
                    )}

                  </div>
                )}

              </div>

            </div>

          </section>


          {/* STORY BODY */}
          <section className="editorial-card">

            <div className="editorial-card-header">

              <div>
                <span className="editorial-section-label">
                  STORY BODY
                </span>

                <h2>
                  Compose the article
                </h2>

                <p>
                  Build the story block
                  by block.
                </p>
              </div>

              <div className="editorial-block-count">
                {form.blocks.length}{" "}
                {form.blocks.length === 1
                  ? "block"
                  : "blocks"}
              </div>

            </div>


            <div className="editorial-block-list">

              {form.blocks.map(
                (block, index) => (
                  <div
                    key={index}
                    className={`editorial-content-block type-${block.type}`}
                  >

                    <div className="editorial-block-toolbar">

                      <div className="editorial-block-title">

                        <span className="editorial-drag">
                          ⋮⋮
                        </span>

                        {block.type ===
                          "paragraph" && (
                          <Type
                            size={16}
                          />
                        )}

                        {block.type ===
                          "heading" && (
                          <Heading
                            size={16}
                          />
                        )}

                        {block.type ===
                          "image" && (
                          <ImageIcon
                            size={16}
                          />
                        )}

                        {(block.type ===
                          "youtube" ||
                          block.type ===
                            "short-video") && (
                          <Video
                            size={16}
                          />
                        )}

                        {block.type ===
                          "quote" && (
                          <Quote
                            size={16}
                          />
                        )}

                        {block.type ===
                          "link" && (
                          <LinkIcon
                            size={16}
                          />
                        )}

                        {block.type ===
                          "divider" && (
                          <Minus
                            size={16}
                          />
                        )}

                        <strong>
                          {formatBlockName(
                            block.type
                          )}
                        </strong>

                      </div>


                      <div className="editorial-block-actions">

                        <button
                          type="button"
                          onClick={() =>
                            moveBlock(
                              index,
                              "up"
                            )
                          }
                          disabled={
                            index === 0
                          }
                          title="Move up"
                        >
                          <ChevronUp
                            size={15}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            moveBlock(
                              index,
                              "down"
                            )
                          }
                          disabled={
                            index ===
                            form.blocks
                              .length -
                              1
                          }
                          title="Move down"
                        >
                          <ChevronDown
                            size={15}
                          />
                        </button>

                        <button
                          type="button"
                          className="danger"
                          onClick={() =>
                            removeBlock(
                              index
                            )
                          }
                          title="Delete block"
                        >
                          <Trash2
                            size={15}
                          />
                        </button>

                      </div>

                    </div>


                    <div className="editorial-block-body">

                      {block.type ===
                        "paragraph" && (
                        <textarea
                          rows={6}
                          value={
                            block.text ||
                            ""
                          }
                          onChange={(event) =>
                            updateBlock(
                              index,
                              "text",
                              event.target.value
                            )
                          }
                          placeholder="Write the paragraph..."
                        />
                      )}


                      {block.type ===
                        "heading" && (
                        <input
                          value={
                            block.text ||
                            ""
                          }
                          onChange={(event) =>
                            updateBlock(
                              index,
                              "text",
                              event.target.value
                            )
                          }
                          placeholder="Section heading..."
                        />
                      )}


                      {block.type ===
                        "image" && (
                        <div className="editorial-media-fields">

                          <div className="editorial-media-preview">

                            {block.url ? (
                              <img
                                src={
                                  block.url
                                }
                                alt={
                                  block.alt ||
                                  "Article media"
                                }
                              />
                            ) : (
                              <div>
                                <ImageIcon
                                  size={30}
                                />
                                <span>
                                  Image preview
                                </span>
                              </div>
                            )}

                          </div>

                          <input
                            type="url"
                            value={
                              block.url ||
                              ""
                            }
                            onChange={(event) =>
                              updateBlock(
                                index,
                                "url",
                                event.target.value
                              )
                            }
                            placeholder="Image URL"
                          />

                          <div className="editorial-upload-row">
                            <label className="editorial-upload-button">
                              <ImageIcon size={15} />
                              {uploadingMedia[index] ? "Uploading..." : "Upload Image"}
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                hidden
                                disabled={uploadingMedia[index]}
                                onChange={(event) => {
                                  const file = event.target.files?.[0];
                                  if (file) {
                                    onMediaUpload(index, file, "image");
                                  }
                                  event.target.value = "";
                                }}
                              />
                            </label>
                            <span>JPG, PNG, WebP • Max 10 MB</span>
                          </div>

                          {block.mediaName && (
                            <div className="editorial-uploaded-file">
                              <CheckCircle2 size={15} />
                              <span>{block.mediaName}</span>
                            </div>
                          )}

                          <input
                            value={
                              block.alt ||
                              ""
                            }
                            onChange={(event) =>
                              updateBlock(
                                index,
                                "alt",
                                event.target.value
                              )
                            }
                            placeholder="Image alt text"
                          />

                          <input
                            value={
                              block.caption ||
                              ""
                            }
                            onChange={(event) =>
                              updateBlock(
                                index,
                                "caption",
                                event.target.value
                              )
                            }
                            placeholder="Image caption"
                          />

                        </div>
                      )}


                      {block.type ===
                        "youtube" && (
                        <div className="editorial-media-fields">

                          <div className="editorial-video-icon youtube">
                            <Youtube
                              size={28}
                            />
                            <span>
                              YouTube video
                            </span>
                          </div>

                          <input
                            type="url"
                            value={
                              block.url ||
                              ""
                            }
                            onChange={(event) =>
                              updateBlock(
                                index,
                                "url",
                                event.target.value
                              )
                            }
                            placeholder="Paste YouTube video URL"
                          />

                          <input
                            value={
                              block.caption ||
                              ""
                            }
                            onChange={(event) =>
                              updateBlock(
                                index,
                                "caption",
                                event.target.value
                              )
                            }
                            placeholder="Video caption"
                          />

                        </div>
                      )}


                      {block.type ===
                        "short-video" && (
                        <div className="editorial-media-fields">

                          <div className="editorial-video-icon">
                            <Video
                              size={28}
                            />
                            <span>
                              Short video
                            </span>
                          </div>

                          <input
                            type="url"
                            value={
                              block.url ||
                              ""
                            }
                            onChange={(event) =>
                              updateBlock(
                                index,
                                "url",
                                event.target.value
                              )
                            }
                            placeholder="Video URL"
                          />

                          <div className="editorial-upload-row">
                            <label className="editorial-upload-button">
                              <Video size={15} />
                              {uploadingMedia[index] ? "Uploading..." : "Upload Video"}
                              <input
                                type="file"
                                accept="video/mp4,video/webm"
                                hidden
                                disabled={uploadingMedia[index]}
                                onChange={(event) => {
                                  const file = event.target.files?.[0];
                                  if (file) {
                                    onMediaUpload(index, file, "video");
                                  }
                                  event.target.value = "";
                                }}
                              />
                            </label>
                            <span>MP4, WebM • Max 100 MB</span>
                          </div>

                          {block.mediaName && (
                            <div className="editorial-uploaded-file">
                              <CheckCircle2 size={15} />
                              <span>{block.mediaName}</span>
                            </div>
                          )}

                          <input
                            value={
                              block.caption ||
                              ""
                            }
                            onChange={(event) =>
                              updateBlock(
                                index,
                                "caption",
                                event.target.value
                              )
                            }
                            placeholder="Video caption"
                          />

                        </div>
                      )}


                      {block.type ===
                        "quote" && (
                        <div className="editorial-media-fields">

                          <textarea
                            rows={4}
                            value={
                              block.text ||
                              ""
                            }
                            onChange={(event) =>
                              updateBlock(
                                index,
                                "text",
                                event.target.value
                              )
                            }
                            placeholder="Enter quotation..."
                          />

                          <input
                            value={
                              block.author ||
                              ""
                            }
                            onChange={(event) =>
                              updateBlock(
                                index,
                                "author",
                                event.target.value
                              )
                            }
                            placeholder="Quote attribution"
                          />

                        </div>
                      )}


                      {block.type ===
                        "link" && (
                        <div className="editorial-two-column">

                          <input
                            value={
                              block.text ||
                              ""
                            }
                            onChange={(event) =>
                              updateBlock(
                                index,
                                "text",
                                event.target.value
                              )
                            }
                            placeholder="Link text"
                          />

                          <input
                            type="url"
                            value={
                              block.url ||
                              ""
                            }
                            onChange={(event) =>
                              updateBlock(
                                index,
                                "url",
                                event.target.value
                              )
                            }
                            placeholder="https://..."
                          />

                        </div>
                      )}


                      {block.type ===
                        "divider" && (
                        <div className="editorial-divider-preview">
                          <span />
                        </div>
                      )}

                    </div>
                  </div>
                )
              )}

            </div>


            {/* ADD BLOCK */}
            <div className="editorial-add-block">

              <div className="editorial-add-title">
                <Plus size={17} />
                <strong>
                  Add content block
                </strong>
              </div>

              <div className="editorial-block-buttons">

                <BlockButton
                  icon={<Type size={15} />}
                  label="Paragraph"
                  onClick={() =>
                    addBlock(
                      "paragraph"
                    )
                  }
                />

                <BlockButton
                  icon={
                    <Heading size={15} />
                  }
                  label="Heading"
                  onClick={() =>
                    addBlock(
                      "heading"
                    )
                  }
                />

                <BlockButton
                  icon={
                    <ImageIcon size={15} />
                  }
                  label="Image"
                  onClick={() =>
                    addBlock(
                      "image"
                    )
                  }
                />

                <BlockButton
                  icon={
                    <Youtube size={15} />
                  }
                  label="YouTube"
                  onClick={() =>
                    addBlock(
                      "youtube"
                    )
                  }
                />

                <BlockButton
                  icon={
                    <Video size={15} />
                  }
                  label="Short Video"
                  onClick={() =>
                    addBlock(
                      "short-video"
                    )
                  }
                />

                <BlockButton
                  icon={
                    <Quote size={15} />
                  }
                  label="Quote"
                  onClick={() =>
                    addBlock(
                      "quote"
                    )
                  }
                />

                <BlockButton
                  icon={
                    <LinkIcon size={15} />
                  }
                  label="Link"
                  onClick={() =>
                    addBlock(
                      "link"
                    )
                  }
                />

                <BlockButton
                  icon={
                    <Minus size={15} />
                  }
                  label="Divider"
                  onClick={() =>
                    addBlock(
                      "divider"
                    )
                  }
                />

              </div>

            </div>

          </section>

        </main>


        {/* SIDEBAR */}
        <aside className="editorial-editor-sidebar">

          <div className="editorial-side-card">

            <span className="editorial-section-label">
              PUBLICATION
            </span>

            <h3>
              Workflow
            </h3>

            <Workflow />

          </div>


          <div className="editorial-side-card">

            <span className="editorial-section-label">
              STORY CHECK
            </span>

            <h3>
              Before submission
            </h3>

            <ul className="editorial-check-list">

              <CheckItem
                complete={
                  Boolean(
                    form.title.trim()
                  )
                }
                text="Headline added"
              />
              <CheckItem
                complete={
                  form.blocks.some(
                    (block) =>
                      block.type ===
                        "divider" ||
                      block.text?.trim() ||
                      block.url?.trim()
                  )
                }
                text="Story content added"
              />

              <CheckItem
                complete={
                  form.tags.length > 0
                }
                text="Tags added"
              />

            </ul>

          </div>

        </aside>

      </div>


      {/* LOCAL PREVIEW */}

      {showPreview && (
        <EditorialPreviewModal
          form={form}
          onClose={() =>
            setShowPreview(false)
          }
        />
      )}

    </div>
  );
}


/* =========================================================
   COMPONENTS
   ========================================================= */

function BlockButton({
  icon,
  label,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}


function CheckItem({
  complete,
  text,
}) {
  return (
    <li
      className={
        complete
          ? "complete"
          : ""
      }
    >
      <span />
      {text}
    </li>
  );
}


function Workflow() {
  return (
    <div className="editorial-editor-workflow">

      <WorkflowStep
        number="1"
        title="Draft"
        text="Compose your story"
        active
      />

      <div className="workflow-line" />

      <WorkflowStep
        number="2"
        title="Editorial Review"
        text="Admin / Editor review"
      />

      <div className="workflow-line" />

      <WorkflowStep
        number="3"
        title="Approval"
        text="Super Admin when required"
      />

      <div className="workflow-line" />

      <WorkflowStep
        number="4"
        title="Published"
        text="Visible to readers"
      />

    </div>
  );
}


function WorkflowStep({
  number,
  title,
  text,
  active,
}) {
  return (
    <div
      className={`workflow-step ${
        active ? "active" : ""
      }`}
    >
      <span>{number}</span>

      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
    </div>
  );
}


/* =========================================================
   LOCAL PREVIEW
   ========================================================= */

function EditorialPreviewModal({
  form,
  onClose,
}) {
  return (
    <div
      className="editorial-preview-overlay"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div
        className="editorial-preview-modal"
        role="dialog"
        aria-modal="true"
      >

        <header className="editorial-preview-header">

          <div>
            <span>
              LIVE EDITORIAL PREVIEW
            </span>

            <strong>
              Reader View
            </strong>
          </div>

          <button
            type="button"
            className="editorial-preview-close"
            onClick={onClose}
          >
            <X size={19} />
          </button>

        </header>


        <div className="editorial-preview-scroll">

          <article className="editorial-reader-preview">

            <div className="editorial-preview-category">
              <span>
                {form.category ||
                  "General"}
              </span>

              <small>
                DRAFT PREVIEW
              </small>
            </div>


            <h1>
              {form.title ||
                "Untitled News Article"}
            </h1>


            {form.subtitle && (
              <h2>
                {form.subtitle}
              </h2>
            )}


            <div className="editorial-preview-meta">
              <span>
                NewsRoom Editorial
              </span>

              <span>•</span>

              <span>
                Preview
              </span>
            </div>


            {form.featuredImage && (
              <figure className="editorial-preview-featured">

                <img
                  src={
                    form.featuredImage
                  }
                  alt={
                    form.title ||
                    "Featured image"
                  }
                />

              </figure>
            )}


            {form.tags.length > 0 && (
              <div className="editorial-preview-tags">

                {form.tags.map(
                  (tag) => (
                    <span key={tag}>
                      #{tag}
                    </span>
                  )
                )}

              </div>
            )}


            <div className="editorial-preview-story">

              {form.blocks.map(
                (block, index) => (
                  <PreviewBlock
                    key={index}
                    block={block}
                  />
                )
              )}

            </div>

          </article>

        </div>


        <footer className="editorial-preview-footer">

          <span>
            This preview uses the current
            editor content. Unsaved changes
            are included.
          </span>

          <button
            type="button"
            className="editorial-btn primary"
            onClick={onClose}
          >
            <ArrowLeft size={16} />
            Return to Editor
          </button>

        </footer>

      </div>

    </div>
  );
}


/* =========================================================
   PREVIEW BLOCK
   ========================================================= */

function PreviewBlock({ block }) {
  if (!block) return null;

  if (
    block.type ===
    "paragraph"
  ) {
    if (!block.text?.trim()) {
      return null;
    }

    return (
      <p>
        {block.text}
      </p>
    );
  }


  if (
    block.type ===
    "heading"
  ) {
    if (!block.text?.trim()) {
      return null;
    }

    return (
      <h3>
        {block.text}
      </h3>
    );
  }


  if (
    block.type ===
    "image"
  ) {
    if (!block.url?.trim()) {
      return null;
    }

    return (
      <figure className="editorial-preview-media">

        <img
          src={block.url}
          alt={
            block.alt ||
            block.caption ||
            "Article image"
          }
        />

        {block.caption && (
          <figcaption>
            {block.caption}
          </figcaption>
        )}

      </figure>
    );
  }


  if (
    block.type ===
    "youtube"
  ) {
    if (!block.url?.trim()) {
      return null;
    }

    const embedUrl =
      getYoutubeEmbedUrl(
        block.url
      );

    return (
      <figure className="editorial-preview-video">

        {embedUrl ? (
          <div className="editorial-preview-video-frame">

            <iframe
              src={embedUrl}
              title={
                block.caption ||
                "YouTube video"
              }
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />

          </div>
        ) : (
          <div className="editorial-preview-video-invalid">

            <Youtube size={30} />

            <strong>
              YouTube video
            </strong>

            <span>
              Invalid YouTube URL.
            </span>

          </div>
        )}

        {block.caption && (
          <figcaption>
            {block.caption}
          </figcaption>
        )}

      </figure>
    );
  }


  if (
    block.type ===
    "short-video"
  ) {
    if (!block.url?.trim()) {
      return null;
    }

    return (
      <figure className="editorial-preview-video">

        <div className="editorial-preview-video-frame">

          <video
            src={block.url}
            controls
            preload="metadata"
          />

        </div>

        {block.caption && (
          <figcaption>
            {block.caption}
          </figcaption>
        )}

      </figure>
    );
  }


  if (
    block.type ===
    "quote"
  ) {
    if (!block.text?.trim()) {
      return null;
    }

    return (
      <blockquote>

        <p>
          {block.text}
        </p>

        {block.author && (
          <cite>
            — {block.author}
          </cite>
        )}

      </blockquote>
    );
  }


  if (
    block.type ===
    "link"
  ) {
    if (!block.url?.trim()) {
      return null;
    }

    return (
      <p className="editorial-preview-link-wrap">

        <a
          href={block.url}
          target="_blank"
          rel="noreferrer"
        >
          {block.text ||
            block.url}

          <LinkIcon size={15} />
        </a>

      </p>
    );
  }


  if (
    block.type ===
    "divider"
  ) {
    return <hr />;
  }

  return null;
}


/* =========================================================
   HELPERS
   ========================================================= */

function formatBlockName(type) {
  if (
    type === "short-video"
  ) {
    return "Short Video";
  }

  if (
    type === "youtube"
  ) {
    return "YouTube Video";
  }

  return (
    type.charAt(0).toUpperCase() +
    type.slice(1)
  );
}


function getYoutubeEmbedUrl(
  value
) {
  try {
    const url =
      new URL(value);

    const hostname =
      url.hostname
        .replace(
          /^www\./,
          ""
        )
        .toLowerCase();

    if (
      hostname ===
      "youtu.be"
    ) {
      const id =
        url.pathname
          .replace(
            /^\//,
            ""
          )
          .split("/")[0];

      return id
        ? `https://www.youtube.com/embed/${id}`
        : "";
    }

    if (
      hostname ===
        "youtube.com" ||
      hostname ===
        "m.youtube.com"
    ) {
      if (
        url.pathname.startsWith(
          "/embed/"
        )
      ) {
        return value;
      }

      if (
        url.pathname.startsWith(
          "/shorts/"
        )
      ) {
        const id =
          url.pathname
            .split("/shorts/")[1]
            ?.split("/")[0];

        return id
          ? `https://www.youtube.com/embed/${id}`
          : "";
      }

      const id =
        url.searchParams.get(
          "v"
        );

      return id
        ? `https://www.youtube.com/embed/${id}`
        : "";
    }

    return "";
  } catch {
    return "";
  }
}