import React, { useEffect } from "react";

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-lg border-b border-outline-variant/20">
          <h2 className="font-headline-lg text-headline-lg text-on-background font-bold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-outline hover:text-on-background rounded-full hover:bg-surface-container transition-colors"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-lg max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
