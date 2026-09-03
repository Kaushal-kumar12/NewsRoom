import React from "react";
import {
  CheckCircle2,
  Circle,
  Clock3,
  ShieldCheck,
} from "lucide-react";

function formatDate(value) {
  if (!value) {
    return "";
  }

  let date;

  try {
    date = value?.toDate
      ? value.toDate()
      : value instanceof Date
        ? value
        : new Date(value);
  } catch {
    return "";
  }

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getIcon(event, index, total) {
  if (event?.status === "BLOCKED") {
    return ShieldCheck;
  }

  if (index === total - 1) {
    return CheckCircle2;
  }

  return Circle;
}

export default function ApprovalTimeline({ events = [] }) {
  if (!events.length) {
    return (
      <div className="editorial-empty-inline">
        <Clock3 size={17} />
        <span>No approval activity recorded yet.</span>
      </div>
    );
  }

  return (
    <div className="approval-timeline">
      {events.map((event, index) => {
        const Icon = getIcon(event, index, events.length);
        const date = formatDate(event.createdAt);

        return (
          <div
            className="approval-event"
            key={event.id || `${event.action}-${index}`}
          >
            <div className="approval-event-marker">
              <Icon size={17} />
            </div>

            <div className="approval-event-line">
              {index < events.length - 1 && <span />}
            </div>

            <div className="approval-event-content">
              <div className="approval-event-heading">
                <strong>
                  {event.label || event.action || "Editorial activity"}
                </strong>

                {event.status && (
                  <span className="approval-event-status">
                    {String(event.status).replaceAll("_", " ")}
                  </span>
                )}
              </div>

              <span className="approval-event-meta">
                {event.actorName || "System"}
                {event.actorRole ? ` • ${event.actorRole}` : ""}
                {date ? ` • ${date}` : ""}
              </span>

              {event.reason && (
                <p className="approval-event-reason">
                  {event.reason}
                </p>
              )}

              {event.message && (
                <p className="approval-event-message">
                  {event.message}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}