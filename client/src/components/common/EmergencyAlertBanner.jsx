import React from "react";
import { AlertTriangle, X } from "lucide-react";

export default function EmergencyAlertBanner({
  emergencyAnnouncements = [],
  onDismiss,
}) {
  if (!emergencyAnnouncements || emergencyAnnouncements.length === 0) {
    return (
      <div className="bg-red-600 text-white px-6 py-3 font-semibold flex items-center justify-between text-sm shadow-md">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-300 animate-pulse flex-shrink-0" />
          <span>
            <strong className="uppercase tracking-wider">
              🚨 EMERGENCY ALERT:
            </strong>{" "}
            Water main shutoff scheduled for tomorrow 9 AM - 2 PM. Please store
            emergency water.
          </span>
        </div>
      </div>
    );
  }

  const activeAlert = emergencyAnnouncements[0];

  return (
    <div className="bg-red-600 text-white px-6 py-3 font-semibold flex items-center justify-between text-sm shadow-md">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-yellow-300 animate-pulse flex-shrink-0" />
        <span>
          <strong className="uppercase tracking-wider">
            🚨 EMERGENCY ALERT:
          </strong>{" "}
          {activeAlert.title} &mdash; {activeAlert.content}
        </span>
      </div>
      {onDismiss && (
        <button
          onClick={() => onDismiss(activeAlert.id)}
          className="text-white/80 hover:text-white p-1 rounded hover:bg-red-700 transition-colors"
          title="Dismiss Alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
