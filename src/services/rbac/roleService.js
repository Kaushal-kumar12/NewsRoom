import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../../lib/firebase/firebaseClient";

const ROLES = "roles";

function ensureDb() {
  if (!db) throw new Error("Firestore is not configured.");
}

export async function getRoles() {
  ensureDb();
  const snapshot = await getDocs(collection(db, ROLES));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function getRole(roleId) {
  ensureDb();
  const snapshot = await getDoc(doc(db, ROLES, roleId));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function saveRole(roleId, role) {
  ensureDb();
  return setDoc(doc(db, ROLES, roleId), {
    ...role,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function deleteRole(roleId) {
  ensureDb();
  return deleteDoc(doc(db, ROLES, roleId));
}

export const defaultRoles = [
  {
    id: "super-administrator",
    name: "Super Administrator",
    description: "Full system control including roles and permissions.",
    permissions: ["*"],
    protected: true
  },
  {
    id: "administrator",
    name: "Administrator",
    description: "Manages newsroom operations and administrative resources.",
    permissions: [
      "users.read", "users.manage",
      "news.read", "news.manage",
      "categories.manage", "tags.manage",
      "media.manage", "advertisements.manage",
      "polls.manage", "settings.manage", "audit.read"
    ],
    protected: true
  },
  {
    id: "editor",
    name: "Editor",
    description: "Reviews and publishes newsroom stories.",
    permissions: [
      "news.read", "news.review", "news.publish",
      "news.schedule", "news.reject"
    ],
    protected: false
  },
  {
    id: "author",
    name: "Author / Reporter",
    description: "Creates and submits stories for editorial review.",
    permissions: [
      "news.read", "news.create", "news.editOwn", "news.submit"
    ],
    protected: false
  },
  {
    id: "registered-user",
    name: "Registered User",
    description: "Consumes public content and uses user features.",
    permissions: [
      "news.read", "comments.create",
      "bookmarks.manage", "likes.manage"
    ],
    protected: true
  }
];
