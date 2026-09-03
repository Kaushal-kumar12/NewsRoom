// src/pages/admin/NewsManagementPage.jsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  Search,
  Plus,
  Edit3,
  Eye,
  Send,
} from "lucide-react";

import {
  getAllNews,
  getNewsForAuthor,
  submitNewsForReview,
} from "../../services/editorial/newsWorkflowService";

import {
  PERMISSIONS,
  hasPermission,
  normalizeRole,
  ROLES,
} from "../../config/rolePermissions";

import {
  useStaffAuth,
} from "../../components/auth/StaffRoute";


export default function NewsManagementPage() {

  /*
  |--------------------------------------------------------------------------
  | STAFF AUTH
  |--------------------------------------------------------------------------
  |
  | StaffRoute provides:
  |
  | user    -> Firebase authenticated user
  | profile -> Firestore users/{uid} profile
  | role    -> normalized application role
  |
  */

  const {
    user,
    profile,
    role,
  } = useStaffAuth();


  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [news, setNews] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [submittingId, setSubmittingId] =
    useState(null);


  /*
  |--------------------------------------------------------------------------
  | CURRENT USER ID
  |--------------------------------------------------------------------------
  |
  | Firebase Auth UID is the primary ID.
  | profile.id is kept as a safe fallback because
  | some profile objects contain the document ID.
  |
  */

  const currentUserId =
    user?.uid ||
    profile?.uid ||
    profile?.id ||
    null;


  /*
  |--------------------------------------------------------------------------
  | LOAD NEWS
  |--------------------------------------------------------------------------
  */

  async function loadNews() {

    /*
     * Authentication must already be available.
     */

    if (!currentUserId) {

      setNews([]);

      setError(
        "Unable to identify the current user."
      );

      setLoading(false);

      return;
    }


    try {

      setLoading(true);

      setError("");


      let result;


      /*
      |--------------------------------------------------------------------------
      | AUTHOR
      |--------------------------------------------------------------------------
      |
      | Authors should only load their own news.
      |
      | getNewsForAuthor() performs:
      |
      | where("authorId", "==", userId)
      |
      */

      if (
        normalizeRole(role) ===
        ROLES.AUTHOR
      ) {

        result =
          await getNewsForAuthor(
            currentUserId
          );

      } else {

        /*
        |--------------------------------------------------------------------------
        | ADMIN / EDITOR / SUPER ADMIN
        |--------------------------------------------------------------------------
        |
        | Staff with broader editorial access can load
        | the complete news collection.
        |
        */

        result =
          await getAllNews(
            user
          );

      }


      setNews(
        Array.isArray(result)
          ? result
          : []
      );

    } catch (error) {

      console.error(
        "News loading error:",
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

  }


  /*
  |--------------------------------------------------------------------------
  | LOAD AFTER AUTH IS READY
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (!currentUserId) {
      return;
    }

    loadNews();

  }, [
    currentUserId,
    role,
  ]);


  /*
  |--------------------------------------------------------------------------
  | SUBMIT FOR REVIEW
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | Do not directly update Firestore here.
  |
  | Use the workflow service so the same authorization,
  | status transition and audit logic is used everywhere.
  |
  */

  async function submitForReview(item) {

    if (!item?.id) {
      return;
    }


    if (
      !hasPermission(
        role,
        PERMISSIONS.NEWS_SUBMIT
      )
    ) {

      setError(
        "You do not have permission to submit news for review."
      );

      return;
    }


    if (
      item.status !==
      "DRAFT"
    ) {

      setError(
        "Only draft news can be submitted for review."
      );

      return;
    }


    if (!user) {

      setError(
        "You are not authenticated."
      );

      return;
    }


    try {

      setSubmittingId(
        item.id
      );

      setError("");


      /*
       * Centralized workflow operation.
       *
       * The service records:
       *
       * status
       * submittedBy
       * submittedByName
       * submittedAt
       * updatedAt
       * audit log
       */

      await submitNewsForReview(
        item.id,
        user
      );


      /*
       * Reload so the updated status
       * is immediately reflected.
       */

      await loadNews();

    } catch (error) {

      console.error(
        "Submit news error:",
        error
      );

      setError(
        error?.message ||
          "Unable to submit news for review."
      );

    } finally {

      setSubmittingId(
        null
      );

    }

  }


  /*
  |--------------------------------------------------------------------------
  | FILTER
  |--------------------------------------------------------------------------
  */

  const filteredNews =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return news;
      }

      return news.filter(
        (item) => {

          const text =
            [
              item.title,
              item.category,
              item.status,
              item.authorName,
              item.authorEmail,
              item.id,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          return text.includes(
            query
          );

        }
      );

    }, [
      news,
      search,
    ]);


  /*
  |--------------------------------------------------------------------------
  | CAN CREATE
  |--------------------------------------------------------------------------
  */

  const canCreate =
    hasPermission(
      role,
      PERMISSIONS.NEWS_CREATE
    );


  /*
  |--------------------------------------------------------------------------
  | CAN EDIT ANY
  |--------------------------------------------------------------------------
  */

  const canEditAny =
    hasPermission(
      role,
      PERMISSIONS.NEWS_EDIT_ANY
    );


  /*
  |--------------------------------------------------------------------------
  | CAN SUBMIT
  |--------------------------------------------------------------------------
  */

  const canSubmit =
    hasPermission(
      role,
      PERMISSIONS.NEWS_SUBMIT
    );


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (

    <div className="staff-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="staff-page-header">

        <div>

          <span className="staff-eyebrow">
            EDITORIAL
          </span>

          <h1>
            News Management
          </h1>

          <p>
            Create, edit, review and
            manage newsroom stories.
          </p>

        </div>


        {canCreate && (

          <Link
            to="/admin/news/new"
            className="staff-primary-button"
          >

            <Plus size={17} />

            Create News

          </Link>

        )}

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <div
          className="staff-alert staff-alert-error"
          role="alert"
        >

          {error}

        </div>

      )}


      {/* ======================================================
          TABLE PANEL
      ====================================================== */}

      <div className="staff-panel">

        {/* ====================================================
            TOOLBAR
        ==================================================== */}

        <div className="staff-toolbar">

          <div className="staff-search-box">

            <Search size={18} />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search news..."
              aria-label="Search news"
            />

          </div>


          <span className="staff-count">

            {filteredNews.length}{" "}

            {filteredNews.length === 1
              ? "story"
              : "stories"}

          </span>

        </div>


        {/* ====================================================
            TABLE
        ==================================================== */}

        <div className="staff-table-wrapper">

          <table className="staff-table">

            <thead>

              <tr>

                <th>
                  Headline
                </th>

                <th>
                  Category
                </th>

                <th>
                  Author
                </th>

                <th>
                  Status
                </th>

                <th>
                  Updated
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {/* ==============================================
                  LOADING
              ============================================== */}

              {loading ? (

                <tr>

                  <td
                    colSpan="6"
                    className="staff-table-empty"
                  >
                    Loading news...
                  </td>

                </tr>

              ) : filteredNews.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="staff-table-empty"
                  >
                    No news found.
                  </td>

                </tr>

              ) : (

                filteredNews.map(
                  (item) => {

                    /*
                    |--------------------------------------------------------------------------
                    | OWN ARTICLE
                    |--------------------------------------------------------------------------
                    */

                    const isOwnNews =
                      Boolean(
                        currentUserId &&
                        item.authorId ===
                          currentUserId
                      );


                    /*
                    |--------------------------------------------------------------------------
                    | EDIT PERMISSION
                    |--------------------------------------------------------------------------
                    |
                    | User can edit if:
                    |
                    | 1. They have NEWS_EDIT_ANY
                    | OR
                    | 2. They are the author of the article
                    |    and have NEWS_EDIT_OWN
                    |
                    */

                    const canEdit =
                      canEditAny ||
                      (
                        isOwnNews &&
                        hasPermission(
                          role,
                          PERMISSIONS.NEWS_EDIT_OWN
                        )
                      );


                    /*
                    |--------------------------------------------------------------------------
                    | SUBMIT PERMISSION
                    |--------------------------------------------------------------------------
                    */

                    const canSubmitThis =
                      canSubmit &&
                      item.status ===
                        "DRAFT";


                    return (

                      <tr
                        key={item.id}
                      >

                        {/* ====================================
                            HEADLINE
                        ==================================== */}

                        <td>

                          <strong>
                            {item.title ||
                              "Untitled"}
                          </strong>

                        </td>


                        {/* ====================================
                            CATEGORY
                        ==================================== */}

                        <td>

                          {item.category ||
                            "General"}

                        </td>


                        {/* ====================================
                            AUTHOR
                        ==================================== */}

                        <td>

                          {item.authorName ||
                            item.author ||
                            "NewsRoom"}

                        </td>


                        {/* ====================================
                            STATUS
                        ==================================== */}

                        <td>

                          <span
                            className={
                              `staff-status status-${String(
                                item.status ||
                                  "DRAFT"
                              ).toLowerCase()}`
                            }
                          >

                            {item.status ||
                              "DRAFT"}

                          </span>

                        </td>


                        {/* ====================================
                            UPDATED
                        ==================================== */}

                        <td>

                          {formatDate(
                            item.updatedAt
                          )}

                        </td>


                        {/* ====================================
                            ACTIONS
                        ==================================== */}

                        <td>

                          <div className="staff-row-actions">

                            {/* ==================================
                                PREVIEW
                            ================================== */}

                            <Link
                              to={`/admin/news/${item.id}/preview`}
                              title="Preview"
                              aria-label="Preview news"
                            >

                              <Eye
                                size={16}
                              />

                            </Link>


                            {/* ==================================
                                EDIT
                            ================================== */}

                            {canEdit && (

                              <Link
                                to={`/admin/news/${item.id}/edit`}
                                title="Edit"
                                aria-label="Edit news"
                              >

                                <Edit3
                                  size={16}
                                />

                              </Link>

                            )}


                            {/* ==================================
                                SUBMIT
                            ================================== */}

                            {canSubmitThis && (

                              <button
                                type="button"
                                onClick={() =>
                                  submitForReview(
                                    item
                                  )
                                }
                                title="Submit for review"
                                aria-label="Submit news for review"
                                disabled={
                                  submittingId ===
                                  item.id
                                }
                              >

                                <Send
                                  size={16}
                                />

                              </button>

                            )}

                          </div>

                        </td>

                      </tr>

                    );

                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );
}


// ============================================================
// DATE FORMATTER
// ============================================================

function formatDate(value) {

  if (!value) {
    return "-";
  }


  let date;

  try {

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

      date =
        new Date(
          value.seconds * 1000
        );

    } else {

      date =
        new Date(value);

    }

  } catch {

    return "-";

  }


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "-";

  }


  return date.toLocaleDateString();

}