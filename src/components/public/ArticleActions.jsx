import React, {

  useEffect,

  useState,

} from "react";


import {

  Heart,

  Bookmark,

  Share2,

  Check,

} from "lucide-react";


import {

  useNavigate,

} from "react-router-dom";


import {

  useAuth,

} from "../../context/AuthContext";


import {

  hasLiked,

  toggleLike,

} from "../../services/likes/likeService";


export default function ArticleActions({

  article,

}) {


  const navigate =

    useNavigate();


  const auth =

    useAuth();


  const currentUser =

    auth?.user || null;


  const [

    liked,

    setLiked,

  ] = useState(false);


  const [

    likeLoading,

    setLikeLoading,

  ] = useState(false);


  const [

    likeCount,

    setLikeCount,

  ] = useState(

    Number(

      article?.likesCount ||

      article?.likeCount ||

      0

    )

  );


  const [

    shareMessage,

    setShareMessage,

  ] = useState("");


  const articleId =

    article?.id;


  useEffect(() => {


    setLikeCount(

      Number(

        article?.likesCount ||

        article?.likeCount ||

        0

      )

    );


  }, [

    article?.likesCount,

    article?.likeCount,

  ]);


  useEffect(() => {


    let mounted = true;


    async function loadLikeStatus() {


      if (

        !articleId ||

        !currentUser?.uid

      ) {


        if (mounted) {

          setLiked(false);

        }


        return;

      }


      try {


        const result =

          await hasLiked(

            currentUser.uid,

            articleId

          );


        if (mounted) {

          setLiked(

            Boolean(result)

          );

        }


      } catch (error) {


        console.warn(

          "Unable to load like status:",

          error

        );

      }


    }


    loadLikeStatus();


    return () => {

      mounted = false;

    };


  }, [

    articleId,

    currentUser?.uid,

  ]);


  function redirectToLogin() {


    navigate(

      "/login",

      {

        state: {

          from:

            `/news/${articleId}`,

        },

      }

    );

  }


  async function handleLike() {


    if (!articleId) {

      return;

    }


    if (!currentUser?.uid) {


      redirectToLogin();

      return;

    }


    try {


      setLikeLoading(true);


      const result =

        await toggleLike(

          currentUser.uid,

          articleId

        );


      if (

        result?.liked

      ) {


        setLiked(true);


        setLikeCount(

          (previous) =>

            previous + 1

        );


      } else {


        setLiked(false);


        setLikeCount(

          (previous) =>

            Math.max(

              0,

              previous - 1

            )

        );

      }


    } catch (error) {


      console.error(

        "Unable to update like:",

        error

      );


    } finally {


      setLikeLoading(false);

    }

  }


  function handleSave() {


    if (!currentUser?.uid) {


      redirectToLogin();

      return;

    }


    /*
    --------------------------------------------------------

    Bookmark system will be connected later.

    Currently this button provides the public UI.

    --------------------------------------------------------
    */


    window.alert(

      "Bookmark functionality will be available soon."

    );

  }


  async function handleShare() {


    const shareUrl =

      window.location.href;


    try {


      if (

        navigator.share

      ) {


        await navigator.share({

          title:

            article?.title ||

            "NewsRoom",


          text:

            article?.summary ||

            "",


          url:

            shareUrl,

        });


        return;

      }


      if (

        navigator.clipboard

      ) {


        await navigator.clipboard.writeText(

          shareUrl

        );


        setShareMessage(

          "Copied!"

        );


        window.setTimeout(

          () => {

            setShareMessage("");

          },

          2500

        );

      }


    } catch (error) {


      if (

        error?.name !==

        "AbortError"

      ) {


        console.warn(

          "Unable to share article:",

          error

        );

      }

    }

  }


  return (

    <div
      className="article-actions"
    >


      {/* LIKE */}

      <button

        type="button"

        className={

          liked

            ? "article-action article-action-active"

            : "article-action"

        }

        onClick={

          handleLike

        }

        disabled={

          likeLoading

        }

      >


        <Heart

          size={19}

          fill={

            liked

              ? "currentColor"

              : "none"

          }

        />


        <span>

          {liked

            ? "Liked"

            : "Like"}

        </span>


        {likeCount > 0 && (

          <small>

            {likeCount}

          </small>

        )}


      </button>


      {/* SAVE */}

      <button

        type="button"

        className="article-action"

        onClick={

          handleSave

        }

      >


        <Bookmark
          size={19}
        />


        <span>

          Save

        </span>


      </button>


      {/* SHARE */}

      <button

        type="button"

        className="article-action"

        onClick={

          handleShare

        }

      >


        {shareMessage

          ? (

            <Check
              size={19}
            />

          )

          : (

            <Share2
              size={19}
            />

          )}


        <span>

          {shareMessage ||

            "Share"}

        </span>


      </button>


    </div>

  );


}