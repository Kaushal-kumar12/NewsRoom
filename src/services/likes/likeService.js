import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase/firebaseClient";

const requireDb = () => {
  if (!db) throw new Error("Firestore is not configured.");
};

export async function hasLiked(userId, newsId) {
  requireDb();
  const snapshot = await getDocs(
    query(
      collection(db, "likes"),
      where("userId", "==", userId),
      where("newsId", "==", newsId)
    )
  );
  return snapshot.docs[0] || null;
}

export async function toggleLike(userId, newsId) {
  const existing = await hasLiked(userId, newsId);
  if (existing) {
    await deleteDoc(doc(db, "likes", existing.id));
    return { liked: false, id: null };
  }

  requireDb();
  const ref = await addDoc(collection(db, "likes"), {
    userId,
    newsId,
    createdAt: serverTimestamp(),
  });
  return { liked: true, id: ref.id };
}
