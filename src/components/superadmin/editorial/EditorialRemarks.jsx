import React from "react";
import {
  AlertTriangle,
  Ban,
  MessageSquareWarning,
} from "lucide-react";

export default function EditorialRemarks({ news }) {
  const remarks = [];

  if (news?.blockReason) {
    remarks.push({
      tone: "danger",
      icon: Ban,
      title: "Publication blocked",
      text: news.blockReason,
    });
  }

  if (news?.rejectionReason) {
    remarks.push({
      tone: "danger",
      icon: AlertTriangle,
      title: "Rejection reason",
      text: news.rejectionReason,
    });
  }

  if (news?.remarks) {
    remarks.push({
      tone: "warning",
      icon: MessageSquareWarning,
      title: "Editorial remarks",
      text: news.remarks,
    });
  }

  if (news?.changeRequest) {
    remarks.push({
      tone: "warning",
      icon: MessageSquareWarning,
      title: "Changes requested",
      text: news.changeRequest,
    });
  }

  if (!remarks.length) {
    return null;
  }

  return (
    <div className="editorial-remarks">
      {remarks.map((remark, index) => {
        const Icon = remark.icon;

        return (
          <div
            key={`${remark.title}-${index}`}
            className={`editorial-remark editorial-remark--${remark.tone}`}
          >
            <div className="editorial-remark-icon">
              <Icon size={17} />
            </div>

            <div className="editorial-remark-content">
              <strong>{remark.title}</strong>
              <p>{remark.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}