// src/pages/superadmin/SuperAdminEditorialPage.jsx


import React, {
  useEffect,
  useState,
} from "react";


import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileEdit,
  Plus,
  RefreshCw,
  ShieldCheck,
  Video,
  XCircle,
} from "lucide-react";


import {
  Link,
} from "react-router-dom";


import {
  getEditorialDashboardStats,
  getEditorialQueue,
} from "../../services/editorial/editorialService";


import {
  useAuth,
} from "../../context/AuthContext";


const PENDING_REVIEW_STATUSES = [

  "SUBMITTED",

  "PENDING_ADMIN_REVIEW",

  "PENDING_SUPERADMIN_REVIEW",

];


export default function SuperAdminEditorialPage() {


  const {
    user,
    loading: authLoading,
  } = useAuth();


  const [
    stats,
    setStats,
  ] = useState({

    draft: 0,

    submitted: 0,

    pendingAdmin: 0,

    pendingSuperAdmin: 0,

    approved: 0,

    published: 0,

    rejected: 0,

    blocked: 0,

    scheduled: 0,

  });


  const [
    queue,
    setQueue,
  ] = useState([]);


  const [
    pendingTotal,
    setPendingTotal,
  ] = useState(0);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  /* =========================================================
     LOAD DASHBOARD
  ========================================================= */

  const loadDashboard =
    async () => {


      if (authLoading) {

        return;

      }


      if (!user?.uid) {

        setLoading(false);

        setError(
          "Authentication is required."
        );

        return;

      }


      try {

        setLoading(true);

        setError("");


        const [

          dashboardStats,

          editorialQueue,

        ] = await Promise.all([

          getEditorialDashboardStats(),

          getEditorialQueue(
            user
          ),

        ]);


        const pendingQueue =
          Array.isArray(
            editorialQueue
          )
            ? editorialQueue.filter(
                (item) =>
                  PENDING_REVIEW_STATUSES.includes(
                    String(
                      item?.status || ""
                    )
                      .trim()
                      .toUpperCase()
                  )
              )
            : [];


        setStats({

          draft: 0,

          submitted: 0,

          pendingAdmin: 0,

          pendingSuperAdmin: 0,

          approved: 0,

          published: 0,

          rejected: 0,

          blocked: 0,

          scheduled: 0,

          ...(dashboardStats || {}),

        });


        /*
        |------------------------------------------------------
        | IMPORTANT
        |
        | Store the REAL pending count.
        |
        | Dashboard preview shows maximum
        | 6 articles, but count shows ALL.
        |------------------------------------------------------
        */

        setPendingTotal(
          pendingQueue.length
        );


        setQueue(
          pendingQueue.slice(
            0,
            6
          )
        );

      }

      catch (error) {

        console.error(
          "Editorial dashboard loading error:",
          error
        );


        setError(

          error?.message ||

          "Unable to load editorial dashboard."

        );

      }

      finally {

        setLoading(false);

      }

    };


  /* =========================================================
     AUTHENTICATION LOAD
  ========================================================= */

  useEffect(() => {


    if (authLoading) {

      return;

    }


    loadDashboard();


  }, [

    authLoading,

    user?.uid,

  ]);


  /* =========================================================
     STAT CARDS
  ========================================================= */

  const statCards = [

    {

      label:
        "Pending Review",

      value:
        pendingTotal,

      icon:
        Clock3,

      tone:
        "warning",

      path:
        "/super-admin/editorial/status/pending",

      description:
        "Stories waiting for editorial action",

    },


    {

      label:
        "Approved",

      value:
        Number(
          stats.approved || 0
        ),

      icon:
        CheckCircle2,

      tone:
        "success",

      path:
        "/super-admin/editorial/status/approved",

      description:
        "Stories approved for publication",

    },


    {

      label:
        "Published",

      value:
        Number(
          stats.published || 0
        ),

      icon:
        Activity,

      tone:
        "blue",

      path:
        "/super-admin/editorial/status/published",

      description:
        "Stories currently live",

    },


    {

      label:
        "Drafts",

      value:
        Number(
          stats.draft || 0
        ),

      icon:
        FileEdit,

      tone:
        "purple",

      path:
        "/super-admin/editorial/status/draft",

      description:
        "Unpublished stories being prepared",

    },


    {

      label:
        "Rejected",

      value:
        Number(
          stats.rejected || 0
        ),

      icon:
        XCircle,

      tone:
        "danger",

      path:
        "/super-admin/editorial/status/rejected",

      description:
        "Stories rejected during review",

    },


    {

      label:
        "Blocked",

      value:
        Number(
          stats.blocked || 0
        ),

      icon:
        ShieldCheck,

      tone:
        "dark",

      path:
        "/super-admin/editorial/status/blocked",

      description:
        "Stories blocked from publication",

    },

  ];


  /* =========================================================
     AUTH LOADING
  ========================================================= */

  if (authLoading) {

    return (

      <div className="editorial-page">

        <div className="editorial-loading">

          Checking authentication...

        </div>

      </div>

    );

  }


  /* =========================================================
     AUTH ERROR
  ========================================================= */

  if (!user?.uid) {

    return (

      <div className="editorial-page">

        <div className="editorial-alert editorial-alert-danger">

          <AlertTriangle
            size={18}
          />


          <span>

            Authentication is required.
            Please sign in again.

          </span>

        </div>

      </div>

    );

  }


  /* =========================================================
     PAGE
  ========================================================= */

  return (

    <div className="editorial-page">


      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="editorial-hero">


        <div className="editorial-hero-content">


          <span className="editorial-kicker">

            CONTENT OPERATIONS

          </span>


          <h1>

            Editorial Control Center

          </h1>


          <p>

            Monitor, review, approve,
            publish and manage every
            NewsRoom publication from
            one place.

          </p>


        </div>


        <div className="editorial-hero-actions">


          <button

            type="button"

            className="editorial-btn editorial-btn-light"

            onClick={
              loadDashboard
            }

            disabled={
              loading ||
              authLoading
            }

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
              size={17}
            />


            Create News

          </Link>


        </div>


      </header>


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="editorial-alert editorial-alert-danger">


          <AlertTriangle
            size={18}
          />


          <span>

            {error}

          </span>


        </div>

      )}


      {/* =====================================================
          STATUS CARDS
      ====================================================== */}

      <section className="editorial-stat-grid">


        {statCards.map(
          (card) => {


            const Icon =
              card.icon;


            return (

              <Link

                key={
                  card.label
                }

                to={
                  card.path
                }

                className={`editorial-stat-card editorial-stat-card-link ${card.tone}`}

              >


                <div className="editorial-stat-icon">

                  <Icon
                    size={20}
                  />

                </div>


                <div className="editorial-stat-content">


                  <span>

                    {card.label}

                  </span>


                  <strong>

                    {loading
                      ? "—"
                      : card.value}

                  </strong>


                  <small>

                    {
                      card.description
                    }

                  </small>


                </div>


                <ArrowRight

                  size={17}

                  className="editorial-stat-arrow"

                />


              </Link>

            );

          }

        )}


      </section>


      {/* =====================================================
          WORKFLOW
      ====================================================== */}

      <section className="editorial-workflow-card">


        <div className="editorial-section-heading">


          <div>


            <span className="editorial-section-kicker">

              EDITORIAL WORKFLOW

            </span>


            <h2>

              Publication pipeline

            </h2>


          </div>


        </div>


        <div className="editorial-workflow">


          <WorkflowStep

            number="01"

            title="Draft"

            text="Author, editor or administrator creates content."

          />


          <WorkflowArrow />


          <WorkflowStep

            number="02"

            title="Review"

            text="Editorial team checks content and sensitivity."

          />


          <WorkflowArrow />


          <WorkflowStep

            number="03"

            title="Approval"

            text="Administrator or Super Administrator approves."

          />


          <WorkflowArrow />


          <WorkflowStep

            number="04"

            title="Publish"

            text="Approved content becomes publicly available."

          />


        </div>


      </section>


      {/* =====================================================
          EDITORIAL QUEUE
      ====================================================== */}

      <section className="editorial-content-card">


        <div className="editorial-content-header">


          <div>


            <span className="editorial-section-kicker">

              ATTENTION REQUIRED

            </span>


            <h2>

              Editorial Queue

            </h2>


            <p>

              {loading
                ? "Loading publications..."
                : `${pendingTotal} publication${
                    pendingTotal === 1
                      ? ""
                      : "s"
                  } waiting for editorial action.`}

            </p>


          </div>


          <Link

            to="/super-admin/editorial/review"

            className="editorial-text-link"

          >

            Open full queue


            <ArrowRight
              size={15}
            />


          </Link>


        </div>


        <div className="editorial-queue-list">


          {!loading &&
            queue.length === 0 && (

              <div className="editorial-empty">


                <CheckCircle2
                  size={32}
                />


                <strong>

                  No pending editorial work

                </strong>


                <span>

                  Everything is currently
                  under control.

                </span>


              </div>

            )}


          {queue.map(
            (news) => (

              <div

                className="editorial-queue-row"

                key={news.id}

              >


                <div className="editorial-queue-main">


                  <div className="editorial-news-placeholder">


                    {news.contentType ===
                    "VIDEO" ? (

                      <Video
                        size={18}
                      />

                    ) : (

                      <FileEdit
                        size={18}
                      />

                    )}


                  </div>


                  <div>


                    <strong>

                      {news.title ||
                        "Untitled article"}

                    </strong>


                    <span>

                      {news.authorName ||
                        news.author ||
                        "Unknown author"}

                    </span>


                  </div>


                </div>


                <div className="editorial-queue-meta">


                  <span className="editorial-status-pill">

                    {formatStatus(
                      news.status
                    )}

                  </span>


                  <Link

                    to={`/super-admin/editorial/review?id=${news.id}`}

                    className="editorial-icon-link"

                    title="Review article"

                  >

                    <ArrowRight
                      size={17}
                    />

                  </Link>


                </div>


              </div>

            )

          )}


        </div>


      </section>


    </div>

  );

}


function WorkflowStep({

  number,

  title,

  text,

}) {

  return (

    <div className="editorial-workflow-step">


      <span className="editorial-workflow-number">

        {number}

      </span>


      <div>


        <strong>

          {title}

        </strong>


        <p>

          {text}

        </p>


      </div>


    </div>

  );

}


function WorkflowArrow() {

  return (

    <div className="editorial-workflow-arrow">

      <ArrowRight
        size={18}
      />

    </div>

  );

}


function formatStatus(
  status = ""
) {

  return String(status)

    .replaceAll(
      "_",
      " "
    )

    .toLowerCase()

    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );

}