import React, {
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Eye,
  ImagePlus,
  Save,
  Send,
  Settings2,
} from "lucide-react";

import ContentBlockEditor, {
  makeBlock,
} from "./ContentBlockEditor";

import ArticlePreview from "./ArticlePreview";
import MediaUploader from "./MediaUploader";

export default function NewsEditor({
  initialNews,
  mode = "create",
  onSave,
  onSubmit,
  onBack,
}) {
  const [news, setNews] = useState(
    () => ({
      title: "",
      subtitle: "",
      summary: "",
      categoryName: "",
      tags: [],

      contentType: "ARTICLE",

      sensitivity: "NORMAL",

      approvalLevel: "ADMIN",

      featuredMedia: {
        type: "image",
        url: "",
        alt: "",
      },

      contentBlocks: [
        makeBlock("paragraph"),
      ],

      ...initialNews,
    })
  );

  const [tagText, setTagText] =
    useState(
      (
        initialNews?.tags || []
      ).join(", ")
    );

  const [preview, setPreview] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const patch = (value) => {
    setNews((current) => ({
      ...current,
      ...value,
    }));
  };

  const normalized = useMemo(
    () => ({
      ...news,

      tags: tagText
        .split(",")
        .map((item) =>
          item.trim()
        )
        .filter(Boolean),
    }),
    [news, tagText]
  );

  const featured = (media) => {
    if (!media) {
      patch({
        featuredMedia: {
          type: "image",
          url: "",
          alt: "",
        },
      });

      return;
    }

    patch({
      featuredMedia: {
        type: "image",
        url:
          media.previewUrl ||
          media.url ||
          "",
        alt:
          news.title ||
          "Featured news image",
        file: media.file || null,
      },
    });
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      await onSave?.(normalized);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      await onSubmit?.(normalized);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="news-editor-shell">
      <div className="news-editor-topbar">
        <button
          type="button"
          className="editorial-back-button"
          onClick={onBack}
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <div className="news-editor-heading">
          <span className="editorial-kicker">
            NEWSROOM STUDIO
          </span>

          <h1>
            {mode === "edit"
              ? "Edit story"
              : "Create a new story"}
          </h1>
        </div>

        <div className="news-editor-actions">
          <button
            type="button"
            className="editorial-ghost-button"
            onClick={() =>
              setPreview(
                (value) => !value
              )
            }
          >
            <Eye size={16} />

            {preview
              ? "Editor"
              : "Preview"}
          </button>

          <button
            type="button"
            className="editorial-dark-button"
            disabled={saving}
            onClick={handleSave}
          >
            <Save size={16} />

            {saving
              ? "Saving..."
              : "Save draft"}
          </button>

          <button
            type="button"
            className="editorial-primary-button"
            disabled={submitting}
            onClick={handleSubmit}
          >
            <Send size={16} />

            {submitting
              ? "Submitting..."
              : "Submit for review"}
          </button>
        </div>
      </div>

      {preview ? (
        <ArticlePreview
          news={normalized}
        />
      ) : (
        <div className="news-editor-layout">
          <main className="news-editor-main">
            <section className="editorial-editor-card">
              <label>
                Headline

                <input
                  className="headline-input"
                  value={
                    news.title
                  }
                  onChange={(event) =>
                    patch({
                      title:
                        event.target.value,
                    })
                  }
                  placeholder="Write a clear, accurate headline..."
                />
              </label>

              <label>
                Subheadline

                <input
                  value={
                    news.subtitle
                  }
                  onChange={(event) =>
                    patch({
                      subtitle:
                        event.target.value,
                    })
                  }
                  placeholder="Optional supporting headline"
                />
              </label>

              <label>
                Summary

                <textarea
                  rows="4"
                  value={
                    news.summary
                  }
                  onChange={(event) =>
                    patch({
                      summary:
                        event.target.value,
                    })
                  }
                  placeholder="Short summary used in cards, search and social previews..."
                />
              </label>
            </section>

            <section className="editorial-editor-card">
              <div className="editorial-section-title">
                <div>
                  <span className="editorial-kicker">
                    STORY BODY
                  </span>

                  <h2>
                    Compose the article
                  </h2>
                </div>

                <span className="editorial-helper">
                  Place images and videos between any blocks.
                </span>
              </div>

              <ContentBlockEditor
                blocks={
                  news.contentBlocks
                }
                onChange={(
                  contentBlocks
                ) =>
                  patch({
                    contentBlocks,
                  })
                }
              />
            </section>
          </main>

          <aside className="news-editor-sidebar">
            <section className="editorial-editor-card">
              <div className="editorial-section-title">
                <Settings2 size={18} />

                <h3>
                  Story settings
                </h3>
              </div>

              <label>
                Category

                <select
                  value={
                    news.categoryName
                  }
                  onChange={(event) =>
                    patch({
                      categoryName:
                        event.target
                          .value,
                    })
                  }
                >
                  <option value="">
                    Select category
                  </option>

                  <option>
                    National
                  </option>

                  <option>
                    Politics
                  </option>

                  <option>
                    World
                  </option>

                  <option>
                    Business
                  </option>

                  <option>
                    Technology
                  </option>

                  <option>
                    Sports
                  </option>

                  <option>
                    Entertainment
                  </option>

                  <option>
                    Local
                  </option>
                </select>
              </label>

              <label>
                Content type

                <select
                  value={
                    news.contentType
                  }
                  onChange={(event) =>
                    patch({
                      contentType:
                        event.target
                          .value,
                    })
                  }
                >
                  <option value="ARTICLE">
                    Written
                  </option>

                  <option value="IMAGE">
                    Poster
                  </option>

                  <option value="ARTICLE_IMAGE">
                    Written + Poster
                  </option>

                  <option value="VIDEO">
                    Video
                  </option>

                  <option value="ARTICLE_VIDEO">
                    Written + Video
                  </option>

                  <option value="ARTICLE_IMAGE_VIDEO">
                    Written + Poster + Video
                  </option>
                </select>
              </label>

              <label>
                Sensitivity

                <select
                  value={
                    news.sensitivity
                  }
                  onChange={(event) => {
                    const value =
                      event.target.value;

                    patch({
                      sensitivity:
                        value,

                      approvalLevel:
                        value ===
                        "HIGH"
                          ? "SUPER_ADMIN"
                          : "ADMIN",
                    });
                  }}
                >
                  <option value="NORMAL">
                    Normal
                  </option>

                  <option value="SENSITIVE">
                    Sensitive
                  </option>

                  <option value="HIGH">
                    High sensitivity
                  </option>
                </select>
              </label>

              <label>
                Tags

                <input
                  value={tagText}
                  onChange={(event) =>
                    setTagText(
                      event.target.value
                    )
                  }
                  placeholder="India, politics, update"
                />
              </label>
            </section>

            <section className="editorial-editor-card">
              <div className="editorial-section-title">
                <ImagePlus size={18} />

                <h3>
                  Featured poster
                </h3>
              </div>

              <MediaUploader
                label="Choose featured poster"
                description="JPG, PNG or WebP"
                accept="image/*"
                onChange={featured}
              />

              {news.featuredMedia
                ?.url && (
                <img
                  className="featured-thumb"
                  src={
                    news.featuredMedia
                      .url
                  }
                  alt={
                    news.featuredMedia
                      .alt ||
                    "Featured preview"
                  }
                />
              )}
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}