import React from "react";

export default function InlineConfirmationBanner({ submission, onClose }) {
  if (!submission) return null;

  return (
    <div className="mb-lg bg-surface-container-lowest border border-success-container/30 border-l-4 border-l-[#16a34a] rounded p-md flex items-start gap-md shadow-sm">
      <span
        className="material-symbols-outlined text-[#16a34a]"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        check_circle
      </span>
      <div className="flex-1">
        <h3 className="font-title-md text-title-md text-on-surface mb-xs">
          Assortment Plan Successfully Submitted!
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Transaction ID:{" "}
          <span className="font-mono font-bold">
            {submission.transaction_id}
          </span>{" "}
          | Timestamp: {submission.timestamp} | Summary: {submission.summary}
        </p>
      </div>
      <button
        onClick={onClose}
        className="text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
}
