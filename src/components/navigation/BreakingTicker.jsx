import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";

export default function BreakingTicker() {
  const { news = [] } = useApp();

  const breaking = news.filter(
    (item) => item?.breaking === true
  );

  if (!breaking.length) {
    return null;
  }

  return (
    <div className="breaking-bar">

      <div className="breaking-label">
        BREAKING NEWS
      </div>

      <div className="breaking-track">

        {breaking.map((item) => (
          <Link
            key={item.id}
            to={`/news/${item.id}`}
            className="breaking-item"
          >
            {item.title}
          </Link>
        ))}

      </div>

    </div>
  );
}