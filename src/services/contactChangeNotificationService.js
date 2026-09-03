// src/services/contactChangeNotificationService.js


import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";


import {
  db,
} from "../firebase";


import {

  createNotification,

  createNotificationsForUsers,

  NOTIFICATION_TYPES,

} from "./notificationService";


/* =========================================================
   COLLECTION
========================================================= */

const USERS_COLLECTION =
  "users";


/* =========================================================
   NORMALIZE ROLE
========================================================= */

function normalizeRole(
  role
) {

  if (!role) {

    return "";

  }


  return String(
    role
  )

    .trim()

    .toUpperCase();

}


/* =========================================================
   GET USERS BY ROLE
========================================================= */

async function getUsersByRole(

  role

) {


  const usersReference =
    collection(

      db,

      USERS_COLLECTION

    );


  const usersQuery =
    query(

      usersReference,


      where(

        "role",

        "==",

        normalizeRole(
          role
        )

      )

    );


  const snapshot =
    await getDocs(
      usersQuery
    );


  return snapshot.docs.map(

    (
      userDocument
    ) => ({

      id:
        userDocument.id,


      ...userDocument.data(),

    })

  );

}


/* =========================================================
   GET ADMIN IDs
========================================================= */

async function getAdminIds() {


  const admins =
    await getUsersByRole(
      "ADMIN"
    );


  return admins.map(

    (
      admin
    ) =>
      admin.id

  );

}


/* =========================================================
   GET SUPER ADMIN IDs
========================================================= */

async function getSuperAdminIds() {


  const superAdmins =
    await getUsersByRole(
      "SUPER_ADMIN"
    );


  return superAdmins.map(

    (
      superAdmin
    ) =>
      superAdmin.id

  );

}


/* =========================================================
   NOTIFY ABOUT NEW REQUEST
========================================================= */

export async function notifyContactChangeRequest({

  request,

}) {


  if (!request) {

    return;

  }


  const userRole =
    normalizeRole(
      request.userRole
    );


  let recipientIds =
    [];


  /* ===============================================
     AUTHOR / EDITOR

     ADMIN + SUPER ADMIN
  =============================================== */

  if (

    userRole ===
    "AUTHOR"

    ||

    userRole ===
    "EDITOR"

  ) {


    const [

      adminIds,

      superAdminIds,

    ] =

      await Promise.all([

        getAdminIds(),

        getSuperAdminIds(),

      ]);


    recipientIds = [

      ...adminIds,

      ...superAdminIds,

    ];

  }


  /* ===============================================
     ADMIN

     SUPER ADMIN ONLY
  =============================================== */

  if (

    userRole ===
    "ADMIN"

  ) {


    recipientIds =
      await getSuperAdminIds();

  }


  if (

    recipientIds.length === 0

  ) {

    return;

  }


  const requestType =
    request.type === "EMAIL"

      ? "email address"

      : "phone number";


  await createNotificationsForUsers({


    userIds:
      recipientIds,


    title:
      "New Contact Change Request",


    message:

      `${

        request.userName ||

        "A user"

      } requested to change their ${

        requestType

      }.`,


    type:

      NOTIFICATION_TYPES
        .CONTACT_CHANGE_REQUEST,


    data: {


      requestId:
        request.id,


      userId:
        request.userId,


      requestType:
        request.type,


      userRole:
        userRole,

    },

  });

}


/* =========================================================
   NOTIFY USER ABOUT APPROVAL
========================================================= */

export async function notifyContactChangeApproved({

  request,

}) {


  if (!request) {

    return;

  }


  const requestType =
    request.type === "EMAIL"

      ? "email address"

      : "phone number";


  await createNotification({


    recipientId:
      request.userId,


    title:
      "Contact Change Approved",


    message:

      `Your request to change your ${

        requestType

      } has been approved.`,


    type:

      NOTIFICATION_TYPES
        .CONTACT_CHANGE_APPROVED,


    data: {


      requestId:
        request.id,


      userId:
        request.userId,


      requestType:
        request.type,

    },

  });

}


/* =========================================================
   NOTIFY USER ABOUT REJECTION
========================================================= */

export async function notifyContactChangeRejected({

  request,

  rejectionReason,

}) {


  if (!request) {

    return;

  }


  const requestType =
    request.type === "EMAIL"

      ? "email address"

      : "phone number";


  let message =

    `Your request to change your ${

      requestType

    } was rejected.`;


  if (
    rejectionReason
  ) {


    message +=

      ` Reason: ${

        rejectionReason

      }`;

  }


  await createNotification({


    recipientId:
      request.userId,


    title:
      "Contact Change Rejected",


    message,


    type:

      NOTIFICATION_TYPES
        .CONTACT_CHANGE_REJECTED,


    data: {


      requestId:
        request.id,


      userId:
        request.userId,


      requestType:
        request.type,


      rejectionReason:
        rejectionReason || "",

    },

  });

}