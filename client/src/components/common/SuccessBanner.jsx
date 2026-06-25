import React from "react";
import PropTypes from "prop-types";

export default function SuccessBanner({ message, transactionId, onClose }) {
  if (!message) return null;

  return (
    <div
      className="bg-status-grow-bg border-b border-status-grow-text/20 text-status-grow-text px-container-padding py-3 flex items-center justify-between text-body-sm z-40 relative transition-all duration-300"
      id="success-banner"
    >
      <div className="flex items-center gap-3">
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
        <p>
          {message}{" "}
          {transactionId && (
            <>
              Transaction ID: <strong>{transactionId}</strong>. Audit trail
              logged.
            </>
          )}
        </p>
      </div>
      <button
        className="hover:bg-status-grow-text/10 rounded-full p-1 transition-colors"
        onClick={onClose}
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
}

SuccessBanner.propTypes = {
  message: PropTypes.string,
  transactionId: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};
