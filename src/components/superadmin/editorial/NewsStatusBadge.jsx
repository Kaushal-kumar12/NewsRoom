import React from "react";

const LABELS = {
  DRAFT: ["Draft", "draft"],

  PENDING_ADMIN_REVIEW: [
    "Admin Review",
    "review",
  ],

  ADMIN_APPROVED: [
    "Admin Approved",
    "approved",
  ],

  FORWARDED_TO_SUPER_ADMIN: [
    "Forwarded to Super Admin",
    "forwarded",
  ],

  PENDING_SUPER_ADMIN_REVIEW: [
    "Super Admin Review",
    "review",
  ],

  SUPER_ADMIN_APPROVED: [
    "Super Approved",
    "approved",
  ],

  CHANGES_REQUESTED: [
    "Changes Requested",
    "changes",
  ],

  BLOCKED: [
    "Blocked",
    "blocked",
  ],

  REJECTED: [
    "Rejected",
    "blocked",
  ],

  APPROVED: [
    "Approved",
    "approved",
  ],

  PUBLISHED: [
    "Published",
    "published",
  ],

  SCHEDULED: [
    "Scheduled",
    "scheduled",
  ],

  ARCHIVED: [
    "Archived",
    "archived",
  ],
};

export default function NewsStatusBadge({
  status = "DRAFT",
}) {
  const fallback = [
    String(status).replaceAll("_", " "),
    "draft",
  ];

  const [label, tone] =
    LABELS[status] || fallback;

  return (
    <span
      className={`editorial-status editorial-status--${tone}`}
    >
      <span className="editorial-status-dot" />
      <span>{label}</span>
    </span>
  );
}