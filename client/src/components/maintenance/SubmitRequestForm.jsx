import React, { useState } from "react";
import Button from "../common/Button.jsx";

export default function SubmitRequestForm({ onSubmit }) {
  const [category, setCategory] = useState("Plumbing");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    try {
      await onSubmit({
        category,
        priority,
        description,
        image_url: imageUrl || null,
      });
      setMessage({
        type: "success",
        text: "Maintenance request submitted successfully!",
      });
      setDescription("");
      setImageUrl("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to submit request.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card-surface p-6 flex flex-col gap-4"
    >
      <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-2">
        Submit Maintenance Request
      </h3>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-400 uppercase">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-[#6366F1] text-sm"
          >
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="HVAC">HVAC</option>
            <option value="Appliance">Appliance</option>
            <option value="Carpentry">Carpentry</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-400 uppercase">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-[#6366F1] text-sm"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-400 uppercase">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows="4"
          placeholder="Describe the issue in detail..."
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-[#6366F1] text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-400 uppercase">
          Image URL (Optional)
        </label>
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="e.g. https://example.com/image.jpg"
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-[#6366F1] text-sm"
        />
      </div>

      <div className="flex justify-end mt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </Button>
      </div>
    </form>
  );
}
