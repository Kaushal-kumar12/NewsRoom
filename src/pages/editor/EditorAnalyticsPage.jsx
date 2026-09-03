// src/pages/editor/EditorAnalyticsPage.jsx

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BarChart3,
  Eye,
  FileCheck2,
  MessageSquare,
} from "lucide-react";

import {
  getEditorialStories,
} from "../../services/editorial/editorialService";


export default function EditorAnalyticsPage() {

  const [stories, setStories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {

    let mounted = true;


    async function load() {

      try {

        setLoading(true);
        setError("");

        const result =
          await getEditorialStories();


        if (mounted) {

          setStories(
            Array.isArray(result)
              ? result
              : []
          );
        }

      } catch (err) {

        if (mounted) {

          setError(
            err?.message ||
            "Unable to load analytics."
          );
        }

      } finally {

        if (mounted) {
          setLoading(false);
        }
      }
    }


    load();


    return () => {
      mounted = false;
    };

  }, []);


  const totals =
    useMemo(
      () => ({

        total:
          stories.length,

        published:
          stories.filter(
            (item) =>
              item.status ===
              "PUBLISHED"
          ).length,

        submitted:
          stories.filter(
            (item) =>
              item.status ===
              "SUBMITTED"
          ).length,

        views:
          stories.reduce(
            (sum, item) =>
              sum +
              Number(
                item.views || 0
              ),
            0
          ),

        comments:
          stories.reduce(
            (sum, item) =>
              sum +
              Number(
                item.commentsCount ||
                0
              ),
            0
          ),
      }),

      [stories]
    );


  const published =
    useMemo(
      () =>
        [...stories]
          .filter(
            (item) =>
              item.status ===
              "PUBLISHED"
          )
          .sort(
            (a, b) =>
              Number(
                b.views || 0
              ) -
              Number(
                a.views || 0
              )
          )
          .slice(0, 10),

      [stories]
    );


  return (
    <div className="editor-page">

      <header className="editor-header">

        <div>

          <p className="eyebrow">
            Editorial performance
          </p>

          <h1>
            Analytics
          </h1>

          <p>
            Overview of newsroom content
            and publication activity.
          </p>

        </div>

      </header>


      {error && (
        <div className="editor-error">
          {error}
        </div>
      )}


      <section className="editor-stats editor-analytics-stats">

        {[
          [
            "Total stories",
            totals.total,
            BarChart3,
          ],

          [
            "Pending review",
            totals.submitted,
            FileCheck2,
          ],

          [
            "Published",
            totals.published,
            FileCheck2,
          ],

          [
            "Views",
            totals.views,
            Eye,
          ],

          [
            "Comments",
            totals.comments,
            MessageSquare,
          ],
        ].map(
          ([
            label,
            value,
            Icon,
          ]) => (

            <div
              className="editor-stat"
              key={label}
            >

              <div className="editor-stat-icon">
                <Icon size={19} />
              </div>

              <div>

                <strong>
                  {value}
                </strong>

                <span>
                  {label}
                </span>

              </div>

            </div>
          )
        )}

      </section>


      <section className="editor-panel">

        <div className="editor-panel-heading">

          <div>

            <p className="eyebrow">
              Published content
            </p>

            <h2>
              Top stories by views
            </h2>

          </div>

        </div>


        {loading ? (

          <div className="editor-empty">
            Loading analytics...
          </div>

        ) : !published.length ? (

          <div className="editor-empty">

            <BarChart3 size={32} />

            <h3>
              No published stories yet
            </h3>

            <p>
              Analytics will become
              meaningful after stories
              are published.
            </p>

          </div>

        ) : (

          <div className="editor-table">

            {published.map(
              (story) => (

                <div
                  className="editor-row"
                  key={story.id}
                >

                  <div>

                    <strong>
                      {story.title ||
                        "Untitled story"}
                    </strong>

                    <span>
                      {story.authorName ||
                        "Unknown author"}
                    </span>

                  </div>


                  <span>
                    {Number(
                      story.views || 0
                    ).toLocaleString()}{" "}
                    views
                  </span>


                  <span>
                    {Number(
                      story.commentsCount ||
                      0
                    )}{" "}
                    comments
                  </span>

                </div>
              )
            )}

          </div>
        )}

      </section>

    </div>
  );
}