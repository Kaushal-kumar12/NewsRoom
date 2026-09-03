// src/services/contactChangeRequestService.js

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./firebase";

import {
  createNotification,
  createNotificationsForUsers,
  NOTIFICATION_TYPES,
} from "./notificationService";


/* =========================================================
   COLLECTIONS
========================================================= */

const USERS_COLLECTION = "users";

const CONTACT_CHANGE_REQUESTS_COLLECTION =
  "contactChangeRequests";


/* =========================================================
   REQUEST STATUS
========================================================= */

export const CONTACT_CHANGE_REQUEST_STATUS = Object.freeze({
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
});


/* =========================================================
   CONTACT CHANGE TYPE
========================================================= */

export const CONTACT_CHANGE_TYPE = Object.freeze({
  EMAIL: "EMAIL",
  PHONE: "PHONE",
});


/* =========================================================
   ROLE CONSTANTS
========================================================= */

const ROLE = Object.freeze({
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMINISTRATOR",
  EDITOR: "EDITOR",
  AUTHOR: "AUTHOR",
});


/* =========================================================
   NORMALIZE ROLE

   Supports legacy role values.
========================================================= */

export function normalizeUserRole(role) {
  if (!role) {
    return "";
  }

  const normalized = String(role)
    .trim()
    .toUpperCase();

  if (
    normalized === "SUPER_ADMIN" ||
    normalized === "SUPERADMIN" ||
    normalized === "SUPER ADMINISTRATOR" ||
    normalized === "SUPER ADMIN"
  ) {
    return ROLE.SUPER_ADMIN;
  }

  if (
    normalized === "ADMINISTRATOR" ||
    normalized === "ADMIN"
  ) {
    return ROLE.ADMIN;
  }

  if (normalized === "EDITOR") {
    return ROLE.EDITOR;
  }

  if (normalized === "AUTHOR") {
    return ROLE.AUTHOR;
  }

  return normalized;
}


/* =========================================================
   GET USER ROLE
========================================================= */

export function getUserRole(user) {
  if (!user) {
    return "";
  }

  return normalizeUserRole(
    user.role ||
      user.userRole ||
      user?.profile?.role ||
      user?.data?.role ||
      ""
  );
}


/* =========================================================
   GET USER NAME
========================================================= */

export function getUserName(user) {
  if (!user) {
    return "User";
  }

  return (
    user.displayName ||
    user.name ||
    user.fullName ||
    user.username ||
    user.email ||
    "User"
  );
}


/* =========================================================
   GET USER PHONE
========================================================= */

export function getUserPhone(user) {
  if (!user) {
    return "";
  }

  return (
    user.phone ||
    user.phoneNumber ||
    user.mobile ||
    user.mobileNumber ||
    ""
  );
}


/* =========================================================
   VALIDATE EMAIL
========================================================= */

export function isValidEmail(email) {
  if (!email) {
    return false;
  }

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(
    String(email).trim()
  );
}


/* =========================================================
   VALIDATE PHONE
========================================================= */

export function isValidPhone(phone) {
  if (!phone) {
    return false;
  }

  const cleanPhone = String(phone)
    .replace(/\s/g, "")
    .replace(/-/g, "");

  return cleanPhone.length >= 10;
}


/* =========================================================
   NORMALIZE EMAIL
========================================================= */

function normalizeEmail(email) {
  if (!email) {
    return "";
  }

  return String(email)
    .trim()
    .toLowerCase();
}


/* =========================================================
   NORMALIZE PHONE
========================================================= */

function normalizePhone(phone) {
  if (!phone) {
    return "";
  }

  return String(phone).trim();
}


/* =========================================================
   GET USER DOCUMENT
========================================================= */

export async function getUserDocument(userId) {
  if (!userId) {
    throw new Error(
      "User ID is required."
    );
  }

  const userReference = doc(
    db,
    USERS_COLLECTION,
    userId
  );

  const snapshot =
    await getDoc(userReference);

  if (!snapshot.exists()) {
    throw new Error(
      "User profile was not found."
    );
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}


/* =========================================================
   GET USERS BY ROLE
========================================================= */

async function getUsersByRole(role) {
  const normalizedRole =
    normalizeUserRole(role);

  const usersReference = collection(
    db,
    USERS_COLLECTION
  );

  const usersQuery = query(
    usersReference,
    where(
      "role",
      "==",
      normalizedRole
    )
  );

  const snapshot =
    await getDocs(usersQuery);

  return snapshot.docs.map(
    (userDocument) => ({
      id: userDocument.id,
      ...userDocument.data(),
    })
  );
}


/* =========================================================
   GET ADMIN IDS
========================================================= */

export async function getAdminIds() {
  const admins =
    await getUsersByRole(
      ROLE.ADMIN
    );

  return admins.map(
    (admin) => admin.id
  );
}


/* =========================================================
   GET SUPER ADMIN IDS
========================================================= */

export async function getSuperAdminIds() {
  const superAdmins =
    await getUsersByRole(
      ROLE.SUPER_ADMIN
    );

  return superAdmins.map(
    (superAdmin) =>
      superAdmin.id
  );
}


/* =========================================================
   GET APPROVER IDS

   AUTHOR / EDITOR
   → ADMINISTRATOR + SUPER_ADMIN

   ADMINISTRATOR
   → SUPER_ADMIN
========================================================= */

export async function getApproverIdsForRole(
  role
) {
  const normalizedRole =
    normalizeUserRole(role);

  if (
    normalizedRole === ROLE.AUTHOR ||
    normalizedRole === ROLE.EDITOR
  ) {
    const [
      adminIds,
      superAdminIds,
    ] = await Promise.all([
      getAdminIds(),
      getSuperAdminIds(),
    ]);

    return [
      ...new Set([
        ...adminIds,
        ...superAdminIds,
      ]),
    ];
  }

  if (
    normalizedRole === ROLE.ADMIN
  ) {
    return await getSuperAdminIds();
  }

  return [];
}


/* =========================================================
   CHECK IF USER CAN REQUEST CONTACT CHANGE
========================================================= */

export function canRequestContactChange(
  role
) {
  const normalizedRole =
    normalizeUserRole(role);

  return (
    normalizedRole === ROLE.AUTHOR ||
    normalizedRole === ROLE.EDITOR ||
    normalizedRole === ROLE.ADMIN
  );
}


/* =========================================================
   CHECK IF USER CAN APPROVE REQUEST

   SUPER ADMIN:
   - Author
   - Editor
   - Administrator

   ADMINISTRATOR:
   - Author
   - Editor
========================================================= */

export function canApproveContactChange({
  approverRole,
  requestUserRole,
}) {
  const normalizedApproverRole =
    normalizeUserRole(
      approverRole
    );

  const normalizedRequestUserRole =
    normalizeUserRole(
      requestUserRole
    );

  if (
    normalizedApproverRole ===
    ROLE.SUPER_ADMIN
  ) {
    return (
      normalizedRequestUserRole ===
        ROLE.AUTHOR ||
      normalizedRequestUserRole ===
        ROLE.EDITOR ||
      normalizedRequestUserRole ===
        ROLE.ADMIN
    );
  }

  if (
    normalizedApproverRole ===
    ROLE.ADMIN
  ) {
    return (
      normalizedRequestUserRole ===
        ROLE.AUTHOR ||
      normalizedRequestUserRole ===
        ROLE.EDITOR
    );
  }

  return false;
}


/* =========================================================
   GET PENDING CONTACT CHANGE REQUEST
========================================================= */

export async function getPendingContactChangeRequest({
  userId,
  type,
}) {
  if (!userId || !type) {
    return null;
  }

  const requestsReference =
    collection(
      db,
      CONTACT_CHANGE_REQUESTS_COLLECTION
    );

  const requestsQuery = query(
    requestsReference,

    where(
      "userId",
      "==",
      userId
    ),

    where(
      "type",
      "==",
      type
    ),

    where(
      "status",
      "==",
      CONTACT_CHANGE_REQUEST_STATUS.PENDING
    ),

    limit(1)
  );

  const snapshot =
    await getDocs(requestsQuery);

  if (snapshot.empty) {
    return null;
  }

  const requestDocument =
    snapshot.docs[0];

  return {
    id: requestDocument.id,
    ...requestDocument.data(),
  };
}


/* =========================================================
   GET ALL PENDING REQUESTS FOR USER
========================================================= */

export async function getPendingContactChangeRequestsForUser(
  userId
) {
  if (!userId) {
    return [];
  }

  const requestsReference =
    collection(
      db,
      CONTACT_CHANGE_REQUESTS_COLLECTION
    );

  const requestsQuery = query(
    requestsReference,

    where(
      "userId",
      "==",
      userId
    ),

    where(
      "status",
      "==",
      CONTACT_CHANGE_REQUEST_STATUS.PENDING
    ),

    orderBy(
      "createdAt",
      "desc"
    )
  );

  const snapshot =
    await getDocs(requestsQuery);

  return snapshot.docs.map(
    (requestDocument) => ({
      id: requestDocument.id,
      ...requestDocument.data(),
    })
  );
}


/* =========================================================
   GET ALL REQUESTS FOR USER
========================================================= */

export async function getContactChangeRequestsForUser(
  userId
) {
  if (!userId) {
    return [];
  }

  const requestsReference =
    collection(
      db,
      CONTACT_CHANGE_REQUESTS_COLLECTION
    );

  const requestsQuery = query(
    requestsReference,

    where(
      "userId",
      "==",
      userId
    ),

    orderBy(
      "createdAt",
      "desc"
    )
  );

  const snapshot =
    await getDocs(requestsQuery);

  return snapshot.docs.map(
    (requestDocument) => ({
      id: requestDocument.id,
      ...requestDocument.data(),
    })
  );
}


/* =========================================================
   GET SINGLE REQUEST
========================================================= */

export async function getContactChangeRequest(
  requestId
) {
  if (!requestId) {
    throw new Error(
      "Request ID is required."
    );
  }

  const requestReference = doc(
    db,
    CONTACT_CHANGE_REQUESTS_COLLECTION,
    requestId
  );

  const snapshot =
    await getDoc(requestReference);

  if (!snapshot.exists()) {
    throw new Error(
      "Contact change request was not found."
    );
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}


/* =========================================================
   CREATE CONTACT CHANGE REQUEST
========================================================= */

export async function createContactChangeRequest({
  user,
  type,
  requestedValue,
}) {
  if (!user?.uid) {
    throw new Error(
      "User is required."
    );
  }

  const userId = user.uid;

  const userRole =
    getUserRole(user);


  /* Check role */

  if (
    !canRequestContactChange(
      userRole
    )
  ) {
    throw new Error(
      "Your role is not allowed to request contact changes."
    );
  }


  /* Validate type */

  if (
    type !==
      CONTACT_CHANGE_TYPE.EMAIL &&
    type !==
      CONTACT_CHANGE_TYPE.PHONE
  ) {
    throw new Error(
      "Invalid contact change type."
    );
  }


  /* Get latest user profile */

  const userProfile =
    await getUserDocument(
      userId
    );


  const currentEmail =
    normalizeEmail(
      userProfile.email ||
        user.email
    );


  const currentPhone =
    normalizePhone(
      getUserPhone(
        userProfile
      )
    );


  let normalizedRequestedValue =
    "";


  /* EMAIL */

  if (
    type ===
    CONTACT_CHANGE_TYPE.EMAIL
  ) {
    normalizedRequestedValue =
      normalizeEmail(
        requestedValue
      );

    if (
      !isValidEmail(
        normalizedRequestedValue
      )
    ) {
      throw new Error(
        "Please enter a valid email address."
      );
    }

    if (
      normalizedRequestedValue ===
      currentEmail
    ) {
      throw new Error(
        "The new email address is the same as your current email address."
      );
    }
  }


  /* PHONE */

  if (
    type ===
    CONTACT_CHANGE_TYPE.PHONE
  ) {
    normalizedRequestedValue =
      normalizePhone(
        requestedValue
      );

    if (
      !isValidPhone(
        normalizedRequestedValue
      )
    ) {
      throw new Error(
        "Please enter a valid phone number."
      );
    }

    if (
      normalizedRequestedValue ===
      currentPhone
    ) {
      throw new Error(
        "The new phone number is the same as your current phone number."
      );
    }
  }


  /* Check duplicate request */

  const existingRequest =
    await getPendingContactChangeRequest({
      userId,
      type,
    });

  if (existingRequest) {
    throw new Error(
      `You already have a pending ${type.toLowerCase()} change request.`
    );
  }


  /* Get approvers */

  const approverIds =
    await getApproverIdsForRole(
      userRole
    );

  if (approverIds.length === 0) {
    throw new Error(
      "No authorized approver was found for your account."
    );
  }


  /* =====================================================
     CREATE REQUEST DATA

     IMPORTANT:
     Multiple fields are stored for easy display in:
     - AdminUsersPage
     - SuperAdminUsersPage
     - SuperAdminUserDetailsPage

     Example:

     Email:
     currentEmail → requestedEmail

     Phone:
     currentPhone → requestedPhone
  ===================================================== */

  const requestData = {
    userId,

    userName:
      getUserName(
        userProfile
      ) ||
      getUserName(user),

    userEmail:
      normalizeEmail(
        userProfile.email ||
          user.email
      ),

    userRole,

    type,

    status:
      CONTACT_CHANGE_REQUEST_STATUS.PENDING,


    /* Original compatible fields */

    currentValue:
      type ===
      CONTACT_CHANGE_TYPE.EMAIL
        ? currentEmail
        : currentPhone,

    requestedValue:
      normalizedRequestedValue,


    /* Better readable fields */

    oldValue:
      type ===
      CONTACT_CHANGE_TYPE.EMAIL
        ? currentEmail
        : currentPhone,

    newValue:
      normalizedRequestedValue,


    /* Change indicators */

    emailChanged:
      type ===
      CONTACT_CHANGE_TYPE.EMAIL,

    phoneChanged:
      type ===
      CONTACT_CHANGE_TYPE.PHONE,


    /* Email details */

    currentEmail,

    requestedEmail:
      type ===
      CONTACT_CHANGE_TYPE.EMAIL
        ? normalizedRequestedValue
        : null,


    /* Phone details */

    currentPhone,

    requestedPhone:
      type ===
      CONTACT_CHANGE_TYPE.PHONE
        ? normalizedRequestedValue
        : null,


    /* Approvers */

    approverIds,


    /* Timestamps */

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp(),

    approvedAt:
      null,

    approvedBy:
      null,

    approvedByName:
      null,

    approvedByRole:
      null,

    rejectedAt:
      null,

    rejectedBy:
      null,

    rejectedByName:
      null,

    rejectedByRole:
      null,

    rejectionReason:
      null,


    /* History */

    history: [
      {
        action:
          "REQUEST_CREATED",

        by:
          userId,

        byName:
          getUserName(
            userProfile
          ),

        byRole:
          userRole,

        createdAt:
          new Date(),
      },
    ],
  };


  /* Create Firestore document */

  const requestReference =
    await addDoc(
      collection(
        db,
        CONTACT_CHANGE_REQUESTS_COLLECTION
      ),
      requestData
    );


  const request = {
    id: requestReference.id,
    ...requestData,
  };


  /* Create notifications */

  await createRequestNotifications({
    request,
    recipientIds:
      approverIds,
  });


  return request;
}


/* =========================================================
   CREATE REQUEST NOTIFICATIONS
========================================================= */

async function createRequestNotifications({
  request,
  recipientIds,
}) {
  if (
    !request ||
    !Array.isArray(recipientIds) ||
    recipientIds.length === 0
  ) {
    return;
  }

  const typeLabel =
    request.type ===
    CONTACT_CHANGE_TYPE.EMAIL
      ? "email address"
      : "phone number";


  const notificationData = {
    requestId:
      request.id,

    userId:
      request.userId,

    type:
      request.type,

    requestUserRole:
      request.userRole,
  };


  await createNotificationsForUsers({
    userIds:
      recipientIds,

    title:
      "New Contact Change Request",

    message:
      `${request.userName || "A user"} requested to change their ${typeLabel}.`,

    type:
      NOTIFICATION_TYPES.CONTACT_CHANGE_REQUEST,

    data:
      notificationData,
  });
}


/* =========================================================
   VALIDATE APPROVER
========================================================= */

async function validateApprover({
  request,
  approver,
}) {
  if (!request) {
    throw new Error(
      "Request was not found."
    );
  }

  if (!approver?.uid) {
    throw new Error(
      "Approver is required."
    );
  }

  const approverRole =
    getUserRole(
      approver
    );

  const allowed =
    canApproveContactChange({
      approverRole,
      requestUserRole:
        request.userRole,
    });

  if (!allowed) {
    throw new Error(
      "You are not authorized to approve this request."
    );
  }

  return true;
}


/* =========================================================
   APPROVE PHONE CHANGE
========================================================= */

async function approvePhoneChange({
  request,
}) {
  const userReference = doc(
    db,
    USERS_COLLECTION,
    request.userId
  );

  const requestedPhone =
    request.requestedPhone ||
    request.newValue ||
    request.requestedValue;

  await updateDoc(
    userReference,
    {
      phone:
        requestedPhone,

      phoneNumber:
        requestedPhone,

      mobile:
        requestedPhone,

      mobileNumber:
        requestedPhone,

      updatedAt:
        serverTimestamp(),
    }
  );
}


/* =========================================================
   APPROVE EMAIL CHANGE

   NOTE:
   This updates Firestore only.

   Firebase Authentication email cannot safely be changed
   for another user from the client SDK.

   Firebase Auth email update can be implemented later
   using Firebase Cloud Functions + Admin SDK.
========================================================= */

async function approveEmailChange({
  request,
}) {
  const userReference = doc(
    db,
    USERS_COLLECTION,
    request.userId
  );

  const requestedEmail =
    request.requestedEmail ||
    request.newValue ||
    request.requestedValue;

  await updateDoc(
    userReference,
    {
      email:
        requestedEmail,

      updatedAt:
        serverTimestamp(),
    }
  );
}


/* =========================================================
   APPROVE CONTACT CHANGE REQUEST
========================================================= */

export async function approveContactChangeRequest({
  requestId,
  approver,
}) {
  if (!requestId) {
    throw new Error(
      "Request ID is required."
    );
  }


  /* Get request */

  const request =
    await getContactChangeRequest(
      requestId
    );


  /* Check status */

  if (
    request.status !==
    CONTACT_CHANGE_REQUEST_STATUS.PENDING
  ) {
    throw new Error(
      "This request has already been processed."
    );
  }


  /* Validate approver */

  await validateApprover({
    request,
    approver,
  });


  const approverRole =
    getUserRole(
      approver
    );

  const approverName =
    getUserName(
      approver
    );


  /* Update user contact information */

  if (
    request.type ===
    CONTACT_CHANGE_TYPE.PHONE
  ) {
    await approvePhoneChange({
      request,
    });
  }


  if (
    request.type ===
    CONTACT_CHANGE_TYPE.EMAIL
  ) {
    await approveEmailChange({
      request,
    });
  }


  /* Update request */

  const requestReference = doc(
    db,
    CONTACT_CHANGE_REQUESTS_COLLECTION,
    requestId
  );


  const updatedHistory = [
    ...(request.history || []),

    {
      action:
        "REQUEST_APPROVED",

      by:
        approver.uid,

      byName:
        approverName,

      byRole:
        approverRole,

      createdAt:
        new Date(),
    },
  ];


  await updateDoc(
    requestReference,
    {
      status:
        CONTACT_CHANGE_REQUEST_STATUS.APPROVED,

      approvedAt:
        serverTimestamp(),

      approvedBy:
        approver.uid,

      approvedByName:
        approverName,

      approvedByRole:
        approverRole,

      updatedAt:
        serverTimestamp(),

      history:
        updatedHistory,
    }
  );


  /* Notify request sender */

  await createNotification({
    recipientId:
      request.userId,

    title:
      "Contact Change Approved",

    message:
      `Your request to change your ${
        request.type ===
        CONTACT_CHANGE_TYPE.EMAIL
          ? "email address"
          : "phone number"
      } has been approved.`,

    type:
      NOTIFICATION_TYPES.CONTACT_CHANGE_APPROVED,

    data: {
      requestId,

      userId:
        request.userId,

      type:
        request.type,
    },
  });


  return {
    success:
      true,

    requestId,
  };
}


/* =========================================================
   REJECT CONTACT CHANGE REQUEST
========================================================= */

export async function rejectContactChangeRequest({
  requestId,
  approver,
  rejectionReason = "",
}) {
  if (!requestId) {
    throw new Error(
      "Request ID is required."
    );
  }


  /* Get request */

  const request =
    await getContactChangeRequest(
      requestId
    );


  /* Check status */

  if (
    request.status !==
    CONTACT_CHANGE_REQUEST_STATUS.PENDING
  ) {
    throw new Error(
      "This request has already been processed."
    );
  }


  /* Validate approver */

  await validateApprover({
    request,
    approver,
  });


  const approverRole =
    getUserRole(
      approver
    );

  const approverName =
    getUserName(
      approver
    );


  const requestReference = doc(
    db,
    CONTACT_CHANGE_REQUESTS_COLLECTION,
    requestId
  );


  const updatedHistory = [
    ...(request.history || []),

    {
      action:
        "REQUEST_REJECTED",

      by:
        approver.uid,

      byName:
        approverName,

      byRole:
        approverRole,

      rejectionReason:
        rejectionReason || "",

      createdAt:
        new Date(),
    },
  ];


  /* Update request */

  await updateDoc(
    requestReference,
    {
      status:
        CONTACT_CHANGE_REQUEST_STATUS.REJECTED,

      rejectedAt:
        serverTimestamp(),

      rejectedBy:
        approver.uid,

      rejectedByName:
        approverName,

      rejectedByRole:
        approverRole,

      rejectionReason:
        rejectionReason || "",

      updatedAt:
        serverTimestamp(),

      history:
        updatedHistory,
    }
  );


  /* Notify request sender */

  let message =
    `Your request to change your ${
      request.type ===
      CONTACT_CHANGE_TYPE.EMAIL
        ? "email address"
        : "phone number"
    } was rejected.`;

  if (rejectionReason) {
    message +=
      ` Reason: ${rejectionReason}`;
  }


  await createNotification({
    recipientId:
      request.userId,

    title:
      "Contact Change Rejected",

    message,

    type:
      NOTIFICATION_TYPES.CONTACT_CHANGE_REJECTED,

    data: {
      requestId,

      userId:
        request.userId,

      type:
        request.type,
    },
  });


  return {
    success:
      true,

    requestId,
  };
}


/* =========================================================
   GET ALL PENDING REQUESTS

   Used by:
   - Admin Users Page
   - Super Admin Users Page
========================================================= */

export async function getAllPendingContactChangeRequests() {
  const requestsReference =
    collection(
      db,
      CONTACT_CHANGE_REQUESTS_COLLECTION
    );


  const requestsQuery = query(
    requestsReference,

    where(
      "status",
      "==",
      CONTACT_CHANGE_REQUEST_STATUS.PENDING
    ),

    orderBy(
      "createdAt",
      "desc"
    )
  );


  const snapshot =
    await getDocs(
      requestsQuery
    );


  return snapshot.docs.map(
    (requestDocument) => ({
      id:
        requestDocument.id,

      ...requestDocument.data(),
    })
  );
}


/* =========================================================
   GET PENDING REQUESTS FOR APPROVER

   ADMINISTRATOR:
   - AUTHOR
   - EDITOR

   SUPER ADMIN:
   - AUTHOR
   - EDITOR
   - ADMINISTRATOR
========================================================= */

export async function getPendingRequestsForApprover({
  approver,
}) {
  if (!approver) {
    return [];
  }

  const approverRole =
    getUserRole(
      approver
    );


  const allRequests =
    await getAllPendingContactChangeRequests();


  return allRequests.filter(
    (request) =>
      canApproveContactChange({
        approverRole,

        requestUserRole:
          request.userRole,
      })
  );
}


/* =========================================================
   CHECK IF USER HAS PENDING REQUEST
========================================================= */

export async function hasPendingContactChangeRequest({
  userId,
  type,
}) {
  const request =
    await getPendingContactChangeRequest({
      userId,
      type,
    });

  return Boolean(request);
}