import React from "react";

export default function ErrorBox({
  message = "An error occurred. Please try again.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-surface-container-high rounded-lg border border-error/30 text-center">
      <span className="material-symbols-outlined text-error text-5xl mb-3">
        warning
      </span>
      <h3 className="text-error font-headline-md mb-2">Error</h3>
      <p className="text-on-surface-variant font-body-sm mb-4 max-w-md">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-error-container text-on-error-container rounded-md hover:bg-error hover:text-on-error transition-colors font-body-sm font-semibold"
        >
          Retry
        </button>
      )}
    </div>
  );
}
