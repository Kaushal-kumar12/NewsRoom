// src/pages/editorial/NewsPreviewPage.jsx

import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  User,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  db,
} from "../../services/firebase";


export default function NewsPreviewPage() {


  const {

    newsId,

  } = useParams();


  const navigate =

    useNavigate();


  const [

    news,

    setNews,

  ] = useState(null);


  const [

    loading,

    setLoading,

  ] = useState(true);


  const [

    error,

    setError,

  ] = useState("");


  useEffect(() => {


    loadNews();


  }, [

    newsId,

  ]);


  async function loadNews() {


    try {


      setLoading(true);


      setError("");


      if (

        !newsId

      ) {


        setNews(null);


        return;

      }


      const snapshot =

        await getDoc(

          doc(

            db,

            "news",

            newsId

          )

        );


      if (

        !snapshot.exists()

      ) {


        setNews(null);


        return;

      }


      setNews({

        id:

          snapshot.id,


        ...snapshot.data(),

      });


    } catch (

      loadError

    ) {


      console.error(

        "Unable to load news preview:",

        loadError

      );


      setError(

        loadError?.message ||

        "Unable to load the news preview."

      );


    } finally {


      setLoading(false);


    }

  }


  function formatDate(

    value

  ) {


    if (

      !value

    ) {

      return "Not available";

    }


    if (

      typeof value?.toDate ===

      "function"

    ) {


      return value

        .toDate()

        .toLocaleString();

    }


    const date =

      new Date(

        value

      );


    if (

      Number.isNaN(

        date.getTime()

      )

    ) {


      return "Not available";

    }


    return date.toLocaleString();

  }


  function formatStatus(

    status

  ) {


    if (

      !status

    ) {

      return "DRAFT";

    }


    return String(

      status

    )

      .replaceAll(

        "_",

        " "

      )

      .toLowerCase()

      .replace(

        /\b\w/g,

        (

          character

        ) =>

          character.toUpperCase()

      );

  }


  function renderContent() {


    if (

      Array.isArray(

        news?.blocks

      )

    ) {


      return news.blocks.map(

        (

          block,

          index

        ) => {


          if (

            !block

          ) {

            return null;

          }


          if (

            block.type ===

            "heading"

          ) {


            return (

              <h3

                key={

                  block.id ||

                  index

                }

              >

                {

                  block.text ||

                  block.content ||

                  ""

                }

              </h3>

            );

          }


          if (

            block.type ===

            "image"

          ) {


            return (

              <figure

                key={

                  block.id ||

                  index

                }

                className="preview-content-image"

              >


                {block.url && (

                  <img

                    src={

                      block.url

                    }

                    alt={

                      block.alt ||

                      block.caption ||

                      news.title ||

                      "News image"

                    }

                  />

                )}


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

            "quote"

          ) {


            return (

              <blockquote

                key={

                  block.id ||

                  index

                }

              >

                {

                  block.text ||

                  block.content ||

                  ""

                }

              </blockquote>

            );

          }


          if (

            block.type ===

            "divider"

          ) {


            return (

              <hr

                key={

                  block.id ||

                  index

                }

              />

            );

          }


          return (

            <p

              key={

                block.id ||

                index

              }

            >

              {

                block.text ||

                block.content ||

                ""

              }

            </p>

          );

        }

      );

    }


    const content =

      news?.content ||

      news?.body ||

      "";


    if (

      !content

    ) {


      return (

        <div className="preview-no-content">


          <FileText

            size={30}

          />


          <span>

            No article content available.

          </span>


        </div>

      );

    }


    return String(

      content

    )

      .split(

        "\n"

      )

      .filter(

        (

          paragraph

        ) =>

          paragraph.trim()

      )

      .map(

        (

          paragraph,

          index

        ) => (

          <p

            key={

              index

            }

          >

            {

              paragraph

            }

          </p>

        )

      );

  }


  if (

    loading

  ) {


    return (

      <div className="preview-page">


        <div className="preview-loading">


          <div className="preview-spinner" />


          <h2>

            Loading Preview

          </h2>


          <p>

            Preparing the article preview...

          </p>


        </div>


      </div>

    );

  }


  if (

    error

  ) {


    return (

      <div className="preview-page">


        <div className="preview-state-card error">


          <h2>

            Unable to load preview

          </h2>


          <p>

            {

              error

            }

          </p>


          <button

            type="button"

            onClick={() =>

              navigate(

                -1

              )

            }

          >


            <ArrowLeft

              size={17}

            />


            Go Back


          </button>


        </div>


      </div>

    );

  }


  if (

    !news

  ) {


    return (

      <div className="preview-page">


        <div className="preview-state-card">


          <FileText

            size={38}

          />


          <h2>

            Preview unavailable

          </h2>


          <p>

            This article could not be found.

          </p>


          <button

            type="button"

            onClick={() =>

              navigate(

                -1

              )

            }

          >


            <ArrowLeft

              size={17}

            />


            Go Back


          </button>


        </div>


      </div>

    );

  }


  const authorName =

    news.authorName ||

    news.author ||

    news.createdByName ||

    "NewsRoom";


  return (

    <div className="preview-page">


      {/* =====================================================
          TOOLBAR
      ===================================================== */}


      <div className="preview-toolbar">


        <button

          type="button"

          className="preview-back-button"

          onClick={() =>

            navigate(

              -1

            )

          }

        >


          <ArrowLeft

            size={17}

          />


          Back


        </button>


        <div className="preview-toolbar-title">


          <span>

            NewsRoom

          </span>


          <strong>

            Article Preview

          </strong>


        </div>


        <div className="preview-toolbar-spacer" />


      </div>


      {/* =====================================================
          ARTICLE
      ===================================================== */}


      <article className="preview-article">


        <header className="preview-header">


          {news.category && (

            <span className="preview-category">


              {

                news.category

              }


            </span>

          )}


          <h1>


            {

              news.title ||

              "Untitled Article"

            }


          </h1>


          {news.subheadline && (

            <h2>


              {

                news.subheadline

              }


            </h2>

          )}


          {news.summary && (

            <p className="preview-summary">


              {

                news.summary

              }


            </p>

          )}


          <div className="preview-meta">


            <div>


              <User

                size={15}

              />


              <span>


                By

                {" "}

                {

                  authorName

                }


              </span>


            </div>


            <div>


              <Clock

                size={15}

              />


              <span>


                {

                  formatStatus(

                    news.status

                  )

                }


              </span>


            </div>


            <div>


              <Calendar

                size={15}

              />


              <span>


                {

                  formatDate(

                    news.updatedAt ||

                    news.createdAt

                  )

                }


              </span>


            </div>


          </div>


        </header>


        {news.featuredImage && (

          <figure className="preview-featured-image">


            <img

              src={

                news.featuredImage

              }

              alt={

                news.title ||

                "News image"

              }

            />


          </figure>

        )}


        <div className="preview-content">


          {

            renderContent()

          }


        </div>


      </article>


    </div>

  );

}