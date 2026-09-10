import React from "react";
import { X } from "lucide-react";
import AlertBanner from "./AlertBanner";

export default function ModalDialog({
  isOpen,
  onClose,
  title,
  children,
  error,
  warning,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banners */}
        <div className="px-6 pt-4 space-y-3">
          {error && <AlertBanner type="critical" message={error} />}
          {warning && <AlertBanner type="warning" message={warning} />}
        </div>

        {/* Content Body */}
        <div className="p-6 text-xs text-slate-700">{children}</div>
      </div>
    </div>
  );
}
