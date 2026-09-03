import React from "react";


export default function SimplePage({
  title,
  eyebrow = "NEWSROOM"
}) {

  return (

    <section className="simple-page">

      <div className="simple-page-content">

        <span className="eyebrow">

          {eyebrow}

        </span>


        <h1>

          {title}

        </h1>


        <p>

          This section is part of NewsRoom.
          More information and functionality
          will be available soon.

        </p>

      </div>

    </section>

  );
}