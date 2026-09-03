import React from "react";
import {
  ExternalLink,
  Play,
} from "lucide-react";

function getYouTubeEmbedUrl(url) {
  if (!url) {
    return null;
  }

  try {
    const parsed =
      new URL(url);

    if (
      parsed.hostname.includes(
        "youtube.com"
      )
    ) {
      const videoId =
        parsed.searchParams.get(
          "v"
        );

      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : url;
    }

    if (
      parsed.hostname ===
      "youtu.be"
    ) {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }

    return url;
  } catch {
    return url;
  }
}

export default function ArticlePreview({
  news,
}) {
  return (
    <article className="article-preview">
      <div className="article-preview-kicker">
        {news.categoryName ||
          "NEWSROOM"}
      </div>

      <h1>
        {news.title ||
          "Untitled news story"}
      </h1>

      {news.subtitle && (
        <p className="article-preview-subtitle">
          {news.subtitle}
        </p>
      )}

      {news.summary && (
        <div className="article-preview-summary">
          {news.summary}
        </div>
      )}

      {news.featuredMedia
        ?.url && (
        <figure className="article-featured-figure">
          <img
            className="article-featured-image"
            src={
              news.featuredMedia
                .url
            }
            alt={
              news.featuredMedia
                .alt ||
              news.title ||
              ""
            }
          />
        </figure>
      )}

      <div className="article-preview-meta">
        <span>
          {news.authorName ||
            "Unknown author"}
        </span>

        {news.categoryName && (
          <>
            <span>•</span>

            <span>
              {news.categoryName}
            </span>
          </>
        )}
      </div>

      <div className="article-preview-body">
        {(
          news.contentBlocks ||
          []
        ).map((block) => {
          if (
            block.type ===
            "paragraph"
          ) {
            return (
              <p key={block.id}>
                {block.content}
              </p>
            );
          }

          if (
            block.type ===
            "heading"
          ) {
            return (
              <h2 key={block.id}>
                {block.content}
              </h2>
            );
          }

          if (
            block.type ===
            "quote"
          ) {
            return (
              <blockquote
                key={block.id}
              >
                {block.content}
              </blockquote>
            );
          }

          if (
            block.type ===
              "image" &&
            block.mediaUrl
          ) {
            return (
              <figure
                key={block.id}
                className="article-media-block"
              >
                <img
                  src={
                    block.mediaUrl
                  }
                  alt={
                    block.alt ||
                    ""
                  }
                />

                {block.caption && (
                  <figcaption>
                    {
                      block.caption
                    }
                  </figcaption>
                )}
              </figure>
            );
          }

          if (
            block.type ===
              "youtube" &&
            block.url
          ) {
            const embedUrl =
              getYouTubeEmbedUrl(
                block.url
              );

            return (
              <figure
                key={block.id}
                className="article-video-card"
              >
                {embedUrl ? (
                  <iframe
                    src={
                      embedUrl
                    }
                    title={
                      block.caption ||
                      "YouTube video"
                    }
                    loading="lazy"
                    allowFullScreen
                  />
                ) : (
                  <div className="article-video-fallback">
                    <Play size={25} />

                    <strong>
                      YouTube video
                    </strong>
                  </div>
                )}

                {block.caption && (
                  <figcaption>
                    {
                      block.caption
                    }
                  </figcaption>
                )}

                <a
                  href={
                    block.url
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink
                    size={14}
                  />

                  Open on YouTube
                </a>
              </figure>
            );
          }

          if (
            block.type ===
              "video" &&
            block.mediaUrl
          ) {
            return (
              <figure
                key={block.id}
                className="article-media-block"
              >
                <video
                  controls
                  src={
                    block.mediaUrl
                  }
                />

                {block.caption && (
                  <figcaption>
                    {
                      block.caption
                    }
                  </figcaption>
                )}
              </figure>
            );
          }

          if (
            block.type ===
            "link"
          ) {
            return (
              <p key={block.id}>
                <a
                  href={
                    block.url
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  {block.content ||
                    block.url}
                </a>
              </p>
            );
          }

          if (
            block.type ===
            "divider"
          ) {
            return (
              <hr
                key={block.id}
              />
            );
          }

          return null;
        })}
      </div>
    </article>
  );
}