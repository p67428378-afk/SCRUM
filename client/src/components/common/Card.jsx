import React from "react";

export default function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
}) {
  return (
    <div
      className={`bg-white border border-[#E5DED1] rounded-lg shadow-sm overflow-hidden ${className}`}
    >
      {(title || action) && (
        <div className="px-6 py-4 border-b border-[#E5DED1] flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-[#1F1A14]">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#80756B] mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
