// src/services/superAdminService.js

import {
  auth,
  db,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "./firebase";

const USERS_COLLECTION = "users";
const AUDIT_COLLECTION = "securityLogs";
const INVITATIONS_COLLECTION = "superAdminInvitations";

// ============================================================
// ROLES
// IMPORTANT:
// These values MUST match AuthContext.jsx
// ============================================================

export const ROLES = Object.freeze({
  USER: "Registered User",
  AUTHOR: "Author",
  EDITOR: "Editor",
  ADMIN: "Administrator",

  // IMPORTANT: same value as AuthContext.jsx
  SUPER_ADMIN: "SUPER_ADMIN",
});

// ============================================================
// LEGACY ROLE SUPPORT
// ============================================================
//
// If some old Firestore document still contains:
// "Super Administrator"
//
// we will still recognize it as Super Admin.
//
// New/updated records will use:
// "SUPER_ADMIN"
// ============================================================

const LEGACY_SUPER_ADMIN_ROLE = "Super Administrator";

const isSuperAdminRole = (role) => {
  return (
    role === ROLES.SUPER_ADMIN ||
    role === LEGACY_SUPER_ADMIN_ROLE
  );
};

// ============================================================
// AUTHENTICATION CHECK
// ============================================================

const requireSignedIn = () => {
  if (!auth.currentUser) {
    throw new Error("You must be signed in.");
  }

  return auth.currentUser;
};

// ============================================================
// CURRENT SUPER ADMIN
// ============================================================

export const getCurrentSuperAdminProfile =
  async () => {
    const current = requireSignedIn();

    const profileRef = doc(
      db,
      USERS_COLLECTION,
      current.uid
    );

    const snapshot = await getDoc(
      profileRef
    );

    if (!snapshot.exists()) {
      throw new Error(
        "Super administrator profile was not found."
      );
    }

    const data = snapshot.data();

    // ========================================================
    // FIX:
    // Accept both the new canonical role and old role value.
    // ========================================================

    if (!isSuperAdminRole(data.role)) {
      console.error(
        "Super Admin authorization failed:",
        {
          firebaseUid: current.uid,
          firestoreRole: data.role,
          expectedRole: ROLES.SUPER_ADMIN,
        }
      );

      throw new Error(
        "Super administrator access is required."
      );
    }

    return {
      id: snapshot.id,
      ...data,

      // Normalize role in returned profile
      role: ROLES.SUPER_ADMIN,
    };
  };

// ============================================================
// GET ALL USERS
// ============================================================

export const listUsers =
  async () => {

    await getCurrentSuperAdminProfile();

    const snapshot =
      await getDocs(
        collection(
          db,
          USERS_COLLECTION
        )
      );

    return snapshot.docs.map(
      (item) => ({
        id: item.id,
        ...item.data(),
      })
    );
  };

// ============================================================
// GET USERS BY ROLE
// ============================================================

export const listUsersByRole =
  async (role) => {

    await getCurrentSuperAdminProfile();

    // ========================================================
    // Super Admin needs legacy compatibility
    // ========================================================

    if (role === ROLES.SUPER_ADMIN) {

      const allUsers =
        await listUsers();

      return allUsers.filter(
        (user) =>
          isSuperAdminRole(
            user.role
          )
      );
    }

    const q =
      query(
        collection(
          db,
          USERS_COLLECTION
        ),
        where(
          "role",
          "==",
          role
        )
      );

    const snapshot =
      await getDocs(q);

    return snapshot.docs.map(
      (item) => ({
        id: item.id,
        ...item.data(),
      })
    );
  };

// ============================================================
// ADMINISTRATORS
// ============================================================

export const listAdministrators =
  async () => {

    return await listUsersByRole(
      ROLES.ADMIN
    );
  };

// ============================================================
// SUPER ADMINISTRATORS
// ============================================================

export const listSuperAdministrators =
  async () => {

    return await listUsersByRole(
      ROLES.SUPER_ADMIN
    );
  };

// Alias for convenience
export const listSuperAdmins =
  listSuperAdministrators;

// ============================================================
// AUTHORS
// ============================================================

export const listAuthors =
  async () => {

    return await listUsersByRole(
      ROLES.AUTHOR
    );
  };

// ============================================================
// EDITORS
// ============================================================

export const listEditors =
  async () => {

    return await listUsersByRole(
      ROLES.EDITOR
    );
  };

// ============================================================
// REGISTERED USERS
// ============================================================

export const listRegisteredUsers =
  async () => {

    return await listUsersByRole(
      ROLES.USER
    );
  };

// ============================================================
// GET SINGLE USER
// ============================================================

export const getUserById =
  async (uid) => {

    await getCurrentSuperAdminProfile();

    if (!uid) {
      throw new Error(
        "User ID is required."
      );
    }

    const snapshot =
      await getDoc(
        doc(
          db,
          USERS_COLLECTION,
          uid
        )
      );

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  };

// ============================================================
// UPDATE USER ROLE
// ============================================================

export const updateUserRole =
  async (uid, role) => {

    const current =
      await getCurrentSuperAdminProfile();

    if (!uid) {
      throw new Error(
        "User ID is required."
      );
    }

    const allowedRoles = [
      ROLES.USER,
      ROLES.AUTHOR,
      ROLES.EDITOR,
      ROLES.ADMIN,
      ROLES.SUPER_ADMIN,
    ];

    if (!allowedRoles.includes(role)) {
      throw new Error(
        "Invalid user role."
      );
    }

    // ========================================================
    // Prevent self-demotion
    // ========================================================

    if (
      uid === current.id &&
      role !== ROLES.SUPER_ADMIN
    ) {
      throw new Error(
        "You cannot remove your own Super Administrator role."
      );
    }

    await updateDoc(
      doc(
        db,
        USERS_COLLECTION,
        uid
      ),
      {
        role,

        roleUpdatedAt:
          serverTimestamp(),

        roleUpdatedBy:
          current.id,
      }
    );

    await writeAuditLog(
      "ROLE_UPDATED",
      {
        targetUserId: uid,
        role,
      }
    );

    return true;
  };

// ============================================================
// ENABLE / DISABLE USER
// ============================================================

export const updateUserStatus =
  async (uid, disabled) => {

    const current =
      await getCurrentSuperAdminProfile();

    if (!uid) {
      throw new Error(
        "User ID is required."
      );
    }

    if (uid === current.id) {
      throw new Error(
        "You cannot disable your own account."
      );
    }

    await updateDoc(
      doc(
        db,
        USERS_COLLECTION,
        uid
      ),
      {
        disabled:
          Boolean(disabled),

        statusUpdatedAt:
          serverTimestamp(),

        statusUpdatedBy:
          current.id,
      }
    );

    await writeAuditLog(
      "USER_STATUS_UPDATED",
      {
        targetUserId: uid,

        disabled:
          Boolean(disabled),
      }
    );

    return true;
  };

// ============================================================
// UPDATE SUPER ADMIN PROFILE
// ============================================================

export const updateSuperAdminProfile =
  async ({
    displayName,
    phone,
    photoURL,
  }) => {

    const current =
      await getCurrentSuperAdminProfile();

    const updates = {
      displayName:
        String(
          displayName || ""
        ).trim(),

      phone:
        String(
          phone || ""
        ).trim(),

      updatedAt:
        serverTimestamp(),
    };

    if (
      photoURL !== undefined
    ) {
      updates.photoURL =
        String(
          photoURL || ""
        ).trim();
    }

    await updateDoc(
      doc(
        db,
        USERS_COLLECTION,
        current.id
      ),
      updates
    );

    // ========================================================
    // Update Firebase Authentication profile
    // ========================================================

    const {
      updateProfile,
    } = await import(
      "firebase/auth"
    );

    if (auth.currentUser) {

      await updateProfile(
        auth.currentUser,
        {
          displayName:
            updates.displayName,

          ...(photoURL !== undefined
            ? {
                photoURL:
                  updates.photoURL ||
                  null,
              }
            : {}),
        }
      );
    }

    await writeAuditLog(
      "PROFILE_UPDATED",
      {
        targetUserId:
          current.id,
      }
    );

    return getCurrentSuperAdminProfile();
  };

// ============================================================
// CREATE SUPER ADMIN INVITATION
// ============================================================
//
// IMPORTANT:
// This only creates an invitation document.
// Actual Firebase Auth account creation should be handled
// by a trusted backend / Cloud Function.
// ============================================================

export const createSuperAdminInvitation =
  async ({
    name,
    email,
  }) => {

    const current =
      await getCurrentSuperAdminProfile();

    const normalizedEmail =
      String(
        email || ""
      )
        .trim()
        .toLowerCase();

    if (!normalizedEmail) {
      throw new Error(
        "Email is required."
      );
    }

    const existing =
      await getDocs(
        query(
          collection(
            db,
            USERS_COLLECTION
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
        "An account with this email already exists."
      );
    }

    const invitation =
      await addDoc(
        collection(
          db,
          INVITATIONS_COLLECTION
        ),
        {
          name:
            String(
              name || ""
            ).trim(),

          email:
            normalizedEmail,

          role:
            ROLES.SUPER_ADMIN,

          status:
            "PENDING",

          createdBy:
            current.id,

          createdAt:
            serverTimestamp(),
        }
      );

    await writeAuditLog(
      "SUPER_ADMIN_INVITED",
      {
        invitationId:
          invitation.id,

        email:
          normalizedEmail,
      }
    );

    return invitation.id;
  };

// ============================================================
// DASHBOARD STATISTICS
// ============================================================

export const getDashboardStats =
  async () => {

    const users =
      await listUsers();

    return {

      totalUsers:
        users.length,

      admins:
        users.filter(
          (user) =>
            user.role ===
            ROLES.ADMIN
        ).length,

      superAdmins:
        users.filter(
          (user) =>
            isSuperAdminRole(
              user.role
            )
        ).length,

      authors:
        users.filter(
          (user) =>
            user.role ===
            ROLES.AUTHOR
        ).length,

      editors:
        users.filter(
          (user) =>
            user.role ===
            ROLES.EDITOR
        ).length,

      normalUsers:
        users.filter(
          (user) =>
            user.role ===
            ROLES.USER
        ).length,

      activeUsers:
        users.filter(
          (user) =>
            user.disabled !== true
        ).length,

      disabledUsers:
        users.filter(
          (user) =>
            user.disabled === true
        ).length,

    };
  };

// ============================================================
// SECURITY LOGS
// ============================================================

export const getSecurityLogs =
  async () => {

    await getCurrentSuperAdminProfile();

    const snapshot =
      await getDocs(
        collection(
          db,
          AUDIT_COLLECTION
        )
      );

    return snapshot.docs
      .map(
        (item) => ({
          id: item.id,
          ...item.data(),
        })
      )
      .sort(
        (a, b) => {

          const aTime =
            a.createdAt?.seconds ||
            0;

          const bTime =
            b.createdAt?.seconds ||
            0;

          return (
            bTime -
            aTime
          );
        }
      );
  };

// ============================================================
// AUDIT LOG
// ============================================================

export const writeAuditLog =
  async (
    action,
    metadata = {}
  ) => {

    const current =
      auth.currentUser;

    if (!current) {
      return;
    }

    await addDoc(
      collection(
        db,
        AUDIT_COLLECTION
      ),
      {
        action,

        actorId:
          current.uid,

        actorEmail:
          current.email ||
          "",

        metadata,

        createdAt:
          serverTimestamp(),
      }
    );
  };

// ============================================================
// DELETE FIRESTORE USER DOCUMENT
// ============================================================
//
// IMPORTANT:
// This deletes the Firestore profile document.
// It does NOT delete the Firebase Authentication account.
// ============================================================

export const deleteUserDocument =
  async (uid) => {

    const current =
      await getCurrentSuperAdminProfile();

    if (!uid) {
      throw new Error(
        "User ID is required."
      );
    }

    if (uid === current.id) {
      throw new Error(
        "You cannot delete your own account."
      );
    }

    await deleteDoc(
      doc(
        db,
        USERS_COLLECTION,
        uid
      )
    );

    await writeAuditLog(
      "USER_DOCUMENT_DELETED",
      {
        targetUserId:
          uid,
      }
    );

    return true;
  };


  /*
|--------------------------------------------------------------------------
| Update user profile/details
|--------------------------------------------------------------------------
*/

export const updateUserDetails = async (uid, updates) => {
  const current = await getCurrentSuperAdminProfile();

  if (!uid) {
    throw new Error("User ID is required.");
  }

  const allowedUpdates = {
    name: String(updates.name || "").trim(),

    phone: String(updates.phone || "").trim(),

    experience: String(updates.experience || "").trim(),

    joiningDate: updates.joiningDate || "",

    activeDate: updates.activeDate || "",

    address: String(updates.address || "").trim(),

    city: String(updates.city || "").trim(),

    state: String(updates.state || "").trim(),

    country: String(updates.country || "").trim(),

    pincode: String(updates.pincode || "").trim(),

    bio: String(updates.bio || "").trim(),

    designation: String(updates.designation || "").trim(),

    updatedAt: serverTimestamp(),

    profileUpdatedBy: current.id,
  };

  await updateDoc(
    doc(
      db,
      USERS_COLLECTION,
      uid
    ),
    allowedUpdates
  );

  await writeAuditLog(
    "USER_PROFILE_UPDATED",
    {
      targetUserId: uid,
      fields: Object.keys(allowedUpdates).filter(
        (field) => field !== "updatedAt"
      ),
    }
  );

  return getUserById(uid);
};