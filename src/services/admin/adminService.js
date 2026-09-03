import {
  collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
  serverTimestamp, query, orderBy
} from "firebase/firestore";
import { db } from "../../lib/firebase/firebaseClient";

const ensureDb = () => { if (!db) throw new Error("Firestore is not configured."); };

export async function getCollection(name) {
  ensureDb();
  const snapshot = await getDocs(collection(db, name));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function getDocument(name, id) {
  ensureDb();
  const snapshot = await getDoc(doc(db, name, id));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function createDocument(name, data) {
  ensureDb();
  return addDoc(collection(db, name), {
    ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  });
}

export async function setDocument(name, id, data) {
  ensureDb();
  return setDoc(doc(db, name, id), {
    ...data, updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function updateDocument(name, id, data) {
  ensureDb();
  return updateDoc(doc(db, name, id), {
    ...data, updatedAt: serverTimestamp()
  });
}

export async function deleteDocument(name, id) {
  ensureDb();
  return deleteDoc(doc(db, name, id));
}

export async function getSiteSettings() {
  return getDocument("settings", "site");
}

export async function saveSiteSettings(data) {
  return setDocument("settings", "site", data);
}

export async function getAuditLogs() {
  return getCollection("auditLogs");
}
