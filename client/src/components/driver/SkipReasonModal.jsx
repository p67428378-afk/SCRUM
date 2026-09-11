import React, { useState } from "react";
import { AlertOctagon, Camera, X } from "lucide-react";

export default function SkipReasonModal({ isOpen, onClose, onSubmit, taskId }) {
  const [skipReason, setSkipReason] = useState("Blocked Access");
  const [evidenceUrl, setEvidenceUrl] = useState(
    "https://images.unsplash.com/photo-1530587191325-3db32d826c18",
  );

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      taskId,
      task_status: "Skipped",
      skip_reason: skipReason,
      evidence_url: evidenceUrl,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-2xl border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-600" />
            Log Stop Skip Reason
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-slate-700">
              Reason Code
            </label>
            <select
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded bg-slate-50 focus:ring-2 focus:ring-red-500 focus:bg-white"
              required
            >
              <option value="Blocked Access">
                Blocked Access (Construction / Parked Car)
              </option>
              <option value="Damaged Bin">Damaged / Missing Bin</option>
              <option value="Hazardous Contamination">
                Unsorted Hazardous Material
              </option>
              <option value="Severe Weather">
                Severe Weather / Road Closure
              </option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" /> Evidence Photo URL / Attachment
            </label>
            <input
              type="text"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded bg-slate-50 focus:ring-2 focus:ring-red-500 focus:bg-white font-mono text-xs"
              placeholder="https://..."
              required
            />
          </div>

          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded text-xs">
            Notice: Skipped stops trigger an immediate supervisor notification
            and flag the location for re-routing.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 shadow-sm"
            >
              Submit Skip Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
