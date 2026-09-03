import React, {
  useMemo
} from "react";

import {
  Link
} from "react-router-dom";

import {
  Image,
  Eye,
  Camera
} from "lucide-react";

import {
  useApp
} from "../../context/AppContext";

import {
  formatDate,
  formatViews
} from "../../utils/formatters";


function isPhotoStory(story) {

  if (!story) {

    return false;

  }


  const contentType =
    String(

      story.contentType ||

      story.mediaType ||

      story.type ||

      ""

    )
      .trim()
      .toUpperCase();


  return (

    contentType === "PHOTO" ||

    contentType === "PHOTOS" ||

    contentType === "IMAGE" ||

    contentType === "GALLERY"

  );

}


export default function PhotosPage() {


  const {
    news = []
  } = useApp();


  const photos =
    useMemo(
      () => {

        return [...news]

          .filter(
            (story) =>

              story &&

              (
                !story.status ||

                String(
                  story.status
                )
                  .toUpperCase() ===
                  "PUBLISHED"
              ) &&

              isPhotoStory(story)
          )

          .sort(
            (a, b) => {

              const dateA =
                a.publishedAt?.toDate
                  ? a.publishedAt.toDate()
                  : new Date(
                      a.publishedAt || 0
                    );


              const dateB =
                b.publishedAt?.toDate
                  ? b.publishedAt.toDate()
                  : new Date(
                      b.publishedAt || 0
                    );


              return dateB - dateA;

            }
          );

      },

      [news]
    );


  const featuredPhoto =
    photos[0];


  const remainingPhotos =
    photos.slice(1);


  return (

    <section className="media-page photos-page">


      <div className="media-page-heading">


        <div>


          <span className="eyebrow media-eyebrow">

            <Camera size={14} />

            NEWSROOM PHOTOS

          </span>


          <h1>

            Photos

          </h1>


          <p>

            Explore important moments,
            events and stories through
            powerful images.

          </p>


        </div>


        <div className="media-count">

          <Image size={18} />

          <span>

            {photos.length}

          </span>

          Stories

        </div>


      </div>


      {photos.length > 0 ? (

        <>


          {featuredPhoto && (

            <Link

              to={`/news/${featuredPhoto.id}`}

              className="featured-photo"

            >


              <div className="featured-photo-image">


                {featuredPhoto.featuredImage ? (

                  <img

                    src={
                      featuredPhoto.featuredImage
                    }

                    alt={
                      featuredPhoto.title
                    }

                  />

                ) : (

                  <div className="media-image-placeholder">

                    <Image size={48} />

                  </div>

                )}


                <div className="featured-photo-overlay" />


                <span className="photo-label">

                  <Camera size={13} />

                  PHOTO STORY

                </span>


                <div className="featured-photo-content">


                  <div className="story-meta">

                    <span>

                      {featuredPhoto.category ||
                        "News"}

                    </span>

                    <span>•</span>

                    <span>

                      {featuredPhoto.publishedAt
                        ? formatDate(
                            featuredPhoto.publishedAt
                          )
                        : "Recently"}

                    </span>

                  </div>


                  <h2>

                    {featuredPhoto.title}

                  </h2>


                  {featuredPhoto.summary && (

                    <p>

                      {featuredPhoto.summary}

                    </p>

                  )}


                </div>


              </div>


            </Link>

          )}


          {remainingPhotos.length > 0 && (

            <div className="media-section">


              <div className="media-section-heading">

                <h2>

                  Latest Photos

                </h2>


                <span>

                  Visual stories from
                  NewsRoom

                </span>

              </div>


              <div className="photo-grid">


                {remainingPhotos.map(
                  (story) => (

                    <Link

                      key={story.id}

                      to={`/news/${story.id}`}

                      className="photo-card"

                    >


                      <div className="photo-card-image">


                        {story.featuredImage ? (

                          <img

                            src={
                              story.featuredImage
                            }

                            alt={
                              story.title
                            }

                          />

                        ) : (

                          <div className="media-image-placeholder">

                            <Image size={32} />

                          </div>

                        )}


                        <div className="photo-image-overlay" />


                        <span className="photo-category">

                          {story.category ||
                            "News"}

                        </span>


                        <div className="photo-icon">

                          <Image size={17} />

                        </div>


                      </div>


                      <div className="photo-card-content">


                        <div className="story-meta">

                          <span>

                            {story.publishedAt
                              ? formatDate(
                                  story.publishedAt
                                )
                              : "Recently"}

                          </span>

                        </div>


                        <h3>

                          {story.title}

                        </h3>


                        <div className="media-story-footer">


                          <span>

                            {story.author ||
                              "NewsRoom Editorial"}

                          </span>


                          <span>

                            <Eye size={13} />

                            {formatViews(
                              Number(
                                story.views
                              ) || 0
                            )}

                          </span>


                        </div>


                      </div>


                    </Link>

                  )
                )}


              </div>


            </div>

          )}


        </>

      ) : (

        <div className="media-empty-state">


          <div className="media-empty-icon">

            <Image size={36} />

          </div>


          <h2>

            No photos available

          </h2>


          <p>

            Photo stories will appear here
            when they are published.

          </p>


        </div>

      )}


    </section>

  );

}