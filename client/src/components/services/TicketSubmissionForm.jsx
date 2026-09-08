import React, { useState } from "react";
import { Wrench, Plus, CheckCircle, AlertCircle } from "lucide-react";

export default function TicketSubmissionForm({ onSubmitTicket }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Plumbing");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (!title.trim() || !description.trim()) {
      setMsg({
        type: "error",
        text: "Please enter a ticket title and description.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitTicket({
        title,
        category,
        description,
      });
      setTitle("");
      setDescription("");
      setCategory("Plumbing");
      setMsg({
        type: "success",
        text: "Service ticket submitted successfully!",
      });
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.detail || "Failed to submit service ticket.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
        <Wrench className="w-5 h-5 text-blue-600" />
        <h2 className="text-base font-bold text-slate-900">
          Submit Maintenance Ticket
        </h2>
      </div>

      {msg.text && (
        <div
          className={`p-3 rounded-lg text-xs mb-4 flex items-center gap-2 ${
            msg.type === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          {msg.type === "error" ? (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Issue Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Broken streetlight near House #12, Water leak..."
            required
            className="w-full p-2.5 border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          >
            <option value="Plumbing">🚰 Plumbing</option>
            <option value="Electrical">⚡ Electrical</option>
            <option value="Public Maintenance">🧹 Public Maintenance</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Description & Location Notes
          </label>
          <textarea
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue, exact location in the village, and urgency..."
            required
            className="w-full p-2.5 border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-slate-900 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>
            {isSubmitting ? "Submitting..." : "Submit Service Ticket"}
          </span>
        </button>
      </form>
    </div>
  );
}
