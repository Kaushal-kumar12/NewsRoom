// src/services/editorial/editorialService.js

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  db,
} from "../../services/firebase";


const NEWS = "news";
const AUDIT = "auditLogs";


/*
|--------------------------------------------------------------------------
| WORKFLOW STATES
|--------------------------------------------------------------------------
*/

export const EDITORIAL_STATUSES = {
  DRAFT: "DRAFT",

  SUBMITTED: "SUBMITTED",

  PENDING_ADMIN_REVIEW:
    "PENDING_ADMIN_REVIEW",

  CHANGES_REQUESTED:
    "CHANGES_REQUESTED",

  REJECTED:
    "REJECTED",

  PENDING_SUPERADMIN_REVIEW:
    "PENDING_SUPERADMIN_REVIEW",

  APPROVED:
    "APPROVED",

  SCHEDULED:
    "SCHEDULED",

  PUBLISHED:
    "PUBLISHED",

  DELETED:
    "DELETED",
};


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function requireDb() {

  if (!db) {

    throw new Error(
      "Firestore is not configured."
    );

  }

}


function requireUser(user) {

  if (!user?.uid) {

    throw new Error(
      "Authentication is required."
    );

  }

}


function getUserRole(user) {

  return String(
    user?.role ||
    user?.roleName ||
    ""
  )
    .trim()
    .toUpperCase();

}


function actorName(user) {

  return (
    user?.displayName ||
    user?.name ||
    user?.email ||
    "Staff User"
  );

}


function mapDoc(snapshot) {

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };

}


function getTimestamp(value) {

  if (!value) {

    return 0;

  }


  if (
    typeof value.toMillis ===
    "function"
  ) {

    return value.toMillis();

  }


  if (
    typeof value.toDate ===
    "function"
  ) {

    return value
      .toDate()
      .getTime();

  }


  const timestamp =
    new Date(value).getTime();


  return Number.isNaN(timestamp)
    ? 0
    : timestamp;

}


function requireEditorialRole(user) {

  requireUser(user);


  const role =
    getUserRole(user);


  const allowedRoles = [

    "EDITOR",

    "ADMIN",

    "ADMINISTRATOR",

    "SUPER_ADMIN",

    "SUPERADMIN",

  ];


  if (
    !allowedRoles.includes(role)
  ) {

    throw new Error(
      "You do not have editorial access."
    );

  }


  return role;

}


/*
|--------------------------------------------------------------------------
| AUDIT LOG
|--------------------------------------------------------------------------
*/

async function audit(
  user,
  action,
  targetId,
  metadata = {}
) {

  try {

    if (
      !user?.uid ||
      !db
    ) {

      return;

    }


    await addDoc(
      collection(
        db,
        AUDIT
      ),
      {

        actorId:
          user.uid,


        actorName:
          actorName(user),


        actorRole:
          getUserRole(user) ||
          "STAFF",


        action,


        targetType:
          "news",


        targetId,


        metadata,


        createdAt:
          serverTimestamp(),

      }
    );

  } catch (error) {

    console.warn(
      "Audit log failed:",
      error
    );

  }

}


/*
|--------------------------------------------------------------------------
| GET NEWS BY ID
|--------------------------------------------------------------------------
*/

export async function getNewsById(
  newsId
) {

  requireDb();


  if (!newsId) {

    throw new Error(
      "News ID is required."
    );

  }


  const snapshot =
    await getDoc(
      doc(
        db,
        NEWS,
        newsId
      )
    );


  if (!snapshot.exists()) {

    return null;

  }


  return mapDoc(snapshot);

}

/* 
|--------------------------------------------------------------------------
| INCREMENT NEWS VIEW COUNT
|--------------------------------------------------------------------------
|
| Every article page visit increases
| the view count by 1.
|
| Same user can generate multiple views.
|
*/

export async function incrementNewsViewCount(
  newsId
) {

  requireDb();


  if (!newsId) {

    throw new Error(
      "News ID is required."
    );

  }


  const newsRef =
    doc(
      db,
      NEWS,
      newsId
    );


  await updateDoc(
    newsRef,
    {

      views:
        increment(1),

    }
  );


  return true;

}


/*
|--------------------------------------------------------------------------
| GET ALL EDITORIAL STORIES
|--------------------------------------------------------------------------
*/

export async function getEditorialStories() {

  requireDb();


  const snapshot =
    await getDocs(
      collection(
        db,
        NEWS
      )
    );


  return snapshot.docs
    .map(mapDoc)
    .filter(
      (item) =>
        item.status !==
        EDITORIAL_STATUSES.DRAFT &&
        item.status !==
        EDITORIAL_STATUSES.DELETED
    )
    .sort(
      (a, b) =>
        getTimestamp(
          b.updatedAt ||
          b.createdAt
        ) -
        getTimestamp(
          a.updatedAt ||
          a.createdAt
        )
    );

}


/*
|--------------------------------------------------------------------------
| GET ALL NEWS
|--------------------------------------------------------------------------
|
| Used by Super Admin status pages.
|
| Includes all stories except permanently
| deleted stories.
|
*/

export async function getAllNews() {

  requireDb();


  const snapshot =
    await getDocs(
      collection(
        db,
        NEWS
      )
    );


  return snapshot.docs
    .map(mapDoc)
    .filter(
      (item) =>
        item.status !==
        EDITORIAL_STATUSES.DELETED
    )
    .sort(
      (a, b) =>
        getTimestamp(
          b.updatedAt ||
          b.createdAt
        ) -
        getTimestamp(
          a.updatedAt ||
          a.createdAt
        )
    );

}


/*
|--------------------------------------------------------------------------
| GET STORIES BY STATUS
|--------------------------------------------------------------------------
*/

export async function getStoriesByStatus(
  status
) {

  requireDb();


  if (!status) {

    return getEditorialStories();

  }


  const snapshot =
    await getDocs(
      query(
        collection(
          db,
          NEWS
        ),

        where(
          "status",
          "==",
          status
        )
      )
    );


  return snapshot.docs
    .map(mapDoc)
    .sort(
      (a, b) =>
        getTimestamp(
          b.updatedAt ||
          b.createdAt
        ) -
        getTimestamp(
          a.updatedAt ||
          a.createdAt
        )
    );

}


/*
|--------------------------------------------------------------------------
| SUPER ADMIN EDITORIAL REVIEW QUEUE
|--------------------------------------------------------------------------
|
| This queue contains every story that currently
| requires editorial action.
|
| IMPORTANT:
|
| The same statuses are used by:
|
| - SuperAdminEditorialPage
| - SuperAdminEditorialStatusPage
| - SuperAdminEditorialReviewPage
|
*/

export async function getEditorialQueue(
  user
) {

  requireDb();


  if (user) {

    requireEditorialRole(
      user
    );

  }


  const statuses = [

    EDITORIAL_STATUSES.SUBMITTED,

    EDITORIAL_STATUSES
      .PENDING_ADMIN_REVIEW,

    EDITORIAL_STATUSES
      .PENDING_SUPERADMIN_REVIEW,

  ];


  const results =
    await Promise.all(

      statuses.map(
        (status) =>
          getStoriesByStatus(
            status
          )
      )

    );


  return results
    .flat()
    .sort(
      (a, b) =>
        getTimestamp(
          b.updatedAt ||
          b.createdAt
        ) -
        getTimestamp(
          a.updatedAt ||
          a.createdAt
        )
    );

}


/*
|--------------------------------------------------------------------------
| APPROVE STORY
|--------------------------------------------------------------------------
|
| EDITOR APPROVAL:
|
| SUBMITTED
|       ↓
| PENDING_SUPERADMIN_REVIEW
|
| Editor approval does NOT publish.
|
|--------------------------------------------------------------------------
*/

export async function approveStory(
  storyId,
  user,
  note = ""
) {

  requireDb();


  const role =
    requireEditorialRole(user);


  /*
  |--------------------------------------------------------------------------
  | SUPER ADMIN
  |--------------------------------------------------------------------------
  */

  if (
    role === "SUPER_ADMIN" ||
    role === "SUPERADMIN"
  ) {

    throw new Error(
      "Use the Super Admin editorial workflow for this action."
    );

  }


  const story =
    await getNewsById(
      storyId
    );


  if (!story) {

    throw new Error(
      "Story not found."
    );

  }


  const allowedStatuses = [

    EDITORIAL_STATUSES.SUBMITTED,

    EDITORIAL_STATUSES.PENDING_ADMIN_REVIEW,

  ];


  if (
    !allowedStatuses.includes(
      story.status
    )
  ) {

    throw new Error(
      "This story cannot be approved from its current state."
    );

  }


  await updateDoc(
    doc(
      db,
      NEWS,
      storyId
    ),

    {

      status:
        EDITORIAL_STATUSES
          .PENDING_SUPERADMIN_REVIEW,


      editorialApprovedAt:
        serverTimestamp(),


      editorialApprovedByUid:
        user.uid,


      editorialApprovedBy:
        actorName(user),


      editorialNote:
        note?.trim() || "",


      updatedAt:
        serverTimestamp(),


      updatedByUid:
        user.uid,


      updatedBy:
        actorName(user),

    }
  );


  await audit(
    user,
    "STORY_EDITOR_APPROVED",
    storyId,
    {

      title:
        story.title || "",


      nextStatus:
        EDITORIAL_STATUSES
          .PENDING_SUPERADMIN_REVIEW,


      note:
        note?.trim() || "",

    }
  );


  return {

    id:
      storyId,


    status:
      EDITORIAL_STATUSES
        .PENDING_SUPERADMIN_REVIEW,

  };

}


/*
|--------------------------------------------------------------------------
| REQUEST STORY CHANGES
|--------------------------------------------------------------------------
*/

export async function requestStoryChanges(
  storyId,
  user,
  feedback
) {

  requireDb();

  requireEditorialRole(user);


  if (
    !feedback?.trim()
  ) {

    throw new Error(
      "Please provide editorial feedback."
    );

  }


  const story =
    await getNewsById(
      storyId
    );


  if (!story) {

    throw new Error(
      "Story not found."
    );

  }


  const allowedStatuses = [

    EDITORIAL_STATUSES.SUBMITTED,

    EDITORIAL_STATUSES.PENDING_ADMIN_REVIEW,

  ];


  if (
    !allowedStatuses.includes(
      story.status
    )
  ) {

    throw new Error(
      "This story cannot be returned for changes from its current state."
    );

  }


  await updateDoc(
    doc(
      db,
      NEWS,
      storyId
    ),

    {

      status:
        EDITORIAL_STATUSES
          .CHANGES_REQUESTED,


      editorialFeedback:
        feedback.trim(),


      feedbackByUid:
        user.uid,


      feedbackBy:
        actorName(user),


      feedbackAt:
        serverTimestamp(),


      updatedAt:
        serverTimestamp(),


      updatedByUid:
        user.uid,


      updatedBy:
        actorName(user),

    }
  );


  await audit(
    user,
    "STORY_CHANGES_REQUESTED",
    storyId,
    {

      title:
        story.title || "",


      feedback:
        feedback.trim(),

    }
  );


  return {

    id:
      storyId,


    status:
      EDITORIAL_STATUSES
        .CHANGES_REQUESTED,

  };

}


/*
|--------------------------------------------------------------------------
| REJECT STORY
|--------------------------------------------------------------------------
*/

export async function rejectStory(
  storyId,
  user,
  reason
) {

  requireDb();

  requireEditorialRole(user);


  const story =
    await getNewsById(
      storyId
    );


  if (!story) {

    throw new Error(
      "Story not found."
    );

  }


  const allowedStatuses = [

    EDITORIAL_STATUSES.SUBMITTED,

    EDITORIAL_STATUSES.PENDING_ADMIN_REVIEW,

  ];


  if (
    !allowedStatuses.includes(
      story.status
    )
  ) {

    throw new Error(
      "This story cannot be rejected from its current state."
    );

  }


  const rejectionReason =
    reason?.trim() ||
    "Rejected during editorial review.";


  await updateDoc(
    doc(
      db,
      NEWS,
      storyId
    ),

    {

      status:
        EDITORIAL_STATUSES
          .REJECTED,


      rejectionReason,


      rejectedByUid:
        user.uid,


      rejectedBy:
        actorName(user),


      rejectedAt:
        serverTimestamp(),


      updatedAt:
        serverTimestamp(),


      updatedByUid:
        user.uid,


      updatedBy:
        actorName(user),

    }
  );


  await audit(
    user,
    "STORY_REJECTED",
    storyId,
    {

      title:
        story.title || "",


      reason:
        rejectionReason,

    }
  );


  return {

    id:
      storyId,


    status:
      EDITORIAL_STATUSES
        .REJECTED,

  };

}


/*
|--------------------------------------------------------------------------
| SCHEDULE STORY
|--------------------------------------------------------------------------
|
| Only Admin / Super Admin.
|
|--------------------------------------------------------------------------
*/

export async function scheduleStory(
  storyId,
  user,
  scheduleDate
) {

  requireDb();

  requireUser(user);


  const role =
    getUserRole(user);


  const allowedRoles = [

    "ADMIN",

    "ADMINISTRATOR",

    "SUPER_ADMIN",

    "SUPERADMIN",

  ];


  if (
    !allowedRoles.includes(role)
  ) {

    throw new Error(
      "You do not have permission to schedule publication."
    );

  }


  if (!scheduleDate) {

    throw new Error(
      "Publication date is required."
    );

  }


  const parsedDate =
    new Date(
      scheduleDate
    );


  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {

    throw new Error(
      "Invalid publication date."
    );

  }


  if (
    parsedDate.getTime() <=
    Date.now()
  ) {

    throw new Error(
      "Scheduled publication must be in the future."
    );

  }


  const story =
    await getNewsById(
      storyId
    );


  if (!story) {

    throw new Error(
      "Story not found."
    );

  }


  const allowedStatuses = [

    EDITORIAL_STATUSES.APPROVED,

    EDITORIAL_STATUSES
      .PENDING_SUPERADMIN_REVIEW,

  ];


  if (
    !allowedStatuses.includes(
      story.status
    )
  ) {

    throw new Error(
      "This story is not ready to be scheduled."
    );

  }


  const scheduledFor =
    parsedDate.toISOString();


  await updateDoc(
    doc(
      db,
      NEWS,
      storyId
    ),

    {

      status:
        EDITORIAL_STATUSES
          .SCHEDULED,


      scheduledFor,


      scheduledByUid:
        user.uid,


      scheduledBy:
        actorName(user),


      scheduledAt:
        serverTimestamp(),


      updatedAt:
        serverTimestamp(),


      updatedByUid:
        user.uid,


      updatedBy:
        actorName(user),

    }
  );


  await audit(
    user,
    "STORY_SCHEDULED",
    storyId,
    {

      title:
        story.title || "",


      scheduledFor,

    }
  );


  return {

    id:
      storyId,


    status:
      EDITORIAL_STATUSES
        .SCHEDULED,


    scheduledFor,

  };

}


/*
|--------------------------------------------------------------------------
| PUBLISH STORY
|--------------------------------------------------------------------------
|
| Editor CANNOT publish.
|
| Only:
|
| ADMIN
| SUPER_ADMIN
|
|--------------------------------------------------------------------------
*/

export async function publishStory(
  storyId,
  user
) {

  requireDb();

  requireUser(user);


  const role =
    getUserRole(user);


  const allowedRoles = [

    "ADMIN",

    "ADMINISTRATOR",

    "SUPER_ADMIN",

    "SUPERADMIN",

  ];


  if (
    !allowedRoles.includes(role)
  ) {

    throw new Error(
      "Only Admin or Super Admin can publish stories."
    );

  }


  const story =
    await getNewsById(
      storyId
    );


  if (!story) {

    throw new Error(
      "Story not found."
    );

  }


  const allowedStatuses = [

    EDITORIAL_STATUSES.APPROVED,

    EDITORIAL_STATUSES.SCHEDULED,

    EDITORIAL_STATUSES
      .PENDING_SUPERADMIN_REVIEW,

  ];


  if (
    !allowedStatuses.includes(
      story.status
    )
  ) {

    throw new Error(
      "This story cannot be published from its current state."
    );

  }


  await updateDoc(
    doc(
      db,
      NEWS,
      storyId
    ),

    {

      status:
        EDITORIAL_STATUSES
          .PUBLISHED,

      views:
        story.views || 0,


      publishedAt:
        serverTimestamp(),


      publishedByUid:
        user.uid,


      publishedBy:
        actorName(user),


      updatedAt:
        serverTimestamp(),


      updatedByUid:
        user.uid,


      updatedBy:
        actorName(user),

    }
  );


  await audit(
    user,
    "STORY_PUBLISHED",
    storyId,
    {

      title:
        story.title || "",

    }
  );


  return {

    id:
      storyId,


    status:
      EDITORIAL_STATUSES
        .PUBLISHED,

  };

}


/*
|--------------------------------------------------------------------------
| EDITORIAL DASHBOARD STATS
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| These keys are compatible with
| SuperAdminEditorialPage.jsx.
|
|--------------------------------------------------------------------------
*/

export async function getEditorialDashboardStats() {

  requireDb();


  /*
  |--------------------------------------------------------------------------
  | ALL NEWS
  |--------------------------------------------------------------------------
  |
  | We use all news here because the Super Admin
  | dashboard also needs to count drafts.
  |
  */

  const stories =
    await getAllNews();


  const draft =
    countStatus(
      stories,
      [
        EDITORIAL_STATUSES.DRAFT,
      ]
    );


  const submitted =
    countStatus(
      stories,
      [

        EDITORIAL_STATUSES.SUBMITTED,

        EDITORIAL_STATUSES
          .PENDING_ADMIN_REVIEW,

      ]
    );


  const pendingSuperAdmin =
    countStatus(
      stories,
      [

        EDITORIAL_STATUSES
          .PENDING_SUPERADMIN_REVIEW,

      ]
    );


  const changesRequested =
    countStatus(
      stories,
      [

        EDITORIAL_STATUSES
          .CHANGES_REQUESTED,

      ]
    );


  const approved =
    countStatus(
      stories,
      [

        EDITORIAL_STATUSES.APPROVED,

      ]
    );


  const published =
    countStatus(
      stories,
      [

        EDITORIAL_STATUSES.PUBLISHED,

      ]
    );


  const rejected =
    countStatus(
      stories,
      [

        EDITORIAL_STATUSES.REJECTED,

      ]
    );


  const scheduled =
    countStatus(
      stories,
      [

        EDITORIAL_STATUSES.SCHEDULED,

      ]
    );


  /*
  |--------------------------------------------------------------------------
  | BLOCKED
  |--------------------------------------------------------------------------
  |
  | Currently changes requested stories are treated
  | as blocked from publication until corrected.
  |
  */

  const blocked =
    changesRequested;


  return {

    /*
    |--------------------------------------------------------------------------
    | CURRENT SUPER ADMIN PAGE KEYS
    |--------------------------------------------------------------------------
    */

    draft,


    pendingAdmin:
      submitted,


    pendingSuperAdmin,


    approved,


    published,


    rejected,


    blocked,


    scheduled,


    /*
    |--------------------------------------------------------------------------
    | BACKWARD COMPATIBILITY
    |--------------------------------------------------------------------------
    |
    | Keep these existing keys so other current
    | components do not break.
    |
    */

    submitted,


    changesRequested,

  };

}


/*
|--------------------------------------------------------------------------
| COUNT STATUS
|--------------------------------------------------------------------------
*/

function countStatus(
  items,
  statuses
) {

  return items.filter(
    (item) =>
      statuses.includes(
        item.status
      )
  ).length;

}