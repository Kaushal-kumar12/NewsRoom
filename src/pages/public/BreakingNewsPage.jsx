// src/pages/public/BreakingNewsPage.jsx

import React, {
  useMemo,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  Zap,
  ArrowUpRight,
  Clock3,
} from "lucide-react";

import {
  useApp,
} from "../../context/AppContext";

import {
  formatDate,
} from "../../utils/formatters";


function getDateValue(value) {

  if (!value) {

    return 0;

  }


  if (
    typeof value?.toDate ===
    "function"
  ) {

    return value
      .toDate()
      .getTime();

  }


  if (
    typeof value?.toMillis ===
    "function"
  ) {

    return value.toMillis();

  }


  const date =
    new Date(value);


  return Number.isNaN(
    date.getTime()
  )
    ? 0
    : date.getTime();

}


function getImageUrl(story) {

  return (

    story?.featuredImage ||
    story?.imageUrl ||
    story?.coverImage ||
    story?.image ||
    ""

  );

}


export default function BreakingNewsPage() {

  const {
    news = [],
  } = useApp();


  const stories =
    useMemo(
      () =>

        [...news]

          .filter(

            (item) =>

              item &&

              item.breaking === true &&

              (

                !item.status ||

                String(
                  item.status
                )
                  .toUpperCase() ===
                  "PUBLISHED"

              )

          )

          .sort(

            (a, b) =>

              getDateValue(
                b.publishedAt ||
                b.createdAt
              ) -

              getDateValue(
                a.publishedAt ||
                a.createdAt
              )

          ),

      [
        news,
      ]

    );


  return (

    <main
      className="breaking-page"
    >


      <section
        className="breaking-page-header"
      >


        <div
          className="breaking-header-content"
        >


          <span
            className="eyebrow red-eyebrow"
          >

            <Zap
              size={14}
            />

            LIVE DESK

          </span>


          <h1>

            Breaking News

          </h1>


          <p>

            Fast-moving stories,
            major developments and
            important updates as
            they happen.

          </p>


        </div>


        <div
          className="breaking-live-indicator"
        >

          <span
            className="breaking-live-dot"
          />

          LIVE UPDATES

        </div>


      </section>


      {

        stories.length > 0

          ? (

            <section
              className="breaking-news-section"
            >


              <div
                className="breaking-section-heading"
              >

                <div>

                  <span>

                    LATEST ALERTS

                  </span>


                  <h2>

                    Breaking Stories

                  </h2>

                </div>


                <p>

                  {stories.length}

                  {" "}

                  active

                  {" "}

                  {stories.length === 1
                    ? "story"
                    : "stories"}

                </p>


              </div>


              <div
                className="breaking-list"
              >


                {

                  stories.map(
                    (
                      story,
                      index
                    ) => {

                      const imageUrl =
                        getImageUrl(
                          story
                        );


                      return (

                        <Link

                          key={story.id}

                          to={`/news/${story.id}`}

                          className="breaking-card"

                        >


                          <div
                            className="breaking-card-number"
                          >

                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}

                          </div>


                          <div
                            className="breaking-image"
                          >


                            {

                              imageUrl

                                ? (

                                  <img

                                    src={imageUrl}

                                    alt={
                                      story.title ||
                                      "Breaking news"
                                    }

                                    loading="lazy"

                                  />

                                )

                                : (

                                  <div
                                    className="breaking-image-placeholder"
                                  >

                                    <Zap
                                      size={32}
                                    />

                                  </div>

                                )

                            }


                            <span
                              className="story-badge breaking-badge"
                            >

                              <Zap
                                size={12}
                              />

                              BREAKING

                            </span>


                          </div>


                          <div
                            className="breaking-content"
                          >


                            <div
                              className="breaking-top-meta"
                            >


                              <div
                                className="story-meta"
                              >

                                <span>

                                  {
                                    story.category ||
                                    "News"
                                  }

                                </span>


                                <span>

                                  •

                                </span>


                                <span>

                                  {

                                    story.publishedAt ||
                                    story.createdAt

                                      ? formatDate(

                                          story.publishedAt ||
                                          story.createdAt

                                        )

                                      : "Recently"

                                  }

                                </span>


                              </div>


                              <Clock3
                                size={16}
                              />


                            </div>


                            <h2>

                              {
                                story.title ||
                                "Untitled Breaking Story"
                              }

                            </h2>


                            {

                              story.summary &&

                              (

                                <p>

                                  {
                                    story.summary
                                  }

                                </p>

                              )

                            }


                            <div
                              className="breaking-read-more"
                            >

                              <span>

                                Read full story

                              </span>


                              <ArrowUpRight
                                size={17}
                              />


                            </div>


                          </div>


                        </Link>

                      );

                    }

                  )

                }


              </div>


            </section>

          )

          : (

            <section
              className="empty-state breaking-empty-state"
            >


              <div
                className="breaking-empty-icon"
              >

                <Zap
                  size={32}
                />

              </div>


              <span
                className="eyebrow red-eyebrow"
              >

                LIVE DESK

              </span>


              <h2>

                No breaking stories
                right now

              </h2>


              <p>

                There are currently no
                active breaking news
                stories. Check back
                later for important
                developments.

              </p>


              <Link
                to="/latest"
                className="breaking-empty-link"
              >

                Browse latest news

                <ArrowUpRight
                  size={16}
                />

              </Link>


            </section>

          )

      }


    </main>

  );

}