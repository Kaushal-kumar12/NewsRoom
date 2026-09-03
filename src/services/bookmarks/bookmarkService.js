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

export async function getUserBookmarks(userId) {
  requireDb();
  const snapshot = await getDocs(
    query(collection(db, "bookmarks"), where("userId", "==", userId))
  );
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function addBookmark(userId, news) {
  requireDb();
  const existing = await getDocs(
    query(
      collection(db, "bookmarks"),
      where("userId", "==", userId),
      where("newsId", "==", news.id)
    )
  );
  if (!existing.empty) return existing.docs[0].id;

  const ref = await addDoc(collection(db, "bookmarks"), {
    userId,
    newsId: news.id,
    title: news.title || "",
    image: news.image || "",
    category: news.category || "",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function removeBookmark(bookmarkId) {
  requireDb();
  await deleteDoc(doc(db, "bookmarks", bookmarkId));
}
