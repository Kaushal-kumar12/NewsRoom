// src/services/firebase.js

import {
  initializeApp,
} from "firebase/app";


/* ============================================================
   FIREBASE AUTH
============================================================ */

import {

  getAuth,

  createUserWithEmailAndPassword,

  signInWithEmailAndPassword,

  signOut,

  onAuthStateChanged,

  updateProfile,

  sendEmailVerification,

  sendPasswordResetEmail,

  reload,

  RecaptchaVerifier,

  signInWithPhoneNumber,

  PhoneAuthProvider,

  linkWithCredential,

  EmailAuthProvider,

  reauthenticateWithCredential,

  updateEmail,

  updatePhoneNumber,

} from "firebase/auth";


/* ============================================================
   FIRESTORE
============================================================ */

import {

  getFirestore,

  collection,

  addDoc,

  getDocs,

  doc,

  getDoc,

  setDoc,

  updateDoc,

  deleteDoc,

  query,

  orderBy,

  where,

  serverTimestamp,

} from "firebase/firestore";


/* ============================================================
   FIREBASE STORAGE
============================================================ */

import {

  getStorage,

  ref,

  uploadBytes,

  getDownloadURL,

  deleteObject,

} from "firebase/storage";


/* ============================================================
   FIREBASE ANALYTICS
============================================================ */

import {

  getAnalytics,

  isSupported,

} from "firebase/analytics";


/* ============================================================
   FIREBASE CONFIGURATION
============================================================ */

const firebaseConfig = {

  apiKey:
    import.meta.env
      .VITE_FIREBASE_API_KEY,

  authDomain:
    import.meta.env
      .VITE_FIREBASE_AUTH_DOMAIN,

  projectId:
    import.meta.env
      .VITE_FIREBASE_PROJECT_ID,

  storageBucket:
    import.meta.env
      .VITE_FIREBASE_STORAGE_BUCKET,

  messagingSenderId:
    import.meta.env
      .VITE_FIREBASE_MESSAGING_SENDER_ID,

  appId:
    import.meta.env
      .VITE_FIREBASE_APP_ID,

  measurementId:
    import.meta.env
      .VITE_FIREBASE_MEASUREMENT_ID,

};


/* ============================================================
   VALIDATE ENVIRONMENT
============================================================ */

const requiredFirebaseEnv = {

  VITE_FIREBASE_API_KEY:
    firebaseConfig.apiKey,

  VITE_FIREBASE_AUTH_DOMAIN:
    firebaseConfig.authDomain,

  VITE_FIREBASE_PROJECT_ID:
    firebaseConfig.projectId,

  VITE_FIREBASE_STORAGE_BUCKET:
    firebaseConfig.storageBucket,

  VITE_FIREBASE_MESSAGING_SENDER_ID:
    firebaseConfig.messagingSenderId,

  VITE_FIREBASE_APP_ID:
    firebaseConfig.appId,

};


const missingFirebaseEnv =
  Object.entries(
    requiredFirebaseEnv
  )
    .filter(
      ([, value]) => !value
    )
    .map(
      ([key]) => key
    );


if (
  missingFirebaseEnv.length > 0
) {

  console.error(

    "Missing Firebase environment variables:",

    missingFirebaseEnv

  );

}


/* ============================================================
   INITIALIZE FIREBASE
============================================================ */

const app =
  initializeApp(
    firebaseConfig
  );


/* ============================================================
   AUTH
============================================================ */

export const auth =
  getAuth(app);


/* ============================================================
   FIRESTORE
============================================================ */

export const db =
  getFirestore(app);


/* ============================================================
   FIREBASE STORAGE
============================================================ */

export const storage =
  getStorage(app);


/* ============================================================
   ANALYTICS
============================================================ */

if (
  typeof window !==
  "undefined"
) {

  isSupported()

    .then(
      (supported) => {

        if (supported) {

          getAnalytics(app);

        }

      }
    )

    .catch(
      (error) => {

        console.warn(

          "Firebase Analytics unavailable:",

          error

        );

      }
    );

}


/* ============================================================
   AUTH EXPORTS
============================================================ */

export {

  createUserWithEmailAndPassword,

  signInWithEmailAndPassword,

  signOut,

  onAuthStateChanged,

  updateProfile,

  sendEmailVerification,

  sendPasswordResetEmail,

  reload,

  RecaptchaVerifier,

  signInWithPhoneNumber,

  PhoneAuthProvider,

  linkWithCredential,

  EmailAuthProvider,

  reauthenticateWithCredential,

  updateEmail,

  updatePhoneNumber,

};


/* ============================================================
   FIRESTORE EXPORTS
============================================================ */

export {

  collection,

  addDoc,

  getDocs,

  doc,

  getDoc,

  setDoc,

  updateDoc,

  deleteDoc,

  query,

  orderBy,

  where,

  serverTimestamp,

};


/* ============================================================
   STORAGE EXPORTS
============================================================ */

export {

  ref,

  uploadBytes,

  getDownloadURL,

  deleteObject,

};


/* ============================================================
   DEFAULT APP
============================================================ */

export default app;