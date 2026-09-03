import React, {
  useMemo,
} from "react";

import {
  ArrowUpRight,
  CalendarDays,
  Eye,
  Globe2,
  Landmark,
  MapPin,
  Newspaper,
  Trophy,
  BriefcaseBusiness,
  Cpu,
  FlaskConical,
  Clock3,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  useApp,
} from "../../context/AppContext";

import {
  formatDate,
  formatViews,
} from "../../utils/formatters";

import "../../styles/public/category-modern.css";


/* =========================================================
   CATEGORY INFORMATION
========================================================= */

const CATEGORY_CONFIG = {

  india: {

    title: "India",

    description:
      "Latest national news, important developments, policies, and stories from across India.",

    label:
      "INDIA NEWS",

    icon:
      Landmark,

    theme:
      "india",

  },


  world: {

    title: "World",

    description:
      "Important international developments, global events, and stories from around the world.",

    label:
      "WORLD NEWS",

    icon:
      Globe2,

    theme:
      "world",

  },


  bihar: {

    title: "Bihar",

    description:
      "Latest news, developments, public issues, and important stories from Bihar.",

    label:
      "BIHAR NEWS",

    icon:
      MapPin,

    theme:
      "bihar",

  },


  technology: {

    title: "Technology",

    description:
      "The latest technology news, innovation, digital trends, science, and emerging developments.",

    label:
      "TECHNOLOGY",

    icon:
      Cpu,

    theme:
      "technology",

  },


  business: {

    title: "Business",

    description:
      "Business news, markets, companies, finance, economy, and important commercial developments.",

    label:
      "BUSINESS",

    icon:
      BriefcaseBusiness,

    theme:
      "business",

  },


  sports: {

    title: "Sports",

    description:
      "Latest sports news, matches, tournaments, athletes, results, and important sporting developments.",

    label:
      "SPORTS",

    icon:
      Trophy,

    theme:
      "sports",

  },


  science: {

    title: "Science",

    description:
      "Scientific discoveries, research, innovation, and important developments from the world of science.",

    label:
      "SCIENCE",

    icon:
      FlaskConical,

    theme:
      "science",

  },

};


/* =========================================================
   HELPERS
========================================================= */

function normalizeCategory(value) {

  return String(
    value || ""
  )

    .trim()

    .toLowerCase()

    .replace(
      /\s+/g,
      "-"
    );

}


function getStoryImage(story) {

  return (

    story?.featuredImage

    ||

    story?.featuredImageUrl

    ||

    story?.imageUrl

    ||

    story?.coverImage

    ||

    story?.image

    ||

    ""

  );

}


function getStoryDate(story) {

  return (

    story?.publishedAt

    ||

    story?.createdAt

    ||

    null

  );

}


function getDateValue(value) {

  if (!value) {

    return new Date(0);

  }


  if (

    typeof value?.toDate ===
    "function"

  ) {

    return value.toDate();

  }


  if (

    typeof value?.toMillis ===
    "function"

  ) {

    return new Date(
      value.toMillis()
    );

  }


  const date =
    new Date(value);


  if (

    Number.isNaN(
      date.getTime()
    )

  ) {

    return new Date(0);

  }


  return date;

}


function getReadTime(story) {

  return (

    story?.readTime

    ||

    story?.readingTime

    ||

    "3 min read"

  );

}


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function CategoryPage() {


  const {

    category,

  } = useParams();


  const {

    news = [],

  } = useApp();


  /* =======================================================
     NORMALIZE URL CATEGORY
  ======================================================= */

  const categoryKey =
    normalizeCategory(
      category
    );


  /* =======================================================
     CATEGORY CONFIGURATION
  ======================================================= */

  const categoryConfig =

    CATEGORY_CONFIG[
      categoryKey
    ]

    ||

    {

      title:

        categoryKey

          ? categoryKey

              .replace(
                /-/g,
                " "
              )

              .replace(

                /\b\w/g,

                (letter) =>
                  letter.toUpperCase()

              )

          : "Category",


      description:

        "Latest coverage, analysis, and important stories from this category.",


      label:
        "NEWS CATEGORY",


      icon:
        Newspaper,


      theme:
        "default",

    };


  const CategoryIcon =
    categoryConfig.icon;


  /* =======================================================
     FILTER + SORT STORIES
  ======================================================= */

  const stories =

    useMemo(

      () =>

        [...news]

          .filter(

            (item) => {

              if (!item) {

                return false;

              }


              const itemCategory =

                normalizeCategory(
                  item.category
                );


              const isCorrectCategory =

                itemCategory ===
                categoryKey;


              const isPublished =

                !item.status

                ||

                String(
                  item.status
                )

                  .toUpperCase()

                  === "PUBLISHED";


              return (

                isCorrectCategory

                &&

                isPublished

              );

            }

          )

          .sort(

            (a, b) => {

              const dateA =

                getDateValue(
                  getStoryDate(a)
                );


              const dateB =

                getDateValue(
                  getStoryDate(b)
                );


              return (
                dateB - dateA
              );

            }

          ),

      [

        news,
        categoryKey,

      ]

    );


  /* =======================================================
     FEATURED STORY
  ======================================================= */

  const featuredStory =
    stories[0] || null;


  const remainingStories =
    stories.slice(1);


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <main

      className={
        `pc-page pc-theme-${categoryConfig.theme}`
      }

    >


      <div
        className="pc-container"
      >


        {/* =============================================
            CATEGORY HERO
        ============================================== */}

        <section
          className="pc-hero"
        >


          <div
            className="pc-hero-content"
          >


            <span
              className="pc-kicker"
            >

              {categoryConfig.label}

            </span>


            <h1>

              {categoryConfig.title}

            </h1>


            <p>

              {categoryConfig.description}

            </p>


            <div
              className="pc-hero-bottom"
            >


              <span
                className="pc-story-total"
              >

                <Newspaper
                  size={15}
                />

                {

                  stories.length

                }

                {" "}

                {

                  stories.length === 1

                    ? "published story"

                    : "published stories"

                }

              </span>


              <span
                className="pc-category-line"
              />


            </div>


          </div>


          <div
            className="pc-hero-icon"
          >

            <CategoryIcon
              size={42}
            />

          </div>


        </section>


        {

          featuredStory

            ? (

              <>


                {/* =========================================
                    FEATURED STORY
                ========================================== */}

                <section
                  className="pc-featured-section"
                >


                  <div
                    className="pc-section-heading"
                  >


                    <div>


                      <span
                        className="pc-section-kicker"
                      >

                        FEATURED STORY

                      </span>


                      <h2>

                        Top Story in{" "}

                        {

                          categoryConfig.title

                        }

                      </h2>


                    </div>


                    <span
                      className="pc-featured-badge"
                    >

                      <span />

                      FEATURED

                    </span>


                  </div>


                  <article
                    className="pc-featured-card"
                  >


                    <Link

                      to={
                        `/news/${featuredStory.id}`
                      }

                      className="pc-featured-image"

                    >


                      {

                        getStoryImage(
                          featuredStory
                        )

                          ? (

                            <img

                              src={
                                getStoryImage(
                                  featuredStory
                                )
                              }

                              alt={
                                featuredStory.title
                              }

                            />

                          )

                          : (

                            <div
                              className="pc-image-fallback"
                            >

                              <Newspaper
                                size={52}
                              />

                            </div>

                          )

                      }


                      <div
                        className="pc-featured-overlay"
                      />


                      <span
                        className="pc-image-category"
                      >

                        {

                          featuredStory.subcategory

                          ||

                          featuredStory.category

                          ||

                          categoryConfig.title

                        }

                      </span>


                    </Link>


                    <div
                      className="pc-featured-content"
                    >


                      <div
                        className="pc-meta"
                      >


                        <span>

                          <CalendarDays
                            size={14}
                          />

                          {

                            getStoryDate(
                              featuredStory
                            )

                              ? formatDate(

                                  getStoryDate(
                                    featuredStory
                                  )

                                )

                              : "Recently"

                          }

                        </span>


                        <span>

                          <Eye
                            size={14}
                          />

                          {

                            formatViews(

                              Number(
                                featuredStory.views
                              )

                              ||

                              0

                            )

                          }

                          {" "}

                          views

                        </span>


                        <span>

                          <Clock3
                            size={14}
                          />

                          {

                            getReadTime(
                              featuredStory
                            )

                          }

                        </span>


                      </div>


                      <h2>


                        <Link

                          to={
                            `/news/${featuredStory.id}`
                          }

                        >

                          {

                            featuredStory.title

                            ||

                            "Untitled News Story"

                          }

                        </Link>


                      </h2>


                      {

                        featuredStory.summary

                        &&

                        (

                          <p>

                            {

                              featuredStory.summary

                            }

                          </p>

                        )

                      }


                      <div
                        className="pc-featured-footer"
                      >


                        <div
                          className="pc-author"
                        >


                          <div
                            className="pc-author-avatar"
                          >

                            {

                              String(

                                featuredStory.authorName

                                ||

                                featuredStory.author

                                ||

                                "N"

                              )

                                .charAt(0)

                                .toUpperCase()

                            }

                          </div>


                          <div>


                            <span>

                              Written by

                            </span>


                            <strong>

                              {

                                featuredStory.authorName

                                ||

                                featuredStory.author

                                ||

                                "NewsRoom Editorial"

                              }

                            </strong>


                          </div>


                        </div>


                        <Link

                          to={
                            `/news/${featuredStory.id}`
                          }

                          className="pc-read-button"

                        >

                          Read Story

                          <ArrowUpRight
                            size={17}
                          />

                        </Link>


                      </div>


                    </div>


                  </article>


                </section>


                {/* =========================================
                    MORE STORIES
                ========================================== */}

                <section
                  className="pc-stories-section"
                >


                  <div
                    className="pc-stories-header"
                  >


                    <div>


                      <span
                        className="pc-section-kicker"
                      >

                        LATEST COVERAGE

                      </span>


                      <h2>

                        More{" "}

                        {

                          categoryConfig.title

                        }

                        {" "}Stories

                      </h2>


                    </div>


                    <span
                      className="pc-story-count"
                    >

                      {

                        remainingStories.length

                      }

                      {" "}

                      {

                        remainingStories.length === 1

                          ? "story"

                          : "stories"

                      }

                    </span>


                  </div>


                  {

                    remainingStories.length > 0

                      ? (

                        <div
                          className="pc-grid"
                        >


                          {

                            remainingStories.map(

                              (story) => (

                                <article

                                  className="pc-card"

                                  key={
                                    story.id
                                  }

                                >


                                  <Link

                                    to={
                                      `/news/${story.id}`
                                    }

                                    className="pc-card-image"

                                  >


                                    {

                                      getStoryImage(
                                        story
                                      )

                                        ? (

                                          <img

                                            src={
                                              getStoryImage(
                                                story
                                              )
                                            }

                                            alt={
                                              story.title
                                            }

                                            loading="lazy"

                                          />

                                        )

                                        : (

                                          <div
                                            className="pc-image-fallback"
                                          >

                                            <Newspaper
                                              size={34}
                                            />

                                          </div>

                                        )

                                    }


                                    <div
                                      className="pc-card-overlay"
                                    />


                                    <span
                                      className="pc-card-category"
                                    >

                                      {

                                        story.subcategory

                                        ||

                                        story.category

                                        ||

                                        categoryConfig.title

                                      }

                                    </span>


                                  </Link>


                                  <div
                                    className="pc-card-content"
                                  >


                                    <div
                                      className="pc-card-meta"
                                    >


                                      <span>

                                        {

                                          getStoryDate(
                                            story
                                          )

                                            ? formatDate(

                                                getStoryDate(
                                                  story
                                                )

                                              )

                                            : "Recently"

                                        }

                                      </span>


                                      <span>
                                        •
                                      </span>


                                      <span>

                                        {

                                          getReadTime(
                                            story
                                          )

                                        }

                                      </span>


                                    </div>


                                    <h3>


                                      <Link

                                        to={
                                          `/news/${story.id}`
                                        }

                                      >

                                        {

                                          story.title

                                          ||

                                          "Untitled News Story"

                                        }

                                      </Link>


                                    </h3>


                                    {

                                      story.summary

                                      &&

                                      (

                                        <p>

                                          {

                                            story.summary

                                          }

                                        </p>

                                      )

                                    }


                                    <div
                                      className="pc-card-footer"
                                    >


                                      <span
                                        className="pc-card-author"
                                      >

                                        {

                                          story.authorName

                                          ||

                                          story.author

                                          ||

                                          "NewsRoom"

                                        }

                                      </span>


                                      <span
                                        className="pc-card-views"
                                      >

                                        <Eye
                                          size={14}
                                        />

                                        {

                                          formatViews(

                                            Number(
                                              story.views
                                            )

                                            ||

                                            0

                                          )

                                        }

                                      </span>


                                    </div>


                                  </div>


                                </article>

                              )

                            )

                          }


                        </div>

                      )

                      : (

                        <div
                          className="pc-no-more"
                        >


                          <Newspaper
                            size={25}
                          />


                          <div>


                            <strong>

                              You are all caught up.

                            </strong>


                            <p>

                              More{" "}

                              {

                                categoryConfig.title

                              }

                              {" "}

                              stories will appear here
                              when they are published.

                            </p>


                          </div>


                        </div>

                      )

                  }


                </section>


              </>

            )

            : (

              <section
                className="pc-empty"
              >


                <div
                  className="pc-empty-icon"
                >

                  <CategoryIcon
                    size={38}
                  />

                </div>


                <span>

                  {categoryConfig.label}

                </span>


                <h2>

                  No stories available

                </h2>


                <p>

                  There are currently no
                  published stories in{" "}

                  {

                    categoryConfig.title

                  }.

                </p>


                <Link
                  to="/latest"
                >

                  Explore Latest News

                  <ArrowUpRight
                    size={16}
                  />

                </Link>


              </section>

            )

        }


      </div>


    </main>

  );

}