import React from "react";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      data-testid="modal-overlay"
    >
      <div
        className="bg-white border border-[#e5e0d9] border-solid flex flex-col gap-6 items-start p-6 rounded-[14px] shadow-xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto"
        data-testid="modal-dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between w-full border-b border-[#e5e0d9] pb-3">
          <h3 className="font-bold text-[#1f1712] text-xl">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#7a7066] hover:text-[#eb590d] text-lg font-bold transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
