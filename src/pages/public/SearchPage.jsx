// src/pages/public/SearchPage.jsx

import React from "react";

import {

  Search,

  Newspaper,

  Eye,

  CalendarDays,

  UserRound,

} from "lucide-react";


import {

  Link,

  useSearchParams,

} from "react-router-dom";


import {

  useApp,

} from "../../context/AppContext";


import {

  formatDate,

  formatViews,

} from "../../utils/formatters";


function getPublishedDateValue(value) {

  if (!value) {

    return 0;

  }


  if (value?.toDate) {

    return value
      .toDate()
      .getTime();

  }


  const date =
    new Date(value);


  return Number.isNaN(
    date.getTime()
  )
    ? 0
    : date.getTime();

}


function isPublished(item) {

  return (

    item &&

    (

      !item.status ||

      String(item.status)
        .toUpperCase() ===
        "PUBLISHED"

    )

  );

}


export default function SearchPage() {


  const [params] =
    useSearchParams();


  const query =
    params.get("q") || "";


  const {

    news = [],

  } = useApp();


  const normalizedQuery =
    query
      .trim()
      .toLowerCase();


  const results =

    normalizedQuery

      ? [...news]

          .filter(
            (item) =>
              isPublished(item)
          )

          .filter((item) => {


            const searchableText = [

              item.title,

              item.summary,

              item.category,

              item.subcategory,

              item.author,

            ]

              .filter(Boolean)

              .join(" ")

              .toLowerCase();


            return searchableText.includes(
              normalizedQuery
            );


          })

          .sort(
            (a, b) =>

              getPublishedDateValue(
                b.publishedAt
              )

              -

              getPublishedDateValue(
                a.publishedAt
              )
          )

      : [];


  const resultCount =
    results.length;


  return (

    <section className="listing-page search-page">


      {/* ===============================================
          SEARCH PAGE HERO
      =============================================== */}

      <div className="public-search-hero">


        <div className="public-search-heading">


          <span className="public-search-eyebrow">

            <span className="public-search-line" />

            SEARCH

          </span>


          <h1>

            Search Results

          </h1>


          <p>

            {query

              ? (
                  <>
                    Explore NewsRoom stories
                    related to{" "}

                    <strong>

                      “{query}”

                    </strong>

                  </>
                )

              : (
                  "Search through the latest news, stories and topics."
                )

            }

          </p>


        </div>


        {query && (

          <div className="public-search-count">


            <Search
              size={17}
            />


            <span>

              {resultCount}

            </span>


            <span>

              {resultCount === 1

                ? "story found"

                : "stories found"

              }

            </span>


          </div>

        )}


      </div>



      {/* ===============================================
          EMPTY SEARCH
      =============================================== */}

      {!query && (

        <div className="public-search-empty">


          <div className="public-search-empty-icon">

            <Search
              size={34}
            />

          </div>


          <h2>

            Search NewsRoom

          </h2>


          <p>

            Enter a keyword in the search
            bar above to discover news,
            topics and stories.

          </p>


          <div className="public-search-tips">


            <span>
              Try searching for:
            </span>


            <div>

              <span>
                Technology
              </span>

              <span>
                India
              </span>

              <span>
                Business
              </span>

              <span>
                Science
              </span>

            </div>


          </div>


        </div>

      )}



      {/* ===============================================
          SEARCH RESULTS
      =============================================== */}

      {query && (

        <div className="public-search-results">


          {results.map((story) => (

            <Link

              className="public-search-card"

              key={story.id}

              to={`/news/${story.id}`}

            >


              {/* =========================================
                  IMAGE
              ========================================= */}

              <div className="public-search-image">


                <div className="public-search-image-fallback">

                  <Newspaper
                    size={34}
                  />

                </div>


                {story.featuredImage && (

                  <img

                    src={story.featuredImage}

                    alt={story.title}

                    loading="lazy"

                    onError={
                      (event) => {

                        event.currentTarget.style.display =
                          "none";

                      }
                    }

                  />

                )}


              </div>



              {/* =========================================
                  CONTENT
              ========================================= */}

              <div className="public-search-content">


                <div className="public-search-meta">


                  <span className="public-search-category">

                    {story.category ||
                      "News"}

                  </span>


                  {story.publishedAt && (

                    <span className="public-search-date">

                      <CalendarDays
                        size={13}
                      />


                      {formatDate(
                        story.publishedAt
                      )}

                    </span>

                  )}


                </div>



                <h2>

                  {story.title}

                </h2>



                {story.summary && (

                  <p>

                    {story.summary}

                  </p>

                )}



                <div className="public-search-footer">


                  <span className="public-search-author">

                    <UserRound
                      size={14}
                    />


                    {story.author ||
                      "NewsRoom Editorial"}

                  </span>



                  <span className="public-search-views">

                    <Eye
                      size={14}
                    />


                    {formatViews(
                      Number(
                        story.views
                      ) || 0
                    )}

                  </span>


                </div>


              </div>



              {/* =========================================
                  READ INDICATOR
              ========================================= */}

              <div className="public-search-arrow">

                →

              </div>


            </Link>

          ))}



          {/* =============================================
              NO RESULTS
          ============================================= */}

          {!results.length && (

            <div className="public-search-empty">


              <div className="public-search-empty-icon">

                <Search
                  size={34}
                />

              </div>


              <h2>

                No matching stories

              </h2>


              <p>

                We couldn't find any stories
                matching{" "}

                <strong>

                  “{query}”

                </strong>

                . Try another keyword.

              </p>


              <div className="public-search-suggestion">

                Try using a broader
                or simpler search term.

              </div>


            </div>

          )}


        </div>

      )}


    </section>

  );

}