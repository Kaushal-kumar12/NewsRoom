// src/pages/shared/WorkspaceNewsEditorPage.jsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Eye,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  Quote,
  Save,
  Send,
  Trash2,
  Type,
  Video,
  Youtube,
} from "lucide-react";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  createAuthorStory,
  getAuthorStory,
  submitAuthorStory,
  updateAuthorStory,
} from "../../services/news/newsServices";

import {
  createNewsDraft,
  getNewsById,
  submitNewsForReview,
  updateNewsDraft,
} from "../../services/editorial/newsWorkflowService";

import "../../styles/workspaceNewsEditor.css";


/* ============================================================
   BLOCK TYPES
============================================================ */

const BLOCK_TYPES = [

  {
    type: "paragraph",
    label: "Paragraph",
    icon: Type,
    description: "Normal article text",
  },

  {
    type: "heading",
    label: "Heading",
    icon: Type,
    description: "Section heading",
  },

  {
    type: "image",
    label: "Image",
    icon: ImageIcon,
    description: "Article image",
  },

  {
    type: "youtube",
    label: "YouTube",
    icon: Youtube,
    description: "YouTube video",
  },

  {
    type: "video",
    label: "Video",
    icon: Video,
    description: "Video URL",
  },

  {
    type: "quote",
    label: "Quote",
    icon: Quote,
    description: "Important quotation",
  },

  {
    type: "link",
    label: "Link",
    icon: LinkIcon,
    description: "External link",
  },

  {
    type: "divider",
    label: "Divider",
    icon: FileText,
    description: "Section separator",
  },

];


/* ============================================================
   CREATE BLOCK
============================================================ */

function createBlock(type) {

  const id =
    `${type}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;


  switch (type) {

    case "heading":

      return {

        id,

        type: "heading",

        text: "",

        level: 2,

      };


    case "image":

      return {

        id,

        type: "image",

        url: "",

        caption: "",

        alt: "",

      };


    case "youtube":

      return {

        id,

        type: "youtube",

        url: "",

        title: "",

      };


    case "video":

      return {

        id,

        type: "video",

        url: "",

        title: "",

      };


    case "quote":

      return {

        id,

        type: "quote",

        text: "",

        author: "",

      };


    case "link":

      return {

        id,

        type: "link",

        label: "",

        url: "",

      };


    case "divider":

      return {

        id,

        type: "divider",

      };


    case "paragraph":

    default:

      return {

        id,

        type: "paragraph",

        text: "",

      };

  }

}


/* ============================================================
   DEFAULT ARTICLE
============================================================ */

function createDefaultArticle() {

  return {

    title: "",

    subtitle: "",

    summary: "",

    category: "General",

    subcategory: "",

    tags: [],

    featuredImage: "",

    blocks: [

      createBlock(
        "paragraph"
      ),

    ],

    status: "DRAFT",

  };

}


/* ============================================================
   YOUTUBE HELPER
============================================================ */

function getYouTubeId(
  url = ""
) {

  if (!url) {

    return "";

  }


  try {

    const parsed =
      new URL(url);


    const hostname =
      parsed.hostname
        .replace(
          "www.",
          ""
        )
        .toLowerCase();


    if (
      hostname ===
      "youtu.be"
    ) {

      return parsed.pathname
        .replace(
          "/",
          ""
        )
        .split("/")
        .filter(Boolean)[0] || "";

    }


    if (
      hostname.includes(
        "youtube.com"
      )
    ) {

      const videoId =
        parsed.searchParams.get(
          "v"
        );

      if (videoId) {

        return videoId;

      }


      const parts =
        parsed.pathname
          .split("/")
          .filter(Boolean);


      if (
        parts.includes("embed") ||
        parts.includes("shorts")
      ) {

        return (
          parts[
            parts.length - 1
          ] || ""
        );

      }


      return (
        parts[
          parts.length - 1
        ] || ""
      );

    }


    return "";

  } catch {

    return "";

  }

}


/* ============================================================
   NORMALIZE BLOCKS
============================================================ */

function normalizeBlocks(
  blocks
) {

  if (
    !Array.isArray(blocks) ||
    blocks.length === 0
  ) {

    return [

      createBlock(
        "paragraph"
      ),

    ];

  }


  return blocks.map(
    (block, index) => ({

      ...block,

      id:
        block.id ||
        `${block.type || "paragraph"}-${Date.now()}-${index}`,

      type:
        block.type ||
        "paragraph",

    })
  );

}


/* ============================================================
   COMPONENT
============================================================ */

export default function WorkspaceNewsEditorPage({

  mode = "author",

}) {

  const navigate =
    useNavigate();


  const params =
    useParams();


  /*
  |--------------------------------------------------------------------------
  | ARTICLE ID
  |--------------------------------------------------------------------------
  |
  | Author route:
  |
  | /author/edit/:storyId
  |
  | Editor route:
  |
  | /editor/edit/:newsId
  |
  */

  const articleId =
    params.storyId ||
    params.newsId ||
    "";


  const editing =
    Boolean(articleId);


  /*
  |--------------------------------------------------------------------------
  | AUTH
  |--------------------------------------------------------------------------
  */

  const {

    user,

    firebaseUser,

  } = useAuth();


  const activeUser =
    firebaseUser ||
    user;


  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [

    article,

    setArticle,

  ] = useState(
    createDefaultArticle()
  );


  const [

    loading,

    setLoading,

  ] = useState(editing);


  const [

    saving,

    setSaving,

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

    showBlockMenu,

    setShowBlockMenu,

  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | WORKFLOW USER
  |--------------------------------------------------------------------------
  */

  const workflowUser =
    useMemo(() => {

      const uid =
        activeUser?.uid ||
        activeUser?.id ||
        "";


      if (!uid) {

        return null;

      }


      const name =

        activeUser?.displayName ||

        activeUser?.name ||

        activeUser?.email ||

        (
          mode === "editor"

            ? "Editor"

            : "Author"
        );


      return {

        ...(activeUser || {}),

        uid,

        id: uid,

        name,

        displayName: name,

        role:

          mode === "editor"

            ? "EDITOR"

            : "AUTHOR",

        roleName:

          mode === "editor"

            ? "EDITOR"

            : "AUTHOR",

      };

    }, [

      activeUser,

      mode,

    ]);


  /*
  |--------------------------------------------------------------------------
  | PATHS
  |--------------------------------------------------------------------------
  */

  const basePath =
    mode === "editor"

      ? "/editor"

      : "/author";


  const backPath =
    mode === "editor"

      ? "/editor/dashboard"

      : "/author/stories";


  /*
  |--------------------------------------------------------------------------
  | LOAD ARTICLE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    let mounted =
      true;


    if (!editing) {

      setLoading(false);

      return undefined;

    }


    if (!workflowUser?.uid) {

      setLoading(false);

      return undefined;

    }


    async function loadArticle() {

      try {

        if (mounted) {

          setLoading(true);

          setError("");

          setMessage("");

        }


        let story =
          null;


        /*
        --------------------------------------------------------
        AUTHOR
        --------------------------------------------------------
        */

        if (
          mode === "author"
        ) {

          story =
            await getAuthorStory(

              articleId,

              workflowUser.uid

            );

        }


        /*
        --------------------------------------------------------
        EDITOR
        --------------------------------------------------------
        */

        else {

          story =
            await getNewsById(
              articleId
            );

        }


        if (!story) {

          throw new Error(
            "Article was not found."
          );

        }


        if (!mounted) {

          return;

        }


        setArticle({

          title:

            story.title ||

            story.headline ||

            "",


          subtitle:

            story.subtitle ||

            story.subheadline ||

            "",


          summary:

            story.summary ||

            story.excerpt ||

            "",


          category:

            story.category ||

            "General",


          subcategory:

            story.subcategory ||

            "",


          tags:

            Array.isArray(
              story.tags
            )

              ? story.tags

              : [],


          featuredImage:

            story.featuredImage ||

            story.featuredImageUrl ||

            story.image ||

            "",


          blocks:

            normalizeBlocks(
              story.blocks
            ),


          status:

            story.status ||

            "DRAFT",

        });


      } catch (err) {

        console.error(
          "Article loading error:",
          err
        );


        if (mounted) {

          setError(

            err?.message ||

            "Unable to load article."

          );

        }

      } finally {

        if (mounted) {

          setLoading(false);

        }

      }

    }


    loadArticle();


    return () => {

      mounted =
        false;

    };

  }, [

    editing,

    articleId,

    workflowUser?.uid,

    mode,

  ]);


  /*
  |--------------------------------------------------------------------------
  | PAYLOAD
  |--------------------------------------------------------------------------
  */

  const payload =
    useMemo(() => {

      const content =

        article.blocks

          .filter(
            (block) =>
              block.type ===
              "paragraph"
          )

          .map(
            (block) =>
              block.text ||
              ""
          )

          .filter(Boolean)

          .join(
            "\n\n"
          );


      const hasMedia =

        article.blocks.some(
          (block) =>

            [

              "image",

              "youtube",

              "video",

            ].includes(
              block.type
            )
        );


      return {

        title:
          article.title.trim(),

        headline:
          article.title.trim(),


        subtitle:
          article.subtitle.trim(),

        subheadline:
          article.subtitle.trim(),


        summary:
          article.summary.trim(),

        excerpt:
          article.summary.trim(),


        content,


        category:
          article.category.trim(),


        subcategory:
          article.subcategory.trim(),


        tags:

          Array.isArray(
            article.tags
          )

            ? article.tags

            : [],


        featuredImage:
          article.featuredImage.trim(),


        featuredImageUrl:
          article.featuredImage.trim(),


        image:
          article.featuredImage.trim(),


        blocks:
          article.blocks,


        contentType:

          hasMedia

            ? "MULTIMEDIA"

            : "WRITTEN",

      };

    }, [

      article,

    ]);


  /*
  |--------------------------------------------------------------------------
  | VALIDATION
  |--------------------------------------------------------------------------
  */

  function validateArticle() {

    if (
      !article.title.trim()
    ) {

      return (
        "Headline is required."
      );

    }


    if (
      !article.category.trim()
    ) {

      return (
        "Category is required."
      );

    }


    if (
      !article.summary.trim()
    ) {

      return (
        "Summary is required."
      );

    }


    const hasContent =
      article.blocks.some(
        (block) => {

          if (
            block.type ===
            "paragraph"
          ) {

            return Boolean(
              block.text?.trim()
            );

          }


          if (
            block.type ===
            "heading"
          ) {

            return Boolean(
              block.text?.trim()
            );

          }


          if (
            block.type ===
            "quote"
          ) {

            return Boolean(
              block.text?.trim()
            );

          }


          if (
            block.type ===
            "divider"
          ) {

            return true;

          }


          if (
            block.type ===
            "link"
          ) {

            return Boolean(
              block.label?.trim() ||
              block.url?.trim()
            );

          }


          return Boolean(
            block.url?.trim()
          );

        }
      );


    if (!hasContent) {

      return (
        "Please add article content."
      );

    }


    return "";

  }


  /*
  |--------------------------------------------------------------------------
  | UPDATE ARTICLE
  |--------------------------------------------------------------------------
  */

  function updateArticle(
    field,
    value
  ) {

    setArticle(
      (previous) => ({

        ...previous,

        [field]: value,

      })
    );

  }


  /*
  |--------------------------------------------------------------------------
  | UPDATE TAGS
  |--------------------------------------------------------------------------
  */

  function updateTags(
    value
  ) {

    const tags =
      value

        .split(",")

        .map(
          (tag) =>
            tag.trim()
        )

        .filter(Boolean);


    updateArticle(

      "tags",

      tags

    );

  }


  /*
  |--------------------------------------------------------------------------
  | ADD BLOCK
  |--------------------------------------------------------------------------
  */

  function addBlock(
    type
  ) {

    setArticle(
      (previous) => ({

        ...previous,

        blocks: [

          ...previous.blocks,

          createBlock(type),

        ],

      })
    );


    setShowBlockMenu(
      false
    );

  }


  /*
  |--------------------------------------------------------------------------
  | UPDATE BLOCK
  |--------------------------------------------------------------------------
  */

  function updateBlock(

    blockId,

    field,

    value

  ) {

    setArticle(
      (previous) => ({

        ...previous,

        blocks:

          previous.blocks.map(
            (block) =>

              block.id ===
              blockId

                ? {

                    ...block,

                    [field]: value,

                  }

                : block
          ),

      })
    );

  }


  /*
  |--------------------------------------------------------------------------
  | REMOVE BLOCK
  |--------------------------------------------------------------------------
  */

  function removeBlock(
    blockId
  ) {

    setArticle(
      (previous) => {

        /*
        --------------------------------------------------------
        Do not allow the user to remove
        the final remaining block.
        --------------------------------------------------------
        */

        if (
          previous.blocks.length <= 1
        ) {

          return {

            ...previous,

            blocks: [

              createBlock(
                "paragraph"
              ),

            ],

          };

        }


        return {

          ...previous,

          blocks:

            previous.blocks.filter(
              (block) =>

                block.id !==
                blockId
            ),

        };

      }
    );

  }


  /*
  |--------------------------------------------------------------------------
  | MOVE BLOCK
  |--------------------------------------------------------------------------
  */

  function moveBlock(

    index,

    direction

  ) {

    setArticle(
      (previous) => {

        const blocks =
          [...previous.blocks];


        const newIndex =
          index +
          direction;


        if (

          newIndex < 0 ||

          newIndex >=
            blocks.length

        ) {

          return previous;

        }


        [

          blocks[index],

          blocks[newIndex],

        ] = [

          blocks[newIndex],

          blocks[index],

        ];


        return {

          ...previous,

          blocks,

        };

      }
    );

  }


  /*
  |--------------------------------------------------------------------------
  | SAVE DRAFT
  |--------------------------------------------------------------------------
  */

  async function saveDraft() {

    try {

      setSaving(true);

      setError("");

      setMessage("");


      if (!workflowUser) {

        throw new Error(
          "You are not authenticated."
        );

      }


      let currentId =
        articleId;


      /*
      ----------------------------------------------------------
      AUTHOR
      ----------------------------------------------------------
      */

      if (
        mode === "author"
      ) {

        if (currentId) {

          await updateAuthorStory(

            currentId,

            payload,

            workflowUser

          );

        } else {

          const created =
            await createAuthorStory(

              payload,

              workflowUser

            );


          currentId =

            created?.id ||

            created;

        }

      }


      /*
      ----------------------------------------------------------
      EDITOR
      ----------------------------------------------------------
      */

      else {

        if (currentId) {

          await updateNewsDraft(

            currentId,

            payload,

            workflowUser

          );

        } else {

          const created =
            await createNewsDraft(

              payload,

              workflowUser

            );


          currentId =

            created?.id ||

            created;

        }

      }


      if (!currentId) {

        throw new Error(
          "Unable to create draft."
        );

      }


      setArticle(
        (previous) => ({

          ...previous,

          status: "DRAFT",

        })
      );


      setMessage(

        mode === "editor"

          ? "News draft saved successfully."

          : "Story draft saved successfully."

      );


      /*
      ----------------------------------------------------------
      NEW ARTICLE
      ----------------------------------------------------------
      */

      if (!articleId) {

        navigate(

          `${basePath}/edit/${currentId}`,

          {

            replace: true,

          }

        );

      }


    } catch (err) {

      console.error(
        "Save draft error:",
        err
      );


      setError(

        err?.message ||

        "Unable to save draft."

      );

    } finally {

      setSaving(false);

    }

  }


  /*
  |--------------------------------------------------------------------------
  | SUBMIT FOR REVIEW
  |--------------------------------------------------------------------------
  */

  async function submitForReview() {

    const validation =
      validateArticle();


    if (validation) {

      setError(
        validation
      );

      return;

    }


    try {

      setSaving(true);

      setError("");

      setMessage("");


      if (!workflowUser) {

        throw new Error(
          "You are not authenticated."
        );

      }


      let currentId =
        articleId;


      /*
      ==========================================================
      AUTHOR WORKFLOW

      DRAFT
         ↓
      SUBMITTED
      ==========================================================
      */

      if (
        mode === "author"
      ) {

        if (currentId) {

          await updateAuthorStory(

            currentId,

            payload,

            workflowUser

          );

        } else {

          const created =
            await createAuthorStory(

              payload,

              workflowUser

            );


          currentId =

            created?.id ||

            created;

        }


        if (!currentId) {

          throw new Error(
            "Unable to create story."
          );

        }


        await submitAuthorStory(

          currentId,

          workflowUser

        );

      }


      /*
      ==========================================================
      EDITOR WORKFLOW

      DRAFT
         ↓
      PENDING ADMIN REVIEW

      IMPORTANT:

      Editor does NOT publish directly here.
      ==========================================================
      */

      else {

        if (currentId) {

          await updateNewsDraft(

            currentId,

            payload,

            workflowUser

          );

        } else {

          const created =
            await createNewsDraft(

              payload,

              workflowUser

            );


          currentId =

            created?.id ||

            created;

        }


        if (!currentId) {

          throw new Error(
            "Unable to create news."
          );

        }


        await submitNewsForReview(

          currentId,

          workflowUser

        );

      }


      /*
      ----------------------------------------------------------
      UPDATE LOCAL STATUS
      ----------------------------------------------------------
      */

      const newStatus =

        mode === "editor"

          ? "PENDING_ADMIN_REVIEW"

          : "SUBMITTED";


      setArticle(
        (previous) => ({

          ...previous,

          status: newStatus,

        })
      );


      setMessage(

        mode === "editor"

          ? "News sent successfully for admin review."

          : "Story submitted successfully for review."

      );


      /*
      ----------------------------------------------------------
      NEW ARTICLE
      ----------------------------------------------------------
      */

      if (!articleId) {

        navigate(

          `${basePath}/edit/${currentId}`,

          {

            replace: true,

          }

        );

      }


    } catch (err) {

      console.error(
        "Submit article error:",
        err
      );


      setError(

        err?.message ||

        "Unable to send article for review."

      );

    } finally {

      setSaving(false);

    }

  }


  /*
  |--------------------------------------------------------------------------
  | PREVIEW
  |--------------------------------------------------------------------------
  */

  function previewArticle() {

    if (!articleId) {

      setError(
        "Please save the draft first before previewing."
      );

      return;

    }


    /*
    ------------------------------------------------------------
    CURRENT ROUTES

    AUTHOR:
    /author/news/:newsId/preview

    EDITOR:
    /editor/news/:newsId/preview
    ------------------------------------------------------------
    */

    navigate(

      `${basePath}/news/${articleId}/preview`

    );

  }


  /*
  |--------------------------------------------------------------------------
  | LOCKED STATUS
  |--------------------------------------------------------------------------
  */

  const locked =
    [

      "SUBMITTED",

      "PENDING_ADMIN_REVIEW",

      "PENDING_SUPERADMIN_REVIEW",

      "APPROVED",

      "SCHEDULED",

      "PUBLISHED",

    ].includes(
      String(
        article.status ||
        ""
      ).toUpperCase()
    );


  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {

    return (

      <div
        className="workspace-editor-page"
        style={{

          width: "100%",

          maxWidth: "100%",

          minWidth: 0,

        }}
      >

        <div className="workspace-editor-loading">

          Loading editor...

        </div>

      </div>

    );

  }


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (

    <div
      className="workspace-editor-page"
      style={{

        width: "100%",

        maxWidth: "100%",

        minWidth: 0,

        overflowX: "hidden",

      }}
    >


      {/* ======================================================
          HEADER
      ====================================================== */}

      <header
        className="workspace-editor-header"
        style={{

          width: "100%",

          maxWidth: "100%",

          minWidth: 0,

        }}
      >

        <div
          style={{

            minWidth: 0,

          }}
        >

          <button
            type="button"
            className="workspace-editor-back"
            onClick={() =>
              navigate(backPath)
            }
          >

            <ArrowLeft size={17} />

            Back

          </button>


          <span className="workspace-editor-eyebrow">

            {mode === "editor"

              ? "EDITORIAL NEWS"

              : "AUTHOR STORY"}

          </span>


          <h1>

            {editing

              ? (

                mode === "editor"

                  ? "Edit News"

                  : "Edit Story"

              )

              : (

                mode === "editor"

                  ? "Create News"

                  : "Create Story"

              )}

          </h1>


          <p>

            Create and manage your content
            using flexible editorial blocks.

          </p>

        </div>


        <div className="workspace-editor-status">

          {article.status || "DRAFT"}

        </div>

      </header>


      {/* ======================================================
          MESSAGES
      ====================================================== */}

      {message && (

        <div className="workspace-editor-success">

          {message}

        </div>

      )}


      {error && (

        <div className="workspace-editor-error">

          {error}

        </div>

      )}


      {locked && (

        <div className="workspace-editor-info">

          This article is currently in the
          review or publication workflow and
          cannot be edited.

        </div>

      )}


      {/* ======================================================
          BASIC INFORMATION
      ====================================================== */}

      <section
        className="workspace-editor-card"
        style={{

          width: "100%",

          maxWidth: "100%",

          minWidth: 0,

        }}
      >

        <div className="workspace-card-heading">

          <div>

            <h2>

              {mode === "editor"

                ? "News Information"

                : "Story Information"}

            </h2>


            <p>

              Add the basic details of
              your article.

            </p>

          </div>

        </div>


        <div
          className="workspace-form-grid"
          style={{

            minWidth: 0,

            width: "100%",

          }}
        >


          {/* HEADLINE */}

          <label className="workspace-field workspace-field-full">

            Headline

            <input
              type="text"
              disabled={locked}
              value={article.title}
              placeholder="Enter headline"
              onChange={(event) =>
                updateArticle(

                  "title",

                  event.target.value

                )
              }
            />

          </label>


          {/* SUBHEADLINE */}

          <label className="workspace-field workspace-field-full">

            Subheadline

            <input
              type="text"
              disabled={locked}
              value={article.subtitle}
              placeholder="Optional subheadline"
              onChange={(event) =>
                updateArticle(

                  "subtitle",

                  event.target.value

                )
              }
            />

          </label>


          {/* CATEGORY */}

          <label className="workspace-field">

            Category

            <input
              type="text"
              disabled={locked}
              value={article.category}
              placeholder="Technology"
              onChange={(event) =>
                updateArticle(

                  "category",

                  event.target.value

                )
              }
            />

          </label>


          {/* SUBCATEGORY */}

          <label className="workspace-field">

            Subcategory

            <input
              type="text"
              disabled={locked}
              value={article.subcategory}
              placeholder="Optional"
              onChange={(event) =>
                updateArticle(

                  "subcategory",

                  event.target.value

                )
              }
            />

          </label>


          {/* FEATURED IMAGE */}

          <label className="workspace-field workspace-field-full">

            Featured Image URL

            <input
              type="url"
              disabled={locked}
              value={article.featuredImage}
              placeholder="https://..."
              onChange={(event) =>
                updateArticle(

                  "featuredImage",

                  event.target.value

                )
              }
            />

          </label>


          {/* TAGS */}

          <label className="workspace-field workspace-field-full">

            Tags

            <input
              type="text"
              disabled={locked}
              value={
                article.tags.join(", ")
              }
              placeholder="news, india, technology"
              onChange={(event) =>
                updateTags(
                  event.target.value
                )
              }
            />

          </label>


          {/* SUMMARY */}

          <label className="workspace-field workspace-field-full">

            Summary

            <textarea
              rows={4}
              disabled={locked}
              value={article.summary}
              placeholder="Write a short summary..."
              onChange={(event) =>
                updateArticle(

                  "summary",

                  event.target.value

                )
              }
            />

          </label>

        </div>

      </section>


      {/* ======================================================
          ARTICLE CONTENT
      ====================================================== */}

      <section
        className="workspace-editor-card"
        style={{

          width: "100%",

          maxWidth: "100%",

          minWidth: 0,

          overflow: "visible",

        }}
      >


        {/* ====================================================
            CONTENT HEADER

            ADD BLOCK IS REMOVED FROM HERE
        ==================================================== */}

        <div className="workspace-card-heading">

          <div>

            <h2>

              Article Content

            </h2>


            <p>

              Build your article using
              content blocks.

            </p>

          </div>

        </div>


        {/* ====================================================
            BLOCK LIST
        ==================================================== */}

        <div
          className="workspace-block-list"
          style={{

            width: "100%",

            maxWidth: "100%",

            minWidth: 0,

          }}
        >

          {article.blocks.map(

            (

              block,

              index

            ) => (

              <div
                key={block.id}
                className="workspace-content-block"
                style={{

                  width: "100%",

                  maxWidth: "100%",

                  minWidth: 0,

                }}
              >


                {/* ============================================
                    BLOCK HEADER
                ============================================ */}

                <div className="workspace-block-header">

                  <span>

                    {String(
                      block.type
                    )
                      .replace(
                        /^./,
                        (character) =>
                          character.toUpperCase()
                      )}

                  </span>


                  {!locked && (

                    <div className="workspace-block-actions">


                      {/* MOVE UP */}

                      <button
                        type="button"
                        disabled={
                          index === 0
                        }
                        onClick={() =>
                          moveBlock(

                            index,

                            -1

                          )
                        }
                        aria-label="Move block up"
                      >

                        <ArrowUp size={16} />

                      </button>


                      {/* MOVE DOWN */}

                      <button
                        type="button"
                        disabled={
                          index ===
                          article.blocks.length - 1
                        }
                        onClick={() =>
                          moveBlock(

                            index,

                            1

                          )
                        }
                        aria-label="Move block down"
                      >

                        <ArrowDown size={16} />

                      </button>


                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() =>
                          removeBlock(
                            block.id
                          )
                        }
                        aria-label="Delete block"
                      >

                        <Trash2 size={16} />

                      </button>

                    </div>

                  )}

                </div>


                {/* ============================================
                    PARAGRAPH
                ============================================ */}

                {block.type ===
                  "paragraph" && (

                  <textarea
                    rows={8}
                    disabled={locked}
                    value={
                      block.text ||
                      ""
                    }
                    placeholder="Write article content..."
                    onChange={(event) =>
                      updateBlock(

                        block.id,

                        "text",

                        event.target.value

                      )
                    }
                  />

                )}


                {/* ============================================
                    HEADING
                ============================================ */}

                {block.type ===
                  "heading" && (

                  <div className="workspace-block-fields">


                    <select
                      disabled={locked}
                      value={
                        block.level ||
                        2
                      }
                      onChange={(event) =>
                        updateBlock(

                          block.id,

                          "level",

                          Number(
                            event.target.value
                          )

                        )
                      }
                    >

                      <option value={2}>

                        Heading 2

                      </option>

                      <option value={3}>

                        Heading 3

                      </option>

                      <option value={4}>

                        Heading 4

                      </option>

                    </select>


                    <input
                      type="text"
                      disabled={locked}
                      value={
                        block.text ||
                        ""
                      }
                      placeholder="Section heading"
                      onChange={(event) =>
                        updateBlock(

                          block.id,

                          "text",

                          event.target.value

                        )
                      }
                    />

                  </div>

                )}


                {/* ============================================
                    IMAGE
                ============================================ */}

                {block.type ===
                  "image" && (

                  <div className="workspace-block-fields">


                    <input
                      type="url"
                      disabled={locked}
                      value={
                        block.url ||
                        ""
                      }
                      placeholder="Image URL"
                      onChange={(event) =>
                        updateBlock(

                          block.id,

                          "url",

                          event.target.value

                        )
                      }
                    />


                    <input
                      type="text"
                      disabled={locked}
                      value={
                        block.alt ||
                        ""
                      }
                      placeholder="Image alt text"
                      onChange={(event) =>
                        updateBlock(

                          block.id,

                          "alt",

                          event.target.value

                        )
                      }
                    />


                    <input
                      type="text"
                      disabled={locked}
                      value={
                        block.caption ||
                        ""
                      }
                      placeholder="Image caption"
                      onChange={(event) =>
                        updateBlock(

                          block.id,

                          "caption",

                          event.target.value

                        )
                      }
                    />


                    {block.url && (

                      <img
                        src={block.url}
                        alt={
                          block.alt ||
                          "Article"
                        }
                        style={{

                          width: "100%",

                          maxWidth: "100%",

                          height: "auto",

                          borderRadius: "10px",

                          objectFit: "cover",

                        }}
                      />

                    )}

                  </div>

                )}


                {/* ============================================
                    YOUTUBE
                ============================================ */}

                {block.type ===
                  "youtube" && (

                  <div className="workspace-block-fields">


                    <input
                      type="url"
                      disabled={locked}
                      value={
                        block.url ||
                        ""
                      }
                      placeholder="YouTube URL"
                      onChange={(event) =>
                        updateBlock(

                          block.id,

                          "url",

                          event.target.value

                        )
                      }
                    />


                    <input
                      type="text"
                      disabled={locked}
                      value={
                        block.title ||
                        ""
                      }
                      placeholder="Video title"
                      onChange={(event) =>
                        updateBlock(

                          block.id,

                          "title",

                          event.target.value

                        )
                      }
                    />


                    {getYouTubeId(
                      block.url
                    ) && (

                      <iframe
                        className="workspace-youtube-preview"
                        src={
                          `https://www.youtube.com/embed/${getYouTubeId(
                            block.url
                          )}`
                        }
                        title={
                          block.title ||
                          "YouTube video"
                        }
                        allowFullScreen
                        style={{

                          width: "100%",

                          maxWidth: "100%",

                          aspectRatio: "16 / 9",

                          border: "none",

                        }}
                      />

                    )}

                  </div>

                )}


                {/* ============================================
                    VIDEO
                ============================================ */}

                {block.type ===
                  "video" && (

                  <div className="workspace-block-fields">


                    <input
                      type="url"
                      disabled={locked}
                      value={
                        block.url ||
                        ""
                      }
                      placeholder="Video URL"
                      onChange={(event) =>
                        updateBlock(

                          block.id,

                          "url",

                          event.target.value

                        )
                      }
                    />


                    <input
                      type="text"
                      disabled={locked}
                      value={
                        block.title ||
                        ""
                      }
                      placeholder="Video title"
                      onChange={(event) =>
                        updateBlock(

                          block.id,

                          "title",

                          event.target.value

                        )
                      }
                    />


                    {block.url && (

                      <video
                        controls
                        style={{

                          width: "100%",

                          maxWidth: "100%",

                          height: "auto",

                        }}
                      >

                        <source
                          src={block.url}
                        />

                        Your browser does not support
                        video playback.

                      </video>

                    )}

                  </div>

                )}


                {/* ============================================
                    QUOTE
                ============================================ */}

                {block.type ===
                  "quote" && (

                  <div className="workspace-block-fields">


                    <textarea
                      rows={4}
                      disabled={locked}
                      value={
                        block.text ||
                        ""
                      }
                      placeholder="Write quotation..."
                      onChange={(event) =>
                        updateBlock(

                          block.id,

                          "text",

                          event.target.value

                        )
                      }
                    />


                    <input
                      type="text"
                      disabled={locked}
                      value={
                        block.author ||
                        ""
                      }
                      placeholder="Quote author"
                      onChange={(event) =>
                        updateBlock(

                          block.id,

                          "author",

                          event.target.value

                        )
                      }
                    />

                  </div>

                )}


                {/* ============================================
                    LINK
                ============================================ */}

                {block.type ===
                  "link" && (

                  <div className="workspace-block-fields">


                    <input
                      type="text"
                      disabled={locked}
                      value={
                        block.label ||
                        ""
                      }
                      placeholder="Link label"
                      onChange={(event) =>
                        updateBlock(

                          block.id,

                          "label",

                          event.target.value

                        )
                      }
                    />


                    <input
                      type="url"
                      disabled={locked}
                      value={
                        block.url ||
                        ""
                      }
                      placeholder="https://..."
                      onChange={(event) =>
                        updateBlock(

                          block.id,

                          "url",

                          event.target.value

                        )
                      }
                    />


                    {block.url && (

                      <a
                        href={block.url}
                        target="_blank"
                        rel="noreferrer"
                      >

                        {block.label ||
                          block.url}

                      </a>

                    )}

                  </div>

                )}


                {/* ============================================
                    DIVIDER
                ============================================ */}

                {block.type ===
                  "divider" && (

                  <hr className="workspace-divider-preview" />

                )}

              </div>

            )

          )}

        </div>


        {/* ====================================================
            ADD BLOCK

            IMPORTANT:
            NOW AT THE BOTTOM OF ARTICLE CONTENT
        ==================================================== */}

        {!locked && (

          <div
            className="workspace-block-menu-wrapper"
            style={{

              position: "relative",

              width: "100%",

              maxWidth: "100%",

              minWidth: 0,

              marginTop: "24px",

              display: "flex",

              flexDirection: "column",

              alignItems: "center",

            }}
          >


            {showBlockMenu && (

              <div
                className="workspace-block-menu"
                style={{

                  position: "relative",

                  width: "100%",

                  maxWidth: "760px",

                  marginBottom: "12px",

                  zIndex: 20,

                }}
              >

                {BLOCK_TYPES.map(

                  ({

                    type,

                    label,

                    icon: Icon,

                    description,

                  }) => (

                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        addBlock(type)
                      }
                    >

                      <Icon size={18} />


                      <span>

                        <strong>

                          {label}

                        </strong>


                        <small>

                          {description}

                        </small>

                      </span>

                    </button>

                  )

                )}

              </div>

            )}


            <button
              type="button"
              className="workspace-add-block-button"
              onClick={() =>
                setShowBlockMenu(
                  (value) =>
                    !value
                )
              }
            >

              <Plus size={17} />

              {showBlockMenu

                ? "Close Block Menu"

                : "Add Block"}

            </button>

          </div>

        )}

      </section>


      {/* ======================================================
          ACTIONS
      ====================================================== */}

      {!locked && (

        <section
          className="workspace-editor-actions"
          style={{

            width: "100%",

            maxWidth: "100%",

            minWidth: 0,

          }}
        >


          {/* SAVE DRAFT */}

          <button
            type="button"
            className="workspace-action-draft"
            disabled={saving}
            onClick={saveDraft}
          >

            <Save size={17} />

            {saving

              ? "Saving..."

              : "Save Draft"}

          </button>


          {/* PREVIEW */}

          <button
            type="button"
            className="workspace-action-preview"
            disabled={
              saving ||
              !articleId
            }
            onClick={previewArticle}
          >

            <Eye size={17} />

            Preview

          </button>


          <div className="workspace-action-spacer" />


          {/* SUBMIT */}

          <button
            type="button"
            className="workspace-action-review"
            disabled={saving}
            onClick={submitForReview}
          >

            <Send size={16} />

            {saving

              ? "Please wait..."

              : mode === "editor"

                ? "Send for Review"

                : "Submit Story"}

          </button>

        </section>

      )}

    </div>

  );

}