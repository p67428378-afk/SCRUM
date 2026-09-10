import { useState } from "react";
import PropTypes from "prop-types";
import {
  CheckCircle2,
  Download,
  PlusCircle,
  X,
  ShieldCheck,
} from "lucide-react";

export default function TransferSuccessModal({
  transfer,
  isOpen,
  onClose,
  currentBalance,
}) {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen || !transfer) return null;

  const formattedAmount = Number(transfer.amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedNewBalance =
    currentBalance !== undefined && currentBalance !== null
      ? Number(currentBalance).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
        })
      : null;

  const handleDownloadReceipt = () => {
    const receiptData = `================================================
          SECUREBANK P2P TRANSFER RECEIPT
================================================
Transaction ID: ${transfer.id}
Date & Time:    ${new Date(transfer.created_at || Date.now()).toLocaleString()}
Status:         ${transfer.status || "COMPLETED"}

Sender ID:      ${transfer.sender_id}
Recipient ID:   ${transfer.receiver_id}
Transfer Amount:${formattedAmount} USD
Fee:            $0.00 USD
Total Debited:  ${formattedAmount} USD
${formattedNewBalance ? `New Balance:    ${formattedNewBalance} USD\n` : ""}================================================
Thank you for banking with SecureBank.
================================================`;

    const blob = new Blob([receiptData], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${transfer.id || "transfer"}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border border-slate-200 shadow-2xl relative text-center animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h2 id="modal-headline" className="text-2xl font-bold text-slate-900">
          Transfer Completed Successfully
        </h2>

        <p className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
          {formattedAmount}{" "}
          <span className="text-xl font-medium text-slate-500">USD</span>
        </p>

        <p className="text-sm text-slate-600 mb-6 mt-1">
          Sent to{" "}
          <span className="font-semibold text-slate-800">
            {transfer.receiver_id}
          </span>
        </p>

        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl text-left text-sm space-y-3 mb-6">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
              Transaction ID
            </span>
            <span
              className="font-mono text-xs text-slate-800 bg-slate-200/70 px-2 py-0.5 rounded truncate max-w-[220px]"
              title={transfer.id}
            >
              {transfer.id}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
              Status
            </span>
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300/50 px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 mr-1" />
              {transfer.status || "COMPLETED"}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
              Sender
            </span>
            <span className="font-mono text-xs text-slate-800 truncate max-w-[220px]">
              {transfer.sender_id}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
              Recipient
            </span>
            <span className="font-mono text-xs text-slate-800 truncate max-w-[220px]">
              {transfer.receiver_id}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
              Settlement Fee
            </span>
            <span className="font-semibold text-emerald-600">
              $0.00 USD (Instant)
            </span>
          </div>

          {formattedNewBalance && (
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-700 text-xs uppercase tracking-wider font-bold">
                New Available Balance
              </span>
              <span className="font-bold text-slate-900">
                {formattedNewBalance} USD
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleDownloadReceipt}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-xl font-medium transition duration-150 inline-flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>
              {downloaded ? "Receipt Downloaded" : "Download Receipt"}
            </span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium shadow-md shadow-blue-500/20 transition duration-150 inline-flex items-center justify-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Send Another Transfer</span>
          </button>
        </div>
      </div>
    </div>
  );
}

TransferSuccessModal.propTypes = {
  transfer: PropTypes.shape({
    id: PropTypes.string,
    sender_id: PropTypes.string,
    receiver_id: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    status: PropTypes.string,
    created_at: PropTypes.string,
  }),
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  currentBalance: PropTypes.number,
};
