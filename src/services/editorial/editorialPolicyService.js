import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../lib/firebase/firebaseClient";

const POLICY_ID = "global";

const DEFAULT_POLICY = {
  requireReviewForSensitive: true,
  requireReviewForControversial: true,

  allowAuthorPublish: false,
  allowEditorPublish: true,
  allowAdminPublish: true,

  requireAdminForSensitive: true,
  requireSuperAdminForEscalation: true,

  allowScheduledPublishing: true,

  allowYoutubeVideo: true,
  allowUploadedVideo: true,
};

export async function getEditorialPolicy() {
  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  const snapshot = await getDoc(
    doc(db, "editorialPolicies", POLICY_ID)
  );

  if (!snapshot.exists()) {
    return DEFAULT_POLICY;
  }

  return {
    ...DEFAULT_POLICY,
    ...snapshot.data(),
  };
}

export async function saveEditorialPolicy(
  policy
) {
  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  await setDoc(
    doc(
      db,
      "editorialPolicies",
      POLICY_ID
    ),
    {
      ...policy,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}