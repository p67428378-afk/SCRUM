import React from "react";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white border border-[#e3e8f0] flex flex-col gap-[24px] p-[32px] rounded-[14px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08)] w-full max-w-[680px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between w-full">
          <h3 className="font-bold text-[#171c29] text-[20px]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#707a8c] hover:text-[#171c29] text-[20px] font-bold transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
