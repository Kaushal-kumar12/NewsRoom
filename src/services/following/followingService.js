import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase/firebaseClient";

export async function updateFollowedCategories(userId, categories) {
  if (!db) throw new Error("Firestore is not configured.");

  await updateDoc(doc(db, "users", userId), {
    followed: [...new Set(categories)],
    updatedAt: serverTimestamp(),
  });

  const snapshot = await getDoc(doc(db, "users", userId));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function toggleFollowCategory(userId, currentCategories = [], category) {
  const next = currentCategories.includes(category)
    ? currentCategories.filter((item) => item !== category)
    : [...currentCategories, category];

  return updateFollowedCategories(userId, next);
}
