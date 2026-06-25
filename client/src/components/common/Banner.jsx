import React from "react";

export default function Banner({ type = "success", message, onClose }) {
  const styles = {
    success: "bg-[#E6F4EA] border-[#1E8E3E] text-[#13522B]",
    error: "bg-[#FCE8E6] border-[#D93025] text-[#A51D24]",
    warning: "bg-[#FEF7E0] border-[#E37400] text-[#7A3E00]",
  };

  const icons = {
    success: "check_circle",
    error: "error",
    warning: "warning",
  };

  return (
    <div
      className={`border-l-4 p-4 rounded-DEFAULT flex items-start gap-3 shadow-sm ${styles[type]}`}
    >
      <span className="material-symbols-outlined text-lg shrink-0">
        {icons[type]}
      </span>
      <div className="flex-1 font-body-md">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current hover:opacity-70 focus:outline-none"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      )}
    </div>
  );
}
