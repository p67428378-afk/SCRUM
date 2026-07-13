import React from "react";

export default function InlineConfirmationBanner({ submission }) {
  if (!submission) return null;

  const { message, transaction_id, submitted_at, user } = submission;

  return (
    <div className="mt-lg p-4 rounded-lg border border-emerald-900 flex items-start space-x-3 mx-container-padding mb-container-padding shadow-lg bg-[#064E3B]">
      <span className="text-emerald-400 mt-0.5 text-xl">✓</span>
      <div>
        <div className="text-white font-semibold">{message}</div>
        <div className="text-emerald-200/80 font-mono-label text-xs mt-1">
          Transaction ID: {transaction_id}. Audit trail logged for {user} at{" "}
          {new Date(submitted_at).toLocaleString()} UTC.
        </div>
      </div>
    </div>
  );
}
