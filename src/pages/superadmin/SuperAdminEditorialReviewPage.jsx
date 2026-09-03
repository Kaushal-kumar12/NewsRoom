// src/pages/superadmin/SuperAdminEditorialReviewPage.jsx


import React, {
  useEffect,
  useMemo,
  useState,
} from "react";


import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Send,
  Eye,
  Clock3,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  FileText,
  CalendarDays,
  MessageSquare,
  Loader2,
} from "lucide-react";


import {
  Link,
  useSearchParams,
} from "react-router-dom";


import {
  getEditorialQueue,
  getNewsById,
} from "../../services/editorial/editorialService";


import {
  approveNews,
  rejectNews,
  publishNews,
} from "../../services/editorial/newsWorkflowService";


import {
  useAuth,
} from "../../context/AuthContext";


const PENDING_REVIEW_STATUSES = [

  "SUBMITTED",

  "PENDING_ADMIN_REVIEW",

  "PENDING_SUPERADMIN_REVIEW",

];


export default function SuperAdminEditorialReviewPage() {


  const {
    user,
    loading: authLoading,
  } = useAuth();


  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();


  const selectedId =
    searchParams.get("id");


  const [
    queue,
    setQueue,
  ] = useState([]);


  const [
    selected,
    setSelected,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    loadingArticle,
    setLoadingArticle,
  ] = useState(false);


  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    message,
    setMessage,
  ] = useState("");


  const [
    rejectReason,
    setRejectReason,
  ] = useState("");


  const [
    showReject,
    setShowReject,
  ] = useState(false);


  /* =========================================================
     LOAD QUEUE
  ========================================================= */

  const loadQueue =
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


        const result =
          await getEditorialQueue(
            user
          );


        const pendingQueue =
          Array.isArray(result)

            ? result.filter(
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


        setQueue(
          pendingQueue
        );

      }

      catch (err) {

        console.error(

          "Editorial queue loading error:",

          err

        );


        setError(

          err?.message ||

          "Unable to load editorial queue."

        );

      }

      finally {

        setLoading(false);

      }

    };


  /* =========================================================
     LOAD QUEUE
  ========================================================= */

  useEffect(() => {


    if (authLoading) {

      return;

    }


    loadQueue();


  }, [

    authLoading,

    user?.uid,

  ]);


  /* =========================================================
     LOAD ARTICLE FROM URL
  ========================================================= */

  useEffect(() => {


    async function loadSelected() {


      if (

        authLoading ||

        !user?.uid ||

        !selectedId

      ) {

        return;

      }


      try {

        setLoadingArticle(true);

        setError("");


        const article =
          await getNewsById(
            selectedId
          );


        if (!article) {

          throw new Error(
            "The selected publication was not found."
          );

        }


        setSelected(
          article
        );


        setShowReject(false);

        setRejectReason("");


      }

      catch (err) {

        console.error(

          "Selected article loading error:",

          err

        );


        setSelected(null);


        setError(

          err?.message ||

          "Unable to load the selected article."

        );

      }

      finally {

        setLoadingArticle(false);

      }

    }


    loadSelected();


  }, [

    authLoading,

    selectedId,

    user?.uid,

  ]);


  /* =========================================================
     COUNTS
  ========================================================= */

  const pendingCount =
    queue.length;


  const approvedCount =
    selected?.status ===
    "APPROVED"

      ? 1

      : 0;


  const rejectedCount =
    selected?.status ===
    "REJECTED"

      ? 1

      : 0;


  /* =========================================================
     SELECT ARTICLE
  ========================================================= */

  const selectArticle =
    (article) => {


      if (!article?.id) {

        return;

      }


      setMessage("");

      setError("");

      setShowReject(false);

      setRejectReason("");


      setSearchParams({

        id:
          article.id,

      });


    };


  /* =========================================================
     APPROVE
  ========================================================= */

  const handleApprove =
    async () => {


      if (

        !selected ||

        !user?.uid

      ) {

        setError(
          "Authentication is required."
        );

        return;

      }


      if (

        !window.confirm(

          "Approve this publication for the next editorial stage?"

        )

      ) {

        return;

      }


      try {

        setActionLoading(true);

        setError("");

        setMessage("");


        await approveNews(

          selected.id,

          user

        );


        setMessage(

          "Publication approved successfully."

        );


        await loadQueue();


        const updated =
          await getNewsById(
            selected.id
          );


        setSelected(
          updated
        );

      }

      catch (err) {

        console.error(

          "Approve error:",

          err

        );


        setError(

          err?.message ||

          "Unable to approve publication."

        );

      }

      finally {

        setActionLoading(false);

      }

    };


  /* =========================================================
     REJECT
  ========================================================= */

  const handleReject =
    async () => {


      if (

        !selected ||

        !user?.uid

      ) {

        setError(
          "Authentication is required."
        );

        return;

      }


      if (

        !rejectReason.trim()

      ) {

        setError(

          "Please provide a reason before rejecting the publication."

        );

        return;

      }


      if (

        !window.confirm(

          "Reject this publication and record the editorial remarks?"

        )

      ) {

        return;

      }


      try {

        setActionLoading(true);

        setError("");

        setMessage("");


        await rejectNews(

          selected.id,

          rejectReason.trim(),

          user

        );


        setRejectReason("");

        setShowReject(false);


        setMessage(

          "Publication rejected and remarks recorded."

        );


        await loadQueue();


        const updated =
          await getNewsById(
            selected.id
          );


        setSelected(
          updated
        );

      }

      catch (err) {

        console.error(

          "Reject error:",

          err

        );


        setError(

          err?.message ||

          "Unable to reject publication."

        );

      }

      finally {

        setActionLoading(false);

      }

    };


  /* =========================================================
     PUBLISH
  ========================================================= */

  const handlePublish =
    async () => {


      if (

        !selected ||

        !user?.uid

      ) {

        setError(
          "Authentication is required."
        );

        return;

      }


      if (

        !window.confirm(

          "Publish this news article now?"

        )

      ) {

        return;

      }


      try {

        setActionLoading(true);

        setError("");

        setMessage("");


        await publishNews(

          selected.id,

          user

        );


        setMessage(

          "Publication is now live."

        );


        await loadQueue();


        const updated =
          await getNewsById(
            selected.id
          );


        setSelected(
          updated
        );

      }

      catch (err) {

        console.error(

          "Publish error:",

          err

        );


        setError(

          err?.message ||

          "Unable to publish the article."

        );

      }

      finally {

        setActionLoading(false);

      }

    };


  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate =
    (value) => {


      if (!value) {

        return "—";

      }


      if (

        typeof value ===
          "object" &&

        typeof value.toDate ===
          "function"

      ) {

        return value

          .toDate()

          .toLocaleString();

      }


      const date =
        new Date(value);


      return Number.isNaN(

        date.getTime()

      )

        ? "—"

        : date.toLocaleString();

    };


  /* =========================================================
     RENDER BLOCK
  ========================================================= */

  const renderBlock =
    (block, index) => {


      if (!block) {

        return null;

      }


      if (

        block.type ===
        "paragraph"

      ) {

        return (

          <p key={index}>

            {block.text}

          </p>

        );

      }


      if (

        block.type ===
        "heading"

      ) {

        return (

          <h3 key={index}>

            {block.text}

          </h3>

        );

      }


      if (

        block.type ===
        "image"

      ) {

        return (

          <figure

            key={index}

            className="review-story-image"

          >

            <img

              src={

                block.url ||

                block.src

              }

              alt={

                block.alt ||

                "Story image"

              }

            />

          </figure>

        );

      }


      if (

        block.type ===
        "video"

      ) {

        return (

          <div

            key={index}

            className="review-story-video"

          >

            {block.url ? (

              <video

                controls

                src={
                  block.url
                }

              />

            ) : null}

          </div>

        );

      }


      return (

        <p key={index}>

          {block.text || ""}

        </p>

      );

    };


  /* =========================================================
     AUTH LOADING
  ========================================================= */

  if (authLoading) {

    return (

      <div className="editorial-page">


        <div className="editorial-loading">


          <Loader2

            size={30}

            className="editorial-spin"

          />


          <h2>

            Checking authentication

          </h2>


          <p>

            Please wait...

          </p>


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


      {/* HEADER */}

      <div className="review-page-header">


        <div>


          <Link

            to="/super-admin/editorial"

            className="review-back-link"

          >

            <ArrowLeft
              size={16}
            />


            Back to Editorial

          </Link>


          <span className="editorial-kicker">

            EDITORIAL REVIEW

          </span>


          <h1>

            Review Publications

          </h1>


          <p>

            Review, approve, reject and
            publish NewsRoom content.

          </p>


        </div>


        <button

          type="button"

          className="editorial-btn editorial-btn-light"

          onClick={loadQueue}

          disabled={

            loading ||

            actionLoading

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


      </div>


      {/* ERROR */}

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


      {/* SUCCESS */}

      {message && (

        <div className="editorial-alert editorial-alert-success">


          <CheckCircle2
            size={18}
          />


          <span>

            {message}

          </span>


        </div>

      )}


      {/* SUMMARY */}

      <section className="editorial-stat-grid">


        <div className="editorial-stat-card">


          <div className="editorial-stat-icon">

            <Clock3
              size={20}
            />

          </div>


          <div className="editorial-stat-content">


            <span>

              Pending

            </span>


            <strong>

              {loading
                ? "—"
                : pendingCount}

            </strong>


            <small>

              Waiting for review

            </small>


          </div>


        </div>


        <div className="editorial-stat-card">


          <div className="editorial-stat-icon">

            <CheckCircle2
              size={20}
            />

          </div>


          <div className="editorial-stat-content">


            <span>

              Selected Approved

            </span>


            <strong>

              {loading
                ? "—"
                : approvedCount}

            </strong>


            <small>

              Current selected publication

            </small>


          </div>


        </div>


        <div className="editorial-stat-card">


          <div className="editorial-stat-icon">

            <XCircle
              size={20}
            />

          </div>


          <div className="editorial-stat-content">


            <span>

              Selected Rejected

            </span>


            <strong>

              {loading
                ? "—"
                : rejectedCount}

            </strong>


            <small>

              Current selected publication

            </small>


          </div>


        </div>


      </section>


      {/* QUEUE */}

      <section className="editorial-content-card">


        <div className="editorial-content-header">


          <div>


            <span className="editorial-section-kicker">

              REVIEW QUEUE

            </span>


            <h2>

              Publications

            </h2>


            <p>

              Select an article to review.

            </p>


          </div>


        </div>


        <div className="editorial-queue-list">


          {loading ? (

            <div className="editorial-empty">


              <Loader2

                size={30}

                className="editorial-spin"

              />


              <strong>

                Loading editorial queue...

              </strong>


            </div>

          ) : queue.length === 0 ? (

            <div className="editorial-empty">


              <CheckCircle2
                size={32}
              />


              <strong>

                No pending editorial work

              </strong>


              <span>

                There are currently no
                publications waiting for
                editorial action.

              </span>


            </div>

          ) : (

            queue.map(
              (article) => (

                <button

                  type="button"

                  key={
                    article.id
                  }

                  className={`editorial-queue-row ${
                    selected?.id ===
                    article.id

                      ? "active"

                      : ""
                  }`}

                  onClick={() =>

                    selectArticle(
                      article
                    )

                  }

                >


                  <div className="editorial-queue-main">


                    <div className="editorial-news-placeholder">


                      {article.contentType ===
                      "VIDEO" ? (

                        <Send
                          size={18}
                        />

                      ) : (

                        <FileText
                          size={18}
                        />

                      )}


                    </div>


                    <div>


                      <strong>

                        {article.title ||

                          "Untitled article"}

                      </strong>


                      <span>

                        {article.authorName ||

                          article.author ||

                          "Unknown author"}

                      </span>


                    </div>


                  </div>


                  <div className="editorial-queue-meta">


                    <span className="editorial-status-pill">

                      {formatStatus(
                        article.status
                      )}

                    </span>


                    <Eye
                      size={17}
                    />


                  </div>


                </button>

              )
            )

          )}


        </div>


      </section>


      {/* SELECTED ARTICLE LOADING */}

      {loadingArticle && (

        <section className="editorial-content-card">


          <div className="editorial-empty">


            <Loader2

              size={32}

              className="editorial-spin"

            />


            <strong>

              Loading article...

            </strong>


          </div>


        </section>

      )}


      {/* SELECTED ARTICLE */}

      {selected &&
        !loadingArticle && (

          <>


            <article className="review-story-card">


              <header className="review-story-header">


                <div>


                  <span className="editorial-section-kicker">

                    PUBLICATION

                  </span>


                  <h2>

                    {selected.title ||

                      "Untitled article"}

                  </h2>


                  <div className="review-author">


                    <div className="review-author-avatar">

                      <ShieldCheck
                        size={18}
                      />

                    </div>


                    <div>


                      <strong>

                        {selected.authorName ||

                          selected.author ||

                          "Unknown author"}

                      </strong>


                      <span>

                        Author

                      </span>


                    </div>


                  </div>


                  <div className="review-meta">


                    <span>


                      <CalendarDays
                        size={15}
                      />


                      {formatDate(

                        selected.submittedAt ||

                        selected.createdAt

                      )}


                    </span>


                    <span>

                      Category:{" "}

                      {selected.category ||

                        "General"}

                    </span>


                    <span>

                      Status:{" "}

                      {formatStatus(
                        selected.status
                      )}

                    </span>


                  </div>


                </div>


              </header>


              {selected.featuredImage && (

                <div className="review-featured-image">


                  <img

                    src={
                      selected.featuredImage
                    }

                    alt={

                      selected.title ||

                      "Featured image"

                    }

                  />


                </div>

              )}


              <div className="review-story-body">


                {selected.blocks?.length

                  ? selected.blocks.map(
                      renderBlock
                    )

                  : (

                    <p>

                      {selected.content ||

                        "No story content available."}

                    </p>

                  )}


              </div>


            </article>


            {/* REMARKS */}

            {selected.rejectionReason && (

              <section className="review-remarks-card">


                <MessageSquare
                  size={20}
                />


                <div>


                  <span>

                    EDITORIAL REMARKS

                  </span>


                  <h3>

                    Previous review

                  </h3>


                  <p>

                    {
                      selected.rejectionReason
                    }

                  </p>


                </div>


              </section>

            )}


            {/* ACTIONS */}

            <section className="review-action-panel">


              <div>


                <span>

                  EDITORIAL ACTION

                </span>


                <h3>

                  What would you like
                  to do?

                </h3>


                <p>

                  Your action will be
                  recorded in the editorial
                  workflow.

                </p>


              </div>


              <div className="review-actions">


                <button

                  type="button"

                  className="review-action reject"

                  onClick={() =>

                    setShowReject(
                      !showReject
                    )

                  }

                  disabled={
                    actionLoading
                  }

                >

                  <XCircle
                    size={17}
                  />


                  Reject

                </button>


                <button

                  type="button"

                  className="review-action approve"

                  onClick={
                    handleApprove
                  }

                  disabled={
                    actionLoading
                  }

                >

                  <CheckCircle2
                    size={17}
                  />


                  Approve

                </button>


                <button

                  type="button"

                  className="review-action publish"

                  onClick={
                    handlePublish
                  }

                  disabled={

                    actionLoading ||

                    ![

                      "APPROVED",

                      "SCHEDULED",

                    ].includes(

                      selected.status

                    )

                  }

                >

                  <Send
                    size={17}
                  />


                  Publish

                </button>


              </div>


              {showReject && (

                <div className="review-reject-box">


                  <label>

                    Reason / editorial remarks

                  </label>


                  <textarea

                    rows={5}

                    value={
                      rejectReason
                    }

                    onChange={

                      (event) =>

                        setRejectReason(

                          event.target.value

                        )

                    }

                    placeholder="Explain why this publication is being rejected."

                  />


                  <div>


                    <button

                      type="button"

                      className="review-cancel-button"

                      onClick={() =>

                        setShowReject(
                          false
                        )

                      }

                    >

                      Cancel

                    </button>


                    <button

                      type="button"

                      className="review-confirm-reject"

                      onClick={
                        handleReject
                      }

                      disabled={
                        actionLoading
                      }

                    >

                      <XCircle
                        size={16}
                      />


                      Confirm Rejection

                    </button>


                  </div>


                </div>

              )}


            </section>


          </>

        )}


      {/* EMPTY SELECTION */}

      {!loading &&
        !loadingArticle &&
        !selected &&
        queue.length > 0 && (

          <section className="editorial-content-card">


            <div className="editorial-empty">


              <Eye
                size={32}
              />


              <strong>

                Select a publication

              </strong>


              <span>

                Choose any publication from
                the queue above to open its
                complete editorial review.

              </span>


            </div>


          </section>

        )}


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