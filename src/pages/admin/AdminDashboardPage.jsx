// src/pages/admin/AdminDashboardPage.jsx

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Newspaper,
  FileText,
  Clock3,
  CheckCircle2,
  Users,
  PenSquare,
  ArrowRight,
  Send,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

import {
  db,
} from "../../services/firebase";

import {
  PERMISSIONS,
  hasPermission,
  getRoleLabel,
} from "../../config/rolePermissions";

import {
  useStaffAuth,
} from "../../components/auth/StaffRoute";

export default function AdminDashboardPage() {

  const {
    role,
    profile,
  } = useStaffAuth();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    stats,
    setStats,
  ] = useState({
    total: 0,
    drafts: 0,
    pending: 0,
    published: 0,
    users: 0,
  });

  const [
    recentDrafts,
    setRecentDrafts,
  ] = useState([]);

  const loadDashboard =
    useCallback(
      async () => {

        try {

          setLoading(true);
          setError("");

          /*
          |--------------------------------------------------------------------------
          | NEWS
          |--------------------------------------------------------------------------
          */

          const newsSnapshot =
            await getDocs(
              collection(
                db,
                "news"
              )
            );

          const news =
            newsSnapshot.docs.map(
              (item) => ({
                id: item.id,
                ...item.data(),
              })
            );

          /*
          |--------------------------------------------------------------------------
          | USERS
          |--------------------------------------------------------------------------
          |
          | Only query users when the role has USERS_READ.
          |--------------------------------------------------------------------------
          */

          let usersCount = 0;

          if (
            hasPermission(
              role,
              PERMISSIONS.USERS_READ
            )
          ) {

            const usersSnapshot =
              await getDocs(
                collection(
                  db,
                  "users"
                )
              );

            usersCount =
              usersSnapshot.size;
          }

          /*
          |--------------------------------------------------------------------------
          | COUNTS
          |--------------------------------------------------------------------------
          */

          const drafts =
            news.filter(
              (item) =>
                item.status ===
                "DRAFT"
            );

          const pending =
            news.filter(
              (item) =>
                [
                  "PENDING_ADMIN_REVIEW",
                  "PENDING_SUPERADMIN_REVIEW",
                  "ADMIN_REVIEW",
                  "SUPERADMIN_REVIEW",
                  "PENDING_REVIEW",
                ].includes(
                  item.status
                )
            );

          const published =
            news.filter(
              (item) =>
                item.status ===
                "PUBLISHED"
            );

          setStats({
            total:
              news.length,

            drafts:
              drafts.length,

            pending:
              pending.length,

            published:
              published.length,

            users:
              usersCount,
          });

          /*
          |--------------------------------------------------------------------------
          | RECENT DRAFTS
          |--------------------------------------------------------------------------
          */

          setRecentDrafts(
            drafts
              .sort(
                (
                  a,
                  b
                ) => {

                  const aTime =
                    a.updatedAt?.seconds ||
                    a.createdAt?.seconds ||
                    0;

                  const bTime =
                    b.updatedAt?.seconds ||
                    b.createdAt?.seconds ||
                    0;

                  return (
                    bTime -
                    aTime
                  );
                }
              )
              .slice(
                0,
                5
              )
          );

        } catch (err) {

          console.error(
            "Dashboard error:",
            err
          );

          if (
            err?.code ===
            "permission-denied"
          ) {

            setError(
              "Firebase denied access to one of the dashboard resources. Check the Firestore rules and role stored in users/{uid}."
            );

          } else {

            setError(
              err?.message ||
                "Unable to load dashboard."
            );
          }

        } finally {

          setLoading(false);
        }

      },
      [role]
    );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const cards = [

    {
      title: "Total News",
      value:
        stats.total,
      icon:
        Newspaper,
      className:
        "blue",
    },

    {
      title: "Drafts",
      value:
        stats.drafts,
      icon:
        FileText,
      className:
        "orange",
    },

    {
      title: "Pending Review",
      value:
        stats.pending,
      icon:
        Clock3,
      className:
        "purple",
    },

    {
      title: "Published",
      value:
        stats.published,
      icon:
        CheckCircle2,
      className:
        "green",
    },
  ];

  return (
    <div className="staff-page">

      <div className="staff-page-header">

        <div>

          <span className="staff-eyebrow">
            {getRoleLabel(role)}
          </span>

          <h1>
            Welcome back,{" "}
            {profile?.name ||
              "Staff User"}
          </h1>

          <p>
            Manage NewsRoom operations
            according to your assigned
            permissions.
          </p>

        </div>

        <div className="staff-header-actions">

          <button
            type="button"
            className="staff-secondary-button"
            onClick={loadDashboard}
          >
            <RefreshCw
              size={16}
            />
            Refresh
          </button>

          {hasPermission(
            role,
            PERMISSIONS.NEWS_CREATE
          ) && (
            <Link
              className="staff-primary-button"
              to="/admin/news/new"
            >
              <PenSquare
                size={17}
              />
              Create News
            </Link>
          )}

        </div>

      </div>

      {error && (
        <div className="staff-alert error">
          {error}
        </div>
      )}

      <section className="staff-stat-grid">

        {cards.map(
          (card) => {

            const Icon =
              card.icon;

            return (
              <div
                className="staff-stat-card"
                key={card.title}
              >

                <div
                  className={`staff-stat-icon ${card.className}`}
                >
                  <Icon
                    size={21}
                  />
                </div>

                <div>

                  <span>
                    {card.title}
                  </span>

                  <strong>
                    {loading
                      ? "..."
                      : card.value}
                  </strong>

                </div>

              </div>
            );
          }
        )}

      </section>

      {hasPermission(
        role,
        PERMISSIONS.USERS_READ
      ) && (
        <section className="staff-panel staff-users-summary">

          <div className="staff-panel-header">

            <div>
              <h2>
                Registered Users
              </h2>

              <p>
                User accounts and their
                current assigned roles.
              </p>
            </div>

            <Users
              size={22}
            />

          </div>

          <div className="staff-big-number">
            {loading
              ? "..."
              : stats.users}
          </div>

          <Link
            to="/admin/users"
            className="staff-text-link"
          >
            View users
            <ArrowRight
              size={15}
            />
          </Link>

        </section>
      )}

      <section className="staff-dashboard-grid">

        <div className="staff-panel">

          <div className="staff-panel-header">

            <div>

              <h2>
                Editorial Workspace
              </h2>

              <p>
                Work with stories according
                to your role.
              </p>

            </div>

          </div>

          <div className="staff-action-grid">

            {hasPermission(
              role,
              PERMISSIONS.NEWS_CREATE
            ) && (
              <Link
                to="/admin/news/new"
                className="staff-action-card"
              >
                <PenSquare />

                <strong>
                  Create News
                </strong>

                <span>
                  Write and save a
                  newsroom story.
                </span>
              </Link>
            )}

            {hasPermission(
              role,
              PERMISSIONS.NEWS_REVIEW
            ) && (
              <Link
                to="/admin/editorial"
                className="staff-action-card"
              >
                <Clock3 />

                <strong>
                  Editorial Queue
                </strong>

                <span>
                  Review submitted
                  stories.
                </span>
              </Link>
            )}

            <Link
              to="/admin/news"
              className="staff-action-card"
            >
              <Newspaper />

              <strong>
                News Management
              </strong>

              <span>
                View your newsroom
                publications.
              </span>
            </Link>

            {hasPermission(
              role,
              PERMISSIONS.NEWS_APPROVE
            ) && (
              <Link
                to="/admin/editorial"
                className="staff-action-card"
              >
                <ShieldCheck />

                <strong>
                  Approvals
                </strong>

                <span>
                  Approve stories or
                  forward them to
                  Super Admin.
                </span>
              </Link>
            )}

          </div>

        </div>

      </section>

      <section className="staff-panel">

        <div className="staff-panel-header">

          <div>

            <h2>
              Saved Drafts
            </h2>

            <p>
              Continue editing unfinished
              stories.
            </p>

          </div>

          <FileText
            size={22}
          />

        </div>

        {loading ? (

          <div className="staff-empty-state">
            Loading drafts...
          </div>

        ) : recentDrafts.length === 0 ? (

          <div className="staff-empty-state">
            <FileText size={30} />

            <strong>
              No saved drafts
            </strong>

            <span>
              Drafts created by your
              newsroom team will appear
              here.
            </span>
          </div>

        ) : (

          <div className="staff-draft-list">

            {recentDrafts.map(
              (draft) => (

                <div
                  className="staff-draft-row"
                  key={draft.id}
                >

                  <div>

                    <strong>
                      {draft.title ||
                        "Untitled Story"}
                    </strong>

                    <span>
                      {draft.category ||
                        "General"}
                    </span>

                  </div>

                  <Link
                    to={`/admin/news/${draft.id}/edit`}
                    className="staff-outline-button"
                  >
                    <PenSquare
                      size={15}
                    />
                    Edit Draft
                  </Link>

                </div>

              )
            )}

          </div>
        )}

      </section>

      {hasPermission(
        role,
        PERMISSIONS.NEWS_SUBMIT
      ) && (
        <section className="staff-workflow-info">

          <div>
            <Send size={20} />
          </div>

          <div>

            <strong>
              News approval workflow
            </strong>

            <p>
              Save a story as a draft,
              submit it for Admin review,
              and wait for approval.
              Administrators can publish
              directly or forward a story
              to Super Admin for final
              approval.
            </p>

          </div>

        </section>
      )}

    </div>
  );
}