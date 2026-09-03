// src/pages/author/AuthorNewsPage.jsx

import React from "react";
import {
  Navigate,
} from "react-router-dom";

import AuthorStoriesPage from "./AuthorStoriesPage";

export default function AuthorNewsPage() {
  return (
    <Navigate
      to="/author/stories"
      replace
    />
  );
}