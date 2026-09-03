import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Globe2,
  ShieldAlert,
  Timer,
} from "lucide-react";

const CARDS = [
  {
    status: "PENDING_ADMIN_REVIEW",
    label: "Admin review",
    icon: Timer,
  },
  {
    status: "PENDING_SUPER_ADMIN_REVIEW",
    label: "Super Admin review",
    icon: ShieldAlert,
  },
  {
    status: "PUBLISHED",
    label: "Published",
    icon: Globe2,
  },
  {
    status: "DRAFT",
    label: "Drafts",
    icon: FileText,
  },
  {
    status: "BLOCKED",
    label: "Blocked",
    icon: AlertTriangle,
  },
  {
    status: "SCHEDULED",
    label: "Scheduled",
    icon: CheckCircle2,
  },
];

export default function EditorialStats({
  news = [],
}) {
  const count = (status) =>
    news.filter(
      (item) => item.status === status
    ).length;

  return (
    <div className="editorial-stat-grid">
      {CARDS.map((card) => {
        const Icon = card.icon;

        return (
          <div
            className="editorial-stat-card"
            key={card.status}
          >
            <div className="editorial-stat-icon">
              <Icon size={19} />
            </div>

            <div className="editorial-stat-content">
              <strong>
                {count(card.status)}
              </strong>

              <span>{card.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}