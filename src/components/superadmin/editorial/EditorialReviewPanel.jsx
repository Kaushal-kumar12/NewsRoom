import React, { useState } from "react";
import {
  Check,
  Forward,
  MessageSquareWarning,
  ShieldBan,
  X,
} from "lucide-react";

export default function EditorialReviewPanel({
  actor,
  news,
  onApprove,
  onForward,
  onChanges,
  onBlock,
}) {
  const [reason, setReason] = useState("");
  const [mode, setMode] = useState(null);
  const [busy, setBusy] = useState(false);

  const role = actor?.role || "";

  const isSuperAdmin =
    role === "Super Administrator" ||
    role === "SUPER_ADMIN" ||
    role === "SUPERADMIN";

  const confirm = async () => {
    const value = reason.trim();

    if (!value) {
      return;
    }

    setBusy(true);

    try {
      if (mode === "block") {
        await onBlock?.(value);
      }

      if (mode === "changes") {
        await onChanges?.(value);
      }
    } finally {
      setBusy(false);
      setReason("");
      setMode(null);
    }
  };

  return (
    <div className="review-actions-panel">
      <div className="review-panel-title">
        <span className="editorial-kicker">
          DECISION DESK
        </span>

        <h2>Editorial decision</h2>

        <p>
          Review the story carefully before moving it
          toward publication.
        </p>
      </div>

      {news?.sensitivity && (
        <div className="review-sensitivity">
          <span>Sensitivity</span>
          <strong>
            {String(news.sensitivity).replaceAll("_", " ")}
          </strong>
        </div>
      )}

      <div className="review-action-grid">
        <button
          type="button"
          className="review-action review-action--approve"
          onClick={onApprove}
        >
          <Check size={18} />

          <span>
            <strong>Approve</strong>
            <small>
              Move this story toward publication
            </small>
          </span>
        </button>

        <button
          type="button"
          className="review-action"
          onClick={onForward}
        >
          <Forward size={18} />

          <span>
            <strong>Forward</strong>
            <small>
              Send to the next approval level
            </small>
          </span>
        </button>

        <button
          type="button"
          className="review-action"
          onClick={() => setMode("changes")}
        >
          <MessageSquareWarning size={18} />

          <span>
            <strong>Request changes</strong>
            <small>
              Return the story with editorial remarks
            </small>
          </span>
        </button>

        {isSuperAdmin && (
          <button
            type="button"
            className="review-action review-action--danger"
            onClick={() => setMode("block")}
          >
            <ShieldBan size={18} />

            <span>
              <strong>Block story</strong>
              <small>
                Stop publication and record a reason
              </small>
            </span>
          </button>
        )}
      </div>

      {mode && (
        <div className="review-reason-box">
          <div className="review-reason-heading">
            <div>
              <strong>
                {mode === "block"
                  ? "Why are you blocking this story?"
                  : "What should be changed?"}
              </strong>

              <span>
                This reason will be recorded in the
                editorial audit trail.
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setMode(null);
                setReason("");
              }}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <textarea
            autoFocus
            value={reason}
            onChange={(event) =>
              setReason(event.target.value)
            }
            placeholder={
              mode === "block"
                ? "Explain clearly why this story must be blocked..."
                : "Explain clearly what the author/editor needs to change..."
            }
          />

          <div className="review-reason-footer">
            <button
              type="button"
              className="editorial-ghost-button"
              onClick={() => {
                setMode(null);
                setReason("");
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              className="editorial-primary-button"
              disabled={!reason.trim() || busy}
              onClick={confirm}
            >
              {busy
                ? "Saving..."
                : mode === "block"
                  ? "Confirm block"
                  : "Send changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}