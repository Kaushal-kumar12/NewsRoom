// src/components/superadmin/editorial/EditorialQueue.jsx

import React, { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Clock3,
  AlertTriangle,
  MoreHorizontal,
  FileText,
} from "lucide-react";

const STATUS_META = {
  PENDING_REVIEW: {
    label: "Pending Review",
    className: "pending",
    icon: Clock3,
  },
  ADMIN_REVIEW: {
    label: "Admin Review",
    className: "admin-review",
    icon: Eye,
  },
  SUPER_ADMIN_REVIEW: {
    label: "Super Admin Review",
    className: "super-review",
    icon: AlertTriangle,
  },
  APPROVED: {
    label: "Approved",
    className: "approved",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    className: "rejected",
    icon: XCircle,
  },
  PUBLISHED: {
    label: "Published",
    className: "published",
    icon: CheckCircle2,
  },
};

function formatDate(value) {
  if (!value) return "—";

  try {
    const date =
      value?.toDate instanceof Function
        ? value.toDate()
        : new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function getAuthorName(item) {
  return (
    item.authorName ||
    item.createdByName ||
    item.authorEmail ||
    "Unknown author"
  );
}

export default function EditorialQueue({
  items = [],
  loading = false,
  onRefresh,
  onOpen,
  onApprove,
  onReject,
  onForward,
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [menuId, setMenuId] = useState(null);

  const filteredItems = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !normalized ||
        String(item.title || "")
          .toLowerCase()
          .includes(normalized) ||
        String(getAuthorName(item))
          .toLowerCase()
          .includes(normalized) ||
        String(item.category || "")
          .toLowerCase()
          .includes(normalized);

      const matchesStatus =
        status === "ALL" || item.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [items, search, status]);

  return (
    <section className="editorial-queue">

      {/* HEADER */}
      <div className="editorial-queue-header">
        <div>
          <div className="editorial-section-label">
            REVIEW WORKSPACE
          </div>

          <h2>Editorial Queue</h2>

          <p>
            Review submitted stories, media posts and sensitive
            publications before they go live.
          </p>
        </div>

        <button
          type="button"
          className="editorial-outline-button"
          onClick={onRefresh}
        >
          Refresh
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="editorial-queue-toolbar">

        <div className="editorial-search">
          <Search size={18} />

          <input
            type="search"
            placeholder="Search title, author or category..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="editorial-filter">
          <Filter size={17} />

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING_REVIEW">
              Pending Review
            </option>
            <option value="ADMIN_REVIEW">
              Admin Review
            </option>
            <option value="SUPER_ADMIN_REVIEW">
              Super Admin Review
            </option>
            <option value="APPROVED">
              Approved
            </option>
            <option value="REJECTED">
              Rejected
            </option>
            <option value="PUBLISHED">
              Published
            </option>
          </select>
        </div>

      </div>

      {/* TABLE */}
      <div className="editorial-queue-table-wrap">

        <table className="editorial-queue-table">

          <thead>
            <tr>
              <th>STORY</th>
              <th>AUTHOR</th>
              <th>TYPE</th>
              <th>STATUS</th>
              <th>SUBMITTED</th>
              <th />
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="editorial-table-empty"
                >
                  Loading editorial queue...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="editorial-table-empty"
                >
                  <FileText size={30} />

                  <strong>
                    No editorial items found
                  </strong>

                  <span>
                    Submitted articles and posts will appear here.
                  </span>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {

                const meta =
                  STATUS_META[item.status] ||
                  STATUS_META.PENDING_REVIEW;

                const StatusIcon = meta.icon;

                return (
                  <tr key={item.id}>

                    {/* STORY */}
                    <td>

                      <div className="editorial-story-cell">

                        <div className="editorial-story-thumbnail">
                          {item.coverImage ||
                          item.featuredImage ? (
                            <img
                              src={
                                item.coverImage ||
                                item.featuredImage
                              }
                              alt=""
                            />
                          ) : (
                            <FileText size={20} />
                          )}
                        </div>

                        <div>
                          <strong>
                            {item.title ||
                              "Untitled publication"}
                          </strong>

                          <small>
                            {item.category ||
                              "Uncategorized"}
                          </small>
                        </div>

                      </div>

                    </td>

                    {/* AUTHOR */}
                    <td>
                      <div className="editorial-author-cell">
                        <strong>
                          {getAuthorName(item)}
                        </strong>

                        <small>
                          {item.authorRole ||
                            "Contributor"}
                        </small>
                      </div>
                    </td>

                    {/* TYPE */}
                    <td>
                      <span className="editorial-type-pill">
                        {item.contentType ||
                          item.type ||
                          "Article"}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td>

                      <span
                        className={`editorial-status ${meta.className}`}
                      >
                        <StatusIcon size={14} />
                        {meta.label}
                      </span>

                    </td>

                    {/* DATE */}
                    <td>
                      <span className="editorial-date">
                        {formatDate(
                          item.submittedAt ||
                          item.updatedAt ||
                          item.createdAt
                        )}
                      </span>
                    </td>

                    {/* ACTION */}
                    <td className="editorial-actions-cell">

                      <button
                        type="button"
                        className="editorial-icon-button"
                        title="Open publication"
                        onClick={() =>
                          onOpen?.(item)
                        }
                      >
                        <Eye size={17} />
                      </button>

                      <div className="editorial-more-wrapper">

                        <button
                          type="button"
                          className="editorial-icon-button"
                          onClick={() =>
                            setMenuId(
                              menuId === item.id
                                ? null
                                : item.id
                            )
                          }
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {menuId === item.id && (
                          <div className="editorial-action-menu">

                            <button
                              type="button"
                              onClick={() => {
                                setMenuId(null);
                                onOpen?.(item);
                              }}
                            >
                              <Eye size={15} />
                              View publication
                            </button>

                            {[
                              "PENDING_REVIEW",
                              "ADMIN_REVIEW",
                            ].includes(item.status) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setMenuId(null);
                                  onApprove?.(item);
                                }}
                              >
                                <CheckCircle2 size={15} />
                                Approve
                              </button>
                            )}

                            {item.status !== "PUBLISHED" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setMenuId(null);
                                  onForward?.(item);
                                }}
                              >
                                <ArrowUpRight size={15} />
                                Forward for review
                              </button>
                            )}

                            {item.status !== "PUBLISHED" && (
                              <button
                                type="button"
                                className="danger"
                                onClick={() => {
                                  setMenuId(null);
                                  onReject?.(item);
                                }}
                              >
                                <XCircle size={15} />
                                Reject
                              </button>
                            )}

                          </div>
                        )}

                      </div>

                    </td>

                  </tr>
                );
              })
            )}

          </tbody>

        </table>

      </div>

      <div className="editorial-queue-footer">
        Showing {filteredItems.length} of {items.length} publications
      </div>

    </section>
  );
}