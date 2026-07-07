import React from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-container border border-surface-bright rounded-lg max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-md border-b border-surface-bright bg-surface-container-low">
          <h3 className="font-headline-md text-headline-md text-on-surface text-base font-bold">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-md text-on-surface font-body-md text-body-md">
          {children}
        </div>
        <div className="p-md border-t border-surface-bright bg-surface-container-low flex justify-end">
          <button
            onClick={onClose}
            className="bg-primary text-on-primary-container px-4 py-2 rounded font-body-md font-semibold hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
