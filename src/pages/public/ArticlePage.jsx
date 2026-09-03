// src/pages/public/Article.jsx

import React, {
  useMemo,
} from "react";

import {
  ArrowLeft,
  Clock3,
  Eye,
  Newspaper,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  useApp,
} from "../../context/AppContext";

import CommentsSection
  from "../../components/comments/CommentsSection";

import ArticleActions
  from "../../components/public/ArticleActions";

import RelatedNews
  from "../../components/public/RelatedNews";


function getImageUrl(story) {

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


function createCategorySlug(category) {

  return String(
    category || "news"
  )

    .trim()

    .toLowerCase()

    .replace(
      /\s+/g,
      "-"
    );

}


function getDateValue(value) {

  if (!value) {

    return null;

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


  return Number.isNaN(
    date.getTime()
  )

    ? null

    : date;

}


function formatArticleDate(value) {

  const date =
    getDateValue(value);


  if (!date) {

    return "Recently";

  }


  return new Intl.DateTimeFormat(

    "en-IN",

    {

      day: "2-digit",

      month: "long",

      year: "numeric",

    }

  ).format(date);

}


function formatArticleTime(value) {

  const date =
    getDateValue(value);


  if (!date) {

    return "";

  }


  return new Intl.DateTimeFormat(

    "en-IN",

    {

      hour: "numeric",

      minute: "2-digit",

    }

  ).format(date);

}


function formatViews(value = 0) {

  const views =
    Number(value) || 0;


  if (views >= 1000000) {

    return `${
      (
        views / 1000000
      ).toFixed(1)
    }M`;

  }


  if (views >= 1000) {

    return `${
      (
        views / 1000
      ).toFixed(1)
    }K`;

  }


  return String(views);

}


export default function ArticlePage() {


  const { id } =
    useParams();


  const {

    news = [],

    loading,

  } = useApp();


  /* =====================================================
     FIND ONLY PUBLISHED ARTICLE

     This prevents public users from accessing
     draft or unpublished articles directly
     through the article URL.
  ===================================================== */

  const story =

    useMemo(

      () =>

        news.find(

          (item) =>

            String(
              item?.id
            )

              ===

            String(
              id
            )

            &&

            (

              !item?.status

              ||

              String(
                item.status
              )

                .toUpperCase()

                ===

                "PUBLISHED"

            )

        ),

      [

        news,

        id,

      ]

    );


  const imageUrl =
    getImageUrl(story);


  const publishedDate =

    story?.publishedAt

    ||

    story?.createdAt;


  function renderArticleContent() {


    /* ===============================================
       ARTICLE BLOCKS
    =============================================== */

    if (

      Array.isArray(
        story?.blocks
      )

      &&

      story.blocks.length > 0

    ) {


      return story.blocks.map(

        (

          block,

          index

        ) => {


          if (!block) {

            return null;

          }


          /* ===========================================
             IMAGE BLOCK
          =========================================== */

          if (

            block.type ===
            "image"

          ) {


            const blockImage =

              block.url

              ||

              block.imageUrl

              ||

              block.src;


            if (!blockImage) {

              return null;

            }


            return (

              <figure

                key={`image-${index}`}

                className="pa-inline-image"

              >


                <img

                  src={blockImage}

                  alt={

                    block.caption

                    ||

                    story?.title

                    ||

                    "News image"

                  }

                  loading="lazy"

                />


                {

                  block.caption

                  &&

                  (

                    <figcaption>

                      {

                        block.caption

                      }

                    </figcaption>

                  )

                }


              </figure>

            );

          }


          /* ===========================================
             TEXT CONTENT
          =========================================== */

          const text =

            block.body

            ||

            block.text

            ||

            block.content

            ||

            block.value

            ||

            "";


          if (

            !String(text).trim()

          ) {

            return null;

          }


          /* ===========================================
             HEADING
          =========================================== */

          if (

            block.type ===
            "heading"

          ) {


            return (

              <h2

                key={`heading-${index}`}

                className="pa-section-heading"

              >

                {text}

              </h2>

            );

          }


          /* ===========================================
             PARAGRAPH
          =========================================== */

          return (

            <p

              key={`paragraph-${index}`}

            >

              {text}

            </p>

          );


        }

      );

    }


    /* ===============================================
       ARRAY CONTENT
    =============================================== */

    if (

      Array.isArray(
        story?.content
      )

      &&

      story.content.length > 0

    ) {


      return story.content.map(

        (

          item,

          index

        ) => {


          const text =

            typeof item ===
            "string"

              ? item

              : (

                  item?.body

                  ||

                  item?.text

                  ||

                  item?.content

                  ||

                  item?.value

                  ||

                  ""

                );


          if (

            !String(text).trim()

          ) {

            return null;

          }


          return (

            <p

              key={`content-${index}`}

            >

              {text}

            </p>

          );


        }

      );

    }


    /* ===============================================
       STRING CONTENT FALLBACK
    =============================================== */

    const stringContent =

      typeof story?.content ===
      "string"

        ? story.content

        : (

            typeof story?.body ===
            "string"

              ? story.body

              : (

                  typeof story?.article ===
                  "string"

                    ? story.article

                    : (

                        typeof story?.description ===
                        "string"

                          ? story.description

                          : ""

                      )

                )

          );


    if (

      stringContent.trim()

    ) {


      return stringContent

        .split("\n")

        .map(

          (

            paragraph,

            index

          ) => (

            {

              paragraph,

              index,

            }

          )

        )

        .filter(

          ({

            paragraph,

          }) =>

            paragraph.trim()

        )

        .map(

          ({

            paragraph,

            index,

          }) => (

            <p

              key={`text-${index}`}

            >

              {paragraph}

            </p>

          )

        );

    }


    /* ===============================================
       NO CONTENT
    =============================================== */

    return (

      <div

        className="pa-no-content"

      >


        <Newspaper

          size={24}

        />


        <div>


          <strong>

            Full article coming soon

          </strong>


          <p>

            The article details are not
            available yet.

          </p>


        </div>


      </div>

    );

  }


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {


    return (

      <main

        className="pa-page"

      >


        <div

          className="pa-container"

        >


          <div

            className="pa-loading"

          >

            <span />

            <span />

            <span />

          </div>


        </div>


      </main>

    );

  }


  /* =====================================================
     STORY NOT FOUND

     This will also appear if:
     - Article ID is invalid
     - Article was deleted
     - Article is not published
  ===================================================== */

  if (!story) {


    return (

      <main

        className="pa-page"

      >


        <div

          className="pa-container"

        >


          <section

            className="pa-not-found"

          >


            <div

              className="pa-not-found-icon"

            >


              <Newspaper

                size={34}

              />


            </div>


            <span>

              NEWSROOM

            </span>


            <h1>

              Story not found

            </h1>


            <p>

              The news article you are looking
              for is not available, has not been
              published, or may have been removed.

            </p>


            <Link

              to="/latest"

            >


              <ArrowLeft

                size={17}

              />


              Back to latest news


            </Link>


          </section>


        </div>


      </main>

    );

  }


  /* =====================================================
     ARTICLE PAGE
  ===================================================== */

  return (

    <main

      className="pa-page"

    >


      <div

        className="pa-container"

      >


        {/* =============================================
            BACK BUTTON
        ============================================== */}

        <Link

          to="/latest"

          className="pa-back-link"

        >


          <ArrowLeft

            size={16}

          />


          Back to latest news


        </Link>


        {/* =============================================
            ARTICLE
        ============================================== */}

        <article

          className="pa-article"

        >


          {/* =========================================
              ARTICLE HEADER
          ========================================== */}

          <header

            className="pa-header"

          >


            {/* =======================================
                CATEGORY
            ======================================== */}

            <div

              className="pa-category-row"

            >


              <Link

                to={

                  `/category/${

                    createCategorySlug(
                      story.category
                    )

                  }`

                }

                className="pa-category"

              >

                {

                  story.category

                  ||

                  "News"

                }

              </Link>


              {

                story.subcategory

                &&

                (

                  <span

                    className="pa-subcategory"

                  >

                    {

                      story.subcategory

                    }

                  </span>

                )

              }


            </div>


            {/* =======================================
                TITLE
            ======================================== */}

            <h1>

              {

                story.title

                ||

                "Untitled News Story"

              }

            </h1>


            {/* =======================================
                SUMMARY
            ======================================== */}

            {

              story.summary

              &&

              (

                <p

                  className="pa-summary"

                >

                  {

                    story.summary

                  }

                </p>

              )

            }


            {/* =======================================
                AUTHOR + ARTICLE INFO
            ======================================== */}

            <div

              className="pa-meta-row"

            >


              {/* AUTHOR */}

              <div

                className="pa-author"

              >


                <div

                  className="pa-author-avatar"

                >

                  {

                    String(

                      story.author

                      ||

                      story.authorName

                      ||

                      "NewsRoom"

                    )

                      .charAt(0)

                      .toUpperCase()

                  }

                </div>


                <div>


                  <span>

                    By

                  </span>


                  <strong>

                    {

                      story.author

                      ||

                      story.authorName

                      ||

                      "NewsRoom"

                    }

                  </strong>


                </div>


              </div>


              {/* ARTICLE INFORMATION */}

              <div

                className="pa-info-list"

              >


                {/* DATE */}

                <span>


                  <Clock3

                    size={15}

                  />


                  {

                    formatArticleDate(
                      publishedDate
                    )

                  }


                </span>


                {/* TIME */}

                {

                  formatArticleTime(
                    publishedDate
                  )

                  &&

                  (

                    <span

                      className="pa-time"

                    >

                      {

                        formatArticleTime(
                          publishedDate
                        )

                      }

                    </span>

                  )

                }


                {/* VIEWS */}

                <span>


                  <Eye

                    size={15}

                  />


                  {

                    formatViews(
                      story.views
                    )

                  }

                  {" "}

                  views


                </span>


                {/* READ TIME */}

                <span>

                  {

                    story.readTime

                    ||

                    story.readingTime

                    ||

                    "3 min read"

                  }

                </span>


              </div>


            </div>


          </header>


          {/* =========================================
              FEATURED IMAGE
          ========================================== */}

          {

            imageUrl

            &&

            (

              <figure

                className="pa-featured-image"

              >


                <img

                  src={imageUrl}

                  alt={

                    story.title

                    ||

                    "News story"

                  }

                />


                {

                  story.imageCaption

                  &&

                  (

                    <figcaption>

                      {

                        story.imageCaption

                      }

                    </figcaption>

                  )

                }


              </figure>

            )

          }


          {/* =========================================
              ARTICLE ACTIONS
          ========================================== */}

          <div

            className="pa-action-wrap"

          >


            <ArticleActions

              article={story}

            />


          </div>


          {/* =========================================
              ARTICLE CONTENT
          ========================================== */}

          <section

            className="pa-body"

          >

            {

              renderArticleContent()

            }

          </section>


          <div

            className="pa-bottom-divider"

          />


          {/* =========================================
              ARTICLE FOOTER
          ========================================== */}

          <div

            className="pa-bottom-actions"

          >


            <div>


              <span>

                NEWSROOM

              </span>


              <strong>

                Stay informed. Read more.

              </strong>


            </div>


            <Link

              to="/latest"

            >

              More latest news

            </Link>


          </div>


        </article>


        {/* =============================================
            RELATED NEWS
        ============================================== */}

        <RelatedNews

          article={story}

          news={news}

          limit={4}

        />


        {/* =============================================
            COMMENTS
        ============================================== */}

        <section

          className="pa-comments-wrap"

        >


          <CommentsSection

            newsId={story.id}

          />


        </section>


      </div>


    </main>

  );

}