import React, { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";

export default function ReservationForm({
  isOpen,
  onClose,
  tables = [],
  preselectedTable = null,
  onBookReservation,
}) {
  const [formData, setFormData] = useState({
    table_id: "",
    customer_name: "",
    party_size: 2,
    reservation_time: "",
    notes: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      const defaultTime = now.toISOString().slice(0, 16);

      setFormData({
        table_id: preselectedTable
          ? preselectedTable.id
          : tables[0]?.id || "t1",
        customer_name: "",
        party_size: preselectedTable ? preselectedTable.capacity : 2,
        reservation_time: defaultTime,
        notes: "",
      });
      setError("");
    }
  }, [isOpen, preselectedTable, tables]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customer_name.trim()) {
      setError("Customer name is required.");
      return;
    }
    if (!formData.reservation_time) {
      setError("Please select a reservation date and time.");
      return;
    }

    const selectedTableObj = tables.find((t) => t.id === formData.table_id);

    try {
      onBookReservation({
        ...formData,
        table_number: selectedTableObj ? selectedTableObj.table_number : 1,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to complete reservation.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">
              Table Reservation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Table <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.table_id}
              onChange={(e) =>
                setFormData({ ...formData, table_id: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-white"
            >
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  Table {t.table_number} (Seats: {t.capacity} | Status:{" "}
                  {t.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Customer Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jane Smith"
              value={formData.customer_name}
              onChange={(e) =>
                setFormData({ ...formData, customer_name: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Party Size (Guests)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={formData.party_size}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    party_size: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={formData.reservation_time}
                onChange={(e) =>
                  setFormData({ ...formData, reservation_time: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Special Requests / Notes
            </label>
            <textarea
              rows="2"
              placeholder="High chair needed, birthday cake, window seat..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            ></textarea>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              Confirm Reservation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
