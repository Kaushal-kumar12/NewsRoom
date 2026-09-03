// src/services/news/newsServices.js

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  db,
} from "../firebase";


const NEWS_COLLECTION = "news";


/* ============================================================
   FIRESTORE CHECK
============================================================ */

function requireDb() {

  if (!db) {

    throw new Error(
      "Firestore is not configured."
    );

  }

}


/* ============================================================
   USER CHECK
============================================================ */

function requireUser(user) {

  if (!user?.uid) {

    throw new Error(
      "Authentication is required."
    );

  }

}


/* ============================================================
   NORMALIZE TAGS
============================================================ */

function normalizeTags(tags) {

  if (Array.isArray(tags)) {

    return tags
      .map(
        (tag) =>
          String(tag).trim()
      )
      .filter(Boolean);

  }


  if (
    typeof tags === "string"
  ) {

    return tags
      .split(",")
      .map(
        (tag) =>
          tag.trim()
      )
      .filter(Boolean);

  }


  return [];

}


/* ============================================================
   NORMALIZE STORY
============================================================ */

function normalizeStory(
  story = {},
  user
) {

  requireUser(user);


  const name =
    user.displayName ||
    user.name ||
    user.email ||
    "Author";


  const title =
    String(
      story.title ||
      story.headline ||
      ""
    ).trim();


  const summary =
    String(
      story.summary ||
      story.excerpt ||
      ""
    ).trim();


  return {

    title,

    headline:
      title,


    slug:
      String(
        story.slug || ""
      ).trim(),


    excerpt:
      summary,


    summary,


    subtitle:
      String(
        story.subtitle ||
        story.subheadline ||
        ""
      ).trim(),


    subheadline:
      String(
        story.subheadline ||
        story.subtitle ||
        ""
      ).trim(),


    content:
      String(
        story.content || ""
      ).trim(),


    category:
      story.category || "",


    subcategory:
      story.subcategory || "",


    tags:
      normalizeTags(
        story.tags
      ),


    image:
      story.image ||
      story.featuredImage ||
      "",


    featuredImage:
      story.featuredImage ||
      story.image ||
      "",


    blocks:
      Array.isArray(
        story.blocks
      )
        ? story.blocks
        : [],


    contentType:
      story.contentType ||
      "WRITTEN",


    authorId:
      user.uid,


    ownerId:
      user.uid,


    authorName:
      name,


    authorEmail:
      user.email || "",


    authorRole:
      "AUTHOR",


    status:
      story.status ||
      "DRAFT",

  };

}


/* ============================================================
   GET AUTHOR STORIES
============================================================ */

export async function getAuthorStories(
  userId
) {

  requireDb();


  if (!userId) {

    throw new Error(
      "User ID is required."
    );

  }


  const snapshot =
    await getDocs(

      query(

        collection(
          db,
          NEWS_COLLECTION
        ),

        where(
          "authorId",
          "==",
          userId
        )

      )

    );


  return snapshot.docs.map(
    (item) => ({

      id: item.id,

      ...item.data(),

    })
  );

}


/* ============================================================
   GET ONE AUTHOR STORY
============================================================ */

export async function getAuthorStory(
  storyId,
  userId
) {

  requireDb();


  if (
    !storyId ||
    !userId
  ) {

    throw new Error(
      "Story and user ID are required."
    );

  }


  const stories =
    await getAuthorStories(
      userId
    );


  return (
    stories.find(
      (story) =>
        story.id === storyId
    ) || null
  );

}


/* ============================================================
   CREATE AUTHOR STORY
============================================================ */

export async function createAuthorStory(
  story,
  user
) {

  requireDb();


  const payload =
    normalizeStory(
      story,
      user
    );


  const ref =
    await addDoc(

      collection(
        db,
        NEWS_COLLECTION
      ),

      {

        ...payload,

        status:
          "DRAFT",


        createdAt:
          serverTimestamp(),


        updatedAt:
          serverTimestamp(),

      }

    );


  return {

    id:
      ref.id,

    ...payload,

    status:
      "DRAFT",

  };

}


/* ============================================================
   UPDATE AUTHOR STORY
============================================================ */

export async function updateAuthorStory(
  storyId,
  story,
  user
) {

  requireDb();

  requireUser(user);


  if (!storyId) {

    throw new Error(
      "Story ID is required."
    );

  }


  const existing =
    await getAuthorStory(
      storyId,
      user.uid
    );


  if (!existing) {

    throw new Error(
      "Story not found or you do not have access to it."
    );

  }


  const editableStatuses = [

    "DRAFT",

    "CHANGES_REQUESTED",

    "REVISION_REQUIRED",

    "REJECTED",

  ];


  if (
    !editableStatuses.includes(
      existing.status
    )
  ) {

    throw new Error(
      "This story is currently locked."
    );

  }


  const payload =
    normalizeStory(
      story,
      user
    );


  delete payload.status;


  await updateDoc(

    doc(
      db,
      NEWS_COLLECTION,
      storyId
    ),

    {

      ...payload,


      updatedAt:
        serverTimestamp(),


      updatedByUid:
        user.uid,

    }

  );


  return {

    id:
      storyId,

    ...existing,

    ...payload,

  };

}


/* ============================================================
   SUBMIT AUTHOR STORY
============================================================ */

export async function submitAuthorStory(
  storyId,
  user
) {

  requireDb();

  requireUser(user);


  if (!storyId) {

    throw new Error(
      "Story ID is required."
    );

  }


  const existing =
    await getAuthorStory(
      storyId,
      user.uid
    );


  if (!existing) {

    throw new Error(
      "Story not found or you do not have access to it."
    );

  }


  const allowedStatuses = [

    "DRAFT",

    "CHANGES_REQUESTED",

    "REVISION_REQUIRED",

    "REJECTED",

  ];


  if (
    !allowedStatuses.includes(
      existing.status
    )
  ) {

    throw new Error(
      "This story cannot be submitted in its current state."
    );

  }


  await updateDoc(

    doc(
      db,
      NEWS_COLLECTION,
      storyId
    ),

    {

      status:
        "SUBMITTED",


      submittedAt:
        serverTimestamp(),


      submittedByUid:
        user.uid,


      submittedByName:
        user.displayName ||
        user.name ||
        user.email ||
        "Author",


      updatedAt:
        serverTimestamp(),


      updatedByUid:
        user.uid,

    }

  );

}


/* ============================================================
   PUBLISH AUTHOR STORY DIRECTLY
============================================================ */

export async function publishAuthorStory(
  storyId,
  user
) {

  requireDb();

  requireUser(user);


  if (!storyId) {

    throw new Error(
      "Story ID is required."
    );

  }


  const existing =
    await getAuthorStory(
      storyId,
      user.uid
    );


  if (!existing) {

    throw new Error(
      "Story not found or you do not have access to it."
    );

  }


  const allowedStatuses = [

    "DRAFT",

    "CHANGES_REQUESTED",

    "REVISION_REQUIRED",

    "REJECTED",

  ];


  if (
    !allowedStatuses.includes(
      existing.status
    )
  ) {

    throw new Error(
      "This story cannot be published in its current state."
    );

  }


  const name =
    user.displayName ||
    user.name ||
    user.email ||
    "Author";


  await updateDoc(

    doc(
      db,
      NEWS_COLLECTION,
      storyId
    ),

    {

      status:
        "PUBLISHED",


      publishedAt:
        serverTimestamp(),


      publishedByUid:
        user.uid,


      publishedByName:
        name,


      publishedByRole:
        "AUTHOR",


      updatedAt:
        serverTimestamp(),


      updatedByUid:
        user.uid,

    }

  );


  return {

    id:
      storyId,

    status:
      "PUBLISHED",

  };

}


/* ============================================================
   DELETE AUTHOR STORY
============================================================ */

export async function deleteAuthorStory(
  storyId,
  user
) {

  requireDb();

  requireUser(user);


  if (!storyId) {

    throw new Error(
      "Story ID is required."
    );

  }


  const existing =
    await getAuthorStory(
      storyId,
      user.uid
    );


  if (!existing) {

    throw new Error(
      "Story not found or you do not have access to it."
    );

  }


  if (
    existing.status !==
    "DRAFT"
  ) {

    throw new Error(
      "Only draft stories can be deleted."
    );

  }


  await deleteDoc(

    doc(
      db,
      NEWS_COLLECTION,
      storyId
    )

  );

}


/* ============================================================
   GET AUTHOR STORY COUNTS
============================================================ */

export async function getAuthorStoryStats(
  userId
) {

  const stories =
    await getAuthorStories(
      userId
    );


  return {

    total:
      stories.length,


    drafts:
      stories.filter(
        (story) =>
          story.status ===
          "DRAFT"
      ).length,


    submitted:
      stories.filter(
        (story) =>
          story.status ===
          "SUBMITTED"
      ).length,


    changesRequested:
      stories.filter(
        (story) =>
          story.status ===
            "CHANGES_REQUESTED" ||
          story.status ===
            "REVISION_REQUIRED"
      ).length,


    published:
      stories.filter(
        (story) =>
          story.status ===
          "PUBLISHED"
      ).length,


    rejected:
      stories.filter(
        (story) =>
          story.status ===
          "REJECTED"
      ).length,

  };

}