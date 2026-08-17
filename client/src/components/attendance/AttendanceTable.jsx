import React from "react";
import { Calendar, Clock, AlertTriangle } from "lucide-react";

export default function AttendanceTable({
  records = [],
  title = "Attendance Log History",
  onRequestCorrection,
}) {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-[#17a34a] border-green-200";
      case "Late":
        return "bg-yellow-100 text-[#eb9917] border-yellow-200";
      case "Absent":
        return "bg-red-100 text-[#dc2626] border-red-200";
      case "Half-Day":
        return "bg-blue-100 text-[#2663eb] border-blue-200";
      case "Incomplete":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatUtcTime = (timeStr) => {
    if (!timeStr) return "--:--:--";
    try {
      const d = new Date(timeStr);
      return d.toISOString().substring(11, 19);
    } catch {
      return timeStr;
    }
  };

  const formatDate = (timeStr) => {
    if (!timeStr) return "N/A";
    try {
      const d = new Date(timeStr);
      return d.toISOString().substring(0, 10);
    } catch {
      return timeStr;
    }
  };

  const calculateDuration = (checkInStr, checkOutStr) => {
    if (!checkInStr) return "0h 00m";
    const start = new Date(checkInStr);
    const end = checkOutStr ? new Date(checkOutStr) : new Date();
    const diffMs = Math.max(0, end.getTime() - start.getTime());
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins.toString().padStart(2, "0")}m${!checkOutStr ? " (Active)" : ""}`;
  };

  return (
    <div className="bg-white border border-[#e3e8f0] rounded-[14px] p-6 shadow-sm w-full">
      <div className="flex items-center justify-between pb-4 border-b border-[#e3e8f0] mb-4">
        <h3 className="text-[#171c29] font-bold text-lg flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-[#2663eb]" />
          <span>{title}</span>
        </h3>
        <span className="text-[#707a8c] text-xs font-medium bg-[#f7fafc] px-3 py-1 rounded-full border border-[#e3e8f0]">
          Total Records: {records.length}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#e3e8f0]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f7fafc] text-[#707a8c] font-semibold border-b border-[#e3e8f0] text-xs uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Date</th>
              <th className="p-3.5">Check-In (UTC)</th>
              <th className="p-3.5">Check-Out (UTC)</th>
              <th className="p-3.5">Worked Duration</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e3e8f0]">
            {records.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-[#707a8c]">
                  No attendance records found.
                </td>
              </tr>
            ) : (
              records.map((rec) => (
                <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3.5 font-medium text-[#171c29]">
                    {formatDate(rec.check_in_time)}
                  </td>
                  <td className="p-3.5 font-mono text-[#171c29] text-xs">
                    {formatUtcTime(rec.check_in_time)}
                  </td>
                  <td className="p-3.5 font-mono text-[#171c29] text-xs">
                    {formatUtcTime(rec.check_out_time)}
                  </td>
                  <td className="p-3.5 font-mono text-xs text-[#171c29]">
                    {calculateDuration(rec.check_in_time, rec.check_out_time)}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(rec.status)}`}
                    >
                      {rec.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    {(!rec.check_out_time ||
                      rec.status === "Incomplete" ||
                      rec.status === "Absent") &&
                      onRequestCorrection && (
                        <button
                          onClick={() => onRequestCorrection(rec)}
                          type="button"
                          className="text-xs text-[#2663eb] hover:underline font-medium"
                        >
                          Fix Entry
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
