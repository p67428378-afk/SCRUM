import React, { useState, useEffect } from "react";
import ApprovalRequestsTable from "../components/approvals/ApprovalRequestsTable";
import AttendanceTable from "../components/attendance/AttendanceTable";
import { approvalsApi, attendanceApi } from "../services/api";

export default function TeamApprovalsPage({ currentUser }) {
  const [activeTab, setActiveTab] = useState("requests"); // 'requests' | 'teamHistory'
  const [requests, setRequests] = useState([]);
  const [teamHistory, setTeamHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const data = await approvalsApi.getRequests();
      setRequests(data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  const fetchTeamHistory = async () => {
    try {
      const data = await attendanceApi.getTeamHistory();
      setTeamHistory(data);
    } catch (err) {
      console.error("Error fetching team history:", err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchRequests(), fetchTeamHistory()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingCount = requests.filter((r) => r.status === "Pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171c29]">
          Team Attendance & Adjustment Approvals
        </h1>
        <p className="text-sm text-[#707a8c]">
          Manager Portal: Review employee attendance requests and track
          real-time team status.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-[#e3e8f0] space-x-6">
        <button
          onClick={() => setActiveTab("requests")}
          type="button"
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            activeTab === "requests"
              ? "text-[#2663eb] border-b-2 border-[#2663eb]"
              : "text-[#707a8c] hover:text-[#171c29]"
          }`}
        >
          Pending Requests ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab("teamHistory")}
          type="button"
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            activeTab === "teamHistory"
              ? "text-[#2663eb] border-b-2 border-[#2663eb]"
              : "text-[#707a8c] hover:text-[#171c29]"
          }`}
        >
          Team Attendance History ({teamHistory.length})
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-[#e3e8f0] rounded-[14px] p-8 text-center text-[#707a8c]">
          Loading team data...
        </div>
      ) : activeTab === "requests" ? (
        <ApprovalRequestsTable
          requests={requests}
          onRequestUpdated={fetchRequests}
        />
      ) : (
        <AttendanceTable
          records={teamHistory}
          title="Team Attendance Log History"
        />
      )}
    </div>
  );
}
