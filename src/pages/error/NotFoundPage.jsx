// src/pages/error/NotFoundPage.jsx

import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          textAlign: "center",
          background: "#ffffff",
          padding: "50px 30px",
          borderRadius: "16px",
          boxShadow:
            "0 10px 30px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div
          style={{
            fontSize: "80px",
            fontWeight: "800",
            lineHeight: "1",
            color: "#2563eb",
            marginBottom: "20px",
          }}
        >
          404
        </div>

        <h1
          style={{
            margin: "0 0 12px",
            fontSize: "28px",
            color: "#0f172a",
          }}
        >
          Page Not Found
        </h1>

        <p
          style={{
            margin: "0 auto 30px",
            maxWidth: "450px",
            color: "#64748b",
            fontSize: "16px",
            lineHeight: "1.6",
          }}
        >
          The page you are looking for does not
          exist or may have been moved.
        </p>

        <Link
          to="/"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            borderRadius: "8px",
            background: "#2563eb",
            color: "#ffffff",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}