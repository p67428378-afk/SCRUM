import React from "react";
import { AlertTriangle, AlertOctagon, Info, CheckCircle2 } from "lucide-react";

export default function AlertBanner({
  type = "warning",
  title,
  message,
  onClose,
}) {
  const configs = {
    warning: {
      bg: "bg-amber-50 border-amber-300 text-amber-900",
      icon: AlertTriangle,
      iconColor: "text-amber-600",
    },
    critical: {
      bg: "bg-rose-50 border-rose-300 text-rose-900",
      icon: AlertOctagon,
      iconColor: "text-rose-600",
    },
    info: {
      bg: "bg-sky-50 border-sky-300 text-sky-900",
      icon: Info,
      iconColor: "text-sky-600",
    },
    success: {
      bg: "bg-emerald-50 border-emerald-300 text-emerald-900",
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
    },
  };

  const config = configs[type] || configs.warning;
  const Icon = config.icon;

  return (
    <div
      className={`p-4 rounded-lg border ${config.bg} flex items-start space-x-3 shadow-sm`}
    >
      <Icon className={`w-5 h-5 ${config.iconColor} shrink-0 mt-0.5`} />
      <div className="flex-1 text-xs">
        {title && <h4 className="font-bold text-sm mb-1">{title}</h4>}
        <p className="font-medium leading-relaxed">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 text-sm font-bold ml-2"
        >
          ×
        </button>
      )}
    </div>
  );
}
