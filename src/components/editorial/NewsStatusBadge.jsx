const labels = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published"
};

export default function NewsStatusBadge({ status }) {
  return (
    <span className={`news-status news-status-${String(status || "").toLowerCase()}`}>
      {labels[status] || status || "Unknown"}
    </span>
  );
}
