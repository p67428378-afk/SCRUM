import React from "react";

export default function LiveValidationBanner({ isValid, message }) {
  return (
    <div
      className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
        isValid
          ? "bg-secondary/10 text-on-secondary-container border-secondary/20"
          : "bg-error/10 text-on-error-container border-error/20"
      }`}
      data-testid="live-validation-banner"
    >
      <span className="material-symbols-outlined text-xl">
        {isValid ? "check_circle" : "warning"}
      </span>
      <div className="flex-1 text-xs font-semibold">{message}</div>
    </div>
  );
}
