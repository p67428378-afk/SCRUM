import React, { useState } from "react";
import { AlertTriangle, Info, Bell, Archive, Filter, Pin } from "lucide-react";

export default function AnnouncementFeed({ announcements = [], onArchive }) {
  const [urgencyFilter, setUrgencyFilter] = useState("ALL");

  const filteredAnnouncements = announcements.filter((a) => {
    if (a.is_archived) return false;
    if (urgencyFilter === "ALL") return true;
    return (a.urgency || "").toUpperCase() === urgencyFilter.toUpperCase();
  });

  const getUrgencyBadge = (urgency) => {
    switch ((urgency || "").toUpperCase()) {
      case "EMERGENCY":
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 border border-red-300 px-2.5 py-0.5 rounded-full text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-pulse" />{" "}
            Emergency
          </span>
        );
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Warning
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 border border-blue-300 px-2.5 py-0.5 rounded-full text-xs font-bold">
            <Info className="w-3.5 h-3.5 text-blue-600" /> Info
          </span>
        );
    }
  };

  return (
    <div>
      {/* Urgency Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => setUrgencyFilter("ALL")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            urgencyFilter === "ALL"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
        >
          All Notices
        </button>
        <button
          onClick={() => setUrgencyFilter("EMERGENCY")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
            urgencyFilter === "EMERGENCY"
              ? "bg-red-600 text-white shadow-sm"
              : "bg-red-100 text-red-700 hover:bg-red-200"
          }`}
        >
          🚨 Emergency
        </button>
        <button
          onClick={() => setUrgencyFilter("WARNING")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
            urgencyFilter === "WARNING"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-amber-100 text-amber-700 hover:bg-amber-200"
          }`}
        >
          ⚠️ Warning
        </button>
        <button
          onClick={() => setUrgencyFilter("INFO")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
            urgencyFilter === "INFO"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          ℹ️ Info
        </button>
      </div>

      {/* Feed Cards */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-400 text-xs">
            No active announcements found for the selected urgency level.
          </div>
        ) : (
          filteredAnnouncements.map((a) => (
            <div
              key={a.id}
              className={`bg-white border rounded-xl p-5 shadow-sm hover:shadow transition-shadow relative ${
                (a.urgency || "").toUpperCase() === "EMERGENCY"
                  ? "border-l-4 border-l-red-600 bg-red-50/20"
                  : "border-slate-200"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {getUrgencyBadge(a.urgency)}
                  <span className="text-[11px] text-slate-400">
                    {a.created_at
                      ? new Date(a.created_at).toLocaleDateString()
                      : "Today"}
                  </span>
                </div>

                {onArchive && (
                  <button
                    onClick={() => onArchive(a.id)}
                    className="text-slate-400 hover:text-slate-600 p-1 text-xs flex items-center gap-1"
                    title="Archive Notice"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">
                {a.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {a.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
