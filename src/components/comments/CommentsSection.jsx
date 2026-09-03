import React, {

  useEffect,

  useMemo,

  useState,

} from "react";


import {

  MessageCircle,

  Send,

  User,

  LogIn,

  RefreshCw,

} from "lucide-react";


import {

  useNavigate,

} from "react-router-dom";


import {

  useAuth,

} from "../../context/AuthContext";


import {

  addComment,

  getNewsComments,

} from "../../services/comments/commentService";


function formatDate(

  value

) {


  if (!value) {

    return "Just now";

  }


  let date;


  if (

    typeof value?.toDate ===

    "function"

  ) {


    date =

      value.toDate();


  } else {


    date =

      new Date(

        value

      );

  }


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

      hour: "numeric",

      minute: "2-digit",

    }

  ).format(

    date

  );

}


export default function CommentsSection({

  newsId,

}) {


  const navigate =

    useNavigate();


  const auth =

    useAuth();


  const currentUser =

    auth?.user || null;


  const [

    comments,

    setComments,

  ] = useState([]);


  const [

    loading,

    setLoading,

  ] = useState(true);


  const [

    submitting,

    setSubmitting,

  ] = useState(false);


  const [

    commentText,

    setCommentText,

  ] = useState("");


  const [

    error,

    setError,

  ] = useState("");


  const [

    message,

    setMessage,

  ] = useState("");


  async function loadComments() {


    if (!newsId) {


      setComments([]);

      setLoading(false);

      return;

    }


    try {


      setLoading(true);

      setError("");


      const result =

        await getNewsComments(

          newsId

        );


      setComments(

        Array.isArray(result)

          ? result

          : []

      );


    } catch (loadError) {


      console.error(

        "Unable to load comments:",

        loadError

      );


      setError(

        loadError?.message ||

        "Unable to load comments."

      );


    } finally {


      setLoading(false);

    }

  }


  useEffect(() => {


    loadComments();


  }, [

    newsId,

  ]);


  const approvedComments =

    useMemo(

      () =>

        comments.filter(

          (comment) => {


            const status =

              String(

                comment?.status ||

                ""

              ).toUpperCase();


            return (

              status ===

              "APPROVED"

            );


          }

        ),

      [

        comments,

      ]

    );


  function getUserName() {


    return (

      currentUser?.displayName ||

      currentUser?.name ||

      currentUser?.email

        ?.split("@")[0] ||

      "NewsRoom Reader"

    );

  }


  function redirectToLogin() {


    navigate(

      "/login",

      {

        state: {

          from:

            `/news/${newsId}`,

        },

      }

    );

  }


  async function handleSubmit(

    event

  ) {


    event.preventDefault();


    const text =

      commentText.trim();


    if (!text) {


      setError(

        "Please write a comment."

      );


      return;

    }


    if (

      !currentUser?.uid

    ) {


      redirectToLogin();

      return;

    }


    try {


      setSubmitting(true);

      setError("");

      setMessage("");


      await addComment({

        userId:

          currentUser.uid,


        userName:

          getUserName(),


        newsId,


        text,

      });


      setCommentText("");


      setMessage(

        "Your comment has been submitted for moderation."

      );


      await loadComments();


    } catch (submitError) {


      console.error(

        "Unable to submit comment:",

        submitError

      );


      setError(

        submitError?.message ||

        "Unable to submit your comment."

      );


    } finally {


      setSubmitting(false);

    }

  }


  return (

    <section
      className="comments-section"
    >


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="comments-heading"
      >


        <div>


          <span
            className="comments-eyebrow"
          >

            COMMUNITY

          </span>


          <h2>


            <MessageCircle
              size={25}
            />


            Comments


            <span>

              {approvedComments.length}

            </span>


          </h2>


          <p>

            Join the discussion and share your thoughts.

          </p>


        </div>


        <button

          type="button"

          className="comments-refresh"

          onClick={

            loadComments

          }

          disabled={

            loading

          }

          title="Refresh comments"

        >


          <RefreshCw

            size={17}

          />


        </button>


      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div
          className="comments-error"
        >

          {error}

        </div>

      )}


      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {message && (

        <div
          className="comments-success"
        >

          {message}

        </div>

      )}


      {/* =====================================================
          COMMENT FORM
      ===================================================== */}

      {currentUser?.uid

        ? (

          <form

            className="comment-form"

            onSubmit={

              handleSubmit

            }

          >


            <div
              className="comment-user-avatar"
            >


              <User
                size={20}
              />


            </div>


            <div
              className="comment-form-body"
            >


              <textarea

                value={

                  commentText

                }

                onChange={

                  (event) =>

                    setCommentText(

                      event.target.value

                    )

                }

                placeholder="Share your thoughts about this story..."

                rows={4}

                maxLength={1000}

                disabled={

                  submitting

                }

              />


              <div
                className="comment-form-footer"
              >


                <small>

                  {commentText.length}/1000

                </small>


                <button

                  type="submit"

                  disabled={

                    submitting ||

                    !commentText.trim()

                  }

                >


                  <Send
                    size={16}
                  />


                  {submitting

                    ? "Submitting..."

                    : "Post Comment"}


                </button>


              </div>


            </div>


          </form>

        )

        : (

          <div
            className="comment-login-card"
          >


            <div>


              <User
                size={22}
              />


              <div>


                <strong>

                  Join the conversation

                </strong>


                <p>

                  Sign in to share your thoughts and comments.

                </p>


              </div>


            </div>


            <button

              type="button"

              onClick={

                redirectToLogin

              }

            >


              <LogIn
                size={16}
              />


              Sign In


            </button>


          </div>

        )}


      {/* =====================================================
          COMMENTS
      ===================================================== */}

      <div
        className="comments-list"
      >


        {loading

          ? (

            <div
              className="comments-loading"
            >


              <RefreshCw

                size={22}

                className="spin"

              />


              Loading comments...


            </div>

          )

          : approvedComments.length ===

            0

            ? (

              <div
                className="comments-empty"
              >


                <MessageCircle
                  size={34}
                />


                <h3>

                  No comments yet

                </h3>


                <p>

                  Be the first person to start the discussion.

                </p>


              </div>

            )

            : (

              approvedComments.map(

                (comment) => (


                  <article

                    key={

                      comment.id

                    }

                    className="comment-item"

                  >


                    <div
                      className="comment-avatar"
                    >


                      {

                        String(

                          comment.userName ||

                          "U"

                        )

                          .charAt(0)

                          .toUpperCase()

                      }


                    </div>


                    <div
                      className="comment-content"
                    >


                      <div
                        className="comment-top"
                      >


                        <strong>

                          {comment.userName ||

                            "NewsRoom Reader"}

                        </strong>


                        <span>

                          {formatDate(

                            comment.createdAt

                          )}

                        </span>


                      </div>


                      <p>

                        {comment.text}

                      </p>


                    </div>


                  </article>

                )

              )

            )}


      </div>


    </section>

  );


}