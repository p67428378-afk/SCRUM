import React, { useState } from "react";

export default function AvailabilityControlPanel({
  selectedDates = [],
  onSave,
  onClearSelection,
}) {
  const [isAvailable, setIsAvailable] = useState(true);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedDates.length === 0) return;

    setLoading(true);
    try {
      await onSave(selectedDates, isAvailable, notes);
      setNotes("");
    } catch (err) {
      console.error("Failed to save availability", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container rounded-xl border border-outline-variant p-6">
      <h3 className="text-lg font-bold text-on-surface mb-4">
        Manage Availability
      </h3>

      {selectedDates.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          Select one or more dates on the calendar to update your availability.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Selected Dates ({selectedDates.length})
            </label>
            <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto p-2 bg-surface-container-low rounded-lg border border-outline-variant/30">
              {selectedDates.map((date) => (
                <span
                  key={date}
                  className="px-2 py-1 bg-surface-container-high text-xs rounded-md border border-outline-variant/50 text-on-surface"
                >
                  {date}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Status
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setIsAvailable(true)}
                className={`py-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-2 ${
                  isAvailable
                    ? "bg-primary/10 text-primary border-primary"
                    : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-high"
                }`}
              >
                <span className="material-symbols-outlined">check_circle</span>
                Available
              </button>
              <button
                type="button"
                onClick={() => setIsAvailable(false)}
                className={`py-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-2 ${
                  !isAvailable
                    ? "bg-error/10 text-error border-error"
                    : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-high"
                }`}
              >
                <span className="material-symbols-outlined">block</span>
                Unavailable
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Everest Base Camp Trek, Personal Leave"
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClearSelection}
              className="flex-1 py-3 bg-surface-container-low hover:bg-surface-container-high text-on-surface font-bold rounded-xl border border-outline-variant/30 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-primary text-on-primary hover:brightness-110 font-bold rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
