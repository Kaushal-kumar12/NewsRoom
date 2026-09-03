import React, {
  useEffect,
  useState,
} from "react";


function formatDateTime(date) {

  const dateText =
    new Intl.DateTimeFormat(
      "en-IN",
      {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ).format(date);


  const timeText =
    new Intl.DateTimeFormat(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }
    ).format(date);


  return {
    dateText,
    timeText,
  };

}


export default function CurrentDateTime() {


  const [

    currentTime,

    setCurrentTime,

  ] = useState(

    () => new Date()

  );


  useEffect(() => {


    const interval =

      window.setInterval(

        () => {

          setCurrentTime(

            new Date()

          );

        },

        1000

      );


    return () => {

      window.clearInterval(

        interval

      );

    };


  }, []);


  const {

    dateText,

    timeText,

  } =

    formatDateTime(

      currentTime

    );


  return (

    <div

      className="current-date-time"

      aria-label="Current date and time"

    >


      <span

        className="current-date"

      >

        {dateText}

      </span>


      <span

        className="current-time"

      >

        {timeText}

      </span>


    </div>

  );


}