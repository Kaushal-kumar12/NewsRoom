// src/context/AuthContext.jsx

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";


import {

  auth,

  db,

  onAuthStateChanged,

  signInWithEmailAndPassword,

  signOut,

  createUserWithEmailAndPassword,

  updateProfile,

  sendEmailVerification,

  doc,

  getDoc,

  setDoc,

  updateDoc,

  serverTimestamp,

} from "../services/firebase";


import {

  ROLES,

  normalizeRole,

  isStaffRole,

  isAdminRole,

  isSuperAdminRole,

} from "../config/rolePermissions";


import {

  createContactChangeRequest,

  CONTACT_CHANGE_TYPE,

} from "../services/contactChangeRequestService";


/* ============================================================
   CONTEXT
============================================================ */

const AuthContext =
  createContext(null);


const STORAGE_KEY =
  "newsroom-user-profile";


/* ============================================================
   BUILD PROFILE
============================================================ */

function buildProfile(
  firebaseUser,
  firestoreData = {}
) {

  const role =
    normalizeRole(
      firestoreData.role
    );


  return {

    id:
      firebaseUser.uid,

    uid:
      firebaseUser.uid,


    /* --------------------------------------------------------
       BASIC
    -------------------------------------------------------- */

    name:

      firestoreData.name ||

      firebaseUser.displayName ||

      "User",


    displayName:

      firestoreData.displayName ||

      firestoreData.name ||

      firebaseUser.displayName ||

      "User",


    email:

      firestoreData.email ||

      firebaseUser.email ||

      "",


    role,


    /* --------------------------------------------------------
       PROFILE
    -------------------------------------------------------- */

    avatar:

      firestoreData.avatar ||

      firebaseUser.photoURL ||

      "",


    bio:

      firestoreData.bio ||

      "",


    about:

      firestoreData.about ||

      "",


    website:

      firestoreData.website ||

      "",


    address:

      firestoreData.address ||

      "",


    city:

      firestoreData.city ||

      "",


    state:

      firestoreData.state ||

      "",


    country:

      firestoreData.country ||

      "",


    postalCode:

      firestoreData.postalCode ||

      "",


    /* --------------------------------------------------------
       SOCIAL
    -------------------------------------------------------- */

    linkedin:

      firestoreData.linkedin ||

      "",


    twitter:

      firestoreData.twitter ||

      "",


    facebook:

      firestoreData.facebook ||

      "",


    instagram:

      firestoreData.instagram ||

      "",


    /* --------------------------------------------------------
       USER SETTINGS
    -------------------------------------------------------- */

    followed:

      Array.isArray(
        firestoreData.followed
      )

        ? firestoreData.followed

        : [],


    notifyBreaking:

      firestoreData.notifyBreaking ??
      true,


    notifyCategory:

      firestoreData.notifyCategory ??
      true,


    /* --------------------------------------------------------
       ACCOUNT STATUS
    -------------------------------------------------------- */

    status:

      String(

        firestoreData.status ||

        firestoreData.accountStatus ||

        "ACTIVE"

      )

        .trim()

        .toUpperCase(),


    accountStatus:

      String(

        firestoreData.accountStatus ||

        firestoreData.status ||

        "ACTIVE"

      )

        .trim()

        .toUpperCase(),


    /* --------------------------------------------------------
       PHONE
    -------------------------------------------------------- */

    phoneNumber:

      firestoreData.phoneNumber ||

      firebaseUser.phoneNumber ||

      "",


    phoneVerified:

      Boolean(

        firestoreData.phoneVerified ||

        firebaseUser.phoneNumber

      ),


    /* --------------------------------------------------------
       EMAIL
    -------------------------------------------------------- */

    emailVerified:

      Boolean(
        firebaseUser.emailVerified
      ),


    verificationMethod:

      firestoreData.verificationMethod ||

      "",


    /* --------------------------------------------------------
       ROLE FLAGS
    -------------------------------------------------------- */

    isSuperAdmin:

      isSuperAdminRole(role),


    isAdmin:

      isAdminRole(role),


    isStaff:

      isStaffRole(role),


    /* --------------------------------------------------------
       TIMESTAMPS
    -------------------------------------------------------- */

    createdAt:

      firestoreData.createdAt ||

      null,


    updatedAt:

      firestoreData.updatedAt ||

      null,

  };

}


/* ============================================================
   AUTH PROVIDER
============================================================ */

export function AuthProvider({
  children,
}) {


  const [

    user,

    setUser,

  ] =
    useState(null);


  const [

    firebaseUser,

    setFirebaseUser,

  ] =
    useState(null);


  const [

    loading,

    setLoading,

  ] =
    useState(true);


  /* ==========================================================
     SAVE LOCAL PROFILE
  ========================================================== */

  function saveLocalProfile(
    profile
  ) {

    setUser(profile);


    try {

      localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(profile)

      );

    } catch {

      // Ignore storage errors.

    }

  }


  /* ==========================================================
     LOAD USER PROFILE
  ========================================================== */

  async function loadUserProfile(
    currentFirebaseUser
  ) {

    if (!currentFirebaseUser) {

      return null;

    }


    const userRef =
      doc(

        db,

        "users",

        currentFirebaseUser.uid

      );


    const snapshot =
      await getDoc(userRef);


    /* --------------------------------------------------------
       EXISTING PROFILE
    -------------------------------------------------------- */

    if (
      snapshot.exists()
    ) {

      const profile =
        buildProfile(

          currentFirebaseUser,

          snapshot.data()

        );


      saveLocalProfile(
        profile
      );


      return profile;

    }


    /* --------------------------------------------------------
       MISSING PROFILE
    -------------------------------------------------------- */

    const profile =
      buildProfile(

        currentFirebaseUser,

        {

          name:

            currentFirebaseUser.displayName ||

            "User",


          displayName:

            currentFirebaseUser.displayName ||

            "User",


          email:

            currentFirebaseUser.email ||

            "",


          role:

            ROLES.USER,


          status:

            "ACTIVE",


          accountStatus:

            "ACTIVE",


          avatar:

            "",


          bio:

            "",


          about:

            "",


          address:

            "",


          city:

            "",


          state:

            "",


          country:

            "",


          postalCode:

            "",


          website:

            "",


          linkedin:

            "",


          twitter:

            "",


          facebook:

            "",


          instagram:

            "",


          followed:

            [],


          notifyBreaking:

            true,


          notifyCategory:

            true,

        }

      );


    await setDoc(

      userRef,

      {

        ...profile,


        createdAt:
          serverTimestamp(),


        updatedAt:
          serverTimestamp(),

      },

      {

        merge: true,

      }

    );


    saveLocalProfile(
      profile
    );


    return profile;

  }


  /* ==========================================================
     REFRESH PROFILE
  ========================================================== */

  async function refreshProfile() {

    const currentUser =
      auth.currentUser;


    if (!currentUser) {

      return null;

    }


    await currentUser.reload();


    const profile =
      await loadUserProfile(
        currentUser
      );


    setFirebaseUser(
      currentUser
    );


    setUser(
      profile
    );


    return profile;

  }


  /* ==========================================================
     UPDATE OWN PROFILE
  ========================================================== */

  async function updateOwnProfile(
    updates = {}
  ) {

    if (
      !auth.currentUser?.uid
    ) {

      throw new Error(
        "You are not authenticated."
      );

    }


    /*
     * SECURITY:
     *
     * Only these fields can be changed
     * directly from the profile page.
     *
     * Email, phone and role are NOT
     * included here.
     */

    const allowedFields = [

      "name",

      "displayName",

      "avatar",

      "bio",

      "about",

      "website",

      "address",

      "city",

      "state",

      "country",

      "postalCode",

      "linkedin",

      "twitter",

      "facebook",

      "instagram",

    ];


    const safeUpdates = {};


    allowedFields.forEach(
      (field) => {

        if (
          Object.prototype.hasOwnProperty.call(
            updates,
            field
          )
        ) {

          safeUpdates[field] =
            updates[field] ??
            "";

        }

      }
    );


    if (
      Object.prototype.hasOwnProperty.call(
        safeUpdates,
        "name"
      )
    ) {

      safeUpdates.name =
        String(
          safeUpdates.name
        ).trim();


      safeUpdates.displayName =
        safeUpdates.name;

    }


    if (
      Object.prototype.hasOwnProperty.call(
        safeUpdates,
        "displayName"
      )
    ) {

      safeUpdates.displayName =
        String(
          safeUpdates.displayName
        ).trim();

    }


    await updateDoc(

      doc(

        db,

        "users",

        auth.currentUser.uid

      ),

      {

        ...safeUpdates,


        updatedAt:
          serverTimestamp(),

      }

    );


    const authUpdates = {};


    if (

      Object.prototype.hasOwnProperty.call(
        safeUpdates,
        "displayName"
      )

      &&

      safeUpdates.displayName

    ) {

      authUpdates.displayName =
        safeUpdates.displayName;

    }


    if (
      Object.keys(
        authUpdates
      ).length > 0
    ) {

      await updateProfile(

        auth.currentUser,

        authUpdates

      );

    }


    return await refreshProfile();

  }


  /* ==========================================================
     REQUEST EMAIL / PHONE CHANGE
  ========================================================== */

  async function requestContactChange({

    type,

    newValue,

  }) {

    if (
      !auth.currentUser?.uid
    ) {

      throw new Error(
        "You are not authenticated."
      );

    }


    const normalizedType =
      String(
        type || ""
      )

        .trim()

        .toUpperCase();


    if (

      normalizedType !==
      CONTACT_CHANGE_TYPE.EMAIL

      &&

      normalizedType !==
      CONTACT_CHANGE_TYPE.PHONE

    ) {

      throw new Error(
        "Invalid contact change request type."
      );

    }


    const requestedValue =
      String(
        newValue || ""
      ).trim();


    if (!requestedValue) {

      throw new Error(
        "Please enter the new contact value."
      );

    }


    /*
     * IMPORTANT:
     *
     * Do not create requests directly
     * inside AuthContext.
     *
     * The centralized service handles:
     *
     * - role authorization
     * - Author/Editor -> Admin + Super Admin
     * - Admin -> Super Admin
     * - validation
     * - duplicate pending request prevention
     * - Firestore request creation
     * - approver IDs
     * - notifications
     */

    const requestUser = {

      ...(user || {}),


      uid:
        auth.currentUser.uid,


      email:

        user?.email ||

        auth.currentUser.email ||

        "",


      displayName:

        user?.displayName ||

        user?.name ||

        auth.currentUser.displayName ||

        "User",


      name:

        user?.name ||

        auth.currentUser.displayName ||

        "User",


      phoneNumber:

        user?.phoneNumber ||

        auth.currentUser.phoneNumber ||

        "",


      role:

        normalizeRole(
          user?.role
        ),

    };


    const request =
      await createContactChangeRequest({

        user:
          requestUser,


        type:
          normalizedType,


        requestedValue,

      });


    return request;

  }


  /* ==========================================================
     FIREBASE AUTH LISTENER
  ========================================================== */

  useEffect(() => {

    let mounted = true;


    const unsubscribe =
      onAuthStateChanged(

        auth,

        async (
          currentFirebaseUser
        ) => {

          if (
            !currentFirebaseUser
          ) {

            if (!mounted) {

              return;

            }


            setFirebaseUser(null);

            setUser(null);


            try {

              localStorage.removeItem(
                STORAGE_KEY
              );

            } catch {

              // Ignore.

            }


            setLoading(false);

            return;

          }


          try {

            if (!mounted) {

              return;

            }


            setLoading(true);


            const profile =
              await loadUserProfile(
                currentFirebaseUser
              );


            if (!mounted) {

              return;

            }


            setFirebaseUser(
              currentFirebaseUser
            );


            setUser(
              profile
            );

          } catch (
            error
          ) {

            console.error(
              "Unable to load user profile:",
              error
            );


            if (!mounted) {

              return;

            }


            setFirebaseUser(
              currentFirebaseUser
            );


            setUser(null);

          } finally {

            if (
              mounted
            ) {

              setLoading(false);

            }

          }

        }

      );


    return () => {

      mounted = false;

      unsubscribe();

    };

  }, []);


  /* ==========================================================
     LOGIN
  ========================================================== */

  async function login(
    email,
    password
  ) {

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


    if (!password) {

      throw new Error(
        "Password is required."
      );

    }


    const credential =
      await signInWithEmailAndPassword(

        auth,

        normalizedEmail,

        password

      );


    const firebaseAccount =
      credential.user;


    await firebaseAccount.reload();


    let profile =
      await loadUserProfile(
        firebaseAccount
      );


    let accountStatus =
      String(

        profile?.accountStatus ||

        profile?.status ||

        "ACTIVE"

      )

        .trim()

        .toUpperCase();


    const emailVerified =
      Boolean(
        firebaseAccount.emailVerified
      );


    const phoneVerified =
      Boolean(

        profile?.phoneVerified ||

        firebaseAccount.phoneNumber

      );


    if (

      emailVerified &&

      accountStatus ===
        "PENDING_EMAIL_VERIFICATION"

    ) {

      await setDoc(

        doc(

          db,

          "users",

          firebaseAccount.uid

        ),

        {

          status:
            "ACTIVE",


          accountStatus:
            "ACTIVE",


          emailVerified:
            true,


          activatedAt:
            serverTimestamp(),


          activationMethod:
            "EMAIL",


          updatedAt:
            serverTimestamp(),

        },

        {

          merge: true,

        }

      );


      profile =
        await loadUserProfile(
          firebaseAccount
        );


      accountStatus =
        String(

          profile?.accountStatus ||

          profile?.status ||

          "ACTIVE"

        )

          .trim()

          .toUpperCase();

    }


    if (

      accountStatus ===
        "PENDING_EMAIL_VERIFICATION" &&

      !emailVerified

    ) {

      await signOut(auth);


      throw new Error(

        "Your account is pending email verification. Please verify your email before signing in."

      );

    }


    if (

      accountStatus ===
        "PENDING_PHONE_VERIFICATION" &&

      !phoneVerified

    ) {

      await signOut(auth);


      throw new Error(

        "Your account is pending mobile verification. Please complete OTP verification before signing in."

      );

    }


    if (

      [

        "DISABLED",

        "SUSPENDED",

        "BLOCKED",

      ].includes(
        accountStatus
      )

    ) {

      await signOut(auth);


      throw new Error(

        "Your NewsRoom account is currently disabled. Please contact an administrator."

      );

    }


    setFirebaseUser(
      firebaseAccount
    );


    setUser(
      profile
    );


    return profile;

  }


  /* ==========================================================
     PUBLIC REGISTRATION
  ========================================================== */

  async function register({

    name,

    email,

    password,

    phoneNumber = "",

  }) {

    const normalizedName =
      name?.trim();


    const normalizedEmail =
      email
        ?.trim()
        .toLowerCase();


    const normalizedPhone =
      phoneNumber?.trim() ||
      "";


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
        "Password is required."
      );

    }


    const credential =
      await createUserWithEmailAndPassword(

        auth,

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


    const hasPhone =
      Boolean(
        normalizedPhone
      );


    const initialStatus =
      hasPhone

        ? "PENDING_PHONE_VERIFICATION"

        : "PENDING_EMAIL_VERIFICATION";


    const profile = {

      id:
        credential.user.uid,


      uid:
        credential.user.uid,


      name:
        normalizedName,


      displayName:
        normalizedName,


      email:
        normalizedEmail,


      phoneNumber:
        normalizedPhone,


      phoneVerified:
        false,


      emailVerified:
        false,


      verificationMethod:

        hasPhone

          ? "PHONE_OTP"

          : "EMAIL_LINK",


      role:
        ROLES.USER,


      status:
        initialStatus,


      accountStatus:
        initialStatus,


      avatar:
        "",


      bio:
        "",


      about:
        "",


      website:
        "",


      address:
        "",


      city:
        "",


      state:
        "",


      country:
        "",


      postalCode:
        "",


      linkedin:
        "",


      twitter:
        "",


      facebook:
        "",


      instagram:
        "",


      followed:
        [],


      notifyBreaking:
        true,


      notifyCategory:
        true,


      isSuperAdmin:
        false,


      isAdmin:
        false,


      isStaff:
        false,

    };


    await setDoc(

      doc(

        db,

        "users",

        credential.user.uid

      ),

      {

        ...profile,


        createdAt:
          serverTimestamp(),


        updatedAt:
          serverTimestamp(),

      }

    );


    if (!hasPhone) {

      await sendEmailVerification(

        credential.user,

        {

          url:

            `${window.location.origin}/verify-email`,


          handleCodeInApp:
            true,

        }

      );

    }


    setFirebaseUser(
      credential.user
    );


    saveLocalProfile(
      profile
    );


    return {

      ...profile,


      requiresPhoneVerification:
        hasPhone,


      requiresEmailVerification:
        !hasPhone,

    };

  }


  /* ==========================================================
     PHONE VERIFIED
  ========================================================== */

  async function markPhoneRegistrationVerified(
    phoneNumber
  ) {

    if (
      !auth.currentUser?.uid
    ) {

      throw new Error(
        "No registration session is active."
      );

    }


    const normalizedPhone =
      phoneNumber?.trim();


    await setDoc(

      doc(

        db,

        "users",

        auth.currentUser.uid

      ),

      {

        phoneNumber:

          normalizedPhone ||

          auth.currentUser.phoneNumber ||

          "",


        phoneVerified:
          true,


        status:
          "ACTIVE",


        accountStatus:
          "ACTIVE",


        verificationMethod:
          "PHONE_OTP",


        activationMethod:
          "PHONE_OTP",


        activatedAt:
          serverTimestamp(),


        updatedAt:
          serverTimestamp(),

      },

      {

        merge: true,

      }

    );


    return await refreshProfile();

  }


  /* ==========================================================
     RESEND EMAIL ACTIVATION
  ========================================================== */

  async function resendEmailActivation() {

    if (!auth.currentUser) {

      throw new Error(
        "Please sign in to resend the activation email."
      );

    }


    await auth.currentUser.reload();


    if (
      auth.currentUser.emailVerified
    ) {

      return;

    }


    await sendEmailVerification(

      auth.currentUser,

      {

        url:

          `${window.location.origin}/verify-email`,


        handleCodeInApp:
          true,

      }

    );

  }


  /* ==========================================================
     LOGOUT
  ========================================================== */

  async function logout() {

    try {

      await signOut(auth);

    } finally {

      setFirebaseUser(null);

      setUser(null);


      try {

        localStorage.removeItem(
          STORAGE_KEY
        );

      } catch {

        // Ignore.

      }

    }

  }


  /* ==========================================================
     ROLE HELPER
  ========================================================== */

  function hasRole(
    roles = []
  ) {

    if (!user) {

      return false;

    }


    const currentRole =
      normalizeRole(
        user.role
      );


    return roles.some(

      (role) =>

        normalizeRole(role) ===
        currentRole

    );

  }


  /* ==========================================================
     CURRENT ROLE
  ========================================================== */

  const currentRole =
    normalizeRole(
      user?.role
    );


  const isNormalUser =

    Boolean(user) &&

    currentRole ===
      ROLES.USER;


  const isStaff =

    Boolean(user) &&

    isStaffRole(
      currentRole
    );


  const isAdmin =

    Boolean(user) &&

    isAdminRole(
      currentRole
    );


  const isSuperAdmin =

    Boolean(user) &&

    isSuperAdminRole(
      currentRole
    );


  /* ==========================================================
     CONTEXT VALUE
  ========================================================== */

  const value =
    useMemo(

      () => ({

        user,

        profile:
          user,

        firebaseUser,

        loading,


        isAuthenticated:

          Boolean(
            firebaseUser
          ),


        login,

        register,

        logout,


        refreshProfile,

        updateOwnProfile,

        requestContactChange,


        markPhoneRegistrationVerified,

        resendEmailActivation,


        role:
          currentRole,


        hasRole,


        isNormalUser,

        isStaff,

        isAdmin,

        isSuperAdmin,


        ROLES,

      }),

      [

        user,

        firebaseUser,

        loading,

        currentRole,

        isNormalUser,

        isStaff,

        isAdmin,

        isSuperAdmin,

      ]

    );


  return (

    <AuthContext.Provider
      value={value}
    >

      {children}

    </AuthContext.Provider>

  );

}


/* ============================================================
   HOOK
============================================================ */

export function useAuth() {

  const context =
    useContext(
      AuthContext
    );


  if (!context) {

    throw new Error(

      "useAuth must be used inside AuthProvider."

    );

  }


  return context;

}