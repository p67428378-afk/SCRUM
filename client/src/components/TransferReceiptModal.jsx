import PropTypes from "prop-types";
import { CheckCircle2, Download, X } from "lucide-react";

export default function TransferReceiptModal({ transfer, onClose }) {
  if (!transfer) return null;

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(transfer.amount || 0);

  const handleDownloadPdf = () => {
    const receiptText = `
========================================
APEX BANK - P2P TRANSFER RECEIPT
========================================
Transfer ID: ${transfer.id}
Status:      ${transfer.status}
Amount:      ${formattedAmount}
Sender ID:   ${transfer.sender_id}
Receiver ID: ${transfer.receiver_id}
Timestamp:   ${transfer.created_at || new Date().toISOString()}
========================================
Fedwire Instant Settlement Confirmed.
========================================
    `.trim();

    const blob = new Blob([receiptText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Receipt-${transfer.id || "transfer"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative transform transition-all">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h3
          id="modal-title"
          className="text-xl font-bold text-slate-900 text-center"
        >
          Transfer Completed Successfully!
        </h3>
        <p className="text-xs text-slate-500 font-mono text-center mt-1">
          HTTP 201 Created • Fedwire Instant Settlement
        </p>

        <div className="text-3xl font-extrabold text-slate-900 text-center mt-4 tracking-tight">
          {formattedAmount}
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mt-5 space-y-2.5 text-xs text-slate-600 font-mono border border-slate-100">
          <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
            <span className="text-slate-500">Transfer ID:</span>
            <span className="font-semibold text-slate-800 break-all text-right ml-2">
              {transfer.id}
            </span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
            <span className="text-slate-500">Sender ID:</span>
            <span className="font-semibold text-slate-800 break-all text-right ml-2">
              {transfer.sender_id}
            </span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
            <span className="text-slate-500">Receiver ID:</span>
            <span className="font-semibold text-slate-800 break-all text-right ml-2">
              {transfer.receiver_id}
            </span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
            <span className="text-slate-500">Status:</span>
            <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {transfer.status || "COMPLETED"}
            </span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-500">Timestamp:</span>
            <span className="text-slate-700">
              {transfer.created_at
                ? new Date(transfer.created_at).toLocaleString()
                : new Date().toLocaleString()}
            </span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Receipt
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

TransferReceiptModal.propTypes = {
  transfer: PropTypes.shape({
    id: PropTypes.string,
    sender_id: PropTypes.string,
    receiver_id: PropTypes.string,
    amount: PropTypes.number,
    status: PropTypes.string,
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};
