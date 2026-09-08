import React, { useState, useEffect } from "react";
import { Wrench, Plus, CheckCircle2 } from "lucide-react";
import ServiceRequestTable from "../components/services/ServiceRequestTable.jsx";
import TicketSubmissionForm from "../components/services/TicketSubmissionForm.jsx";
import {
  getServiceRequests,
  createServiceRequest,
  updateServiceRequestStatus,
  assignServiceRequestStaff,
  getResidents,
} from "../services/api.js";

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchServiceData = async () => {
    try {
      const [reqData, resData] = await Promise.all([
        getServiceRequests().catch(() => []),
        getResidents().catch(() => []),
      ]);

      if (Array.isArray(reqData) && reqData.length > 0) {
        setRequests(reqData);
      } else {
        setRequests([
          {
            id: "req-101",
            title: "Broken Streetlight near House #12",
            category: "Electrical",
            description:
              "Streetlight fixture blinking intermittently and dark at night.",
            status: "Open",
            assigned_staff_id: null,
            created_at: new Date().toISOString(),
          },
          {
            id: "req-102",
            title: "Water Pipe Leak at Tennis Court",
            category: "Plumbing",
            description:
              "Water leaking near court gate #2 creating puddle on walkway.",
            status: "In Progress",
            assigned_staff_id: "staff-1",
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: "req-103",
            title: "Debris Removal in Park Pathway",
            category: "Public Maintenance",
            description: "Tree branches down after storm blocking bike path.",
            status: "Resolved",
            assigned_staff_id: "staff-2",
            created_at: new Date(Date.now() - 172800000).toISOString(),
          },
        ]);
      }

      if (Array.isArray(resData)) {
        const staffList = resData.filter(
          (r) =>
            (r.role || "").toUpperCase() === "STAFF" ||
            (r.role || "").toUpperCase() === "ADMIN",
        );
        if (staffList.length > 0) {
          setStaffMembers(staffList);
        } else {
          setStaffMembers([
            {
              id: "staff-1",
              full_name: "Robert Johnson",
              email: "robert@village.org",
              role: "Staff",
            },
            {
              id: "staff-2",
              full_name: "Jane Smith",
              email: "jane@village.org",
              role: "Staff",
            },
          ]);
        }
      }
    } catch (err) {
      console.warn("Error loading service requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceData();
  }, []);

  const handleSubmitTicket = async (ticketPayload) => {
    const res = await createServiceRequest(ticketPayload);
    await fetchServiceData();
    return res;
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      await updateServiceRequestStatus(ticketId, newStatus);
      await fetchServiceData();
    } catch (err) {
      console.error("Failed to update ticket status:", err);
      // Fallback optimistic UI update
      setRequests((prev) =>
        prev.map((r) => (r.id === ticketId ? { ...r, status: newStatus } : r)),
      );
    }
  };

  const handleAssignStaff = async (ticketId, staffId) => {
    try {
      await assignServiceRequestStaff(ticketId, staffId);
      await fetchServiceData();
    } catch (err) {
      console.error("Failed to assign staff:", err);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === ticketId ? { ...r, assigned_staff_id: staffId } : r,
        ),
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-600" /> Service Requests &
            Maintenance Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit maintenance tickets (Plumbing, Electrical, Public
            Maintenance), track resolution status (Open, In Progress, Resolved),
            and assign village staff.
          </p>
        </div>
      </div>

      {/* Grid: Ticket Table & Submission Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Maintenance Service Tickets
          </h2>
          <ServiceRequestTable
            requests={requests}
            staffMembers={staffMembers}
            onUpdateStatus={handleUpdateStatus}
            onAssignStaff={handleAssignStaff}
          />
        </div>

        <div>
          <TicketSubmissionForm onSubmitTicket={handleSubmitTicket} />
        </div>
      </div>
    </div>
  );
}
