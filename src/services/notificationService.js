// src/services/notificationService.js


import {

  addDoc,

  collection,

  doc,

  getDocs,

  limit,

  onSnapshot,

  orderBy,

  query,

  serverTimestamp,

  updateDoc,

  where,

} from "firebase/firestore";


import {

  db,

} from "./firebase";


/* ============================================================
   COLLECTION
============================================================ */

const NOTIFICATIONS_COLLECTION =
  "notifications";


/* ============================================================
   NOTIFICATION TYPES
============================================================ */

export const NOTIFICATION_TYPES = {


  /* ==========================================================
     CONTACT CHANGE
  ========================================================== */

  CONTACT_CHANGE_REQUEST:
    "CONTACT_CHANGE_REQUEST",


  CONTACT_CHANGE_APPROVED:
    "CONTACT_CHANGE_APPROVED",


  CONTACT_CHANGE_REJECTED:
    "CONTACT_CHANGE_REJECTED",


  /* ==========================================================
     PROFILE CHANGE
  ========================================================== */

  PROFILE_CHANGE_REQUEST:
    "PROFILE_CHANGE_REQUEST",


  PROFILE_CHANGE_APPROVED:
    "PROFILE_CHANGE_APPROVED",


  PROFILE_CHANGE_REJECTED:
    "PROFILE_CHANGE_REJECTED",


  /* ==========================================================
     NEWS
  ========================================================== */

  NEWS_COMMENT:
    "NEWS_COMMENT",


  NEWS_LIKE:
    "NEWS_LIKE",


  NEWS_UPDATE:
    "NEWS_UPDATE",


  /* ==========================================================
     SYSTEM
  ========================================================== */

  SYSTEM:
    "SYSTEM",

};


/* ============================================================
   ROLE NORMALIZATION
============================================================ */

export function getUserRole(

  user

) {


  const rawRole =
    String(

      user?.role ||

      user?.roleName ||

      user?.userRole ||

      ""

    )
      .trim()
      .toUpperCase();


  if (

    rawRole === "SUPER_ADMIN" ||

    rawRole === "SUPERADMIN" ||

    rawRole === "SUPER ADMINISTRATOR"

  ) {

    return "SUPER_ADMIN";

  }


  if (

    rawRole === "ADMIN" ||

    rawRole === "ADMINISTRATOR"

  ) {

    return "ADMINISTRATOR";

  }


  if (

    rawRole === "EDITOR"

  ) {

    return "EDITOR";

  }


  if (

    rawRole === "AUTHOR"

  ) {

    return "AUTHOR";

  }


  if (

    rawRole === "USER" ||

    rawRole === "REGISTERED_USER"

  ) {

    return "REGISTERED_USER";

  }


  return rawRole;

}


/* ============================================================
   DATABASE CHECK
============================================================ */

function requireDb() {


  if (!db) {

    throw new Error(

      "Firestore is not configured."

    );

  }

}


/* ============================================================
   CREATE NOTIFICATION
============================================================ */

export async function createNotification({

  recipientId,

  userId,

  recipientRole,

  role,

  title,

  message,

  type =
    NOTIFICATION_TYPES.SYSTEM,

  relatedUserId,

  relatedRequestId,

  data = {},

}) {


  requireDb();


  const targetUserId =
    userId ||

    recipientId ||

    null;


  const targetRole =
    getUserRole({

      role:

        recipientRole ||

        role ||

        ""

    });


  const notificationData = {


    /* ========================================================
       NOTIFICATION OWNER

       userId is required by your current
       Firestore security rules.
    ======================================================== */

    userId:

      targetUserId,


    /*
     * Compatibility field.
     */

    recipientId:

      targetUserId,


    /* ========================================================
       ROLE
    ======================================================== */

    recipientRole:

      targetRole ||

      null,


    /* ========================================================
       CONTENT
    ======================================================== */

    title:

      title ||

      "Notification",


    message:

      message ||

      "",


    type:

      type ||

      NOTIFICATION_TYPES.SYSTEM,


    /* ========================================================
       RELATED DATA
    ======================================================== */

    relatedUserId:

      relatedUserId ||

      data?.userId ||

      null,


    relatedRequestId:

      relatedRequestId ||

      data?.requestId ||

      null,


    data: {

      ...(data || {}),


      userId:

        data?.userId ||

        relatedUserId ||

        null,


      requestId:

        data?.requestId ||

        relatedRequestId ||

        null,

    },


    /* ========================================================
       STATUS
    ======================================================== */

    read:

      false,


    /* ========================================================
       TIMESTAMPS
    ======================================================== */

    createdAt:

      serverTimestamp(),


    updatedAt:

      serverTimestamp(),

  };


  const reference =
    await addDoc(

      collection(

        db,

        NOTIFICATIONS_COLLECTION

      ),

      notificationData

    );


  return {

    id:

      reference.id,


    ...notificationData,

  };

}


/* ============================================================
   CREATE NOTIFICATIONS FOR MULTIPLE USERS
============================================================ */

export async function createNotificationsForUsers({

  userIds = [],

  title,

  message,

  type =
    NOTIFICATION_TYPES.SYSTEM,

  relatedUserId,

  relatedRequestId,

  data = {},

}) {


  requireDb();


  if (

    !Array.isArray(

      userIds

    )

  ) {

    throw new Error(

      "userIds must be an array."

    );

  }


  const uniqueUserIds =

    [

      ...new Set(

        userIds

          .filter(Boolean)

          .map(

            (item) =>

              String(item)

          )

      ),

    ];


  if (

    uniqueUserIds.length === 0

  ) {

    return [];

  }


  const results =
    await Promise.all(

      uniqueUserIds.map(

        (

          notificationUserId

        ) =>

          createNotification({

            userId:

              notificationUserId,


            title,


            message,


            type,


            relatedUserId,


            relatedRequestId,


            data,

          })

      )

    );


  return results;

}


/* ============================================================
   CREATE ROLE NOTIFICATION

   IMPORTANT:

   This function keeps compatibility with
   existing code.

   Your contact change system should preferably
   send notifications using actual user IDs through:

   createNotificationsForUsers()

   because your current Firestore rules use userId.
============================================================ */

export async function createRoleNotification({

  recipientRoles = [],

  title,

  message,

  type =
    NOTIFICATION_TYPES.SYSTEM,

  relatedUserId,

  relatedRequestId,

  data = {},

}) {


  requireDb();


  if (

    !Array.isArray(

      recipientRoles

    )

  ) {

    throw new Error(

      "recipientRoles must be an array."

    );

  }


  const uniqueRoles =

    [

      ...new Set(

        recipientRoles

          .filter(Boolean)

          .map(

            (item) =>

              getUserRole({

                role:

                  item

              })

          )

      ),

    ];


  if (

    uniqueRoles.length === 0

  ) {

    return [];

  }


  /*
   * Role-only notifications are not recommended
   * with the current Firestore rules.
   *
   * The current rules require userId ownership.
   *
   * We keep this function for compatibility.
   */

  const results =
    await Promise.all(

      uniqueRoles.map(

        (

          notificationRole

        ) =>

          addDoc(

            collection(

              db,

              NOTIFICATIONS_COLLECTION

            ),

            {


              userId:

                null,


              recipientId:

                null,


              recipientRole:

                notificationRole,


              title:

                title ||

                "Notification",


              message:

                message ||

                "",


              type:

                type ||

                NOTIFICATION_TYPES.SYSTEM,


              relatedUserId:

                relatedUserId ||

                data?.userId ||

                null,


              relatedRequestId:

                relatedRequestId ||

                data?.requestId ||

                null,


              data: {

                ...(data || {}),


                userId:

                  data?.userId ||

                  relatedUserId ||

                  null,


                requestId:

                  data?.requestId ||

                  relatedRequestId ||

                  null,

              },


              read:

                false,


              createdAt:

                serverTimestamp(),


              updatedAt:

                serverTimestamp(),

            }

          )

      )

    );


  return results;

}


/* ============================================================
   GET NOTIFICATIONS FOR USER
============================================================ */

export async function getNotificationsForUser({

  userId,

  maxResults = 100,

}) {


  requireDb();


  if (!userId) {

    return [];

  }


  const notificationsQuery =
    query(

      collection(

        db,

        NOTIFICATIONS_COLLECTION

      ),


      where(

        "userId",

        "==",

        userId

      ),


      orderBy(

        "createdAt",

        "desc"

      ),


      limit(

        maxResults

      )

    );


  const snapshot =
    await getDocs(

      notificationsQuery

    );


  const notifications =
    snapshot.docs.map(

      (

        item

      ) => ({

        id:

          item.id,


        ...item.data(),

      })

    );


  return normalizeNotifications(

    notifications,

    maxResults

  );

}


/* ============================================================
   SUBSCRIBE TO NOTIFICATIONS

   REAL-TIME FIRESTORE SUBSCRIPTION
============================================================ */

export function subscribeToNotifications({

  userId,

  callback,

}) {


  requireDb();


  if (

    typeof callback !==

    "function"

  ) {

    throw new Error(

      "callback must be a function."

    );

  }


  if (!userId) {


    callback([]);


    return () => {};

  }


  const notificationsQuery =
    query(

      collection(

        db,

        NOTIFICATIONS_COLLECTION

      ),


      where(

        "userId",

        "==",

        userId

      ),


      orderBy(

        "createdAt",

        "desc"

      ),


      limit(100)

    );


  const unsubscribe =
    onSnapshot(

      notificationsQuery,


      (

        snapshot

      ) => {


        const notifications =
          snapshot.docs.map(

            (

              item

            ) => ({

              id:

                item.id,


              ...item.data(),

            })

          );


        callback(

          normalizeNotifications(

            notifications,

            100

          )

        );

      },


      (

        error

      ) => {


        console.error(

          "Notification subscription error:",

          error

        );


        callback([]);

      }

    );


  return unsubscribe;

}


/* ============================================================
   MARK NOTIFICATION AS READ
============================================================ */

export async function markNotificationAsRead(

  notificationId

) {


  requireDb();


  if (!notificationId) {

    throw new Error(

      "Notification ID is required."

    );

  }


  await updateDoc(

    doc(

      db,

      NOTIFICATIONS_COLLECTION,

      notificationId

    ),


    {

      read:

        true,


      updatedAt:

        serverTimestamp(),

    }

  );

}


/* ============================================================
   MARK ALL NOTIFICATIONS AS READ
============================================================ */

export async function markAllNotificationsAsRead(

  notifications = []

) {


  requireDb();


  if (

    !Array.isArray(

      notifications

    )

  ) {

    return;

  }


  const unreadNotifications =
    notifications.filter(

      (

        item

      ) =>

        item &&

        item.id &&

        !item.read

    );


  if (

    unreadNotifications.length === 0

  ) {

    return;

  }


  await Promise.all(

    unreadNotifications.map(

      (

        item

      ) =>

        markNotificationAsRead(

          item.id

        )

    )

  );

}


/* ============================================================
   NORMALIZE NOTIFICATIONS
============================================================ */

function normalizeNotifications(

  notifications = [],

  maxResults = 100

) {


  const uniqueNotifications =
    Array.from(

      new Map(

        notifications.map(

          (

            item

          ) => [

            item.id,

            item,

          ]

        )

      ).values()

    );


  return uniqueNotifications

    .sort(

      (

        first,

        second

      ) => {


        const firstTime =
          getNotificationTime(

            first?.createdAt

          );


        const secondTime =
          getNotificationTime(

            second?.createdAt

          );


        return (

          secondTime -

          firstTime

        );

      }

    )

    .slice(

      0,

      maxResults

    );

}


/* ============================================================
   GET NOTIFICATION TIME
============================================================ */

function getNotificationTime(

  value

) {


  if (!value) {

    return 0;

  }


  if (

    typeof value.toDate ===

    "function"

  ) {

    return value

      .toDate()

      .getTime();

  }


  if (

    typeof value.toMillis ===

    "function"

  ) {

    return value.toMillis();

  }


  if (

    typeof value.seconds ===

    "number"

  ) {

    return (

      value.seconds * 1000

    );

  }


  const date =
    new Date(

      value

    );


  const time =
    date.getTime();


  if (

    Number.isNaN(

      time

    )

  ) {

    return 0;

  }


  return time;

}