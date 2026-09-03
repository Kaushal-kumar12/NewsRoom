import React from "react";

import {
  ArrowRight,
  ChevronRight,
  Clock3,
  Eye,
  Flame,
  Image as ImageIcon,
  Newspaper,
  TrendingUp,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useApp } from "../../context/AppContext";

import {
  formatDate,
  formatViews,
} from "../../utils/formatters";


/* =========================================================
   HELPERS
========================================================= */

function getStoryImage(story) {
  if (!story) return "";

  return (
    story.featuredImage ||
    story.imageUrl ||
    story.coverImage ||
    story.image ||
    ""
  );
}


function getStoryDate(story) {
  if (!story) return new Date(0);

  const value =
    story.publishedAt ||
    story.createdAt ||
    story.updatedAt ||
    null;

  if (!value) return new Date(0);

  if (typeof value?.toDate === "function") {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? new Date(0)
    : date;
}


function getStoryDateLabel(story) {
  if (story?.publishedAt) {
    return formatDate(story.publishedAt);
  }

  if (story?.createdAt) {
    return formatDate(story.createdAt);
  }

  return "Recently";
}


function getCategorySlug(category) {
  return encodeURIComponent(
    String(category || "news").toLowerCase()
  );
}


function getReadingTime(story) {
  return story?.readTime || "3 min read";
}


/* =========================================================
   IMAGE BLOCK
========================================================= */

function NewsImage({
  story,
  className = "",
  priority = false,
}) {
  const image = getStoryImage(story);

  if (!image) {
    return (
      <div className={`ph-image-placeholder ${className}`}>
        <Newspaper size={32} />
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={story?.title || "News story"}
      className={className}
      loading={priority ? "eager" : "lazy"}
      onError={(event) => {
        const imageElement = event.currentTarget;
        imageElement.style.display = "none";

        const fallback =
          imageElement.parentElement?.querySelector(
            ".ph-image-error-fallback"
          );

        if (fallback) {
          fallback.style.display = "flex";
        }
      }}
    />
  );
}


function ImageFallback() {
  return (
    <div className="ph-image-error-fallback">
      <Newspaper size={30} />
    </div>
  );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyNewsState() {
  return (
    <section className="ph-empty-state">
      <div className="ph-empty-icon">
        <TrendingUp size={30} />
      </div>

      <div>
        <h2>No published news available</h2>
        <p>
          Published stories will appear here once they are available.
        </p>
      </div>
    </section>
  );
}


/* =========================================================
   NEWS CARD
========================================================= */

function NewsCard({ story, variant = "grid" }) {
  if (!story) return null;

  const image = getStoryImage(story);

  return (
    <article className={`ph-news-card ph-news-card-${variant}`}>
      <Link
        to={`/news/${story.id}`}
        className="ph-card-image-link"
        aria-label={story.title || "Open news story"}
      >
        <div className="ph-card-image">
          <NewsImage story={story} className="ph-card-image-file" />

          {image && <ImageFallback />}

          {story.breaking && (
            <span className="ph-breaking-badge">
              <Flame size={13} />
              Breaking
            </span>
          )}
        </div>
      </Link>

      <div className="ph-card-body">
        <div className="ph-card-meta">
          <Link
            to={`/category/${getCategorySlug(story.category)}`}
            className="ph-category-label"
          >
            {story.category || "News"}
          </Link>

          <span>{getStoryDateLabel(story)}</span>
        </div>

        <h3>
          <Link to={`/news/${story.id}`}>
            {story.title || "Untitled News Story"}
          </Link>
        </h3>

        {story.summary && (
          <p className="ph-card-summary">
            {story.summary}
          </p>
        )}

        <div className="ph-card-footer">
          <span className="ph-card-author">
            {story.author ||
              story.authorName ||
              "NewsRoom Editorial"}
          </span>

          <span className="ph-card-views">
            <Eye size={14} />
            {formatViews(Number(story.views) || 0)}
          </span>
        </div>
      </div>
    </article>
  );
}


/* =========================================================
   HOME PAGE
========================================================= */

export default function HomePage() {
  const {
    news = [],
    categories = [],
    loading = false,
  } = useApp();


  /* =======================================================
     PUBLISHED NEWS ONLY
  ======================================================= */

  const publishedNews = Array.isArray(news)
    ? news.filter((item) => {
        if (!item) return false;

        const status = String(
          item.status || ""
        ).toUpperCase();

        return !status || status === "PUBLISHED";
      })
    : [];


  /* =======================================================
     SORT BY DATE
  ======================================================= */

  const sortedNews = [...publishedNews].sort(
    (a, b) => getStoryDate(b) - getStoryDate(a)
  );


  /* =======================================================
     HOME DATA
  ======================================================= */

  const hero = sortedNews[0] || null;
  const sideStories = sortedNews.slice(1, 3);

  const latestStories = sortedNews.slice(3, 9);

  const visibleLatestStories =
    latestStories.length > 0
      ? latestStories
      : sortedNews.slice(1, 7);

  const trendingStories = [...sortedNews]
    .sort((a, b) => {
      const aTrending = a?.trending === true ? 1 : 0;
      const bTrending = b?.trending === true ? 1 : 0;

      if (aTrending !== bTrending) {
        return bTrending - aTrending;
      }

      return (
        (Number(b?.views) || 0) -
        (Number(a?.views) || 0)
      );
    })
    .slice(0, 5);

  const visualStories = sortedNews
    .filter((story) => Boolean(getStoryImage(story)))
    .slice(0, 4);

  const normalizedCategories = Array.isArray(categories)
    ? categories.filter(Boolean)
    : [];

  const categoryStories = normalizedCategories
    .map((category) => {
      const categoryNews = sortedNews
        .filter(
          (story) =>
            String(story.category || "").toLowerCase() ===
            String(category).toLowerCase()
        )
        .slice(0, 3);

      return {
        category,
        stories: categoryNews,
      };
    })
    .filter((item) => item.stories.length > 0)
    .slice(0, 4);


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="public-home">
        <section className="ph-loading">
          <div className="ph-loading-spinner" />
          <p>Loading the latest news...</p>
        </section>
      </div>
    );
  }


  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (!sortedNews.length) {
    return (
      <div className="public-home">
        <section className="ph-welcome">
          <span className="ph-kicker">NEWSROOM</span>
          <h1>News that matters, in one place.</h1>
          <p>
            Your destination for the latest news, important
            developments, and breaking stories.
          </p>

          <Link to="/latest" className="ph-primary-button">
            Explore Latest News
            <ArrowRight size={17} />
          </Link>
        </section>

        <EmptyNewsState />
      </div>
    );
  }


  /* =======================================================
     HOME
  ======================================================= */

  return (
    <div className="public-home">

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="ph-hero-section">
        <div className="ph-hero-heading">
          <span className="ph-live-label">
            <span />
            Top Stories
          </span>

          <p>
            The most recent stories and important developments.
          </p>
        </div>

        <div className="ph-hero-grid">
          {hero && (
            <article className="ph-main-hero">
              <Link
                to={`/news/${hero.id}`}
                className="ph-main-hero-image"
              >
                <NewsImage
                  story={hero}
                  className="ph-main-hero-image-file"
                  priority
                />

                {getStoryImage(hero) && <ImageFallback />}

                <div className="ph-main-hero-shade" />

                {hero.breaking && (
                  <span className="ph-main-hero-breaking">
                    <Flame size={14} />
                    Breaking News
                  </span>
                )}
              </Link>

              <div className="ph-main-hero-content">
                <div className="ph-main-hero-meta">
                  <Link
                    to={`/category/${getCategorySlug(hero.category)}`}
                  >
                    {hero.category || "News"}
                  </Link>

                  <span>•</span>
                  <span>{getStoryDateLabel(hero)}</span>
                </div>

                <h1>
                  <Link to={`/news/${hero.id}`}>
                    {hero.title || "Untitled News Story"}
                  </Link>
                </h1>

                {hero.summary && (
                  <p>{hero.summary}</p>
                )}

                <div className="ph-main-hero-bottom">
                  <span>
                    {hero.author ||
                      hero.authorName ||
                      "NewsRoom Editorial"}
                  </span>

                  <span>
                    <Eye size={15} />
                    {formatViews(Number(hero.views) || 0)}
                  </span>
                </div>
              </div>
            </article>
          )}

          <div className="ph-hero-side">
            {sideStories.map((story) => (
              <NewsCard
                key={story.id}
                story={story}
                variant="side"
              />
            ))}
          </div>
        </div>
      </section>


      {/* ===================================================
          CATEGORY NAVIGATION
      =================================================== */}

      {normalizedCategories.length > 0 && (
        <section className="ph-category-navigation">
          <div className="ph-category-navigation-title">
            <span>Browse by topic</span>
          </div>

          <div className="ph-category-pills">
            {normalizedCategories.map((category) => (
              <Link
                key={category}
                to={`/category/${getCategorySlug(category)}`}
                className="ph-category-pill"
              >
                {category}
                <ChevronRight size={15} />
              </Link>
            ))}
          </div>
        </section>
      )}


      {/* ===================================================
          LATEST NEWS
      =================================================== */}

      <section className="ph-section">
        <div className="ph-section-heading">
          <div>
            <span className="ph-kicker">LATEST COVERAGE</span>
            <h2>Latest News</h2>
            <p>
              Fresh stories from across NewsRoom.
            </p>
          </div>

          <Link to="/latest" className="ph-view-all">
            View all news
            <ArrowRight size={17} />
          </Link>
        </div>

        {visibleLatestStories.length > 0 ? (
          <div className="ph-news-grid">
            {visibleLatestStories.map((story) => (
              <NewsCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <EmptyNewsState />
        )}
      </section>


      {/* ===================================================
          CATEGORY SPOTLIGHTS
      =================================================== */}

      {categoryStories.length > 0 && (
        <section className="ph-section ph-category-spotlights">
          <div className="ph-section-heading">
            <div>
              <span className="ph-kicker">EXPLORE TOPICS</span>
              <h2>News by Category</h2>
              <p>
                Explore the latest coverage from your favourite topics.
              </p>
            </div>
          </div>

          <div className="ph-category-sections">
            {categoryStories.map(({ category, stories }) => {
              const [featured, ...remaining] = stories;

              return (
                <section
                  key={category}
                  className="ph-category-section"
                >
                  <div className="ph-category-section-header">
                    <h3>{category}</h3>

                    <Link
                      to={`/category/${getCategorySlug(category)}`}
                    >
                      View category
                      <ArrowRight size={15} />
                    </Link>
                  </div>

                  <div className="ph-category-story-layout">
                    {featured && (
                      <Link
                        to={`/news/${featured.id}`}
                        className="ph-category-featured"
                      >
                        <div className="ph-category-featured-image">
                          <NewsImage
                            story={featured}
                            className="ph-category-featured-image-file"
                          />
                          {getStoryImage(featured) && <ImageFallback />}
                        </div>

                        <div>
                          <span>{getStoryDateLabel(featured)}</span>
                          <strong>{featured.title}</strong>
                        </div>
                      </Link>
                    )}

                    <div className="ph-category-story-list">
                      {remaining.map((story) => (
                        <Link
                          key={story.id}
                          to={`/news/${story.id}`}
                          className="ph-category-story-row"
                        >
                          <span className="ph-category-row-date">
                            {story.category || category}
                          </span>
                          <strong>{story.title}</strong>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </section>
      )}


      {/* ===================================================
          TRENDING + NEWSLETTER
      =================================================== */}

      <section className="ph-discovery-grid">
        <section className="ph-trending-panel">
          <div className="ph-panel-heading">
            <div>
              <span className="ph-kicker ph-kicker-red">
                <Flame size={13} />
                TRENDING NOW
              </span>
              <h2>Most Read Stories</h2>
            </div>
          </div>

          {trendingStories.length > 0 ? (
            <div className="ph-ranked-list">
              {trendingStories.map((story, index) => (
                <Link
                  key={story.id}
                  to={`/news/${story.id}`}
                  className="ph-ranked-item"
                >
                  <span className="ph-rank-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <span className="ph-ranked-category">
                      {story.category || "News"}
                    </span>

                    <strong>{story.title}</strong>

                    <small>
                      <Eye size={13} />
                      {formatViews(Number(story.views) || 0)} views
                    </small>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyNewsState />
          )}
        </section>

        <aside className="ph-newsletter-card">
          <span className="ph-newsletter-icon">
            <Newspaper size={24} />
          </span>

          <span className="ph-kicker">NEWSROOM BRIEF</span>

          <h2>
            Important stories.
            <br />
            One simple briefing.
          </h2>

          <p>
            Get selected stories and important developments delivered
            directly to your inbox.
          </p>

          <form
            className="ph-newsletter-form"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email address"
              required
            />

            <button type="submit">
              Subscribe
              <ArrowRight size={16} />
            </button>
          </form>

          <small>
            Newsletter delivery will be connected to your existing
            notification system later.
          </small>
        </aside>
      </section>


      {/* ===================================================
          VISUAL STORIES
      =================================================== */}

      {visualStories.length > 0 && (
        <section className="ph-section ph-visual-section">
          <div className="ph-section-heading">
            <div>
              <span className="ph-kicker">
                <ImageIcon size={13} />
                VISUAL NEWS
              </span>
              <h2>Stories in Pictures</h2>
              <p>
                Explore news through the images uploaded with each story.
              </p>
            </div>

            <Link to="/photos" className="ph-view-all">
              Explore photos
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="ph-visual-grid">
            {visualStories.map((story, index) => (
              <Link
                key={story.id}
                to={`/news/${story.id}`}
                className={`ph-visual-card ph-visual-card-${index}`}
              >
                <div className="ph-visual-image-wrap">
                  <NewsImage
                    story={story}
                    className="ph-visual-image"
                  />
                  <ImageFallback />
                </div>

                <div className="ph-visual-shade" />

                <div className="ph-visual-content">
                  <span>{story.category || "News"}</span>
                  <strong>{story.title}</strong>
                  <small>
                    <Clock3 size={13} />
                    {getReadingTime(story)}
                  </small>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
