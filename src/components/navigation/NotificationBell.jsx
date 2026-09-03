// src/components/navigation/NotificationBell.jsx

import React, {

  useEffect,

  useState,

} from "react";


import {

  Bell,

} from "lucide-react";


import {

  useNavigate,

} from "react-router-dom";


import {

  useAuth,

} from "../../context/AuthContext";


import {

  getUserRole,

  subscribeToNotifications,

} from "../../services/notificationService";


export default function NotificationBell() {


  const navigate =

    useNavigate();


  const {

    user,

  } = useAuth();


  const [

    notifications,

    setNotifications,

  ] = useState([]);


  const [

    loading,

    setLoading,

  ] = useState(true);


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


  const unreadCount =

    notifications.filter(

      (

        item

      ) =>

        !item.read

    ).length;


  return (

    <button

      type="button"

      className="icon-button notification-button"

      onClick={() =>

        navigate(

          "/notifications"

        )

      }

      aria-label={

        unreadCount > 0

          ? `${unreadCount} unread notifications`

          : "Notifications"

      }

    >


      <Bell

        size={20}

      />


      {unreadCount > 0 && (

        <span

          className="notification-dot"

        >

          {unreadCount > 99

            ? "99+"

            : unreadCount}

        </span>

      )}


      {loading && (

        <span

          className="notification-loading-dot"

        />

      )}

    </button>

  );

}