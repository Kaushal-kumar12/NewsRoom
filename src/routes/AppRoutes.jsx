// src/routes/AppRoutes.jsx

import React, {
  lazy,
  Suspense,
} from "react";

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";


/* ============================================================
   LAYOUTS
============================================================ */

import PublicLayout
  from "../components/layout/PublicLayout";

import StaffLayout
  from "../components/admin/StaffLayout";

import SuperAdminLayout
  from "../components/superadmin/SuperAdminLayout";


/* ============================================================
   ROUTE GUARDS
============================================================ */

import {
  AdminRoute,
  AuthorRoute,
  EditorRoute,
  SuperAdminRoute,
} from "../components/auth/StaffRoute";


/* ============================================================
   AUTH PAGES
============================================================ */

import LoginPage
  from "../pages/auth/Login";

import RegisterPage
  from "../pages/auth/Register";

import AdminLoginPage
  from "../pages/auth/AdminLoginPage";

import VerifyEmailPage
  from "../pages/auth/VerifyEmailPage";

import ForgotPasswordPage
  from "../pages/auth/ForgotPasswordPage";

import ResetPasswordPage
  from "../pages/auth/ResetPasswordPage";


/* ============================================================
   PUBLIC PAGES
============================================================ */

import HomePage
  from "../pages/public/HomePage";

import LatestNewsPage
  from "../pages/public/LatestNewsPage";

import BreakingNewsPage
  from "../pages/public/BreakingNewsPage";

import CategoryPage
  from "../pages/public/CategoryPage";

import ArticlePage
  from "../pages/public/ArticlePage";

import SearchPage
  from "../pages/public/SearchPage";

import SimplePage
  from "../pages/public/SimplePage";

import VideosPage from "../pages/public/VideosPage";

import PhotosPage from "../pages/public/PhotosPage";


/* ============================================================
   ERROR PAGE
============================================================ */

import NotFoundPage
  from "../pages/error/NotFoundPage";


/* ============================================================
   ADMIN PAGES
============================================================ */

const AdminDashboardPage =
  lazy(() =>
    import(
      "../pages/admin/AdminDashboardPage"
    )
  );


const NewsManagementPage =
  lazy(() =>
    import(
      "../pages/admin/NewsManagementPage"
    )
  );


const AdminUsersPage =
  lazy(() =>
    import(
      "../pages/admin/AdminUsersPage"
    )
  );


const AdminCommentsPage =
  lazy(() =>
    import(
      "../pages/admin/AdminCommentsPage"
    )
  );


const AdminCategoriesPage =
  lazy(() =>
    import(
      "../pages/admin/AdminCategoriesPage"
    )
  );


const AdminTagsPage =
  lazy(() =>
    import(
      "../pages/admin/AdminTagsPage"
    )
  );


const AdminAdvertisementsPage =
  lazy(() =>
    import(
      "../pages/admin/AdminAdvertisementsPage"
    )
  );


const AdminAnalyticsPage =
  lazy(() =>
    import(
      "../pages/admin/AdminAnalyticsPage"
    )
  );


const StaffProfilePage =
  lazy(() =>
    import(
      "../pages/admin/StaffProfilePage"
    )
  );


/* ============================================================
   SHARED EDITOR / PREVIEW
============================================================ */

const NewsEditorPage =
  lazy(() =>
    import(
      "../pages/editorial/NewsEditorPage"
    )
  );


const NewsPreviewPage =
  lazy(() =>
    import(
      "../pages/editorial/NewsPreviewPage"
    )
  );


/* ============================================================
   AUTHOR PAGES
============================================================ */

const AuthorDashboardPage =
  lazy(() =>
    import(
      "../pages/author/AuthorDashboardPage"
    )
  );


const AuthorStoriesPage =
  lazy(() =>
    import(
      "../pages/author/AuthorStoriesPage"
    )
  );


const AuthorStoryEditorPage =
  lazy(() =>
    import(
      "../pages/author/StoryEditorPage"
    )
  );


const AuthorAnalyticsPage =
  lazy(() =>
    import(
      "../pages/author/AuthorAnalyticsPage"
    )
  );


/* ============================================================
   EDITOR PAGES
============================================================ */

const EditorDashboardPage =
  lazy(() =>
    import(
      "../pages/editor/EditorDashboardPage"
    )
  );


const EditorStoriesPage =
  lazy(() =>
    import(
      "../pages/editor/EditorStoriesPage"
    )
  );


const StoryReviewPage =
  lazy(() =>
    import(
      "../pages/editor/StoryReviewPage"
    )
  );


const EditorAnalyticsPage =
  lazy(() =>
    import(
      "../pages/editor/EditorAnalyticsPage"
    )
  );


/* ============================================================
   SUPER ADMIN PAGES
============================================================ */

const SuperAdminDashboardPage =
  lazy(() =>
    import(
      "../pages/superadmin/SuperAdminDashboardPage"
    )
  );


const SuperAdminProfilePage =
  lazy(() =>
    import(
      "../pages/superadmin/SuperAdminProfilePage"
    )
  );


const SuperAdminUsersPage =
  lazy(() =>
    import(
      "../pages/superadmin/SuperAdminUsersPage"
    )
  );


const SuperAdminUserDetailsPage =
  lazy(() =>
    import(
      "../pages/superadmin/SuperAdminUserDetailsPage"
    )
  );


const SuperAdminAdminsPage =
  lazy(() =>
    import(
      "../pages/superadmin/SuperAdminAdminsPage"
    )
  );


const SuperAdminManagementPage =
  lazy(() =>
    import(
      "../pages/superadmin/SuperAdminManagement"
    )
  );


const SuperAdminEditorialPage =
  lazy(() =>
    import(
      "../pages/superadmin/SuperAdminEditorialPage"
    )
  );


const SuperAdminNewsManagementPage =
  lazy(() =>
    import(
      "../pages/superadmin/SuperAdminNewsManagementPage"
    )
  );


const SuperAdminNewsEditorPage =
  lazy(() =>
    import(
      "../pages/superadmin/SuperAdminNewsEditorPage"
    )
  );


const SuperAdminNewsPreviewPage =
  lazy(() =>
    import(
      "../pages/superadmin/SuperAdminNewsPreviewPage"
    )
  );


const SuperAdminEditorialStatusPage =
  lazy(() =>
    import(
      "../pages/superadmin/SuperAdminEditorialStatusPage"
    )
  );


const SuperAdminEditorialReviewPage =
  lazy(() =>
    import(
      "../pages/superadmin/SuperAdminEditorialReviewPage"
    )
  );


const SuperAdminNewsEditPage =
  lazy(() =>
    import(
      "../pages/superadmin/SuperAdminNewsEditPage"
    )
  );


const SuperAdminNewsDetailsPage =
  lazy(() =>
    import(
      "../pages/superadmin/SuperAdminNewsDetailsPage"
    )
  );


const SuperAdminEditorialPoliciesPage =
  lazy(() =>
    import(
      "../pages/superadmin/SuperAdminEditorialPoliciesPage"
    )
  );


const PermissionManagementPage =
  lazy(() =>
    import(
      "../pages/superadmin/PermissionManagementPage"
    )
  );


const RoleManagementPage =
  lazy(() =>
    import(
      "../pages/superadmin/RoleManagementPage"
    )
  );


const SystemSecurityPage =
  lazy(() =>
    import(
      "../pages/superadmin/SystemSecurityPage"
    )
  );


const SuperAdminSettingsPage =
  lazy(() =>
    import(
      "../pages/superadmin/SuperAdminSettingsPage"
    )
  );


/* ============================================================
   LOADING
============================================================ */

function PageLoading() {

  return (

    <div className="staff-route-loading">

      <div className="staff-loading-spinner" />

      <h3>
        Loading NewsRoom
      </h3>

      <p>
        Please wait while the page loads...
      </p>

    </div>

  );

}


/* ============================================================
   LAZY PAGE WRAPPER
============================================================ */

function LazyPage({
  children,
}) {

  return (

    <Suspense
      fallback={
        <PageLoading />
      }
    >

      {children}

    </Suspense>

  );

}


/* ============================================================
   PUBLIC ROUTES

   IMPORTANT:

   This function RETURNS Route elements.

   It must NOT be rendered as:

   <PublicRoutes />

   inside <Routes>.

   It will be called as:

   {PublicRoutes()}
============================================================ */

function PublicRoutes() {

  return (

    <Route
      element={
        <PublicLayout />
      }
    >

      <Route
        path="/"
        element={
          <HomePage />
        }
      />


      <Route
        path="/latest"
        element={
          <LatestNewsPage />
        }
      />


      <Route
        path="/breaking"
        element={
          <BreakingNewsPage />
        }
      />


      <Route
        path="/category/:category"
        element={
          <CategoryPage />
        }
      />


      <Route
        path="/news/:id"
        element={
          <ArticlePage />
        }
      />


      <Route
        path="/search"
        element={
          <SearchPage />
        }
      />


      <Route
        path="/videos"
        element={<VideosPage />}
      />


      <Route
        path="/photos"
        element={<PhotosPage />}
      />


      <Route
        path="/about"
        element={
          <SimplePage
            title="About NewsRoom"
            eyebrow="COMPANY"
          />
        }
      />


      <Route
        path="/contact"
        element={
          <SimplePage
            title="Contact NewsRoom"
            eyebrow="COMPANY"
          />
        }
      />


      <Route
        path="/privacy"
        element={
          <SimplePage
            title="Privacy Policy"
            eyebrow="LEGAL"
          />
        }
      />


      <Route
        path="/terms"
        element={
          <SimplePage
            title="Terms of Service"
            eyebrow="LEGAL"
          />
        }
      />

    </Route>

  );

}


/* ============================================================
   ADMIN APPLICATION

   /admin/*
============================================================ */

function AdminApplication() {

  return (

    <Route
      path="/admin"
      element={
        <AdminRoute />
      }
    >

      <Route
        element={
          <StaffLayout />
        }
      >

        <Route
          index
          element={
            <Navigate
              to="dashboard"
              replace
            />
          }
        />


        {/* DASHBOARD */}

        <Route
          path="dashboard"
          element={
            <LazyPage>
              <AdminDashboardPage />
            </LazyPage>
          }
        />


        {/* NEWS */}

        <Route
          path="news"
          element={
            <LazyPage>
              <NewsManagementPage />
            </LazyPage>
          }
        />


        {/* CREATE NEWS */}

        <Route
          path="news/new"
          element={
            <LazyPage>
              <NewsEditorPage />
            </LazyPage>
          }
        />


        {/* EDIT NEWS */}

        <Route
          path="news/:newsId/edit"
          element={
            <LazyPage>
              <NewsEditorPage />
            </LazyPage>
          }
        />


        {/* PREVIEW NEWS */}

        <Route
          path="news/:newsId/preview"
          element={
            <LazyPage>
              <NewsPreviewPage />
            </LazyPage>
          }
        />


        {/* USERS */}

        <Route
          path="users"
          element={
            <LazyPage>
              <AdminUsersPage />
            </LazyPage>
          }
        />


        {/* COMMENTS */}

        <Route
          path="comments"
          element={
            <LazyPage>
              <AdminCommentsPage />
            </LazyPage>
          }
        />


        {/* CATEGORIES */}

        <Route
          path="categories"
          element={
            <LazyPage>
              <AdminCategoriesPage />
            </LazyPage>
          }
        />


        {/* TAGS */}

        <Route
          path="tags"
          element={
            <LazyPage>
              <AdminTagsPage />
            </LazyPage>
          }
        />


        {/* ADVERTISEMENTS */}

        <Route
          path="advertisements"
          element={
            <LazyPage>
              <AdminAdvertisementsPage />
            </LazyPage>
          }
        />


        {/* ANALYTICS */}

        <Route
          path="analytics"
          element={
            <LazyPage>
              <AdminAnalyticsPage />
            </LazyPage>
          }
        />


        {/* PROFILE */}

        <Route
          path="profile"
          element={
            <LazyPage>
              <StaffProfilePage />
            </LazyPage>
          }
        />

      </Route>

    </Route>

  );

}


/* ============================================================
   AUTHOR APPLICATION

   /author/*
============================================================ */

function AuthorApplication() {

  return (

    <Route
      path="/author"
      element={
        <AuthorRoute />
      }
    >

      <Route
        element={
          <StaffLayout />
        }
      >

        {/* DEFAULT */}

        <Route
          index
          element={
            <Navigate
              to="dashboard"
              replace
            />
          }
        />


        {/* DASHBOARD */}

        <Route
          path="dashboard"
          element={
            <LazyPage>
              <AuthorDashboardPage />
            </LazyPage>
          }
        />


        {/* STORIES */}

        <Route
          path="stories"
          element={
            <LazyPage>
              <AuthorStoriesPage />
            </LazyPage>
          }
        />


        {/* DRAFTS */}

        <Route
          path="drafts"
          element={
            <LazyPage>
              <AuthorStoriesPage
                filter="DRAFT"
              />
            </LazyPage>
          }
        />


        {/* SUBMITTED */}

        <Route
          path="submitted"
          element={
            <LazyPage>
              <AuthorStoriesPage
                filter="SUBMITTED"
              />
            </LazyPage>
          }
        />


        {/* CHANGES REQUESTED */}

        <Route
          path="changes"
          element={
            <LazyPage>
              <AuthorStoriesPage
                filter="CHANGES_REQUESTED"
              />
            </LazyPage>
          }
        />


        {/* PUBLISHED */}

        <Route
          path="published"
          element={
            <LazyPage>
              <AuthorStoriesPage
                filter="PUBLISHED"
              />
            </LazyPage>
          }
        />


        {/* CREATE STORY */}

        <Route
          path="create"
          element={
            <LazyPage>
              <AuthorStoryEditorPage />
            </LazyPage>
          }
        />


        {/* EDIT STORY */}

        <Route
          path="edit/:storyId"
          element={
            <LazyPage>
              <AuthorStoryEditorPage />
            </LazyPage>
          }
        />


        {/* PREVIEW */}

        <Route
          path="news/:newsId/preview"
          element={
            <LazyPage>
              <NewsPreviewPage />
            </LazyPage>
          }
        />


        {/* ANALYTICS */}

        <Route
          path="analytics"
          element={
            <LazyPage>
              <AuthorAnalyticsPage />
            </LazyPage>
          }
        />


        {/* PROFILE */}

        <Route
          path="profile"
          element={
            <LazyPage>
              <StaffProfilePage />
            </LazyPage>
          }
        />

      </Route>

    </Route>

  );

}


/* ============================================================
   EDITOR APPLICATION

   /editor/*
============================================================ */

function EditorApplication() {

  return (

    <Route
      path="/editor"
      element={
        <EditorRoute />
      }
    >

      <Route
        element={
          <StaffLayout />
        }
      >

        {/* DEFAULT */}

        <Route
          index
          element={
            <Navigate
              to="dashboard"
              replace
            />
          }
        />


        {/* DASHBOARD */}

        <Route
          path="dashboard"
          element={
            <LazyPage>
              <EditorDashboardPage />
            </LazyPage>
          }
        />


        {/* CREATE NEWS */}

        <Route
          path="create"
          element={
            <LazyPage>
              <NewsEditorPage />
            </LazyPage>
          }
        />


        {/* EDIT NEWS */}

        <Route
          path="edit/:newsId"
          element={
            <LazyPage>
              <NewsEditorPage />
            </LazyPage>
          }
        />


        {/* PREVIEW NEWS */}

        <Route
          path="news/:newsId/preview"
          element={
            <LazyPage>
              <NewsPreviewPage />
            </LazyPage>
          }
        />


        {/* REVIEW QUEUE */}

        <Route
          path="review"
          element={
            <LazyPage>
              <EditorStoriesPage
                status="SUBMITTED"
              />
            </LazyPage>
          }
        />


        {/* REVIEW STORY */}

        <Route
          path="review/:storyId"
          element={
            <LazyPage>
              <StoryReviewPage />
            </LazyPage>
          }
        />


        {/* CHANGES REQUESTED */}

        <Route
          path="changes-requested"
          element={
            <LazyPage>
              <EditorStoriesPage
                status="CHANGES_REQUESTED"
              />
            </LazyPage>
          }
        />


        {/* PUBLISHED */}

        <Route
          path="published"
          element={
            <LazyPage>
              <EditorStoriesPage
                status="PUBLISHED"
              />
            </LazyPage>
          }
        />


        {/* REJECTED */}

        <Route
          path="rejected"
          element={
            <LazyPage>
              <EditorStoriesPage
                status="REJECTED"
              />
            </LazyPage>
          }
        />


        {/* SCHEDULED */}

        <Route
          path="scheduled"
          element={
            <LazyPage>
              <EditorStoriesPage
                status="SCHEDULED"
              />
            </LazyPage>
          }
        />


        {/* ANALYTICS */}

        <Route
          path="analytics"
          element={
            <LazyPage>
              <EditorAnalyticsPage />
            </LazyPage>
          }
        />


        {/* PROFILE */}

        <Route
          path="profile"
          element={
            <LazyPage>
              <StaffProfilePage />
            </LazyPage>
          }
        />

      </Route>

    </Route>

  );

}


/* ============================================================
   SUPER ADMIN APPLICATION

   /super-admin/*
============================================================ */

function SuperAdminApplication() {

  return (

    <Route
      path="/super-admin"
      element={
        <SuperAdminRoute />
      }
    >

      <Route
        element={
          <SuperAdminLayout />
        }
      >

        {/* DEFAULT */}

        <Route
          index
          element={
            <Navigate
              to="dashboard"
              replace
            />
          }
        />


        {/* DASHBOARD */}

        <Route
          path="dashboard"
          element={
            <LazyPage>
              <SuperAdminDashboardPage />
            </LazyPage>
          }
        />


        {/* PROFILE */}

        <Route
          path="profile"
          element={
            <LazyPage>
              <SuperAdminProfilePage />
            </LazyPage>
          }
        />


        {/* USERS */}

        <Route
          path="users"
          element={
            <LazyPage>
              <SuperAdminUsersPage />
            </LazyPage>
          }
        />


        {/* USER DETAILS */}

        <Route
          path="users/:userId"
          element={
            <LazyPage>
              <SuperAdminUserDetailsPage />
            </LazyPage>
          }
        />


        {/* ADMINS */}

        <Route
          path="admins"
          element={
            <LazyPage>
              <SuperAdminAdminsPage />
            </LazyPage>
          }
        />


        {/* SUPER ADMINS */}

        <Route
          path="super-admins"
          element={
            <LazyPage>
              <SuperAdminManagementPage />
            </LazyPage>
          }
        />


        {/* EDITORIAL */}

        <Route
          path="editorial"
          element={
            <LazyPage>
              <SuperAdminEditorialPage />
            </LazyPage>
          }
        />


        {/* NEWS MANAGEMENT */}

        <Route
          path="editorial/news"
          element={
            <LazyPage>
              <SuperAdminNewsManagementPage />
            </LazyPage>
          }
        />


        {/* CREATE NEWS */}

        <Route
          path="editorial/news/new"
          element={
            <LazyPage>
              <SuperAdminNewsEditorPage />
            </LazyPage>
          }
        />


        {/* EDIT NEWS */}

        <Route
          path="editorial/news/:newsId/edit"
          element={
            <LazyPage>
              <SuperAdminNewsEditPage />
            </LazyPage>
          }
        />


        {/* NEWS PREVIEW */}

        <Route
          path="editorial/news/:newsId/preview"
          element={
            <LazyPage>
              <SuperAdminNewsPreviewPage />
            </LazyPage>
          }
        />

        {/* NEWS DETAILS */}

        <Route
          path="editorial/news/:newsId"
          element={
            <LazyPage>
              <SuperAdminNewsDetailsPage />
            </LazyPage>
          }
        />


        {/* EDITORIAL REVIEW */}

        <Route
          path="editorial/review"
          element={
            <LazyPage>
              <SuperAdminEditorialReviewPage />
            </LazyPage>
          }
        />


        {/* EDITORIAL POLICIES */}

        <Route
          path="editorial/policies"
          element={
            <LazyPage>
              <SuperAdminEditorialPoliciesPage />
            </LazyPage>
          }
        />


        {/* EDITORIAL STATUS */}

        <Route
          path="editorial/status/:statusType"
          element={
            <LazyPage>
              <SuperAdminEditorialStatusPage />
            </LazyPage>
          }
        />


        {/* PERMISSIONS */}

        <Route
          path="permissions"
          element={
            <LazyPage>
              <PermissionManagementPage />
            </LazyPage>
          }
        />


        {/* ROLES */}

        <Route
          path="roles"
          element={
            <LazyPage>
              <RoleManagementPage />
            </LazyPage>
          }
        />


        {/* SECURITY */}

        <Route
          path="security"
          element={
            <LazyPage>
              <SystemSecurityPage />
            </LazyPage>
          }
        />


        {/* SETTINGS */}

        <Route
          path="settings"
          element={
            <LazyPage>
              <SuperAdminSettingsPage />
            </LazyPage>
          }
        />

      </Route>

    </Route>

  );

}


/* ============================================================
   APPLICATION ROUTES
============================================================ */

export default function AppRoutes() {

  return (

    <Routes>

      {/* ======================================================
          PUBLIC WEBSITE

          IMPORTANT:
          Function call returns a Route.
      ====================================================== */}

      {PublicRoutes()}


      {/* ======================================================
          NORMAL USER AUTHENTICATION
      ====================================================== */}

      <Route
        path="/login"
        element={
          <LoginPage />
        }
      />


      <Route
        path="/register"
        element={
          <RegisterPage />
        }
      />

      <Route
        path="/verify-email"
        element={
          <VerifyEmailPage />
        }
      />


      <Route
        path="/forgot-password"
        element={
          <ForgotPasswordPage />
        }
      />


      <Route
        path="/reset-password"
        element={
          <ResetPasswordPage />
        }
      />


      {/* ======================================================
          STAFF LOGIN
      ====================================================== */}

      <Route
        path="/admin/login"
        element={
          <AdminLoginPage />
        }
      />


      {/* ======================================================
          PROTECTED APPLICATIONS

          IMPORTANT:

          Do NOT use:

          <AdminApplication />

          <AuthorApplication />

          <EditorApplication />

          <SuperAdminApplication />

          inside <Routes>.

          These functions return Route elements,
          so call them directly.
      ====================================================== */}

      {AdminApplication()}

      {AuthorApplication()}

      {EditorApplication()}

      {SuperAdminApplication()}


      {/* ======================================================
          LEGACY EDITORIAL ROUTES
      ====================================================== */}

      <Route
        path="/editorial"
        element={
          <Navigate
            to="/editor/dashboard"
            replace
          />
        }
      />


      <Route
        path="/editorial/queue"
        element={
          <Navigate
            to="/editor/review"
            replace
          />
        }
      />


      {/* ======================================================
          LEGACY AUTHOR ROUTES
      ====================================================== */}

      <Route
        path="/author/news"
        element={
          <Navigate
            to="/author/stories"
            replace
          />
        }
      />


      <Route
        path="/author/news/new"
        element={
          <Navigate
            to="/author/create"
            replace
          />
        }
      />


      {/* ======================================================
          404
      ====================================================== */}

      <Route
        path="/404"
        element={
          <NotFoundPage />
        }
      />


      {/* ======================================================
          UNKNOWN ROUTES
      ====================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/404"
            replace
          />
        }
      />

    </Routes>

  );

}