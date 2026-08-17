import React, { useState, useEffect } from "react";
import AuditLogsTable from "../components/admin/AuditLogsTable";
import { adminApi } from "../services/api";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [attendanceId, setAttendanceId] = useState("");
  const [reqCheckIn, setReqCheckIn] = useState("");
  const [reqCheckOut, setReqCheckOut] = useState("");
  const [reason, setReason] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMsg, setModalMsg] = useState(null);
  const [modalErr, setModalErr] = useState(null);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleAdminAdjust = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalErr(null);
    setModalMsg(null);

    try {
      await adminApi.adjustAttendance(attendanceId, {
        requested_check_in: new Date(reqCheckIn).toISOString(),
        requested_check_out: reqCheckOut
          ? new Date(reqCheckOut).toISOString()
          : null,
        reason: reason,
      });
      setModalMsg("Admin attendance adjustment override applied!");
      setTimeout(() => {
        setShowAdminModal(false);
        fetchAuditLogs();
      }, 1500);
    } catch (err) {
      const errMsg =
        err.response?.data?.detail || "Failed to adjust attendance entry.";
      setModalErr(errMsg);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171c29]">
            System Administration & Audit Trail
          </h1>
          <p className="text-sm text-[#707a8c]">
            Immutable security audit log tracking all attendance record
            modifications, approvals, and system overrides.
          </p>
        </div>
        <button
          onClick={() => {
            setAttendanceId("");
            setReqCheckIn("");
            setReqCheckOut("");
            setReason("");
            setModalErr(null);
            setModalMsg(null);
            setShowAdminModal(true);
          }}
          type="button"
          className="bg-[#2663eb] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1d4ed8] transition-colors shadow-sm"
        >
          + Admin Adjustment Override
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-[#e3e8f0] rounded-[14px] p-8 text-center text-[#707a8c]">
          Loading audit logs...
        </div>
      ) : (
        <AuditLogsTable auditLogs={logs} />
      )}

      {/* Admin Override Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[14px] p-6 max-w-md w-full shadow-lg border border-[#e3e8f0]">
            <h3 className="text-lg font-bold text-[#171c29] mb-1">
              Admin Attendance Adjustment Override
            </h3>
            <p className="text-xs text-[#707a8c] mb-4">
              Directly adjust an attendance record UUID. An immutable audit log
              entry will be created.
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

            <form onSubmit={handleAdminAdjust} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#707a8c] mb-1">
                  Attendance Record UUID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                  value={attendanceId}
                  onChange={(e) => setAttendanceId(e.target.value)}
                  className="w-full bg-[#f2f5fa] border border-[#e3e8f0] text-sm rounded-lg p-2.5 font-mono text-xs"
                />
              </div>

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
                  Reason for Admin Override
                </label>
                <textarea
                  required
                  rows="3"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Audit reason for administrative override..."
                  className="w-full bg-[#f2f5fa] border border-[#e3e8f0] text-sm rounded-lg p-2.5"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#707a8c] hover:text-[#171c29]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="bg-[#2663eb] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#1d4ed8] transition-colors"
                >
                  {modalLoading
                    ? "Applying Override..."
                    : "Apply Admin Override"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
