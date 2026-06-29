import React from "react";
import PropTypes from "prop-types";

export default function InlineConfirmationBanner({ auditData, onClose }) {
  if (!auditData) return null;

  return (
    <div className="mb-lg bg-[#064E3B] border border-[#10B981] rounded-lg p-sm flex items-start gap-sm shadow-sm">
      <span className="material-symbols-outlined text-[#10B981] fill mt-0.5">
        check_circle
      </span>
      <div className="flex-1">
        <p className="font-body-md text-on-surface">
          <strong className="font-bold">
            Assortment changes submitted successfully!
          </strong>{" "}
          Audit ID:{" "}
          <span className="font-data-mono font-semibold">
            {auditData.audit_id || "DG-REV-2026-0109-B2"}
          </span>{" "}
          | Submitted by: John Doe on{" "}
          {auditData.created_at
            ? new Date(auditData.created_at).toLocaleString()
            : "2026-01-09 11:50 AM"}{" "}
          | Status:{" "}
          <span className="text-primary-fixed font-semibold">
            Pending Regional VP Approval
          </span>
        </p>
      </div>
      <button
        onClick={onClose}
        className="text-[#10B981] hover:text-on-surface transition-colors"
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
}

InlineConfirmationBanner.propTypes = {
  auditData: PropTypes.shape({
    audit_id: PropTypes.string,
    created_at: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};
