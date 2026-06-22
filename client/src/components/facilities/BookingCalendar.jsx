import React, { useState, useEffect } from "react";
import Button from "../common/Button.jsx";
import { getFacilityAvailability } from "../../services/api.js";

export default function BookingCalendar({ facility, onBook, onCancel }) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [purpose, setPurpose] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (facility && date) {
      fetchAvailability();
    }
  }, [facility, date]);

  const fetchAvailability = async () => {
    setIsLoading(true);
    setError(null);
    setSelectedSlot(null);
    try {
      const data = await getFacilityAvailability(facility.id, date);
      setSlots(data);
    } catch {
      setError("Failed to fetch availability.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSlot || !purpose.trim()) return;
    onBook({
      facility_id: facility.id,
      start_time: selectedSlot.start_time,
      end_time: selectedSlot.end_time,
      purpose,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800">
        <h4 className="text-sm font-semibold text-slate-200">
          {facility.name}
        </h4>
        <p className="text-xs text-slate-400 mt-1">{facility.description}</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-sm bg-red-500/10 text-red-400 border border-red-500/20">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-400 uppercase">
          Select Date
        </label>
        <input
          type="date"
          value={date}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setDate(e.target.value)}
          required
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-[#6366F1] text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-400 uppercase">
          Available Slots
        </label>
        {isLoading ? (
          <p className="text-slate-400 text-sm">Loading slots...</p>
        ) : slots.length === 0 ? (
          <p className="text-slate-400 text-sm">
            No slots available for this date.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
            {slots.map((slot, index) => {
              const isSelected = selectedSlot === slot;
              const startStr = new Date(slot.start_time).toLocaleTimeString(
                [],
                { hour: "2-digit", minute: "2-digit" },
              );
              const endStr = new Date(slot.end_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <button
                  key={index}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    !slot.available
                      ? "bg-slate-800/30 border-slate-800 text-slate-500 cursor-not-allowed"
                      : isSelected
                        ? "bg-[#6366F1] border-[#6366F1] text-white"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  {startStr} - {endStr}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-400 uppercase">
          Purpose of Booking
        </label>
        <input
          type="text"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          required
          placeholder="e.g. Birthday Party, Personal Workout"
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-[#6366F1] text-sm"
        />
      </div>

      <div className="flex gap-3 justify-end mt-4">
        <Button onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button type="submit" disabled={!selectedSlot || !purpose.trim()}>
          Confirm Booking
        </Button>
      </div>
    </form>
  );
}
