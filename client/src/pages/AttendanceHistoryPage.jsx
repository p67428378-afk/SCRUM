import React, { useState, useEffect } from "react";
import FilterBar from "../components/attendance/FilterBar";
import AttendanceTable from "../components/attendance/AttendanceTable";
import { attendanceApi, approvalsApi } from "../services/api";

export default function AttendanceHistoryPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [reqCheckIn, setReqCheckIn] = useState("");
  const [reqCheckOut, setReqCheckOut] = useState("");
  const [reason, setReason] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMsg, setModalMsg] = useState(null);
  const [modalErr, setModalErr] = useState(null);

  const fetchHistory = async (customFilters = filters) => {
    setLoading(true);
    try {
      const data = await attendanceApi.getHistory(customFilters);
      setRecords(data);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filters]);

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  const handleReset = () => {
    setFilters({});
  };

  const handleOpenModal = (record = null) => {
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
    setShowModal(true);
  };

  const handleSubmitRequest = async (e) => {
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
      setModalMsg("Manual adjustment request submitted successfully!");
      setTimeout(() => {
        setShowModal(false);
        fetchHistory();
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171c29]">
            My Attendance History
          </h1>
          <p className="text-sm text-[#707a8c]">
            Search, filter, and review historical check-in records and submit
            correction requests.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          type="button"
          className="bg-[#2663eb] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1d4ed8] transition-colors shadow-sm"
        >
          + Submit Manual Adjustment
        </button>
      </div>

      <FilterBar onFilter={handleFilter} onReset={handleReset} />

      {loading ? (
        <div className="bg-white border border-[#e3e8f0] rounded-[14px] p-8 text-center text-[#707a8c]">
          Loading history records...
        </div>
      ) : (
        <AttendanceTable
          records={records}
          title="Attendance Log History"
          onRequestCorrection={handleOpenModal}
        />
      )}

      {/* Adjustment Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[14px] p-6 max-w-md w-full shadow-lg border border-[#e3e8f0]">
            <h3 className="text-lg font-bold text-[#171c29] mb-1">
              Submit Manual Adjustment Request
            </h3>
            <p className="text-xs text-[#707a8c] mb-4">
              Enter requested check-in and check-out timestamps with a
              justification.
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

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#707a8c] mb-1">
                  Requested Check-In
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
                  Requested Check-Out
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
                  placeholder="Explain why manual adjustment is needed..."
                  className="w-full bg-[#f2f5fa] border border-[#e3e8f0] text-sm rounded-lg p-2.5"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
