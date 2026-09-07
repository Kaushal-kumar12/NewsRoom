// src/services/editorial/newsWorkflowService.js

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../../services/firebase";

const NEWS = "news";
const AUDIT = "auditLogs";
const NOTIFICATIONS = "notifications";

/*
|--------------------------------------------------------------------------
| ROLE CONSTANTS
|--------------------------------------------------------------------------
|
| These values intentionally support the role values currently used by
| AuthContext.jsx as well as older Firestore records.
|
*/

const ROLE = Object.freeze({
  USER: "Registered User",
  AUTHOR: "Author",
  EDITOR: "Editor",
  ADMIN: "Administrator",
  SUPER_ADMIN: "SUPER_ADMIN",
});

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function requireDb() {
  if (!db) {
    throw new Error("Firestore is not configured.");
  }
}

function getUserId(user) {
  return (
    user?.uid ||
    user?.id ||
    ""
  );
}

function getUserName(user) {
  return (
    user?.name ||
    user?.displayName ||
    user?.email ||
    "Unknown User"
  );
}

/*
|--------------------------------------------------------------------------
| ROLE NORMALIZATION
|--------------------------------------------------------------------------
*/

function getUserRole(user) {
  const rawRole =
    user?.role ||
    user?.roleName ||
    "";

  const value = String(rawRole)
    .trim()
    .toUpperCase()
    .replace(/[-\s]+/g, "_");

  switch (value) {
    case "SUPER_ADMIN":
    case "SUPERADMIN":
    case "SUPER_ADMINISTRATOR":
      return ROLE.SUPER_ADMIN;

    case "ADMIN":
    case "ADMINISTRATOR":
      return ROLE.ADMIN;

    case "EDITOR":
      return ROLE.EDITOR;

    case "AUTHOR":
    case "AUTHOR_REPORTER":
      return ROLE.AUTHOR;

    case "USER":
    case "REGISTERED":
    case "REGISTERED_USER":
      return ROLE.USER;

    default:
      return ROLE.USER;
  }
}

/*
|--------------------------------------------------------------------------
| ROLE CHECKS
|--------------------------------------------------------------------------
*/

function isSuperAdmin(user) {
  return getUserRole(user) === ROLE.SUPER_ADMIN;
}

function isAdmin(user) {
  const role = getUserRole(user);

  return (
    role === ROLE.ADMIN ||
    role === ROLE.SUPER_ADMIN
  );
}

function isEditor(user) {
  const role = getUserRole(user);

  return (
    role === ROLE.EDITOR ||
    role === ROLE.ADMIN ||
    role === ROLE.SUPER_ADMIN
  );
}

function isAuthor(user) {
  return getUserRole(user) === ROLE.AUTHOR;
}

function isStaff(user) {
  const role = getUserRole(user);

  return (
    role === ROLE.AUTHOR ||
    role === ROLE.EDITOR ||
    role === ROLE.ADMIN ||
    role === ROLE.SUPER_ADMIN
  );
}

function canCreateNews(user) {
  return isStaff(user);
}

function canReadAllNews(user) {
  return isAdmin(user);
}

function canEditAnyNews(user) {
  return isEditor(user);
}

function canReviewNews(user) {
  return isEditor(user);
}

function canPublishNews(user) {
  return isSuperAdmin(user);
}

function canDeleteAnyNews(user) {
  return isAdmin(user);
}

/*
|--------------------------------------------------------------------------
| OWNERSHIP
|--------------------------------------------------------------------------
*/

function isNewsOwner(news, user) {
  const uid = getUserId(user);

  if (!uid || !news) {
    return false;
  }

  return (
    news.ownerId === uid ||
    news.authorId === uid ||
    news.createdByUid === uid
  );
}

/*
|--------------------------------------------------------------------------
| SAFE AUDIT
|--------------------------------------------------------------------------
|
| Audit failure must never make the main news operation appear to fail.
|
*/

async function safeAudit(
  user,
  action,
  targetId,
  metadata = {}
) {
  try {
    const actorId = getUserId(user);

    if (!actorId) {
      return;
    }

    await addDoc(
      collection(db, AUDIT),
      {
        actorId,

        actorName:
          getUserName(user),

        actorRole:
          getUserRole(user),

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
      "Audit log write failed:",
      error
    );
  }
}

/*
|--------------------------------------------------------------------------
| CREATE NEWS DRAFT
|--------------------------------------------------------------------------
*/

export async function createNewsDraft(
  payload,
  user
) {
  requireDb();

  if (!getUserId(user)) {
    throw new Error(
      "You are not authenticated."
    );
  }

  if (!canCreateNews(user)) {
    throw new Error(
      "You do not have permission to create news."
    );
  }

  const userId =
    getUserId(user);

  const role =
    getUserRole(user);

  /*
  |--------------------------------------------------------------------------
  | IMPORTANT
  |--------------------------------------------------------------------------
  |
  | ownerId is intentionally included.
  |
  | Your Firestore security model uses ownerId for ownership checks.
  |
  */

  const news = {
    ...payload,

    status:
      "DRAFT",

    ownerId:
      userId,

    authorId:
      userId,

    authorName:
      getUserName(user),

    authorRole:
      role,

    createdByUid:
      userId,

    createdBy:
      getUserName(user),

    createdByRole:
      role,

    updatedByUid:
      userId,

    updatedByRole:
      role,

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp(),
  };

  const ref =
    await addDoc(
      collection(db, NEWS),
      news
    );

  await safeAudit(
    user,
    "NEWS_CREATED",
    ref.id,
    {
      title:
        payload?.title ||
        "",
    }
  );

  return ref.id;
}

/*
|--------------------------------------------------------------------------
| GET NEWS BY ID
|--------------------------------------------------------------------------
*/

export async function getNewsById(
  newsId,
  user = null
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

  const news = {
    id:
      snapshot.id,

    ...snapshot.data(),
  };

  /*
  |--------------------------------------------------------------------------
  | Client-side friendly access check.
  |--------------------------------------------------------------------------
  |
  | Firestore remains the final authority.
  |
  */

  if (user) {
    const allowed =
      news.status === "PUBLISHED" ||
      isSuperAdmin(user) ||
      isNewsOwner(news, user) ||
      isAdmin(user) ||
      (
        isEditor(user) &&
        [
          "PENDING_ADMIN_REVIEW",
          "PENDING_SUPERADMIN_REVIEW",
          "APPROVED",
          "REVISION_REQUIRED",
          "REJECTED",
          "BLOCKED",
          "SCHEDULED",
        ].includes(news.status)
      );

    if (!allowed) {
      throw new Error(
        "You do not have permission to view this article."
      );
    }
  }

  return news;
}

/*
|--------------------------------------------------------------------------
| GET ALL NEWS
|--------------------------------------------------------------------------
*/

export async function getAllNews(
  user
) {
  requireDb();

  if (!user) {
    throw new Error(
      "Authentication is required."
    );
  }

  if (!canReadAllNews(user)) {
    throw new Error(
      "You do not have permission to read all news."
    );
  }

  const snapshot =
    await getDocs(
      collection(db, NEWS)
    );

  return snapshot.docs.map(
    (item) => ({
      id:
        item.id,

      ...item.data(),
    })
  );
}

/*
|--------------------------------------------------------------------------
| GET NEWS FOR AUTHOR
|--------------------------------------------------------------------------
*/

export async function getNewsForAuthor(
  userId,
  user = null
) {
  requireDb();

  if (!userId) {
    throw new Error(
      "User ID is required."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | If a user object was supplied, prevent one user from requesting
  | another author's articles.
  |--------------------------------------------------------------------------
  */

  if (
    user &&
    !isAdmin(user) &&
    getUserId(user) !== userId
  ) {
    throw new Error(
      "You do not have permission to view these articles."
    );
  }

  const snapshot =
    await getDocs(
      query(
        collection(db, NEWS),
        where(
          "authorId",
          "==",
          userId
        )
      )
    );

  return snapshot.docs.map(
    (item) => ({
      id:
        item.id,

      ...item.data(),
    })
  );
}

/*
|--------------------------------------------------------------------------
| UPDATE NEWS DRAFT
|--------------------------------------------------------------------------
*/

export async function updateNewsDraft(
  newsId,
  payload,
  user
) {
  requireDb();

  if (!getUserId(user)) {
    throw new Error(
      "You are not authenticated."
    );
  }

  const existing =
    await getNewsById(
      newsId,
      user
    );

  if (!existing) {
    throw new Error(
      "News article was not found."
    );
  }

  const owner =
    isNewsOwner(
      existing,
      user
    );

  const editor =
    canEditAnyNews(user);

  /*
  |--------------------------------------------------------------------------
  | Who can edit?
  |--------------------------------------------------------------------------
  |
  | Super Admin / Admin / Editor:
  |   Can edit editorial content.
  |
  | Author:
  |   Can edit own draft/revision.
  |
  */

  if (!owner && !editor) {
    throw new Error(
      "You do not have permission to edit this article."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Authors should not modify submitted content.
  |--------------------------------------------------------------------------
  */

  if (
    isAuthor(user) &&
    !editor &&
    ![
      "DRAFT",
      "REVISION_REQUIRED",
    ].includes(existing.status)
  ) {
    throw new Error(
      "This article can no longer be edited at its current workflow stage."
    );
  }

  const userId =
    getUserId(user);

  const role =
    getUserRole(user);

  await updateDoc(
    doc(
      db,
      NEWS,
      newsId
    ),
    {
      ...payload,

      /*
      |--------------------------------------------------------------------------
      | Never allow ownership to change.
      |--------------------------------------------------------------------------
      */

      ownerId:
        existing.ownerId ||
        existing.authorId ||
        existing.createdByUid ||
        userId,

      authorId:
        existing.authorId ||
        existing.ownerId ||
        existing.createdByUid ||
        userId,

      updatedByUid:
        userId,

      updatedByRole:
        role,

      updatedAt:
        serverTimestamp(),
    }
  );

  await safeAudit(
    user,
    "NEWS_UPDATED",
    newsId,
    {
      previousStatus:
        existing.status ||
        "",
    }
  );

  return true;
}

/*
|--------------------------------------------------------------------------
| SUBMIT NEWS FOR REVIEW
|--------------------------------------------------------------------------
*/

export async function submitNewsForReview(
  newsId,
  user
) {
  requireDb();

  if (!getUserId(user)) {
    throw new Error(
      "You are not authenticated."
    );
  }

  const existing =
    await getNewsById(
      newsId,
      user
    );

  if (!existing) {
    throw new Error(
      "News article was not found."
    );
  }

  const owner =
    isNewsOwner(
      existing,
      user
    );

  const editor =
    canEditAnyNews(user);

  if (!owner && !editor) {
    throw new Error(
      "You do not have permission to submit this article."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Only staff can submit.
  |--------------------------------------------------------------------------
  */

  if (!isStaff(user)) {
    throw new Error(
      "Only newsroom staff can submit news for review."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Prevent accidental re-submission of already published content.
  |--------------------------------------------------------------------------
  */

  if (
    existing.status ===
    "PUBLISHED"
  ) {
    throw new Error(
      "Published news cannot be submitted as a new draft."
    );
  }

  const userId =
    getUserId(user);

  const role =
    getUserRole(user);

  await updateDoc(
    doc(
      db,
      NEWS,
      newsId
    ),
    {
      status:
        "PENDING_ADMIN_REVIEW",

      ownerId:
        existing.ownerId ||
        existing.authorId ||
        existing.createdByUid ||
        userId,

      authorId:
        existing.authorId ||
        existing.ownerId ||
        existing.createdByUid ||
        userId,

      submittedByUid:
        userId,

      submittedBy:
        userId,

      submittedByName:
        getUserName(user),

      submittedByRole:
        role,

      submittedAt:
        serverTimestamp(),

      updatedByUid:
        userId,

      updatedByRole:
        role,

      updatedAt:
        serverTimestamp(),
    }
  );

  await safeAudit(
    user,
    "NEWS_SUBMITTED",
    newsId
  );

  return true;
}

/*
|--------------------------------------------------------------------------
| APPROVE NEWS
|--------------------------------------------------------------------------
*/

export async function approveNews(
  newsId,
  user
) {
  requireDb();

  if (!canReviewNews(user)) {
    throw new Error(
      "You do not have permission to approve news."
    );
  }

  const existing =
    await getNewsById(
      newsId,
      user
    );

  if (!existing) {
    throw new Error(
      "News article was not found."
    );
  }

  const role =
    getUserRole(user);

  let nextStatus;

  /*
  |--------------------------------------------------------------------------
  | ADMIN / EDITOR
  |--------------------------------------------------------------------------
  |
  | First editorial stage:
  |
  | PENDING_ADMIN_REVIEW
  |            ↓
  | PENDING_SUPERADMIN_REVIEW
  |
  */

  if (
    role === ROLE.ADMIN ||
    role === ROLE.EDITOR
  ) {
    if (
      ![
        "PENDING_ADMIN_REVIEW",
        "REVISION_REQUIRED",
      ].includes(existing.status)
    ) {
      throw new Error(
        "This article is not waiting for editorial review."
      );
    }

    nextStatus =
      "PENDING_SUPERADMIN_REVIEW";
  }

  /*
  |--------------------------------------------------------------------------
  | SUPER ADMIN
  |--------------------------------------------------------------------------
  |
  | Final approval:
  |
  | PENDING_SUPERADMIN_REVIEW
  |            ↓
  | APPROVED
  |
  */

  else if (
    role === ROLE.SUPER_ADMIN
  ) {
    if (
      ![
        "PENDING_SUPERADMIN_REVIEW",
        "PENDING_ADMIN_REVIEW",
        "REVISION_REQUIRED",
      ].includes(existing.status)
    ) {
      throw new Error(
        "This article is not ready for Super Admin approval."
      );
    }

    nextStatus =
      "APPROVED";
  }

  else {
    throw new Error(
      "You do not have permission to approve news."
    );
  }

  const userId =
    getUserId(user);

  await updateDoc(
    doc(
      db,
      NEWS,
      newsId
    ),
    {
      status:
        nextStatus,

      reviewedBy:
        userId,

      reviewedByName:
        getUserName(user),

      reviewedByRole:
        role,

      reviewedAt:
        serverTimestamp(),

      rejectionReason:
        "",

      updatedByUid:
        userId,

      updatedByRole:
        role,

      updatedAt:
        serverTimestamp(),
    }
  );

  await safeAudit(
    user,
    "NEWS_APPROVED",
    newsId,
    {
      nextStatus,
    }
  );

  return true;
}

/*
|--------------------------------------------------------------------------
| REJECT NEWS
|--------------------------------------------------------------------------
*/

export async function rejectNews(
  newsId,
  reason,
  user
) {
  requireDb();

  if (!canReviewNews(user)) {
    throw new Error(
      "You do not have permission to reject news."
    );
  }

  if (!reason?.trim()) {
    throw new Error(
      "A rejection reason is required."
    );
  }

  const existing =
    await getNewsById(
      newsId,
      user
    );

  if (!existing) {
    throw new Error(
      "News article was not found."
    );
  }

  const role =
    getUserRole(user);

  const userId =
    getUserId(user);

  await updateDoc(
    doc(
      db,
      NEWS,
      newsId
    ),
    {
      status:
        "REJECTED",

      rejectionReason:
        reason.trim(),

      reviewedBy:
        userId,

      reviewedByName:
        getUserName(user),

      reviewedByRole:
        role,

      reviewedAt:
        serverTimestamp(),

      updatedByUid:
        userId,

      updatedByRole:
        role,

      updatedAt:
        serverTimestamp(),
    }
  );

  await safeAudit(
    user,
    "NEWS_REJECTED",
    newsId,
    {
      reason:
        reason.trim(),
    }
  );

  return true;
}

/*
|--------------------------------------------------------------------------
| BLOCK NEWS
|--------------------------------------------------------------------------
*/

export async function blockNews(
  newsId,
  reason,
  user
) {
  requireDb();

  if (!canReviewNews(user)) {
    throw new Error(
      "You do not have permission to block news."
    );
  }

  if (!reason?.trim()) {
    throw new Error(
      "A blocking reason is required."
    );
  }

  const existing =
    await getNewsById(
      newsId,
      user
    );

  if (!existing) {
    throw new Error(
      "News article was not found."
    );
  }

  const role =
    getUserRole(user);

  const userId =
    getUserId(user);

  await updateDoc(
    doc(
      db,
      NEWS,
      newsId
    ),
    {
      status:
        "BLOCKED",

      blocked:
        true,

      blockReason:
        reason.trim(),

      blockedBy:
        userId,

      blockedByName:
        getUserName(user),

      blockedByRole:
        role,

      blockedAt:
        serverTimestamp(),

      updatedByUid:
        userId,

      updatedByRole:
        role,

      updatedAt:
        serverTimestamp(),
    }
  );

  await safeAudit(
    user,
    "NEWS_BLOCKED",
    newsId,
    {
      reason:
        reason.trim(),
    }
  );

  return true;
}

/*
|--------------------------------------------------------------------------
| FORWARD TO SUPER ADMIN
|--------------------------------------------------------------------------
*/

export async function forwardNewsToSuperAdmin(
  newsId,
  reason,
  user
) {
  requireDb();

  /*
  |--------------------------------------------------------------------------
  | Only Administrator can explicitly forward.
  |--------------------------------------------------------------------------
  */

  if (!isAdmin(user)) {
    throw new Error(
      "Only administrators can forward news to Super Admin."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Super Admin does not need to forward to itself.
  |--------------------------------------------------------------------------
  */

  if (isSuperAdmin(user)) {
    throw new Error(
      "Super Admin does not need to forward news to Super Admin."
    );
  }

  const existing =
    await getNewsById(
      newsId,
      user
    );

  if (!existing) {
    throw new Error(
      "News article was not found."
    );
  }

  const userId =
    getUserId(user);

  await updateDoc(
    doc(
      db,
      NEWS,
      newsId
    ),
    {
      status:
        "PENDING_SUPERADMIN_REVIEW",

      forwardedTo:
        "SUPER_ADMIN",

      forwardedBy:
        userId,

      forwardedByName:
        getUserName(user),

      forwardedByRole:
        getUserRole(user),

      forwardingReason:
        reason?.trim() ||
        "",

      forwardedAt:
        serverTimestamp(),

      updatedByUid:
        userId,

      updatedByRole:
        getUserRole(user),

      updatedAt:
        serverTimestamp(),
    }
  );

  await safeAudit(
    user,
    "NEWS_FORWARDED_TO_SUPER_ADMIN",
    newsId,
    {
      reason:
        reason?.trim() ||
        "",
    }
  );

  return true;
}

/*
|--------------------------------------------------------------------------
| REVISION REQUIRED
|--------------------------------------------------------------------------
*/

export async function sendNewsBackForRevision(
  newsId,
  remarks,
  user
) {
  requireDb();

  if (!canReviewNews(user)) {
    throw new Error(
      "You do not have permission to request revisions."
    );
  }

  if (!remarks?.trim()) {
    throw new Error(
      "Revision remarks are required."
    );
  }

  const existing =
    await getNewsById(
      newsId,
      user
    );

  if (!existing) {
    throw new Error(
      "News article was not found."
    );
  }

  const userId =
    getUserId(user);

  const role =
    getUserRole(user);

  await updateDoc(
    doc(
      db,
      NEWS,
      newsId
    ),
    {
      status:
        "REVISION_REQUIRED",

      editorialRemarks:
        remarks.trim(),

      reviewedBy:
        userId,

      reviewedByName:
        getUserName(user),

      reviewedByRole:
        role,

      reviewedAt:
        serverTimestamp(),

      updatedByUid:
        userId,

      updatedByRole:
        role,

      updatedAt:
        serverTimestamp(),
    }
  );

  await safeAudit(
    user,
    "NEWS_REVISION_REQUESTED",
    newsId,
    {
      remarks:
        remarks.trim(),
    }
  );

  return true;
}


/*
|--------------------------------------------------------------------------
| DIRECT PUBLISH (SUPER ADMIN)
|--------------------------------------------------------------------------
|
| Used when a Super Admin creates or edits a story and intentionally
| publishes it immediately without sending it through editorial review.
|
*/

export async function publishNewsDirect(
  newsId,
  user
) {
  requireDb();

  if (!canPublishNews(user)) {
    throw new Error(
      "Only Super Admin can publish news directly."
    );
  }

  if (!newsId) {
    throw new Error(
      "News ID is required."
    );
  }

  const existing =
    await getNewsById(
      newsId,
      user
    );

  if (!existing) {
    throw new Error(
      "News article was not found."
    );
  }

  if (
    existing.status ===
    "PUBLISHED"
  ) {
    throw new Error(
      "This news article is already published."
    );
  }

  const userId =
    getUserId(user);

  const role =
    getUserRole(user);

  await updateDoc(
    doc(
      db,
      NEWS,
      newsId
    ),
    {
      status:
        "PUBLISHED",

      publishedBy:
        userId,

      publishedByName:
        getUserName(user),

      publishedByRole:
        role,

      publishedAt:
        serverTimestamp(),

      updatedByUid:
        userId,

      updatedByRole:
        role,

      updatedAt:
        serverTimestamp(),
    }
  );

  await safeAudit(
    user,
    "NEWS_DIRECTLY_PUBLISHED",
    newsId,
    {
      previousStatus:
        existing.status || "",
    }
  );

  return true;
}


/*
|--------------------------------------------------------------------------
| PUBLISH
|--------------------------------------------------------------------------
*/

export async function publishNews(
  newsId,
  user
) {
  requireDb();

  if (!canPublishNews(user)) {
    throw new Error(
      "Only Super Admin can publish news."
    );
  }

  const existing =
    await getNewsById(
      newsId,
      user
    );

  if (!existing) {
    throw new Error(
      "News article was not found."
    );
  }

  if (
    existing.status !==
    "APPROVED"
  ) {
    throw new Error(
      "Only approved news can be published."
    );
  }

  const userId =
    getUserId(user);

  const role =
    getUserRole(user);

  await updateDoc(
    doc(
      db,
      NEWS,
      newsId
    ),
    {
      status:
        "PUBLISHED",

      publishedBy:
        userId,

      publishedByName:
        getUserName(user),

      publishedByRole:
        role,

      publishedAt:
        serverTimestamp(),

      updatedByUid:
        userId,

      updatedByRole:
        role,

      updatedAt:
        serverTimestamp(),
    }
  );

  await safeAudit(
    user,
    "NEWS_PUBLISHED",
    newsId
  );

  return true;
}

/*
|--------------------------------------------------------------------------
| SCHEDULE
|--------------------------------------------------------------------------
*/

export async function scheduleNews(
  newsId,
  publishAt,
  user
) {
  requireDb();

  if (!canPublishNews(user)) {
    throw new Error(
      "Only Super Admin can schedule news."
    );
  }

  const date =
    new Date(publishAt);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    throw new Error(
      "Invalid publication date."
    );
  }

  const existing =
    await getNewsById(
      newsId,
      user
    );

  if (!existing) {
    throw new Error(
      "News article was not found."
    );
  }

  if (
    existing.status !==
    "APPROVED"
  ) {
    throw new Error(
      "Only approved news can be scheduled."
    );
  }

  const userId =
    getUserId(user);

  await updateDoc(
    doc(
      db,
      NEWS,
      newsId
    ),
    {
      status:
        "SCHEDULED",

      scheduledAt:
        date,

      scheduledBy:
        userId,

      scheduledByName:
        getUserName(user),

      scheduledByRole:
        getUserRole(user),

      updatedByUid:
        userId,

      updatedByRole:
        getUserRole(user),

      updatedAt:
        serverTimestamp(),
    }
  );

  await safeAudit(
    user,
    "NEWS_SCHEDULED",
    newsId
  );

  return true;
}

/*
|--------------------------------------------------------------------------
| UNPUBLISH
|--------------------------------------------------------------------------
*/

export async function unpublishNews(
  newsId,
  reason,
  user
) {
  requireDb();

  if (!canPublishNews(user)) {
    throw new Error(
      "Only Super Admin can unpublish news."
    );
  }

  const existing =
    await getNewsById(
      newsId,
      user
    );

  if (!existing) {
    throw new Error(
      "News article was not found."
    );
  }

  if (
    existing.status !==
    "PUBLISHED"
  ) {
    throw new Error(
      "Only published news can be unpublished."
    );
  }

  const userId =
    getUserId(user);

  await updateDoc(
    doc(
      db,
      NEWS,
      newsId
    ),
    {
      status:
        "UNPUBLISHED",

      unpublishedBy:
        userId,

      unpublishedByName:
        getUserName(user),

      unpublishedByRole:
        getUserRole(user),

      unpublishReason:
        reason?.trim() ||
        "",

      unpublishedAt:
        serverTimestamp(),

      updatedByUid:
        userId,

      updatedByRole:
        getUserRole(user),

      updatedAt:
        serverTimestamp(),
    }
  );

  await safeAudit(
    user,
    "NEWS_UNPUBLISHED",
    newsId
  );

  return true;
}

/*
|--------------------------------------------------------------------------
| EDITORIAL QUEUE
|--------------------------------------------------------------------------
*/

export async function getEditorialQueue(
  user
) {
  requireDb();

  if (!user) {
    throw new Error(
      "Authentication is required."
    );
  }

  if (!canReviewNews(user)) {
    throw new Error(
      "You do not have permission to view the editorial queue."
    );
  }

  const statuses = [
    "PENDING_ADMIN_REVIEW",
    "PENDING_SUPERADMIN_REVIEW",
    "APPROVED",
    "REVISION_REQUIRED",
    "REJECTED",
    "BLOCKED",
    "SCHEDULED",

    /*
    | Legacy statuses
    */

    "PENDING_REVIEW",
    "ADMIN_REVIEW",
    "SUPERADMIN_REVIEW",
    "SUPER_ADMIN_REVIEW",
  ];

  const results =
    await Promise.all(
      statuses.map(
        async (status) => {
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

          return snapshot.docs.map(
            (item) => ({
              id:
                item.id,

              ...item.data(),
            })
          );
        }
      )
    );

  return results.flat();
}

/*
|--------------------------------------------------------------------------
| NEWS BY STATUS
|--------------------------------------------------------------------------
*/

export async function getNewsByStatus(
  status,
  user
) {
  requireDb();

  if (!status) {
    throw new Error(
      "News status is required."
    );
  }

  if (!user) {
    throw new Error(
      "Authentication is required."
    );
  }

  if (!canReviewNews(user)) {
    throw new Error(
      "You do not have permission to view news by status."
    );
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

  return snapshot.docs.map(
    (item) => ({
      id:
        item.id,

      ...item.data(),
    })
  );
}

/*
|--------------------------------------------------------------------------
| DELETE NEWS
|--------------------------------------------------------------------------
*/

export async function deleteNews(
  newsId,
  user
) {
  requireDb();

  if (!getUserId(user)) {
    throw new Error(
      "You are not authenticated."
    );
  }

  const existing =
    await getNewsById(
      newsId,
      user
    );

  if (!existing) {
    throw new Error(
      "News article was not found."
    );
  }

  const owner =
    isNewsOwner(
      existing,
      user
    );

  const deleteAny =
    canDeleteAnyNews(user);

  /*
  |--------------------------------------------------------------------------
  | Super Admin / Admin:
  |   Can delete non-published content.
  |
  | Owner:
  |   Can delete own draft/revision.
  |--------------------------------------------------------------------------
  */

  const allowed =
    deleteAny ||
    (
      owner &&
      [
        "DRAFT",
        "REVISION_REQUIRED",
      ].includes(
        existing.status
      )
    );

  if (!allowed) {
    throw new Error(
      "You do not have permission to delete this news article."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Never allow normal deletion of published content.
  |--------------------------------------------------------------------------
  */

  if (
    existing.status ===
    "PUBLISHED"
  ) {
    throw new Error(
      "Published news cannot be deleted."
    );
  }

  await deleteDoc(
    doc(
      db,
      NEWS,
      newsId
    )
  );

  await safeAudit(
    user,
    "NEWS_DELETED",
    newsId,
    {
      title:
        existing.title ||
        existing.headline ||
        "",
    }
  );

  return true;
}

/*
|--------------------------------------------------------------------------
| CREATE EDITORIAL NOTIFICATION
|--------------------------------------------------------------------------
*/

export async function createEditorialNotification(
  recipientId,
  title,
  message,
  type = "NEWS"
) {
  requireDb();

  if (!recipientId) {
    throw new Error(
      "Notification recipient is required."
    );
  }

  await addDoc(
    collection(
      db,
      NOTIFICATIONS
    ),
    {
      userId:
        recipientId,

      title:
        title || "",

      message:
        message || "",

      type,

      read:
        false,

      createdAt:
        serverTimestamp(),
    }
  );

  return true;
}

/*
|--------------------------------------------------------------------------
| NOTIFY NEWS AUTHOR
|--------------------------------------------------------------------------
*/

export async function notifyNewsAuthor(
  newsId,
  title,
  message,
  type = "NEWS"
) {
  const news =
    await getNewsById(
      newsId
    );

  if (!news?.authorId) {
    return false;
  }

  await createEditorialNotification(
    news.authorId,
    title,
    message,
    type
  );

  return true;
}