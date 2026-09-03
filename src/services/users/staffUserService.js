import {
  initializeApp,
  getApps,
} from "firebase/app";

import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDocs,
  collection,
  query,
  where,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase";

import {
  ROLES,
  normalizeRole,
  isAdminRole,
} from "../../config/rolePermissions";

const SECONDARY_APP_NAME =
  "newsroom-staff-creator";

function getCreatorAuth() {
  const existing =
    getApps().find(
      (app) =>
        app.name ===
        SECONDARY_APP_NAME
    );

  const app =
    existing ||
    initializeApp(
      auth.app.options,
      SECONDARY_APP_NAME
    );

  return getAuth(app);
}

function requireAdmin(
  currentUser
) {
  if (
    !currentUser?.role ||
    !isAdminRole(
      currentUser.role
    )
  ) {
    throw new Error(
      "Only an administrator can create staff accounts."
    );
  }
}

export async function createStaffUser({
  name,
  email,
  password,
  role,
  currentUser,
}) {
  if (!db) {
    throw new Error(
      "Firestore is not configured."
    );
  }

  requireAdmin(
    currentUser
  );

  const normalizedName =
    name?.trim();

  const normalizedEmail =
    email
      ?.trim()
      .toLowerCase();

  const normalizedRole =
    normalizeRole(role);

  if (!normalizedName) {
    throw new Error(
      "Name is required."
    );
  }

  if (!normalizedEmail) {
    throw new Error(
      "Email is required."
    );
  }

  if (!password) {
    throw new Error(
      "Temporary password is required."
    );
  }

  if (
    ![
      ROLES.AUTHOR,
      ROLES.EDITOR,
    ].includes(
      normalizedRole
    )
  ) {
    throw new Error(
      "Administrators can create only Author or Editor accounts."
    );
  }

  /*
   * Prevent duplicate profile emails.
   */

  const existing =
    await getDocs(
      query(
        collection(
          db,
          "users"
        ),
        where(
          "email",
          "==",
          normalizedEmail
        )
      )
    );

  if (!existing.empty) {
    throw new Error(
      "A user with this email already exists."
    );
  }

  /*
   * Secondary Firebase Auth instance.
   *
   * This prevents creation of the new account
   * from logging out the administrator.
   */

  const creatorAuth =
    getCreatorAuth();

  let credential;

  try {
    credential =
      await createUserWithEmailAndPassword(
        creatorAuth,
        normalizedEmail,
        password
      );

    await updateProfile(
      credential.user,
      {
        displayName:
          normalizedName,
      }
    );

    const uid =
      credential.user.uid;

    const profile = {
      id: uid,
      uid,

      name:
        normalizedName,

      displayName:
        normalizedName,

      email:
        normalizedEmail,

      role:
        normalizedRole,

      status:
        "ACTIVE",

      accountStatus:
        "ACTIVE",

      avatar:
        "",

      followed:
        [],

      notifyBreaking:
        true,

      notifyCategory:
        true,

      isStaff:
        true,

      isAdmin:
        false,

      isSuperAdmin:
        false,

      createdByUid:
        currentUser.uid,

      createdByName:
        currentUser.name ||
        currentUser.displayName ||
        currentUser.email ||
        "Administrator",

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    };

    await setDoc(
      doc(
        db,
        "users",
        uid
      ),
      profile
    );

    return {
      ...profile,
      id: uid,
      uid,
    };
  } finally {
    /*
     * Never leave the secondary auth
     * session signed in.
     */

    try {
      await signOut(
        creatorAuth
      );
    } catch {
      // Ignore secondary sign-out errors.
    }
  }
}