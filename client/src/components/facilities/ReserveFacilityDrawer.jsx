import React, { useState } from "react";
import { X, Calendar, Clock, AlertCircle, ShieldAlert } from "lucide-react";

export default function ReserveFacilityDrawer({
  isOpen,
  onClose,
  facilities = [],
  onSubmitBooking,
}) {
  const [selectedFacility, setSelectedFacility] = useState(
    facilities[0]?.id || "",
  );
  const [bookingDate, setBookingDate] = useState("2026-06-01");
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("17:00");
  const [purpose, setPurpose] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedFacility && facilities.length > 0) {
      setErrorMsg("Please select a valid facility.");
      return;
    }

    if (startTime >= endTime) {
      setErrorMsg("End time must be strictly after start time.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitBooking({
        facility_id: selectedFacility || facilities[0]?.id,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        purpose: purpose || "Community Event",
      });
      onClose();
    } catch (err) {
      setErrorMsg(
        err.response?.data?.detail ||
          "Slot reservation failed. The selected time slot overlaps with an existing booking.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end transition-opacity">
      <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="flex justify-between items-center pb-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" /> Reserve Facility
              Slot
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 font-bold p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conflict Prevention Note */}
          <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 text-xs flex gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">
                Real-time Slot Conflict Prevention:
              </span>{" "}
              Overlapping time slots for the same facility will be automatically
              rejected by database transaction locks.
            </div>
          </div>

          {errorMsg && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form
            id="booking-form"
            onSubmit={handleSubmit}
            className="mt-6 space-y-4 text-xs"
          >
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Select Facility
              </label>
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                required
                className="w-full p-2.5 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} (${f.hourly_rate}/hr &bull; Cap: {f.capacity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Booking Date
              </label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                required
                className="w-full p-2.5 border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Event / Booking Purpose
              </label>
              <textarea
                rows="3"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Family Birthday Celebration, HOA Quarterly Meeting..."
                className="w-full p-2.5 border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              ></textarea>
            </div>
          </form>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 text-xs font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="booking-form"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold disabled:opacity-50"
          >
            {isSubmitting ? "Confirming Lock..." : "Confirm Reservation"}
          </button>
        </div>
      </div>
    </div>
  );
}
