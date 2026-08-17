import React, { useState } from "react";
import { Check, X, Clock, AlertCircle } from "lucide-react";
import { approvalsApi } from "../../services/api";

export default function ApprovalRequestsTable({
  requests = [],
  onRequestUpdated,
}) {
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  const handleAction = async (requestId, status) => {
    setActionLoading(requestId);
    setError(null);
    try {
      await approvalsApi.updateRequest(requestId, status);
      if (onRequestUpdated) onRequestUpdated();
    } catch (err) {
      const errMsg =
        err.response?.data?.detail ||
        `Failed to ${status.toLowerCase()} request.`;
      setError(errMsg);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDateTime = (dtStr) => {
    if (!dtStr) return "N/A";
    try {
      return (
        new Date(dtStr).toISOString().replace("T", " ").substring(0, 16) +
        " UTC"
      );
    } catch {
      return dtStr;
    }
  };

  return (
    <div className="bg-white border border-[#e3e8f0] rounded-[14px] p-6 shadow-sm w-full">
      <div className="flex items-center justify-between pb-4 border-b border-[#e3e8f0] mb-4">
        <h3 className="text-[#171c29] font-bold text-lg flex items-center space-x-2">
          <Clock className="w-5 h-5 text-[#2663eb]" />
          <span>Pending Adjustment Requests Queue</span>
        </h3>
        <span className="text-[#707a8c] text-xs font-medium bg-[#f7fafc] px-3 py-1 rounded-full border border-[#e3e8f0]">
          Total Requests: {requests.length}
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-[#dc2626] rounded-lg text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-[#e3e8f0]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f7fafc] text-[#707a8c] font-semibold border-b border-[#e3e8f0] text-xs uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Employee</th>
              <th className="p-3.5">Req Check-In</th>
              <th className="p-3.5">Req Check-Out</th>
              <th className="p-3.5">Reason / Justification</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Approval Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e3e8f0]">
            {requests.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-[#707a8c]">
                  No pending adjustment requests found.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3.5 font-medium text-[#171c29]">
                    {req.user?.full_name || req.user_id || "Employee"}
                  </td>
                  <td className="p-3.5 font-mono text-[#171c29] text-xs">
                    {formatDateTime(req.requested_check_in)}
                  </td>
                  <td className="p-3.5 font-mono text-[#171c29] text-xs">
                    {formatDateTime(req.requested_check_out)}
                  </td>
                  <td className="p-3.5 text-[#171c29] max-w-xs truncate">
                    {req.reason}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        req.status === "Approved"
                          ? "bg-green-100 text-[#17a34a] border-green-200"
                          : req.status === "Rejected"
                            ? "bg-red-100 text-[#dc2626] border-red-200"
                            : "bg-amber-100 text-[#eb9917] border-amber-200"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    {req.status === "Pending" ? (
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleAction(req.id, "Approved")}
                          disabled={actionLoading === req.id}
                          type="button"
                          className="bg-[#17a34a] text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-green-700 transition-colors flex items-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleAction(req.id, "Rejected")}
                          disabled={actionLoading === req.id}
                          type="button"
                          className="bg-[#dc2626] text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-700 transition-colors flex items-center space-x-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-[#707a8c] italic">
                        Processed
                      </span>
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
