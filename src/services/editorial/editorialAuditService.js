import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../lib/firebase/firebaseClient";

export async function getNewsAuditLogs(
  newsId
) {
  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  const snapshot = await getDocs(
    query(
      collection(db, "auditLogs"),
      where("targetType", "==", "news"),
      where("targetId", "==", newsId),
      orderBy("createdAt", "desc"),
      limit(100)
    )
  );

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}