import React, {

  useMemo,

} from "react";


import {

  Link,

} from "react-router-dom";


import {

  ArrowRight,

  Newspaper,

} from "lucide-react";


function getTimestamp(

  value

) {


  if (!value) {

    return 0;

  }


  if (

    typeof value?.toMillis ===

    "function"

  ) {

    return value.toMillis();

  }


  if (

    typeof value?.toDate ===

    "function"

  ) {

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


function formatDate(

  value

) {


  if (!value) {

    return "Recently";

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

    return "Recently";

  }


  return new Intl.DateTimeFormat(

    "en-IN",

    {

      day: "numeric",

      month: "short",

      year: "numeric",

    }

  ).format(date);

}


export default function RelatedNews({

  article,

  news = [],

  limit = 4,

}) {


  const relatedNews =

    useMemo(() => {


      const currentId =

        article?.id;


      const currentCategory =

        String(

          article?.category ||

          ""

        )

          .trim()

          .toLowerCase();


      const allNews =

        Array.isArray(news)

          ? news

          : [];


      const publishedNews =

        allNews.filter(

          (item) => {


            if (

              !item ||

              item.id ===

              currentId

            ) {

              return false;

            }


            const status =

              String(

                item.status ||

                ""

              ).toUpperCase();


            return (

              !status ||

              status ===

              "PUBLISHED"

            );


          }

        );


      const sameCategory =

        publishedNews.filter(

          (item) =>

            currentCategory &&

            String(

              item.category ||

              ""

            )

              .trim()

              .toLowerCase()

              ===

              currentCategory

        );


      const remainingNews =

        publishedNews.filter(

          (item) =>

            !sameCategory.some(

              (

                relatedItem

              ) =>

                relatedItem.id ===

                item.id

            )

        );


      return [

        ...sameCategory,

        ...remainingNews,

      ]

        .sort(

          (

            first,

            second

          ) =>


            getTimestamp(

              second.publishedAt ||

              second.createdAt

            )

            -

            getTimestamp(

              first.publishedAt ||

              first.createdAt

            )

        )

        .slice(

          0,

          limit

        );


    }, [

      article,

      news,

      limit,

    ]);


  if (

    relatedNews.length ===

    0

  ) {

    return null;

  }


  return (

    <section
      className="related-news-section"
    >


      <div
        className="related-news-heading"
      >


        <div>


          <span>

            KEEP READING

          </span>


          <h2>

            Related News

          </h2>


        </div>


        <Newspaper
          size={25}
        />


      </div>


      <div
        className="related-news-grid"
      >


        {relatedNews.map(

          (item) => (


            <article

              key={item.id}

              className="related-news-card"

            >


              <Link

                to={`/news/${item.id}`}

                className="related-news-image"

              >


                {item.featuredImage

                  ? (

                    <img

                      src={

                        item.featuredImage

                      }

                      alt={

                        item.title ||

                        "News"

                      }

                    />

                  )

                  : (

                    <div
                      className="related-news-placeholder"
                    >


                      <Newspaper
                        size={30}
                      />


                    </div>

                  )}


              </Link>


              <div
                className="related-news-content"
              >


                <span
                  className="related-news-category"
                >

                  {item.category ||

                    "News"}

                </span>


                <Link

                  to={`/news/${item.id}`}

                >


                  <h3>

                    {item.title ||

                      "Untitled News Story"}

                  </h3>


                </Link>


                <span
                  className="related-news-date"
                >

                  {formatDate(

                    item.publishedAt ||

                    item.createdAt

                  )}

                </span>


                <Link

                  to={`/news/${item.id}`}

                  className="related-news-read"

                >


                  Read Story


                  <ArrowRight
                    size={16}
                  />


                </Link>


              </div>


            </article>

          )

        )}


      </div>


    </section>

  );


}