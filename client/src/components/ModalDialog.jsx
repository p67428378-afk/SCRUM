import React from "react";

export default function ModalDialog({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white border border-[#e3e8f0] border-solid content-stretch flex flex-col gap-[24px] items-start overflow-clip p-[32px] relative rounded-[14px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08)] shrink-0 w-full max-w-[680px]">
        {/* Header */}
        <div className="content-stretch flex font-bold items-center justify-between leading-[normal] not-italic overflow-clip relative shrink-0 w-full whitespace-nowrap">
          <h3 className="relative shrink-0 text-[#171c29] text-[20px]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="relative shrink-0 text-[#707a8c] text-[16px] hover:text-[#171c29] focus:outline-none"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="content-stretch flex gap-[12px] items-center justify-end overflow-clip relative shrink-0 w-full">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
