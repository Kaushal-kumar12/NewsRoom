// src/services/contactChangeService.js

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  db,
} from "../firebase";


/* =========================================================
   COLLECTIONS
========================================================= */

const USERS_COLLECTION =
  "users";

const CONTACT_CHANGE_REQUESTS_COLLECTION =
  "contactChangeRequests";


/* =========================================================
   REQUEST TYPES
========================================================= */

export const CONTACT_CHANGE_TYPES = {

  EMAIL:
    "EMAIL",

  PHONE:
    "PHONE",

};


/* =========================================================
   REQUEST STATUS
========================================================= */

export const CONTACT_CHANGE_STATUS = {

  PENDING:
    "PENDING",

  APPROVED:
    "APPROVED",

  REJECTED:
    "REJECTED",

};


/* =========================================================
   NORMALIZE ROLE
========================================================= */

function normalizeRole(
  role
) {

  if (!role) {
    return "";
  }

  return String(role)
    .trim()
    .toUpperCase();

}


/* =========================================================
   CHECK REQUEST TYPE
========================================================= */

function validateRequestType(
  type
) {

  if (
    type !==
      CONTACT_CHANGE_TYPES.EMAIL
    &&
    type !==
      CONTACT_CHANGE_TYPES.PHONE
  ) {

    throw new Error(
      "Invalid contact change request type."
    );

  }

}


/* =========================================================
   GET APPROVAL ROLES
========================================================= */

export function getApprovalRoles(
  userRole
) {

  const normalizedRole =
    normalizeRole(
      userRole
    );


  /* ===============================================
     AUTHOR
     EDITOR

     ADMIN OR SUPER ADMIN CAN APPROVE
  =============================================== */

  if (
    normalizedRole === "AUTHOR"
    ||
    normalizedRole === "EDITOR"
  ) {

    return [
      "ADMIN",
      "SUPER_ADMIN",
    ];

  }


  /* ===============================================
     ADMIN

     ONLY SUPER ADMIN CAN APPROVE
  =============================================== */

  if (
    normalizedRole === "ADMIN"
  ) {

    return [
      "SUPER_ADMIN",
    ];

  }


  /* ===============================================
     SUPER ADMIN

     NOT ALLOWED THROUGH THIS FLOW
  =============================================== */

  if (
    normalizedRole === "SUPER_ADMIN"
  ) {

    return [];

  }


  return [];

}


/* =========================================================
   CAN ROLE APPROVE REQUEST
========================================================= */

export function canApproveContactChangeRequest(
  approverRole,
  request
) {

  if (!request) {
    return false;
  }


  const normalizedApproverRole =
    normalizeRole(
      approverRole
    );


  const allowedRoles =
    Array.isArray(
      request.approvalRoles
    )
      ? request.approvalRoles
      : getApprovalRoles(
          request.userRole
        );


  return allowedRoles.includes(
    normalizedApproverRole
  );

}


/* =========================================================
   GET USER DOCUMENT
========================================================= */

export async function getUserDocument(
  userId
) {

  if (!userId) {

    throw new Error(
      "User ID is required."
    );

  }


  const userReference =
    doc(
      db,
      USERS_COLLECTION,
      userId
    );


  const userSnapshot =
    await getDoc(
      userReference
    );


  if (
    !userSnapshot.exists()
  ) {

    throw new Error(
      "User not found."
    );

  }


  return {
    id:
      userSnapshot.id,

    ...userSnapshot.data(),
  };

}


/* =========================================================
   CHECK PENDING REQUEST
========================================================= */

export async function getPendingContactChangeRequest(
  userId,
  type
) {

  if (!userId) {

    throw new Error(
      "User ID is required."
    );

  }


  validateRequestType(
    type
  );


  const requestsReference =
    collection(
      db,
      CONTACT_CHANGE_REQUESTS_COLLECTION
    );


  const requestQuery =
    query(
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
        CONTACT_CHANGE_STATUS.PENDING
      ),

      limit(1)
    );


  const snapshot =
    await getDocs(
      requestQuery
    );


  if (
    snapshot.empty
  ) {

    return null;

  }


  const requestDocument =
    snapshot.docs[0];


  return {

    id:
      requestDocument.id,

    ...requestDocument.data(),

  };

}


/* =========================================================
   CREATE CONTACT CHANGE REQUEST
========================================================= */

export async function createContactChangeRequest({

  userId,

  type,

  oldValue,

  newValue,

  reason = "",

}) {

  if (!userId) {

    throw new Error(
      "User ID is required."
    );

  }


  validateRequestType(
    type
  );


  if (
    !newValue
    ||
    !String(newValue).trim()
  ) {

    throw new Error(
      "New contact value is required."
    );

  }


  const cleanOldValue =
    String(
      oldValue || ""
    ).trim();


  const cleanNewValue =
    String(
      newValue
    ).trim();


  if (
    cleanOldValue ===
    cleanNewValue
  ) {

    throw new Error(
      "The new value must be different from the current value."
    );

  }


  /* ===============================================
     GET USER
  =============================================== */

  const userData =
    await getUserDocument(
      userId
    );


  const userRole =
    normalizeRole(
      userData.role
    );


  /* ===============================================
     SUPER ADMIN RESTRICTION
  =============================================== */

  if (
    userRole ===
    "SUPER_ADMIN"
  ) {

    throw new Error(
      "Super Admin contact changes cannot be requested through this approval process."
    );

  }


  /* ===============================================
     CHECK APPROVAL ROLES
  =============================================== */

  const approvalRoles =
    getApprovalRoles(
      userRole
    );


  if (
    approvalRoles.length === 0
  ) {

    throw new Error(
      "No approval authority is available for this user."
    );

  }


  /* ===============================================
     CHECK DUPLICATE PENDING REQUEST
  =============================================== */

  const existingRequest =
    await getPendingContactChangeRequest(
      userId,
      type
    );


  if (
    existingRequest
  ) {

    throw new Error(
      `You already have a pending ${type.toLowerCase()} change request.`
    );

  }


  /* ===============================================
     CREATE REQUEST
  =============================================== */

  const requestsReference =
    collection(
      db,
      CONTACT_CHANGE_REQUESTS_COLLECTION
    );


  const requestData = {

    userId,

    userName:
      userData.displayName
      ||
      userData.name
      ||
      userData.fullName
      ||
      "",


    userEmail:
      userData.email
      ||
      "",


    userRole,


    type,


    oldValue:
      cleanOldValue,


    newValue:
      cleanNewValue,


    reason:
      String(
        reason || ""
      ).trim(),


    status:
      CONTACT_CHANGE_STATUS.PENDING,


    approvalRoles,


    requestedAt:
      serverTimestamp(),


    approvedBy:
      null,


    approvedByName:
      null,


    approvedByRole:
      null,


    approvedAt:
      null,


    rejectedBy:
      null,


    rejectedByName:
      null,


    rejectedByRole:
      null,


    rejectedAt:
      null,


    rejectionReason:
      null,


    updatedAt:
      serverTimestamp(),

  };


  const createdRequest =
    await addDoc(
      requestsReference,
      requestData
    );


  return {

    id:
      createdRequest.id,

    ...requestData,

  };

}


/* =========================================================
   GET USER CONTACT CHANGE REQUESTS
========================================================= */

export async function getUserContactChangeRequests(
  userId
) {

  if (!userId) {

    throw new Error(
      "User ID is required."
    );

  }


  const requestsReference =
    collection(
      db,
      CONTACT_CHANGE_REQUESTS_COLLECTION
    );


  const requestQuery =
    query(
      requestsReference,

      where(
        "userId",
        "==",
        userId
      ),

      orderBy(
        "requestedAt",
        "desc"
      )
    );


  const snapshot =
    await getDocs(
      requestQuery
    );


  return snapshot.docs.map(
    (
      requestDocument
    ) => ({

      id:
        requestDocument.id,

      ...requestDocument.data(),

    })
  );

}


/* =========================================================
   GET PENDING REQUESTS FOR APPROVER
========================================================= */

export async function getPendingContactChangeRequestsForRole(
  approverRole
) {

  const normalizedApproverRole =
    normalizeRole(
      approverRole
    );


  if (
    normalizedApproverRole !== "ADMIN"
    &&
    normalizedApproverRole !== "SUPER_ADMIN"
  ) {

    return [];

  }


  const requestsReference =
    collection(
      db,
      CONTACT_CHANGE_REQUESTS_COLLECTION
    );


  const requestQuery =
    query(
      requestsReference,

      where(
        "status",
        "==",
        CONTACT_CHANGE_STATUS.PENDING
      ),

      orderBy(
        "requestedAt",
        "desc"
      )
    );


  const snapshot =
    await getDocs(
      requestQuery
    );


  const requests =
    snapshot.docs.map(
      (
        requestDocument
      ) => ({

        id:
          requestDocument.id,

        ...requestDocument.data(),

      })
    );


  return requests.filter(
    (
      request
    ) => {

      return canApproveContactChangeRequest(
        normalizedApproverRole,
        request
      );

    }
  );

}


/* =========================================================
   GET ALL PENDING REQUESTS FOR USER
========================================================= */

export async function getPendingRequestsForUser(
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


  const requestQuery =
    query(
      requestsReference,

      where(
        "userId",
        "==",
        userId
      ),

      where(
        "status",
        "==",
        CONTACT_CHANGE_STATUS.PENDING
      )
    );


  const snapshot =
    await getDocs(
      requestQuery
    );


  return snapshot.docs.map(
    (
      requestDocument
    ) => ({

      id:
        requestDocument.id,

      ...requestDocument.data(),

    })
  );

}


/* =========================================================
   GET REQUEST BY ID
========================================================= */

export async function getContactChangeRequestById(
  requestId
) {

  if (!requestId) {

    throw new Error(
      "Request ID is required."
    );

  }


  const requestReference =
    doc(
      db,
      CONTACT_CHANGE_REQUESTS_COLLECTION,
      requestId
    );


  const snapshot =
    await getDoc(
      requestReference
    );


  if (
    !snapshot.exists()
  ) {

    throw new Error(
      "Contact change request not found."
    );

  }


  return {

    id:
      snapshot.id,

    ...snapshot.data(),

  };

}


/* =========================================================
   REJECT CONTACT CHANGE REQUEST
========================================================= */

export async function rejectContactChangeRequest({

  requestId,

  approverId,

  approverName,

  approverRole,

  rejectionReason,

}) {

  if (!requestId) {

    throw new Error(
      "Request ID is required."
    );

  }


  if (!approverId) {

    throw new Error(
      "Approver ID is required."
    );

  }


  if (
    !String(
      rejectionReason || ""
    ).trim()
  ) {

    throw new Error(
      "Rejection reason is required."
    );

  }


  const requestReference =
    doc(
      db,
      CONTACT_CHANGE_REQUESTS_COLLECTION,
      requestId
    );


  await runTransaction(
    db,

    async (
      transaction
    ) => {

      const requestSnapshot =
        await transaction.get(
          requestReference
        );


      if (
        !requestSnapshot.exists()
      ) {

        throw new Error(
          "Contact change request not found."
        );

      }


      const requestData =
        requestSnapshot.data();


      if (
        requestData.status !==
        CONTACT_CHANGE_STATUS.PENDING
      ) {

        throw new Error(
          "This request has already been processed."
        );

      }


      const canApprove =
        canApproveContactChangeRequest(
          approverRole,
          requestData
        );


      if (
        !canApprove
      ) {

        throw new Error(
          "You do not have permission to reject this request."
        );

      }


      transaction.update(
        requestReference,
        {

          status:
            CONTACT_CHANGE_STATUS.REJECTED,


          rejectedBy:
            approverId,


          rejectedByName:
            approverName
            ||
            "",


          rejectedByRole:
            normalizeRole(
              approverRole
            ),


          rejectedAt:
            serverTimestamp(),


          rejectionReason:
            String(
              rejectionReason
            ).trim(),


          updatedAt:
            serverTimestamp(),

        }
      );

    }
  );


  return true;

}


/* =========================================================
   APPROVE CONTACT CHANGE REQUEST

   IMPORTANT:

   This function currently updates the Firestore
   user document.

   Firebase Authentication email updates for another
   user must be performed through a secure backend
   Cloud Function using Firebase Admin SDK.

   Therefore this function is designed as the Firestore
   approval layer.
========================================================= */

export async function approveContactChangeRequest({

  requestId,

  approverId,

  approverName,

  approverRole,

}) {

  if (!requestId) {

    throw new Error(
      "Request ID is required."
    );

  }


  if (!approverId) {

    throw new Error(
      "Approver ID is required."
    );

  }


  const requestReference =
    doc(
      db,
      CONTACT_CHANGE_REQUESTS_COLLECTION,
      requestId
    );


  await runTransaction(
    db,

    async (
      transaction
    ) => {

      const requestSnapshot =
        await transaction.get(
          requestReference
        );


      if (
        !requestSnapshot.exists()
      ) {

        throw new Error(
          "Contact change request not found."
        );

      }


      const requestData =
        requestSnapshot.data();


      if (
        requestData.status !==
        CONTACT_CHANGE_STATUS.PENDING
      ) {

        throw new Error(
          "This request has already been processed."
        );

      }


      const canApprove =
        canApproveContactChangeRequest(
          approverRole,
          requestData
        );


      if (
        !canApprove
      ) {

        throw new Error(
          "You do not have permission to approve this request."
        );

      }


      const userReference =
        doc(
          db,
          USERS_COLLECTION,
          requestData.userId
        );


      /* =============================================
         UPDATE USER DOCUMENT
      ============================================= */

      if (
        requestData.type ===
        CONTACT_CHANGE_TYPES.EMAIL
      ) {

        transaction.update(
          userReference,
          {

            email:
              requestData.newValue,

            updatedAt:
              serverTimestamp(),

          }
        );

      }


      if (
        requestData.type ===
        CONTACT_CHANGE_TYPES.PHONE
      ) {

        transaction.update(
          userReference,
          {

            phoneNumber:
              requestData.newValue,

            phone:
              requestData.newValue,

            updatedAt:
              serverTimestamp(),

          }
        );

      }


      /* =============================================
         UPDATE REQUEST
      ============================================= */

      transaction.update(
        requestReference,
        {

          status:
            CONTACT_CHANGE_STATUS.APPROVED,


          approvedBy:
            approverId,


          approvedByName:
            approverName
            ||
            "",


          approvedByRole:
            normalizeRole(
              approverRole
            ),


          approvedAt:
            serverTimestamp(),


          updatedAt:
            serverTimestamp(),

        }
      );

    }
  );


  return true;

}


/* =========================================================
   GET ALL REQUESTS
========================================================= */

export async function getAllContactChangeRequests() {

  const requestsReference =
    collection(
      db,
      CONTACT_CHANGE_REQUESTS_COLLECTION
    );


  const requestQuery =
    query(
      requestsReference,

      orderBy(
        "requestedAt",
        "desc"
      )
    );


  const snapshot =
    await getDocs(
      requestQuery
    );


  return snapshot.docs.map(
    (
      requestDocument
    ) => ({

      id:
        requestDocument.id,

      ...requestDocument.data(),

    })
  );

}