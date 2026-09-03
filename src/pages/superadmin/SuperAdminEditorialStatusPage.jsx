// src/pages/superadmin/SuperAdminEditorialStatusPage.jsx


import React, {
  useEffect,
  useMemo,
  useState,
} from "react";


import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Clock3,
  Eye,
  FileEdit,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  XCircle,
} from "lucide-react";


import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";


import {
  getAllNews,
} from "../../services/editorial/editorialService";


import NewsStatusBadge
  from "../../components/superadmin/editorial/NewsStatusBadge";


import NewsTypeBadge
  from "../../components/superadmin/editorial/NewsTypeBadge";


const PENDING_REVIEW_STATUSES = [

  "SUBMITTED",

  "PENDING_ADMIN_REVIEW",

  "PENDING_SUPERADMIN_REVIEW",

];


const STATUS_CONFIG = {


  pending: {

    title:
      "Pending Review",

    kicker:
      "EDITORIAL QUEUE",

    description:
      "Stories waiting for editorial review or approval.",

    icon:
      Clock3,

  },


  approved: {

    title:
      "Approved Publications",

    kicker:
      "APPROVED CONTENT",

    description:
      "Stories that have completed the approval process.",

    icon:
      CheckCircle2,

  },


  published: {

    title:
      "Published Publications",

    kicker:
      "LIVE CONTENT",

    description:
      "Stories currently available to readers.",

    icon:
      Send,

  },


  draft: {

    title:
      "Draft Publications",

    kicker:
      "WORK IN PROGRESS",

    description:
      "Stories saved as drafts and waiting to be completed.",

    icon:
      FileEdit,

  },


  rejected: {

    title:
      "Rejected Publications",

    kicker:
      "EDITORIAL DECISIONS",

    description:
      "Stories that were rejected during the editorial process.",

    icon:
      XCircle,

  },


  blocked: {

    title:
      "Blocked Publications",

    kicker:
      "CONTENT RESTRICTIONS",

    description:
      "Stories blocked from publication.",

    icon:
      Ban,

  },

};


const STATUS_MAP = {


  pending:
    PENDING_REVIEW_STATUSES,


  approved: [

    "APPROVED",

  ],


  published: [

    "PUBLISHED",

  ],


  draft: [

    "DRAFT",

  ],


  rejected: [

    "REJECTED",

  ],


  blocked: [

    "BLOCKED",

  ],

};


export default function SuperAdminEditorialStatusPage() {


  const {

    statusType = "pending",

  } = useParams();


  const navigate =
    useNavigate();


  const config =
    STATUS_CONFIG[
      statusType
    ] ||
    STATUS_CONFIG.pending;


  const StatusIcon =
    config.icon;


  const [

    news,
    setNews,

  ] = useState([]);


  const [

    loading,
    setLoading,

  ] = useState(true);


  const [

    search,
    setSearch,

  ] = useState("");


  const [

    error,
    setError,

  ] = useState("");


  const [

    openMenu,
    setOpenMenu,

  ] = useState(null);


  /* =========================================================
     LOAD
  ========================================================= */

  async function load() {


    try {

      setLoading(true);

      setError("");

      setOpenMenu(null);


      const result =
        await getAllNews();


      setNews(

        Array.isArray(
          result
        )
          ? result
          : []

      );

    }

    catch (err) {

      console.error(

        "Editorial status load error:",

        err

      );


      setError(

        err?.message ||

        "Unable to load publications."

      );

    }

    finally {

      setLoading(false);

    }

  }


  useEffect(() => {


    setSearch("");

    load();


  }, [

    statusType,

  ]);


  /* =========================================================
     FILTER
  ========================================================= */

  const filteredNews =
    useMemo(
      () => {


        const query =
          search
            .trim()
            .toLowerCase();


        const allowedStatuses =
          STATUS_MAP[
            statusType
          ] ||
          STATUS_MAP.pending;


        let result =
          news.filter(
            (item) =>
              allowedStatuses.includes(

                String(
                  item.status || ""
                )
                  .trim()
                  .toUpperCase()

              )
          );


        if (!query) {

          return result;

        }


        return result.filter(
          (item) =>

            [

              item.title,

              item.category,

              item.authorName,

              item.author,

              item.authorEmail,

              item.id,

            ]

              .some(

                (value) =>

                  String(
                    value || ""
                  )

                    .toLowerCase()

                    .includes(
                      query
                    )

              )

        );


      },

      [

        news,

        search,

        statusType,

      ]

    );


  /* =========================================================
     PAGE
  ========================================================= */

  return (

    <div className="editorial-page editorial-status-page">


      {/* HEADER */}

      <header className="editorial-page-header">


        <div className="editorial-page-header-main">


          <button

            type="button"

            className="editorial-back-button"

            onClick={() =>

              navigate(
                "/super-admin/editorial"
              )

            }

          >

            <ArrowLeft
              size={16}
            />


            Editorial Control

          </button>


          <div className="editorial-status-heading-icon">

            <StatusIcon
              size={20}
            />

          </div>


          <span className="editorial-kicker">

            {config.kicker}

          </span>


          <h1>

            {config.title}

          </h1>


          <p>

            {config.description}

          </p>


        </div>


        <div className="editorial-page-header-actions">


          <button

            type="button"

            className="editorial-btn editorial-btn-light"

            onClick={load}

            disabled={loading}

          >

            <RefreshCw

              size={16}

              className={
                loading
                  ? "editorial-spin"
                  : ""
              }

            />


            Refresh

          </button>


          <Link

            to="/super-admin/editorial/news/new"

            className="editorial-btn editorial-btn-primary"

          >

            <Plus
              size={16}
            />


            Create News

          </Link>


        </div>


      </header>


      {/* ERROR */}

      {error && (

        <div className="editorial-alert editorial-alert-danger">

          <ShieldAlert
            size={18}
          />


          <span>

            {error}

          </span>


        </div>

      )}


      {/* TOOLBAR */}

      <section className="editorial-status-toolbar">


        <div className="editorial-search-box">


          <Search
            size={17}
          />


          <input

            value={search}

            onChange={
              (event) =>

                setSearch(
                  event.target.value
                )

            }

            placeholder="Search title, author, category or ID..."

          />


        </div>


        <div className="editorial-result-count">


          <strong>

            {loading
              ? "—"
              : filteredNews.length}

          </strong>


          <span>

            {filteredNews.length === 1
              ? "publication"
              : "publications"}

          </span>


        </div>


      </section>


      {/* LIST */}

      <section className="editorial-status-card">


        {loading ? (

          <div className="editorial-status-loading">


            <RefreshCw

              size={23}

              className="editorial-spin"

            />


            <span>

              Loading publications...

            </span>


          </div>

        ) : filteredNews.length === 0 ? (

          <EmptyState

            statusType={
              statusType
            }

            title={
              config.title
            }

          />

        ) : (

          <div className="editorial-status-list">


            {filteredNews.map(
              (item) => (

                <PublicationRow

                  key={item.id}

                  item={item}

                  statusType={
                    statusType
                  }

                  openMenu={
                    openMenu
                  }

                  setOpenMenu={
                    setOpenMenu
                  }

                />

              )
            )}


          </div>

        )}


      </section>


    </div>

  );

}


function EmptyState({

  statusType,

  title,

}) {

  return (

    <div className="editorial-status-empty">


      <div className="editorial-status-empty-icon">

        <FileEdit
          size={28}
        />

      </div>


      <h3>

        No{" "}

        {title.toLowerCase()}

      </h3>


      <p>

        There are currently no
        publications in this section.

      </p>


      {statusType ===
        "draft" && (

        <Link

          to="/super-admin/editorial/news/new"

          className="editorial-btn editorial-btn-primary"

        >

          <Plus
            size={16}
          />


          Create Draft

        </Link>

      )}


    </div>

  );

}


function PublicationRow({

  item,

  statusType,

  openMenu,

  setOpenMenu,

}) {


  const isDraft =
    statusType === "draft";


  const isPending =
    statusType === "pending";


  return (

    <article className="editorial-publication-row">


      {/* TYPE ICON */}

      <div className="editorial-publication-type">


        {item.contentType ===
        "VIDEO" ? (

          <Send
            size={19}
          />

        ) : (

          <FileEdit
            size={19}
          />

        )}


      </div>


      {/* MAIN */}

      <div className="editorial-publication-main">


        <div className="editorial-publication-title-row">


          <Link

            to={
              isPending
                ? `/super-admin/editorial/review?id=${item.id}`
                : `/super-admin/editorial/news/${item.id}/preview`
            }

            className="editorial-publication-title"

          >

            {item.title ||
              "Untitled publication"}

          </Link>


          {(

            item.sensitive ||

            item.isSensitive

          ) && (

            <span className="editorial-sensitive-badge">


              <ShieldAlert
                size={13}
              />


              Sensitive

            </span>

          )}


        </div>


        <div className="editorial-publication-meta">


          <span>

            {item.authorName ||

              item.author ||

              "Unknown author"}

          </span>


          <span>

            •

          </span>


          <span>

            {item.category ||

              "Uncategorized"}

          </span>


          <span>

            •

          </span>


          <span>

            {formatDate(

              item.updatedAt ||

              item.createdAt

            )}

          </span>


        </div>


      </div>


      {/* TYPE */}

      <div className="editorial-publication-type-badge">

        <NewsTypeBadge

          type={
            item.contentType
          }

        />

      </div>


      {/* STATUS */}

      <div className="editorial-publication-status">

        <NewsStatusBadge

          status={
            item.status
          }

        />

      </div>


      {/* ACTION */}

      <div className="editorial-publication-actions">


        {isPending && (

          <Link

            to={`/super-admin/editorial/review?id=${item.id}`}

            className="editorial-review-link"

            title="Review publication"

          >

            <Eye
              size={17}
            />


            Review

          </Link>

        )}


        <button

          type="button"

          className="editorial-more-button"

          onClick={() =>

            setOpenMenu(

              openMenu === item.id
                ? null
                : item.id

            )

          }

          title="More actions"

          aria-label="More actions"

        >

          <MoreHorizontal
            size={19}
          />

        </button>


        {openMenu ===
          item.id && (

          <PublicationMenu

            item={item}

            isDraft={isDraft}

            isPending={isPending}

          />

        )}


      </div>


    </article>

  );

}


function PublicationMenu({

  item,

  isDraft,

  isPending,

}) {


  const status =
    String(

      item.status || ""

    )

      .trim()

      .toUpperCase();


  return (

    <div className="editorial-action-menu">


      {isPending && (

        <Link

          to={`/super-admin/editorial/review?id=${item.id}`}

        >

          <ShieldAlert
            size={15}
          />


          Review Workflow

        </Link>

      )}


      <Link

        to={`/super-admin/editorial/news/${item.id}/preview`}

      >

        <Eye
          size={15}
        />


        Live Preview

      </Link>


      <Link

        to={`/super-admin/editorial/news/${item.id}/edit`}

      >

        <FileEdit
          size={15}
        />


        {isDraft
          ? "Edit Draft"
          : "Edit News"}

      </Link>


      <Link

        to={`/super-admin/editorial/news/${item.id}`}

      >

        <Eye
          size={15}
        />


        View Details

      </Link>


      {status ===
        "APPROVED" && (

        <Link

          to={`/super-admin/editorial/news/${item.id}/preview`}

        >

          <CheckCircle2
            size={15}
          />


          View Approved

        </Link>

      )}


      {status ===
        "PUBLISHED" && (

        <Link

          to={`/super-admin/editorial/news/${item.id}/preview`}

        >

          <Send
            size={15}
          />


          View Published

        </Link>

      )}


      {status ===
        "REJECTED" && (

        <Link

          to={`/super-admin/editorial/news/${item.id}/edit`}

        >

          <XCircle
            size={15}
          />


          Review Rejected Story

        </Link>

      )}


      {status ===
        "BLOCKED" && (

        <Link

          to={`/super-admin/editorial/news/${item.id}/edit`}

        >

          <Ban
            size={15}
          />


          Review Blocked Story

        </Link>

      )}


    </div>

  );

}


function formatDate(
  value
) {


  if (!value) {

    return "—";

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

    return "—";

  }


  return date.toLocaleString();

}