import React from "react";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function BookingScheduleTable({
  bookings = [],
  facilities = [],
  onCancelBooking,
}) {
  const getFacilityName = (facilityId) => {
    const fac = facilities.find((f) => f.id === facilityId);
    return fac
      ? fac.name
      : `Facility (${facilityId?.slice(0, 6) || "Unknown"})`;
  };

  const getStatusBadge = (status) => {
    switch ((status || "").toUpperCase()) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
            <CheckCircle className="w-3 h-3" /> Confirmed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-300">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" /> Facility Slot
          Reservation Log
        </h3>
        <span className="text-xs text-slate-500 font-medium">
          Total Bookings: {bookings.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 uppercase font-semibold">
            <tr>
              <th className="p-3">Facility</th>
              <th className="p-3">Booking Date</th>
              <th className="p-3">Time Slot</th>
              <th className="p-3">Purpose</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  No facility reservations recorded.
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-semibold text-slate-900">
                    {getFacilityName(b.facility_id)}
                  </td>
                  <td className="p-3 text-slate-600 font-mono text-[11px]">
                    {b.booking_date}
                  </td>
                  <td className="p-3 text-slate-700 font-medium">
                    {b.start_time} - {b.end_time}
                  </td>
                  <td className="p-3 text-slate-600 max-w-xs truncate">
                    {b.purpose || "Community Gathering"}
                  </td>
                  <td className="p-3">{getStatusBadge(b.status)}</td>
                  <td className="p-3 text-right">
                    {b.status !== "CANCELLED" && onCancelBooking && (
                      <button
                        onClick={() => onCancelBooking(b.id)}
                        className="text-red-600 hover:text-red-800 text-[11px] font-semibold hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
