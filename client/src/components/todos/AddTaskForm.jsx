import React, { useState } from "react";
import { Plus } from "lucide-react";

export default function AddTaskForm({ onAddTask }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await onAddTask(title, description);
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-outline-variant p-lg card-elevation relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <h3 className="font-headline-md text-headline-md text-on-surface mb-md relative z-10">
        Add New Task
      </h3>
      <form onSubmit={handleSubmit} className="space-y-md relative z-10">
        {error && (
          <div
            className="text-error text-sm bg-error/10 p-sm rounded-lg border border-error/20"
            role="alert"
          >
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 gap-md">
          <div className="focus-ring rounded-lg border border-outline-variant bg-background transition-all">
            <input
              className="w-full bg-transparent border-none focus:ring-0 text-body-md text-on-surface placeholder-on-surface-variant p-sm rounded-lg outline-none"
              placeholder="Task Title (e.g., Buy groceries)"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="focus-ring rounded-lg border border-outline-variant bg-background transition-all">
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 text-body-md text-on-surface placeholder-on-surface-variant p-sm rounded-lg resize-none outline-none"
              placeholder="Description (e.g., Get milk, eggs, and bread from the store)"
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            ></textarea>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            className="bg-primary hover:bg-primary/90 text-white font-label-md text-label-md py-sm px-md rounded-lg flex items-center gap-xs transition-colors shadow-[0_2px_4px_rgba(99,102,241,0.2)] disabled:opacity-50"
            type="submit"
            disabled={isSubmitting}
          >
            <Plus className="w-4 h-4" />
            {isSubmitting ? "Adding..." : "Add Task"}
          </button>
        </div>
      </form>
    </div>
  );
}
