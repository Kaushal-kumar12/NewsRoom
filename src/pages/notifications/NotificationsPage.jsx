// src/pages/notifications/NotificationsPage.jsx

import React, {

  useEffect,

  useState,

} from "react";


import {

  Bell,

  Check,

  Clock,

  RefreshCw,

} from "lucide-react";


import {

  useNavigate,

} from "react-router-dom";


import {

  useAuth,

} from "../../context/AuthContext";


import {

  getUserRole,

  markAllNotificationsAsRead,

  markNotificationAsRead,

  subscribeToNotifications,

} from "../../services/notificationService";


export default function NotificationsPage() {


  const {

    user,

  } = useAuth();


  const navigate =

    useNavigate();


  const [

    notifications,

    setNotifications,

  ] = useState([]);


  const [

    loading,

    setLoading,

  ] = useState(true);


  const [

    actionLoading,

    setActionLoading,

  ] = useState(false);


  const [

    error,

    setError,

  ] = useState("");


  const role =

    getUserRole(

      user

    );


  useEffect(() => {


    if (!user?.uid) {


      setNotifications([]);


      setLoading(false);


      return;

    }


    setLoading(true);


    setError("");


    const unsubscribe =

      subscribeToNotifications({

        userId:

          user.uid,


        role,


        callback:

          (

            items

          ) => {


            setNotifications(

              Array.isArray(items)

                ? items

                : []

            );


            setLoading(false);

          },

      });


    return () => {


      unsubscribe();

    };


  }, [

    user?.uid,

    role,

  ]);


  async function handleMarkAllRead() {


    try {


      setActionLoading(true);


      setError("");


      await markAllNotificationsAsRead(

        notifications

      );


    } catch (

      actionError

    ) {


      console.error(

        actionError

      );


      setError(

        actionError?.message ||

        "Unable to mark notifications as read."

      );


    } finally {


      setActionLoading(false);

    }

  }


  async function handleNotificationClick(

    notification

  ) {


    try {


      setError("");


      if (

        !notification.read

      ) {


        await markNotificationAsRead(

          notification.id

        );

      }


      const requestId =

        notification

          ?.relatedRequestId ||

        notification

          ?.data

          ?.requestId;


      const userId =

        notification

          ?.relatedUserId ||

        notification

          ?.data

          ?.userId;


      const type =

        notification?.type;


      /*
       * CONTACT CHANGE REQUEST
       *
       * Admin and Super Admin should
       * open the user/request section.
       */

      if (

        type ===

        "CONTACT_CHANGE_REQUEST"

      ) {


        if (

          role ===

          "SUPER_ADMIN"

        ) {


          navigate(

            userId

              ? `/superadmin/users/${userId}`

              : "/superadmin/users"

          );


          return;

        }


        if (

          role ===

          "ADMIN"

        ) {


          navigate(

            userId

              ? `/admin/users/${userId}`

              : "/admin/users"

          );


          return;

        }

      }


      /*
       * APPROVED / REJECTED
       *
       * The requesting user stays
       * on their own profile.
       */

      if (

        type ===

        "CONTACT_CHANGE_APPROVED"

        ||

        type ===

        "CONTACT_CHANGE_REJECTED"

      ) {


        if (

          userId === user?.uid

        ) {


          navigate(

            "/profile"

          );


          return;

        }

      }


      /*
       * Fallback navigation
       */

      if (

        requestId ||

        userId

      ) {


        if (

          role ===

          "SUPER_ADMIN"

        ) {


          navigate(

            userId

              ? `/superadmin/users/${userId}`

              : "/superadmin/users"

          );


          return;

        }


        if (

          role ===

          "ADMIN"

        ) {


          navigate(

            userId

              ? `/admin/users/${userId}`

              : "/admin/users"

          );


          return;

        }

      }


    } catch (

      actionError

    ) {


      console.error(

        actionError

      );


      setError(

        actionError?.message ||

        "Unable to update notification."

      );

    }

  }


  function formatDate(

    value

  ) {


    if (!value) {

      return "Just now";

    }


    if (

      typeof value.toDate ===

      "function"

    ) {


      return value

        .toDate()

        .toLocaleString();

    }


    const date =

      new Date(

        value

      );


    if (

      Number.isNaN(

        date.getTime()

      )

    ) {

      return "Just now";

    }


    return date.toLocaleString();

  }


  const unreadCount =

    notifications.filter(

      (

        item

      ) =>

        !item.read

    ).length;


  return (

    <div className="notifications-page">


      <div className="notifications-page-header">


        <div>


          <div className="notifications-title-row">


            <Bell

              size={28}

            />


            <h1>

              Notifications

            </h1>


          </div>


          <p>

            Stay updated with contact change requests,
            approvals, rejections and system activity.

          </p>


        </div>


        <button

          type="button"

          className="notifications-mark-all"

          onClick={

            handleMarkAllRead

          }

          disabled={

            actionLoading ||

            unreadCount === 0

          }

        >


          <Check

            size={17}

          />


          {actionLoading

            ? "Updating..."

            : "Mark all as read"}

        </button>


      </div>


      {error && (

        <div

          className="notifications-error"

        >

          {error}

        </div>

      )}


      <div className="notifications-summary">


        <span>

          {unreadCount}

        </span>


        unread notification

        {unreadCount !== 1

          ? "s"

          : ""}


      </div>


      {loading ? (


        <div className="notifications-empty">


          <RefreshCw

            className="spin"

            size={28}

          />


          Loading notifications...


        </div>


      ) : notifications.length === 0 ? (


        <div className="notifications-empty">


          <Bell

            size={38}

          />


          <h3>

            No notifications

          </h3>


          <p>

            Important updates will appear here.

          </p>


        </div>


      ) : (


        <div className="notifications-list">


          {notifications.map(

            (

              notification

            ) => (


              <button

                type="button"

                key={

                  notification.id

                }

                className={

                  notification.read

                    ? "notification-item"

                    : "notification-item notification-item-unread"

                }

                onClick={() =>

                  handleNotificationClick(

                    notification

                  )

                }

              >


                <div className="notification-icon">


                  <Bell

                    size={19}

                  />


                </div>


                <div className="notification-body">


                  <div className="notification-top">


                    <strong>

                      {notification.title ||

                        "Notification"}

                    </strong>


                    {!notification.read && (

                      <span

                        className="notification-unread-dot"

                      />

                    )}


                  </div>


                  <p>

                    {notification.message ||

                      ""}

                  </p>


                  <span

                    className="notification-date"

                  >


                    <Clock

                      size={14}

                    />


                    {formatDate(

                      notification.createdAt

                    )}


                  </span>


                </div>


              </button>


            )

          )}


        </div>


      )}


    </div>

  );

}