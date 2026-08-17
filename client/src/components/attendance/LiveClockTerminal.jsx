import React, { useState, useEffect } from "react";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { attendanceApi } from "../../services/api";

export default function LiveClockTerminal({
  activeSession,
  onAttendanceChange,
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUtcDateTime = (date) => {
    return date.toUTCString().replace("GMT", "UTC");
  };

  const calculateDuration = (checkInTimeStr) => {
    if (!checkInTimeStr) return "0h 00m 00s";
    const checkInDate = new Date(checkInTimeStr);
    const diffMs = Math.max(0, currentTime.getTime() - checkInDate.getTime());
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    return `${hours}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await attendanceApi.checkIn();
      setMessage("Successfully checked in!");
      if (onAttendanceChange) onAttendanceChange();
    } catch (err) {
      const errMsg =
        err.response?.data?.detail || "Failed to check in. Please try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await attendanceApi.checkOut();
      setMessage("Successfully checked out!");
      if (onAttendanceChange) onAttendanceChange();
    } catch (err) {
      const errMsg =
        err.response?.data?.detail || "Failed to check out. Please try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const isCheckedIn =
    activeSession &&
    activeSession.check_in_time &&
    !activeSession.check_out_time;

  return (
    <div className="bg-white border border-[#e3e8f0] rounded-[14px] p-6 shadow-sm w-full">
      <div className="flex items-center justify-between pb-4 border-b border-[#e3e8f0] mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-[#2663eb]" />
          <h2 className="text-[#171c29] font-bold text-lg">
            Live Attendance Terminal
          </h2>
        </div>
        <p className="text-[#707a8c] font-medium text-sm font-mono">
          {formatUtcDateTime(currentTime)}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-[#dc2626] rounded-lg text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-[#17a34a] rounded-lg text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="bg-[#f7fafc] border border-[#e3e8f0] rounded-[14px] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[#707a8c] font-bold text-xs uppercase tracking-wider">
            Current Session Status
          </span>
          <div className="flex items-center space-x-3 mt-1">
            {isCheckedIn ? (
              <>
                <span className="bg-[#17a34a] text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
                  Active Session
                </span>
                <span className="text-[#171c29] font-medium text-sm">
                  Clocked In at{" "}
                  {new Date(activeSession.check_in_time).toLocaleTimeString(
                    "en-US",
                    { timeZone: "UTC", hour12: false },
                  )}{" "}
                  UTC
                </span>
              </>
            ) : (
              <>
                <span className="bg-gray-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
                  Not Checked In
                </span>
                <span className="text-[#171c29] font-medium text-sm">
                  No active session today
                </span>
              </>
            )}
          </div>
          {isCheckedIn && (
            <p className="text-[#707a8c] text-xs mt-1">
              Active Duration:{" "}
              <span className="font-mono text-xs font-semibold text-[#171c29]">
                {calculateDuration(activeSession.check_in_time)}
              </span>{" "}
              | Today's Goal: 8h 00m
            </p>
          )}
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={handleCheckIn}
            disabled={loading || isCheckedIn}
            type="button"
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors w-full md:w-auto flex items-center justify-center space-x-2 ${
              isCheckedIn
                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                : "bg-white text-[#171c29] border border-[#e3e8f0] hover:bg-gray-50 active:bg-gray-100 shadow-sm"
            }`}
          >
            <span>Check In {isCheckedIn ? "(Active)" : ""}</span>
          </button>

          <button
            onClick={handleCheckOut}
            disabled={loading || !isCheckedIn}
            type="button"
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors w-full md:w-auto flex items-center justify-center space-x-2 ${
              !isCheckedIn
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#2663eb] text-white hover:bg-[#1d4ed8] active:bg-[#1e40af] shadow-sm"
            }`}
          >
            <span>Check Out Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
