import React from "react";
import {
  CheckCircle,
  Download,
  X,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";

export default function TransferReceiptModal({ isOpen, onClose, transfer }) {
  const [copiedField, setCopiedField] = React.useState(null);

  if (!isOpen || !transfer) return null;

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedAmount = Number(transfer.amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  const formattedDate = transfer.created_at
    ? new Date(transfer.created_at).toUTCString()
    : new Date().toUTCString();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 px-6 py-6 text-white text-center relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="mx-auto w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mb-3 shadow-lg ring-4 ring-emerald-400/30">
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          <h3 id="modal-title" className="text-xl font-bold tracking-tight">
            Transfer Confirmed
          </h3>
          <p className="text-blue-200 text-sm mt-1">
            Funds have been securely transferred in real-time
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Amount Display */}
          <div className="text-center bg-slate-50 border border-slate-100 rounded-xl p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Amount Transferred
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {formattedAmount}
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mt-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Instant P2P • Zero Fee ($0.00)</span>
            </div>
          </div>

          {/* Transfer Details Grid */}
          <div className="space-y-3 divide-y divide-slate-100 text-sm">
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500 font-medium">Transaction ID</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-semibold text-slate-700">
                  {transfer.id
                    ? `${transfer.id.slice(0, 8)}...${transfer.id.slice(-6)}`
                    : "N/A"}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(transfer.id, "id")}
                  title="Copy Transaction ID"
                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                >
                  {copiedField === "id" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3">
              <span className="text-slate-500 font-medium">Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {transfer.status || "COMPLETED"}
              </span>
            </div>

            <div className="flex justify-between items-start pt-3">
              <span className="text-slate-500 font-medium">Sender Account</span>
              <div className="text-right">
                <span className="font-mono text-xs text-slate-700 block font-semibold">
                  {transfer.sender_id || "N/A"}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-start pt-3">
              <span className="text-slate-500 font-medium">
                Recipient Account
              </span>
              <div className="text-right">
                <span className="font-mono text-xs text-slate-700 block font-semibold">
                  {transfer.receiver_id || "N/A"}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3">
              <span className="text-slate-500 font-medium">
                Timestamp (UTC)
              </span>
              <span className="text-xs text-slate-600 font-medium">
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download Receipt</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
          >
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
