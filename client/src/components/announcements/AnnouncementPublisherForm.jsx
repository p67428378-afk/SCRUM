import React, { useState } from "react";
import { Send, AlertTriangle, ShieldCheck } from "lucide-react";

export default function AnnouncementPublisherForm({ onPublishSuccess }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [urgency, setUrgency] = useState("Info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: "", text: "" });

    if (!title.trim() || !content.trim()) {
      setStatusMsg({
        type: "error",
        text: "Title and announcement body are required.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onPublishSuccess({
        title,
        content,
        urgency,
      });
      setTitle("");
      setContent("");
      setUrgency("Info");
      setStatusMsg({
        type: "success",
        text: "Announcement published successfully!",
      });
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: err.response?.data?.detail || "Failed to publish announcement.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
        <ShieldCheck className="w-5 h-5 text-blue-600" />
        <h2 className="text-base font-bold text-slate-900">Broadcast Notice</h2>
      </div>

      {statusMsg.text && (
        <div
          className={`p-3 rounded-lg text-xs mb-4 ${
            statusMsg.type === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Notice Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Scheduled Power Outage, Community BBQ..."
            required
            className="w-full p-2.5 border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Urgency Level
          </label>
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          >
            <option value="Info">ℹ️ Info (General Updates)</option>
            <option value="Warning">⚠️ Warning (Action Required)</option>
            <option value="Emergency">🚨 Emergency (Urgent Alert)</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Announcement Body
          </label>
          <textarea
            rows="5"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Provide full announcement details, timeline, and instructions for residents..."
            required
            className="w-full p-2.5 border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? "Publishing..." : "Broadcast to Village"}</span>
        </button>
      </form>
    </div>
  );
}
