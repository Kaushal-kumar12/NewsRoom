// src/pages/superadmin/SuperAdminNewsPreviewPage.jsx

import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Calendar,
  Edit3,
  Eye,
  FileText,
  Loader2,
  User,
  Youtube,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getNewsById,
} from "../../services/editorial/newsWorkflowService";

import NewsStatusBadge from "../../components/superadmin/editorial/NewsStatusBadge";


export default function SuperAdminNewsPreviewPage() {
  const {
    newsId,
  } = useParams();

  const location =
    useLocation();

  const navigate =
    useNavigate();


  const routerPreview =
    location.state?.previewData ||
    null;


  const [news, setNews] =
    useState(routerPreview);

  const [loading, setLoading] =
    useState(!routerPreview);

  const [error, setError] =
    useState("");


  /* =====================================================
     LOAD SAVED ARTICLE WHEN NO ROUTER PREVIEW EXISTS
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadArticle() {
      /*
       * If the editor passed current form data,
       * do NOT call Firestore.
       *
       * This is important because Preview should
       * work even before the article has been saved.
       */

      if (routerPreview) {
        setLoading(false);
        return;
      }

      if (!newsId) {
        setError(
          "There is no saved article to preview."
        );

        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const result =
          await getNewsById(newsId);

        if (!result) {
          throw new Error(
            "Article not found."
          );
        }

        if (!mounted) return;

        setNews(
          normalizePreviewNews(
            result
          )
        );
      } catch (err) {
        console.error(
          "Preview loading error:",
          err
        );

        if (mounted) {
          setError(
            err?.message ||
              "Unable to load article preview."
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
  }, [
    newsId,
    routerPreview,
  ]);


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="editorial-preview-page">

        <div className="editorial-preview-loading">

          <Loader2
            size={34}
            className="editorial-spin"
          />

          <h2>
            Loading live preview
          </h2>

          <p>
            Preparing the reader view...
          </p>

        </div>

      </div>
    );
  }


  /* =====================================================
     ERROR
  ===================================================== */

  if (error || !news) {
    return (
      <div className="editorial-preview-page">

        <div className="editorial-preview-error">

          <div className="editorial-preview-error-icon">
            <FileText size={24} />
          </div>

          <h2>
            Preview unavailable
          </h2>

          <p>
            {error ||
              "The requested article could not be loaded."}
          </p>

          <button
            type="button"
            className="editorial-btn editorial-btn-primary"
            onClick={() =>
              navigate(-1)
            }
          >
            <ArrowLeft size={16} />
            Return to Editor
          </button>

        </div>

      </div>
    );
  }


  /* =====================================================
     PAGE
  ===================================================== */

  const isEditorPreview =
    Boolean(
      location.state?.fromEditor
    );


  return (
    <div className="editorial-preview-page">

      {/* =================================================
          PREVIEW TOOLBAR
      ================================================= */}

      <header className="editorial-preview-toolbar">

        <button
          type="button"
          className="editorial-preview-back"
          onClick={() =>
            navigate(-1)
          }
        >
          <ArrowLeft size={17} />
          Back to Editor
        </button>


        <div className="editorial-preview-toolbar-title">

          <div className="editorial-preview-eye">
            <Eye size={17} />
          </div>

          <div>
            <strong>
              Live Article Preview
            </strong>

            <span>
              Reader view
            </span>
          </div>

        </div>


        {news.id && (
          <Link
            to={`/super-admin/editorial/news/${news.id}/edit`}
            className="editorial-btn editorial-btn-primary"
          >
            <Edit3 size={16} />
            Edit Article
          </Link>
        )}

      </header>


      {/* =================================================
          PREVIEW NOTICE
      ================================================= */}

      <div className="editorial-preview-notice">

        <div>
          <Eye size={17} />

          <span>
            {isEditorPreview
              ? "Previewing the current editor content. Unsaved changes are included."
              : "Preview of the saved NewsRoom publication."}
          </span>
        </div>

        <span className="editorial-preview-notice-badge">
          {news.status || "PREVIEW"}
        </span>

      </div>


      {/* =================================================
          ARTICLE
      ================================================= */}

      <main className="editorial-preview-container">

        <article className="editorial-reader-article">

          {/* CATEGORY */}

          <div className="editorial-reader-category">

            <span>
              {news.category ||
                "General"}
            </span>

            <small>
              NEWSROOM
            </small>

          </div>


          {/* TITLE */}

          <h1>
            {news.title ||
              "Untitled News Article"}
          </h1>


          {/* SUBTITLE */}

          {news.subtitle && (
            <h2>
              {news.subtitle}
            </h2>
          )}


          {/* SUMMARY */}

          {news.summary && (
            <p className="editorial-reader-lead">
              {news.summary}
            </p>
          )}


          {/* META */}

          <div className="editorial-reader-meta">

            <span>
              <User size={15} />

              {news.authorName ||
                news.authorEmail ||
                "NewsRoom Editorial"}
            </span>

            <span>
              <Calendar size={15} />

              {formatDate(
                news.updatedAt ||
                  news.createdAt
              )}
            </span>

            <span>
              <Eye size={15} />

              {news.views || 0}
              {" "}
              views
            </span>

            {news.status && (
              <span className="editorial-reader-status">
                <NewsStatusBadge
                  status={
                    news.status
                  }
                />
              </span>
            )}

          </div>


          {/* FEATURED IMAGE */}

          {(
            news.featuredImage ||
            news.featuredImageUrl
          ) && (
            <figure className="editorial-reader-featured">

              <img
                src={
                  news.featuredImage ||
                  news.featuredImageUrl
                }
                alt={
                  news.title ||
                  "Featured image"
                }
              />

            </figure>
          )}


          {/* TAGS */}

          {Array.isArray(
            news.tags
          ) &&
            news.tags.length >
              0 && (
              <div className="editorial-reader-tags">

                {news.tags.map(
                  (tag) => (
                    <span
                      key={tag}
                    >
                      #{tag}
                    </span>
                  )
                )}

              </div>
            )}


          {/* BODY */}

          <div className="editorial-reader-body">

            {Array.isArray(
              news.blocks
            ) &&
            news.blocks.length >
              0 ? (
              news.blocks.map(
                (block, index) => (
                  <PreviewBlock
                    key={
                      block.id ||
                      index
                    }
                    block={block}
                  />
                )
              )
            ) : news.body ? (
              String(
                news.body
              )
                .split("\n")
                .map(
                  (
                    paragraph,
                    index
                  ) =>
                    paragraph.trim() ? (
                      <p
                        key={
                          index
                        }
                      >
                        {
                          paragraph
                        }
                      </p>
                    ) : null
                )
            ) : (
              <div className="editorial-reader-empty">
                No story content has been added yet.
              </div>
            )}

          </div>

        </article>

      </main>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="editorial-preview-footer">

        <span>
          NewsRoom Editorial Preview
        </span>

        <button
          type="button"
          className="editorial-btn editorial-btn-light"
          onClick={() =>
            navigate(-1)
          }
        >
          <ArrowLeft size={16} />
          Return to Editor
        </button>

      </footer>

    </div>
  );
}


/* =========================================================
   PREVIEW BLOCK
   ========================================================= */

function PreviewBlock({
  block,
}) {
  if (!block) return null;

  const type =
    String(
      block.type ||
        block.blockType ||
        "paragraph"
    ).toLowerCase();


  /* PARAGRAPH */

  if (
    type === "paragraph"
  ) {
    if (
      !block.text?.trim()
    ) {
      return null;
    }

    return (
      <p>
        {block.text}
      </p>
    );
  }


  /* HEADING */

  if (
    type === "heading"
  ) {
    if (
      !block.text?.trim()
    ) {
      return null;
    }

    return (
      <h2>
        {block.text}
      </h2>
    );
  }


  /* IMAGE */

  if (
    type === "image"
  ) {
    const url =
      block.url ||
      block.src ||
      block.imageUrl;

    if (!url) {
      return null;
    }

    return (
      <figure className="editorial-reader-media">

        <img
          src={url}
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


  /* YOUTUBE */

  if (
    type === "youtube"
  ) {
    if (
      !block.url?.trim()
    ) {
      return null;
    }

    const embedUrl =
      getYoutubeEmbedUrl(
        block.url
      );

    if (!embedUrl) {
      return (
        <div className="editorial-reader-video-error">
          <Youtube size={24} />

          <span>
            Invalid YouTube URL.
          </span>
        </div>
      );
    }

    return (
      <figure className="editorial-reader-video">

        <div className="editorial-reader-video-frame">

          <iframe
            src={embedUrl}
            title={
              block.caption ||
              "Article video"
            }
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
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


  /* SHORT VIDEO */

  if (
    type ===
    "short-video"
  ) {
    if (
      !block.url?.trim()
    ) {
      return null;
    }

    return (
      <figure className="editorial-reader-video">

        <div className="editorial-reader-video-frame">

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


  /* QUOTE */

  if (
    type === "quote"
  ) {
    if (
      !block.text?.trim()
    ) {
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


  /* LINK */

  if (
    type === "link"
  ) {
    if (
      !block.url?.trim()
    ) {
      return null;
    }

    return (
      <p className="editorial-reader-link">

        <a
          href={block.url}
          target="_blank"
          rel="noreferrer"
        >
          {block.text ||
            block.url}
        </a>

      </p>
    );
  }


  /* DIVIDER */

  if (
    type === "divider"
  ) {
    return <hr />;
  }


  return null;
}


/* =========================================================
   NORMALIZE
   ========================================================= */

function normalizePreviewNews(
  article
) {
  return {
    ...article,

    title:
      article?.title ||
      article?.headline ||
      "",

    subtitle:
      article?.subtitle ||
      article?.subheadline ||
      "",

    featuredImage:
      article?.featuredImage ||
      article?.featuredImageUrl ||
      "",

    blocks:
      Array.isArray(
        article?.blocks
      )
        ? article.blocks
        : [],
  };
}


/* =========================================================
   DATE
   ========================================================= */

function formatDate(
  value
) {
  if (!value) {
    return "—";
  }

  const date =
    typeof value?.toDate ===
    "function"
      ? value.toDate()
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString();
}


/* =========================================================
   YOUTUBE
   ========================================================= */

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
            .split(
              "/shorts/"
            )[1]
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