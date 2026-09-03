import admin from "firebase-admin";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

export const publishScheduledNews = onSchedule("every 5 minutes", async () => {
  const now = admin.firestore.Timestamp.now();
  const snapshot = await db
    .collection("news")
    .where("status", "==", "SCHEDULED")
    .where("scheduledAt", "<=", now)
    .limit(50)
    .get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, {
      status: "PUBLISHED",
      publishedAt: now.toDate().toISOString(),
      updatedAt: now.toDate().toISOString()
    });
    batch.create(db.collection("auditLogs").doc(), {
      user: "Cloud Function",
      action: "Scheduled Publish",
      target: doc.data().title,
      time: now.toDate().toISOString()
    });
  });
  await batch.commit();
});

export const notifyBreakingNews = onDocumentWritten("news/{newsId}", async (event) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  if (!after || after.status !== "PUBLISHED" || !after.breaking) return;
  if (before?.breaking && before?.status === "PUBLISHED") return;

  await messaging.send({
    topic: "breaking-news",
    notification: {
      title: "Breaking News",
      body: after.title
    },
    webpush: {
      fcmOptions: {
        link: `/news/${after.slug}`
      }
    }
  });

  const users = await db.collection("users").where("notifyBreaking", "==", true).get();
  const batch = db.batch();
  users.docs.forEach((userDoc) => {
    batch.create(db.collection("notifications").doc(), {
      userId: userDoc.id,
      title: `Breaking: ${after.title}`,
      type: "Breaking",
      read: false,
      createdAt: new Date().toISOString()
    });
  });
  await batch.commit();
});
