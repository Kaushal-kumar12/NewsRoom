import React, { useEffect, useRef } from "react";
import {
  Activity,
  Archive,
  Eye,
  MoreHorizontal,
  Pencil,
  ShieldCheck,
} from "lucide-react";

export default function NewsActionMenu({
  open,
  onToggle,
  onView,
  onEdit,
  onReview,
  onActivity,
  onArchive,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const close = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onToggle(false);
      }
    };

    document.addEventListener("mousedown", close);

    return () => {
      document.removeEventListener("mousedown", close);
    };
  }, [onToggle]);

  return (
    <div className="editorial-action-menu" ref={ref}>
      <button
        type="button"
        className="editorial-icon-button"
        onClick={() => onToggle(!open)}
        aria-label="News actions"
        aria-expanded={open}
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div className="editorial-menu-popover">
          <button
            type="button"
            onClick={() => {
              onToggle(false);
              onView?.();
            }}
          >
            <Eye size={15} />
            <span>View details</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onToggle(false);
              onEdit?.();
            }}
          >
            <Pencil size={15} />
            <span>Edit news</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onToggle(false);
              onReview?.();
            }}
          >
            <ShieldCheck size={15} />
            <span>Review</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onToggle(false);
              onActivity?.();
            }}
          >
            <Activity size={15} />
            <span>Activity</span>
          </button>

          <div className="editorial-menu-divider" />

          <button
            type="button"
            className="editorial-menu-danger"
            onClick={() => {
              onToggle(false);
              onArchive?.();
            }}
          >
            <Archive size={15} />
            <span>Archive</span>
          </button>
        </div>
      )}
    </div>
  );
}