import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export default function AlertBanner({
  type = "info",
  message,
  onClose,
  title,
}) {
  if (!message) return null;

  const isError = type === "error";
  const isSuccess = type === "success";
  const isWarning = type === "warning";

  let bannerStyles = "bg-blue-50 text-blue-800 border-blue-200";
  let IconComponent = Info;
  let iconColor = "text-blue-500";

  if (isError) {
    bannerStyles = "bg-rose-50 text-rose-800 border-rose-200";
    IconComponent = XCircle;
    iconColor = "text-rose-500";
  } else if (isSuccess) {
    bannerStyles = "bg-emerald-50 text-emerald-800 border-emerald-200";
    IconComponent = CheckCircle2;
    iconColor = "text-emerald-500";
  } else if (isWarning) {
    bannerStyles = "bg-amber-50 text-amber-800 border-amber-200";
    IconComponent = AlertTriangle;
    iconColor = "text-amber-500";
  }

  return (
    <div
      role="alert"
      className={`flex items-start justify-between p-4 mb-4 border rounded-xl shadow-sm transition-all duration-200 ${bannerStyles}`}
    >
      <div className="flex items-start space-x-3">
        <IconComponent
          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`}
        />
        <div>
          {title && <h4 className="font-semibold text-sm mb-0.5">{title}</h4>}
          <p className="text-sm font-medium">{message}</p>
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          className="ml-3 p-1 rounded-lg hover:bg-black/5 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
