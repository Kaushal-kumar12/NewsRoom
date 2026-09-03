import React from "react";
import {
  Plus,
  Edit3,
  Send,
  Eye,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Globe2,
  Clock3,
  ShieldCheck,
} from "lucide-react";

const ACTIONS = {
  NEWS_CREATED: {
    label: "Publication created",
    icon: Plus,
  },

  NEWS_UPDATED: {
    label: "Publication updated",
    icon: Edit3,
  },

  NEWS_SUBMITTED: {
    label: "Submitted for review",
    icon: Send,
  },

  NEWS_REVIEWED: {
    label: "Publication reviewed",
    icon: Eye,
  },

  NEWS_APPROVED: {
    label: "Publication approved",
    icon: CheckCircle2,
  },

  NEWS_REJECTED: {
    label: "Publication rejected",
    icon: XCircle,
  },

  NEWS_FORWARDED: {
    label: "Forwarded for higher approval",
    icon: ArrowUpRight,
  },

  NEWS_PUBLISHED: {
    label: "Publication published",
    icon: Globe2,
  },

  NEWS_SCHEDULED: {
    label: "Publication scheduled",
    icon: Clock3,
  },

  NEWS_POLICY_UPDATED: {
    label: "Editorial policy updated",
    icon: ShieldCheck,
  },
};

function formatDate(value) {
  if (!value) return "Unknown time";

  try {
    const date =
      value?.toDate instanceof Function
        ? value.toDate()
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Unknown time";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Unknown time";
  }
}

export default function EditorialActivity({
  activities = [],
  loading = false,
  title = "Editorial Activity",
}) {
  const sortedActivities = [...activities].sort(
    (a, b) => {
      const getTime = (item) => {
        const value = item?.createdAt;

        if (value?.toDate instanceof Function) {
          return value.toDate().getTime();
        }

        const date = new Date(value);

        return Number.isNaN(date.getTime())
          ? 0
          : date.getTime();
      };

      return getTime(b) - getTime(a);
    }
  );

  return (
    <section className="editorial-activity">

      {/* HEADER */}

      <div className="editorial-activity-header">

        <div>
          <span className="editorial-section-label">
            AUDIT TRAIL
          </span>

          <h3>{title}</h3>

          <p>
            Track every important action taken on this
            publication.
          </p>
        </div>

        <div className="editorial-activity-count">
          {sortedActivities.length}
        </div>

      </div>

      {/* CONTENT */}

      {loading ? (
        <div className="editorial-activity-empty">
          Loading activity...
        </div>
      ) : sortedActivities.length === 0 ? (
        <div className="editorial-activity-empty">

          <ShieldCheck size={30} />

          <strong>
            No activity recorded
          </strong>

          <span>
            Editorial actions will appear here.
          </span>

        </div>
      ) : (
        <div className="editorial-timeline">

          {sortedActivities.map((activity, index) => {

            const config =
              ACTIONS[activity.action] || {
                label:
                  activity.action ||
                  "Editorial action",
                icon: Eye,
              };

            const Icon = config.icon;

            const isLast =
              index === sortedActivities.length - 1;

            return (
              <div
                className="editorial-timeline-item"
                key={
                  activity.id ||
                  `${activity.action}-${index}`
                }
              >

                {/* ICON */}

                <div className="editorial-timeline-marker">
                  <Icon size={16} />
                </div>

                {/* CONNECTOR */}

                {!isLast && (
                  <div className="editorial-timeline-line" />
                )}

                {/* CONTENT */}

                <div className="editorial-timeline-content">

                  <div className="editorial-timeline-top">

                    <strong>
                      {config.label}
                    </strong>

                    <time>
                      {formatDate(
                        activity.createdAt
                      )}
                    </time>

                  </div>

                  <div className="editorial-timeline-user">

                    <span className="editorial-activity-avatar">
                      {(
                        activity.actorName ||
                        "U"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </span>

                    <div>

                      <strong>
                        {activity.actorName ||
                          "Unknown user"}
                      </strong>

                      <small>
                        {activity.actorRole ||
                          "User"}
                      </small>

                    </div>

                  </div>

                  {activity.metadata && (
                    <div className="editorial-activity-meta">

                      {activity.metadata.reason && (
                        <div>
                          <span>Reason</span>
                          <p>
                            {activity.metadata.reason}
                          </p>
                        </div>
                      )}

                      {activity.metadata.comment && (
                        <div>
                          <span>Comment</span>
                          <p>
                            {activity.metadata.comment}
                          </p>
                        </div>
                      )}

                      {activity.metadata.status && (
                        <div>
                          <span>Status</span>
                          <p>
                            {activity.metadata.status}
                          </p>
                        </div>
                      )}

                      {activity.metadata.title && (
                        <div>
                          <span>Title</span>
                          <p>
                            {activity.metadata.title}
                          </p>
                        </div>
                      )}

                    </div>
                  )}

                </div>

              </div>
            );
          })}

        </div>
      )}

    </section>
  );
}