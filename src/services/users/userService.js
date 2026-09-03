// src/services/users/userService.js

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

function requireDb() {

  if (!db) {
    throw new Error(
      "Firestore is not configured."
    );
  }
}

export async function getUserProfile(
  uid
) {

  requireDb();

  if (!uid) {
    throw new Error(
      "User ID is required."
    );
  }

  const snapshot =
    await getDoc(
      doc(
        db,
        "users",
        uid
      )
    );

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id:
      snapshot.id,

    ...snapshot.data(),
  };
}

export async function updateUserProfile(
  uid,
  data
) {

  requireDb();

  if (!uid) {
    throw new Error(
      "User ID is required."
    );
  }

  const safeData = {
    ...data,

    updatedAt:
      serverTimestamp(),
  };

  /*
  IMPORTANT:
  These fields can NEVER be modified
  by normal profile update.
  */

  delete safeData.id;
  delete safeData.uid;
  delete safeData.role;
  delete safeData.email;
  delete safeData.status;
  delete safeData.isAdmin;
  delete safeData.isSuperAdmin;
  delete safeData.isStaff;

  await updateDoc(
    doc(
      db,
      "users",
      uid
    ),
    safeData
  );

  return getUserProfile(uid);
}