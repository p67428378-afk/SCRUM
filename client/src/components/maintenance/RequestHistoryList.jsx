import React from "react";
import Badge from "../common/Badge.jsx";

export default function RequestHistoryList({ requests = [] }) {
  return (
    <div className="card-surface p-6 flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-2">
        Request History
      </h3>

      <div className="flex flex-col gap-4">
        {requests.length === 0 ? (
          <p className="text-slate-400 text-sm">
            No maintenance requests submitted yet.
          </p>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 flex flex-col md:flex-row justify-between gap-4"
            >
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h4 className="text-base font-semibold text-slate-200">
                    {req.category}
                  </h4>
                  <Badge status={req.status} />
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      req.priority === "High" || req.priority === "Emergency"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                    }`}
                  >
                    {req.priority} Priority
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Submitted on {new Date(req.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-slate-300 mt-2">{req.description}</p>
              </div>
              {req.image_url && (
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0">
                  <img
                    src={req.image_url}
                    alt="Request attachment"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
