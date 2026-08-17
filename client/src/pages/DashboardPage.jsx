import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  FileText,
} from "lucide-react";
import LiveClockTerminal from "../components/attendance/LiveClockTerminal";
import AttendanceTable from "../components/attendance/AttendanceTable";
import { attendanceApi, approvalsApi } from "../services/api";

export default function DashboardPage({ currentUser }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [selectedRecord, setSelectedCorrectionRecord] = useState(null);
  const [reqCheckIn, setReqCheckIn] = useState("");
  const [reqCheckOut, setReqCheckOut] = useState("");
  const [reason, setReason] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMsg, setModalMsg] = useState(null);
  const [modalErr, setModalErr] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceApi.getHistory({ limit: 10 });
      setHistory(data);
    } catch (err) {
      setError("Failed to fetch attendance history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Find active session (check_in present, check_out null)
  const activeSession = history.find(
    (h) => h.check_in_time && !h.check_out_time,
  );

  // Find incomplete record from previous days
  const incompleteRecord = history.find(
    (h) =>
      h.status === "Incomplete" ||
      (!h.check_out_time &&
        new Date(h.check_in_time).toDateString() !== new Date().toDateString()),
  );

  // Calculate metrics
  const presentCount = history.filter((h) => h.status === "Present").length;
  const lateCount = history.filter((h) => h.status === "Late").length;
  const totalHours = history
    .reduce((acc, h) => {
      if (h.check_in_time && h.check_out_time) {
        const diffMs =
          new Date(h.check_out_time).getTime() -
          new Date(h.check_in_time).getTime();
        return acc + diffMs / (1000 * 60 * 60);
      }
      return acc;
    }, 0)
    .toFixed(1);

  const handleOpenCorrectionModal = (record = null) => {
    setSelectedCorrectionRecord(record);
    if (record) {
      setReqCheckIn(
        record.check_in_time ? record.check_in_time.substring(0, 16) : "",
      );
      setReqCheckOut(
        record.check_out_time ? record.check_out_time.substring(0, 16) : "",
      );
    } else {
      setReqCheckIn("");
      setReqCheckOut("");
    }
    setReason("");
    setModalMsg(null);
    setModalErr(null);
    setShowCorrectionModal(true);
  };

  const handleSubmitCorrection = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalErr(null);
    setModalMsg(null);

    try {
      await approvalsApi.submitRequest({
        requested_check_in: reqCheckIn
          ? new Date(reqCheckIn).toISOString()
          : null,
        requested_check_out: reqCheckOut
          ? new Date(reqCheckOut).toISOString()
          : null,
        reason: reason,
      });
      setModalMsg("Adjustment request submitted successfully!");
      setTimeout(() => {
        setShowCorrectionModal(false);
        fetchDashboardData();
      }, 1500);
    } catch (err) {
      const errMsg =
        err.response?.data?.detail || "Failed to submit adjustment request.";
      setModalErr(errMsg);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner for Incomplete Records */}
      {incompleteRecord && (
        <div className="bg-[#fff2e5] border border-[#e3e8f0] rounded-[10px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-[#eb9917] flex-shrink-0" />
            <p className="text-sm font-medium text-[#171c29]">
              Notice: Missing Check-out recorded for{" "}
              {new Date(incompleteRecord.check_in_time).toLocaleDateString()}.
              Please submit a manual correction request.
            </p>
          </div>
          <button
            onClick={() => handleOpenCorrectionModal(incompleteRecord)}
            type="button"
            className="bg-white border border-[#e3e8f0] text-[#171c29] text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap shadow-sm"
          >
            Request Correction
          </button>
        </div>
      )}

      {/* Live Terminal Widget */}
      <LiveClockTerminal
        activeSession={activeSession}
        onAttendanceChange={fetchDashboardData}
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e3e8f0] rounded-[14px] p-5 shadow-sm">
          <p className="text-[#707a8c] font-medium text-xs">Present Days</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-bold text-[#171c29]">
              {presentCount} Days
            </p>
            <span className="bg-[#17a34a] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#e3e8f0] rounded-[14px] p-5 shadow-sm">
          <p className="text-[#707a8c] font-medium text-xs">Late Arrivals</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-bold text-[#171c29]">
              {lateCount} Days
            </p>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${lateCount > 0 ? "bg-[#eb9917] text-white" : "bg-gray-100 text-gray-700"}`}
            >
              {lateCount > 0 ? "Review" : "Punctual"}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#e3e8f0] rounded-[14px] p-5 shadow-sm">
          <p className="text-[#707a8c] font-medium text-xs">
            Total Hours Worked
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-bold text-[#171c29]">
              {totalHours} hrs
            </p>
            <span className="bg-[#17a34a] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              On Track
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#e3e8f0] rounded-[14px] p-5 shadow-sm">
          <p className="text-[#707a8c] font-medium text-xs">
            Correction Action
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <button
              onClick={() => handleOpenCorrectionModal()}
              type="button"
              className="text-xs bg-[#2663eb] text-white font-medium px-3 py-1.5 rounded-lg hover:bg-[#1d4ed8] transition-colors"
            >
              + Submit Request
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <AttendanceTable
        records={history}
        title="Recent Daily Attendance Activity"
        onRequestCorrection={handleOpenCorrectionModal}
      />

      {/* Manual Correction Modal */}
      {showCorrectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[14px] p-6 max-w-md w-full shadow-lg border border-[#e3e8f0]">
            <h3 className="text-lg font-bold text-[#171c29] mb-1">
              Submit Manual Adjustment Request
            </h3>
            <p className="text-xs text-[#707a8c] mb-4">
              Request check-in/check-out timestamp corrections for manager
              approval.
            </p>

            {modalErr && (
              <div className="mb-3 p-2.5 bg-red-50 text-red-600 text-xs rounded border border-red-200">
                {modalErr}
              </div>
            )}

            {modalMsg && (
              <div className="mb-3 p-2.5 bg-green-50 text-green-600 text-xs rounded border border-green-200">
                {modalMsg}
              </div>
            )}

            <form onSubmit={handleSubmitCorrection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#707a8c] mb-1">
                  Requested Check-In (UTC)
                </label>
                <input
                  type="datetime-local"
                  required
                  value={reqCheckIn}
                  onChange={(e) => setReqCheckIn(e.target.value)}
                  className="w-full bg-[#f2f5fa] border border-[#e3e8f0] text-sm rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#707a8c] mb-1">
                  Requested Check-Out (UTC)
                </label>
                <input
                  type="datetime-local"
                  value={reqCheckOut}
                  onChange={(e) => setReqCheckOut(e.target.value)}
                  className="w-full bg-[#f2f5fa] border border-[#e3e8f0] text-sm rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#707a8c] mb-1">
                  Reason / Justification
                </label>
                <textarea
                  required
                  rows="3"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. System downtime during clock-in or forgotten check-out"
                  className="w-full bg-[#f2f5fa] border border-[#e3e8f0] text-sm rounded-lg p-2.5"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#707a8c] hover:text-[#171c29]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="bg-[#2663eb] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#1d4ed8] transition-colors"
                >
                  {modalLoading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
