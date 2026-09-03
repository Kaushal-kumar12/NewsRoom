// src/pages/superadmin/SuperAdminNewsManagementPage.jsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  getAllNews,
} from "../../services/editorial/newsWorkflowService";

import {
  useAuth,
} from "../../context/AuthContext";

import NewsStatusBadge from "../../components/superadmin/editorial/NewsStatusBadge";
import NewsTypeBadge from "../../components/superadmin/editorial/NewsTypeBadge";


// ============================================================
// COMPONENT
// ============================================================

export default function SuperAdminNewsManagementPage() {

  /*
  |--------------------------------------------------------------------------
  | AUTHENTICATED USER
  |--------------------------------------------------------------------------
  |
  | AuthContext stores the authenticated Firestore profile.
  | The workflow service also accepts the authenticated user object.
  |
  */

  const {
    user,
    loading: authLoading,
  } = useAuth();


  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [news, setNews] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("ALL");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [openMenu, setOpenMenu] =
    useState(null);


  /*
  |--------------------------------------------------------------------------
  | LOAD NEWS
  |--------------------------------------------------------------------------
  */

  const load = async () => {

    /*
     * Do not attempt Firestore access
     * before authentication is available.
     */

    if (!user) {
      return;
    }

    setLoading(true);
    setError("");

    try {

      /*
       * Super Admin is allowed to read
       * the complete news collection.
       *
       * Passing user keeps the service API
       * ready for authenticated authorization.
       */

      const result =
        await getAllNews(user);

      setNews(
        Array.isArray(result)
          ? result
          : []
      );

    } catch (error) {

      console.error(
        "Super Admin news loading error:",
        error
      );

      setError(
        error?.message ||
          "Unable to load news."
      );

      setNews([]);

    } finally {

      setLoading(false);

    }
  };


  /*
  |--------------------------------------------------------------------------
  | LOAD WHEN AUTHENTICATION IS READY
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (
      authLoading
    ) {
      return;
    }

    if (user) {
      load();
    } else {
      setLoading(false);
      setNews([]);
    }

  }, [
    user,
    authLoading,
  ]);


  /*
  |--------------------------------------------------------------------------
  | FILTER NEWS
  |--------------------------------------------------------------------------
  */

  const filtered =
    useMemo(() => {

      const q =
        search
          .trim()
          .toLowerCase();

      return news.filter(
        (item) => {

          const matchesStatus =
            status === "ALL" ||
            String(
              item.status || ""
            ).toUpperCase() ===
              status;

          const matchesSearch =
            !q ||
            [
              item.title,
              item.category,
              item.authorName,
              item.authorEmail,
              item.id,
            ].some(
              (value) =>
                String(
                  value || ""
                )
                  .toLowerCase()
                  .includes(q)
            );

          return (
            matchesStatus &&
            matchesSearch
          );
        }
      );

    }, [
      news,
      search,
      status,
    ]);


  /*
  |--------------------------------------------------------------------------
  | CLOSE OPEN MENU WHEN CLICKING ELSEWHERE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    const handleDocumentClick =
      (event) => {

        if (
          !event.target.closest(
            ".sa-action-menu"
          )
        ) {
          setOpenMenu(null);
        }

      };

    document.addEventListener(
      "click",
      handleDocumentClick
    );

    return () => {

      document.removeEventListener(
        "click",
        handleDocumentClick
      );

    };

  }, []);


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (

    <div className="sa-editorial-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="sa-page-head">

        <div>

          <span className="sa-page-kicker">
            CONTENT OPERATIONS
          </span>

          <h1>
            News Management
          </h1>

          <p>
            View and control every news
            article, post and media item.
          </p>

        </div>


        <div className="sa-page-actions">

          <button
            type="button"
            className="sa-btn sa-btn-secondary"
            onClick={load}
            disabled={
              loading ||
              authLoading ||
              !user
            }
          >

            <RefreshCw
              size={16}
              className={
                loading
                  ? "sa-spin"
                  : ""
              }
            />

            Refresh

          </button>


          <Link
            className="sa-btn sa-btn-primary"
            to="/super-admin/editorial/news/new"
          >

            <Plus size={16} />

            Create News

          </Link>

        </div>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <div
          className="sa-alert sa-alert-error"
          role="alert"
        >

          {error}

        </div>

      )}


      {/* ======================================================
          TABLE
      ====================================================== */}

      <section className="sa-card sa-table-card">

        {/* ====================================================
            TOOLBAR
        ==================================================== */}

        <div className="sa-toolbar">

          <div className="sa-search">

            <Search size={17} />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search title, author, category or ID..."
              aria-label="Search news"
            />

          </div>


          <div className="sa-filter">

            <Filter size={16} />

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }
              aria-label="Filter news by status"
            >

              <option value="ALL">
                All Status
              </option>

              <option value="DRAFT">
                Draft
              </option>

              <option value="PENDING_REVIEW">
                Pending Review
              </option>

              <option value="PENDING_ADMIN_REVIEW">
                Pending Admin Review
              </option>

              <option value="ADMIN_REVIEW">
                Admin Review
              </option>

              <option value="SUPER_ADMIN_REVIEW">
                Super Admin Review
              </option>

              <option value="APPROVED">
                Approved
              </option>

              <option value="PUBLISHED">
                Published
              </option>

              <option value="SCHEDULED">
                Scheduled
              </option>

              <option value="REVISION_REQUIRED">
                Revision Required
              </option>

              <option value="BLOCKED">
                Blocked
              </option>

              <option value="REJECTED">
                Rejected
              </option>

            </select>

          </div>

        </div>


        {/* ====================================================
            TABLE
        ==================================================== */}

        <div className="sa-table-wrap">

          <table className="sa-table">

            <thead>

              <tr>

                <th>
                  NEWS
                </th>

                <th>
                  TYPE
                </th>

                <th>
                  AUTHOR
                </th>

                <th>
                  STATUS
                </th>

                <th>
                  UPDATED
                </th>

                <th>
                  ACTION
                </th>

              </tr>

            </thead>


            <tbody>

              {/* ==================================================
                  AUTH LOADING
              ================================================== */}

              {authLoading ? (

                <tr>

                  <td
                    colSpan="6"
                    className="sa-table-empty"
                  >
                    Checking authentication...
                  </td>

                </tr>

              ) : loading ? (

                <tr>

                  <td
                    colSpan="6"
                    className="sa-table-empty"
                  >
                    Loading news...
                  </td>

                </tr>

              ) : filtered.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="sa-table-empty"
                  >
                    No news found.
                  </td>

                </tr>

              ) : (

                filtered.map(
                  (item) => (

                    <tr
                      key={item.id}
                    >

                      {/* ========================================
                          NEWS
                      ======================================== */}

                      <td>

                        <div className="sa-news-cell">

                          <strong>
                            {item.title ||
                              "Untitled News"}
                          </strong>

                          <small>

                            {item.category ||
                              "Uncategorized"}

                            {" · "}

                            {item.id}

                          </small>

                        </div>

                      </td>


                      {/* ========================================
                          TYPE
                      ======================================== */}

                      <td>

                        <NewsTypeBadge
                          type={
                            item.contentType
                          }
                        />

                      </td>


                      {/* ========================================
                          AUTHOR
                      ======================================== */}

                      <td>

                        {item.authorName ||
                          item.author ||
                          "Unknown"}

                      </td>


                      {/* ========================================
                          STATUS
                      ======================================== */}

                      <td>

                        <NewsStatusBadge
                          status={
                            item.status
                          }
                        />

                      </td>


                      {/* ========================================
                          UPDATED
                      ======================================== */}

                      <td>

                        {formatDate(
                          item.updatedAt ||
                            item.createdAt
                        )}

                      </td>


                      {/* ========================================
                          ACTION
                      ======================================== */}

                      <td>

                        <div className="sa-action-menu">

                          <button
                            type="button"
                            className="sa-icon-btn"
                            aria-label={`Actions for ${
                              item.title ||
                              "news"
                            }`}
                            onClick={(
                              event
                            ) => {

                              event.stopPropagation();

                              setOpenMenu(
                                openMenu ===
                                  item.id
                                  ? null
                                  : item.id
                              );

                            }}
                          >

                            <MoreHorizontal
                              size={18}
                            />

                          </button>


                          {openMenu ===
                            item.id && (

                            <div
                              className="sa-menu"
                              onClick={() =>
                                setOpenMenu(
                                  null
                                )
                              }
                            >

                              <Link
                                to={`/super-admin/editorial/news/${item.id}`}
                              >

                                <Eye
                                  size={15}
                                />

                                View Details

                              </Link>


                              <Link
                                to={`/super-admin/editorial/news/${item.id}/edit`}
                              >

                                Edit News

                              </Link>


                              <Link
                                to={`/super-admin/editorial/review?news=${item.id}`}
                              >

                                Review Workflow

                              </Link>

                            </div>

                          )}

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>

  );
}


// ============================================================
// DATE FORMATTER
// ============================================================

function formatDate(value) {

  if (!value) {
    return "—";
  }

  let date;

  try {

    /*
     * Firestore Timestamp
     */

    if (
      typeof value?.toDate ===
      "function"
    ) {

      date =
        value.toDate();

    } else if (
      value?.seconds !==
      undefined
    ) {

      /*
       * Firestore timestamp-like
       * object fallback.
       */

      date =
        new Date(
          value.seconds * 1000
        );

    } else {

      date =
        new Date(value);

    }

  } catch {

    return "—";

  }

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "—";

  }

  return date.toLocaleString();

}