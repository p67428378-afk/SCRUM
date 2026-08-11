import React from "react";

export const InlineErrorAlert = ({
  message = "Unable to load suggestions. Retrying...",
  onRetry,
}) => {
  return (
    <div className="bg-[#fcf2f2] border border-[#db2626] p-3 rounded-md text-[#db2626] text-sm flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span>⚠️</span>
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="text-xs underline font-semibold hover:opacity-80 transition-opacity focus:outline-none"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default InlineErrorAlert;
