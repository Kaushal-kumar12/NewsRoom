import React, {
  useMemo
} from "react";

import {
  Link
} from "react-router-dom";

import {
  Play,
  Video,
  Eye
} from "lucide-react";

import {
  useApp
} from "../../context/AppContext";

import {
  formatDate,
  formatViews
} from "../../utils/formatters";


function getVideoUrl(story) {

  return (

    story.videoUrl ||

    story.video ||

    story.videoLink ||

    story.youtubeUrl ||

    story.youtubeLink ||

    ""

  );

}


function isVideoStory(story) {

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


  if (

    contentType === "VIDEO" ||

    contentType === "VIDEOS"

  ) {

    return true;

  }


  return Boolean(
    getVideoUrl(story)
  );

}


export default function VideosPage() {


  const {
    news = []
  } = useApp();


  const videos =
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

              isVideoStory(story)
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


  const featuredVideo =
    videos[0];


  const remainingVideos =
    videos.slice(1);


  return (

    <section className="media-page videos-page">


      <div className="media-page-heading">


        <div>

          <span className="eyebrow media-eyebrow">

            <Video size={14} />

            NEWSROOM VIDEO

          </span>


          <h1>

            Latest Videos

          </h1>


          <p>

            Watch important stories,
            interviews, reports and
            developments from NewsRoom.

          </p>

        </div>


        <div className="media-count">

          <Video size={18} />

          <span>

            {videos.length}

          </span>

          Videos

        </div>


      </div>


      {videos.length > 0 ? (

        <>


          {featuredVideo && (

            <Link

              to={`/news/${featuredVideo.id}`}

              className="featured-video"

            >


              <div className="featured-video-image">


                {featuredVideo.featuredImage ? (

                  <img

                    src={
                      featuredVideo.featuredImage
                    }

                    alt={
                      featuredVideo.title
                    }

                  />

                ) : (

                  <div className="media-image-placeholder">

                    <Video size={48} />

                  </div>

                )}


                <div className="featured-video-overlay" />


                <div className="featured-play-button">

                  <Play
                    size={28}
                    fill="currentColor"
                  />

                </div>


                <span className="video-label">

                  <Video size={13} />

                  WATCH VIDEO

                </span>


              </div>


              <div className="featured-video-content">


                <div className="story-meta">

                  <span>

                    {featuredVideo.category ||
                      "News"}

                  </span>

                  <span>•</span>

                  <span>

                    {featuredVideo.publishedAt
                      ? formatDate(
                          featuredVideo.publishedAt
                        )
                      : "Recently"}

                  </span>

                </div>


                <h2>

                  {featuredVideo.title}

                </h2>


                {featuredVideo.summary && (

                  <p>

                    {featuredVideo.summary}

                  </p>

                )}


                <div className="media-story-footer">


                  <span>

                    {featuredVideo.author ||
                      "NewsRoom Editorial"}

                  </span>


                  <span>

                    <Eye size={14} />

                    {formatViews(
                      Number(
                        featuredVideo.views
                      ) || 0
                    )}

                  </span>


                </div>


              </div>


            </Link>

          )}


          {remainingVideos.length > 0 && (

            <div className="media-section">


              <div className="media-section-heading">

                <h2>

                  More Videos

                </h2>


                <span>

                  Latest video stories

                </span>

              </div>


              <div className="video-grid">


                {remainingVideos.map(
                  (story) => (

                    <Link

                      key={story.id}

                      to={`/news/${story.id}`}

                      className="video-card"

                    >


                      <div className="video-card-image">


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

                            <Video size={32} />

                          </div>

                        )}


                        <div className="video-image-overlay" />


                        <div className="video-play">

                          <Play
                            size={18}
                            fill="currentColor"
                          />

                        </div>


                        <span className="video-category">

                          {story.category ||
                            "News"}

                        </span>


                      </div>


                      <div className="video-card-content">


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


                        {story.summary && (

                          <p>

                            {story.summary}

                          </p>

                        )}


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

            <Video size={36} />

          </div>


          <h2>

            No videos available

          </h2>


          <p>

            Video stories will appear here
            when they are published.

          </p>


        </div>

      )}


    </section>

  );

}