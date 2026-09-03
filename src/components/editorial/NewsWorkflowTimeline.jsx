const steps = [
  ["DRAFT", "Draft"],
  ["PENDING_REVIEW", "Review"],
  ["APPROVED", "Approved"],
  ["SCHEDULED", "Scheduled"],
  ["PUBLISHED", "Published"]
];

export default function NewsWorkflowTimeline({ status }) {
  const rejected = status === "REJECTED";
  const currentIndex = steps.findIndex(([key]) => key === status);

  return (
    <div className="news-workflow-timeline">
      {steps.map(([key, label], index) => {
        const complete = !rejected && currentIndex >= index;
        const current = key === status;

        return (
          <div
            className={`workflow-step ${complete ? "complete" : ""} ${current ? "current" : ""}`}
            key={key}
          >
            <div className="workflow-dot">{index + 1}</div>
            <span>{label}</span>
          </div>
        );
      })}

      {rejected && (
        <div className="workflow-rejected">
          Article rejected — revise and submit again.
        </div>
      )}
    </div>
  );
}
