import React, {
  useMemo,
} from "react";

import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Eye,
  Newspaper,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useApp,
} from "../../context/AppContext";

import {
  formatDate,
  formatViews,
} from "../../utils/formatters";



function getStoryImage(story) {

  return (

    story?.featuredImage
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


export default function LatestNewsPage() {


  const {

    news = [],

  } = useApp();


  const stories =

    useMemo(

      () =>

        [...news]

          .filter(

            (item) =>

              item
              &&

              (

                !item.status
                ||

                String(
                  item.status
                )
                  .toUpperCase()
                  === "PUBLISHED"

              )

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

      ]

    );


  const featuredStory =
    stories[0] || null;


  const latestStories =
    stories.slice(1);


  return (

    <main
      className="pl-page"
    >


      <div
        className="pl-container"
      >


        {/* =====================================
            PAGE HEADER
        ====================================== */}

        <section
          className="pl-heading"
        >


          <div
            className="pl-heading-content"
          >


            <span
              className="pl-kicker"
            >

              NEWSROOM

            </span>


            <h1>

              Latest News

            </h1>


            <p>

              Stay updated with the latest
              stories, important developments,
              and freshly published news from
              NewsRoom.

            </p>


          </div>


          <div
            className="pl-heading-icon"
          >

            <Newspaper
              size={30}
            />

          </div>


        </section>


        {

          featuredStory

            ? (

              <>


                {/* =====================================
                    FEATURED LATEST STORY
                ====================================== */}

                <section
                  className="pl-featured-section"
                >


                  <div
                    className="pl-section-title"
                  >


                    <div>

                      <span
                        className="pl-section-kicker"
                      >

                        JUST PUBLISHED

                      </span>


                      <h2>

                        Latest Story

                      </h2>

                    </div>


                    <span
                      className="pl-live-indicator"
                    >

                      <span />

                      NEW

                    </span>


                  </div>


                  <article
                    className="pl-featured-card"
                  >


                    <Link

                      to={
                        `/news/${featuredStory.id}`
                      }

                      className="pl-featured-image"

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
                              className="pl-image-fallback"
                            >

                              <Newspaper
                                size={50}
                              />

                            </div>

                          )

                      }


                      <div
                        className="pl-featured-overlay"
                      />


                      <span
                        className="pl-featured-category"
                      >

                        {

                          featuredStory.category
                          ||
                          "News"

                        }

                      </span>


                    </Link>


                    <div
                      className="pl-featured-content"
                    >


                      <div
                        className="pl-meta"
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
                        className="pl-featured-footer"
                      >


                        <div
                          className="pl-author"
                        >

                          <div
                            className="pl-author-avatar"
                          >

                            {

                              String(

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

                          className="pl-read-button"

                        >

                          Read Full Story

                          <ArrowUpRight
                            size={17}
                          />

                        </Link>


                      </div>


                    </div>


                  </article>


                </section>


                {/* =====================================
                    ALL LATEST STORIES
                ====================================== */}

                <section
                  className="pl-stories-section"
                >


                  <div
                    className="pl-stories-heading"
                  >


                    <div>

                      <span
                        className="pl-section-kicker"
                      >

                        MORE STORIES

                      </span>


                      <h2>

                        Latest Updates

                      </h2>

                    </div>


                    <span
                      className="pl-story-count"
                    >

                      {

                        latestStories.length

                      }

                      {" "}

                      {

                        latestStories.length === 1
                          ? "story"
                          : "stories"

                      }

                    </span>


                  </div>


                  {

                    latestStories.length > 0

                      ? (

                        <div
                          className="pl-grid"
                        >


                          {

                            latestStories.map(

                              (
                                story
                              ) =>

                                (

                                  <article

                                    className="pl-card"

                                    key={
                                      story.id
                                    }

                                  >


                                    <Link

                                      to={
                                        `/news/${story.id}`
                                      }

                                      className="pl-card-image"

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
                                              className="pl-image-fallback"
                                            >

                                              <Newspaper
                                                size={34}
                                              />

                                            </div>

                                          )

                                      }


                                      <div
                                        className="pl-card-image-overlay"
                                      />


                                      <span
                                        className="pl-card-category"
                                      >

                                        {

                                          story.category
                                          ||
                                          "News"

                                        }

                                      </span>


                                    </Link>


                                    <div
                                      className="pl-card-content"
                                    >


                                      <div
                                        className="pl-card-meta"
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
                                        className="pl-card-footer"
                                      >


                                        <span
                                          className="pl-card-author"
                                        >

                                          {

                                            story.author
                                            ||
                                            "NewsRoom"

                                          }

                                        </span>


                                        <span
                                          className="pl-card-views"
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
                          className="pl-no-more"
                        >

                          <Newspaper
                            size={24}
                          />


                          <div>

                            <strong>

                              You are all caught up.

                            </strong>


                            <p>

                              More news will appear here
                              when new stories are published.

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
                className="pl-empty"
              >


                <div
                  className="pl-empty-icon"
                >

                  <Newspaper
                    size={36}
                  />

                </div>


                <span>

                  NEWSROOM

                </span>


                <h2>

                  No news available

                </h2>


                <p>

                  Published stories will appear
                  here once they are available.

                </p>


                <Link
                  to="/"
                >

                  Go to Home

                </Link>


              </section>

            )

        }


      </div>


    </main>

  );

}