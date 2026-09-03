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

import { db } from "../../lib/firebase/firebaseClient";


const requireDb = () => {
  if (!db) {
    throw new Error("Firestore is not configured.");
  }
};


/*
|--------------------------------------------------------------------------
| Get News Comments
|--------------------------------------------------------------------------
|
| We intentionally do not use orderBy("createdAt")
| because Firestore requires a composite index when
| where(newsId) and orderBy(createdAt) are combined.
|
| Comments are sorted locally instead.
|
*/

export async function getNewsComments(newsId) {

  requireDb();

  if (!newsId) {
    return [];
  }


  const commentsQuery = query(
    collection(db, "comments"),
    where("newsId", "==", newsId)
  );


  const snapshot = await getDocs(commentsQuery);


  const comments = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));


  /*
  |--------------------------------------------------------------------------
  | Sort locally
  |--------------------------------------------------------------------------
  */

  comments.sort((a, b) => {

    const aTime =
      a.createdAt?.toDate?.()?.getTime() || 0;

    const bTime =
      b.createdAt?.toDate?.()?.getTime() || 0;

    return bTime - aTime;

  });


  return comments;

}


/*
|--------------------------------------------------------------------------
| Add Comment
|--------------------------------------------------------------------------
*/

export async function addComment({
  userId,
  userName,
  newsId,
  text,
}) {

  requireDb();


  if (!userId) {
    throw new Error(
      "You must be signed in to post a comment."
    );
  }


  if (!newsId) {
    throw new Error(
      "News article ID is missing."
    );
  }


  if (!text || !text.trim()) {
    throw new Error(
      "Comment cannot be empty."
    );
  }


  const ref = await addDoc(
    collection(db, "comments"),
    {

      userId,

      userName:
        userName?.trim() || "NewsRoom User",

      newsId,

      text: text.trim(),

      status: "PENDING",

      reported: false,

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp(),

    }
  );


  return ref.id;

}


/*
|--------------------------------------------------------------------------
| Update Comment
|--------------------------------------------------------------------------
*/

export async function updateComment(
  commentId,
  text
) {

  requireDb();


  if (!commentId) {
    throw new Error(
      "Comment ID is missing."
    );
  }


  if (!text || !text.trim()) {
    throw new Error(
      "Comment cannot be empty."
    );
  }


  await updateDoc(
    doc(db, "comments", commentId),
    {

      text: text.trim(),

      updatedAt: serverTimestamp(),

    }
  );

}


/*
|--------------------------------------------------------------------------
| Delete Comment
|--------------------------------------------------------------------------
*/

export async function deleteComment(
  commentId
) {

  requireDb();


  if (!commentId) {
    throw new Error(
      "Comment ID is missing."
    );
  }


  await deleteDoc(
    doc(db, "comments", commentId)
  );

}