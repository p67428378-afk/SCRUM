import React, { useState, useEffect } from "react";
import {
  Plus,
  Filter,
  FileText,
  CheckCircle,
  Clock,
  Send,
  AlertCircle,
  Shield,
} from "lucide-react";
import {
  fetchServiceRequests,
  createServiceRequest,
  updateServiceRequestStatus,
  fetchZones,
  fetchCitizens,
} from "../services/api";

export default function ServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [zones, setZones] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [selectedRequest, setSelectedZoneRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    category: "WATER",
    priority: "MEDIUM",
    zone_id: "",
    citizen_id: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Dispatch Inspector State
  const [assignedDepartment, setAssignedDepartment] = useState("PUBLIC_WORKS");
  const [dispatchNotes, setDispatchNotes] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reqData, zonesData, citizensData] = await Promise.allSettled([
        fetchServiceRequests(),
        fetchZones(),
        fetchCitizens(),
      ]);

      if (reqData.status === "fulfilled" && Array.isArray(reqData.value)) {
        setRequests(reqData.value);
        if (reqData.value.length > 0) setSelectedZoneRequest(reqData.value[0]);
      } else {
        const fallbackReqs = [
          {
            id: "101",
            ticket_number: "SR-2026-88392",
            title: "Main Street Water Leak",
            description:
              "Major underground pipe burst leaking near 4th avenue.",
            category: "WATER",
            priority: "HIGH",
            status: "SUBMITTED",
            assigned_department: "PUBLIC_WORKS",
            zone_id: "z1",
            citizen_id: "c1",
            created_at: new Date().toISOString(),
          },
          {
            id: "102",
            ticket_number: "SR-2026-88393",
            title: "Street Light Outage",
            description: "Street light on Elm st dark for past 3 days.",
            category: "POWER",
            priority: "LOW",
            status: "IN_PROGRESS",
            assigned_department: "DEPT_OF_TRANSPORTATION",
            zone_id: "z2",
            citizen_id: "c2",
            created_at: new Date().toISOString(),
          },
        ];
        setRequests(fallbackReqs);
        setSelectedZoneRequest(fallbackReqs[0]);
      }

      if (zonesData.status === "fulfilled" && Array.isArray(zonesData.value)) {
        setZones(zonesData.value);
        if (zonesData.value.length > 0) {
          setNewTicket((prev) => ({ ...prev, zone_id: zonesData.value[0].id }));
        }
      } else {
        setZones([
          { id: "z1", zone_code: "ZONE-01", name: "Downtown Central" },
          { id: "z2", zone_code: "ZONE-04", name: "North Industrial Park" },
        ]);
      }

      if (
        citizensData.status === "fulfilled" &&
        Array.isArray(citizensData.value)
      ) {
        setCitizens(citizensData.value);
        if (citizensData.value.length > 0) {
          setNewTicket((prev) => ({
            ...prev,
            citizen_id: citizensData.value[0].id,
          }));
        }
      } else {
        setCitizens([
          { id: "c1", full_name: "Jane Doe", email: "jane.doe@city.gov" },
          { id: "c2", full_name: "John Smith", email: "john.smith@city.gov" },
        ]);
      }
    } catch (err) {
      setError("Error loading service request portal data.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusTransition = async (newStatus) => {
    if (!selectedRequest) return;
    setUpdatingStatus(true);
    setError(null);
    try {
      const updated = await updateServiceRequestStatus(selectedRequest.id, {
        status: newStatus,
        assigned_department: assignedDepartment,
        notes: dispatchNotes,
      });

      // Update state only on successful API response
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, ...updated, status: newStatus }
            : r,
        ),
      );
      setSelectedZoneRequest((prev) => ({
        ...prev,
        ...updated,
        status: newStatus,
      }));
      setDispatchNotes("");
    } catch (err) {
      setError(
        `Failed to update ticket status to ${newStatus}. Please try again.`,
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createServiceRequest({
        ...newTicket,
        zone_id: newTicket.zone_id || (zones[0] ? zones[0].id : null),
        citizen_id:
          newTicket.citizen_id || (citizens[0] ? citizens[0].id : null),
      });

      setRequests((prev) => [created, ...prev]);
      setSelectedZoneRequest(created);
      setIsModalOpen(false);
      setNewTicket({
        title: "",
        description: "",
        category: "WATER",
        priority: "MEDIUM",
        zone_id: zones[0] ? zones[0].id : "",
        citizen_id: citizens[0] ? citizens[0].id : "",
      });
    } catch (err) {
      setSubmitError("Failed to submit service request. Please verify inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (priorityFilter && r.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Service Request Portal & Dispatch Queue
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Submit, track, and dispatch municipal service requests across
              departments.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium text-sm transition"
          >
            <Plus className="w-4 h-4" />
            Submit New Service Request
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-sm"
          >
            {error}
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-sm">
          <div className="flex items-center gap-2 text-slate-500 font-semibold">
            <Filter className="w-4 h-4" />
            Filters:
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 border border-slate-300 rounded bg-white text-slate-800 text-xs font-medium"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="p-1.5 border border-slate-300 rounded bg-white text-slate-800 text-xs font-medium"
          >
            <option value="">All Priorities</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>

          <div className="ml-auto text-xs text-slate-500 font-medium">
            Showing {filteredRequests.length} of {requests.length} tickets
          </div>
        </div>

        {/* Main Content: Table & Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Service Requests Table */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Active Service Tickets ({filteredRequests.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b">
                  <tr>
                    <th className="p-3">Ticket #</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((ticket) => {
                    const isSelected =
                      selectedRequest && selectedRequest.id === ticket.id;
                    return (
                      <tr
                        key={ticket.id}
                        onClick={() => setSelectedZoneRequest(ticket)}
                        className={`border-b cursor-pointer transition ${
                          isSelected
                            ? "bg-indigo-50/70 border-indigo-200"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="p-3 font-mono font-bold text-slate-900">
                          {ticket.ticket_number || ticket.id.slice(0, 8)}
                        </td>
                        <td className="p-3 font-medium text-slate-800">
                          {ticket.title}
                        </td>
                        <td className="p-3 text-slate-600 text-xs">
                          {ticket.category}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              ticket.priority === "CRITICAL"
                                ? "bg-rose-100 text-rose-800"
                                : ticket.priority === "HIGH"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              ticket.status === "RESOLVED"
                                ? "bg-emerald-100 text-emerald-800"
                                : ticket.status === "IN_PROGRESS"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-6 text-center text-slate-500"
                      >
                        No service tickets match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ticket Dispatch Inspector */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-2">
              {selectedRequest
                ? `Ticket Details: ${selectedRequest.ticket_number || selectedRequest.id.slice(0, 8)}`
                : "Ticket Dispatch Inspector"}
            </h2>

            {selectedRequest ? (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">
                    Title
                  </p>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {selectedRequest.title}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">
                    Description
                  </p>
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 mt-1">
                    {selectedRequest.description ||
                      "No additional description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold block">
                      Category
                    </span>
                    <span className="font-medium text-slate-800">
                      {selectedRequest.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">
                      Priority
                    </span>
                    <span className="font-bold text-indigo-600">
                      {selectedRequest.priority}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-semibold uppercase block mb-1">
                    Assign Department
                  </label>
                  <select
                    value={assignedDepartment}
                    onChange={(e) => setAssignedDepartment(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs bg-white font-medium text-slate-800"
                  >
                    <option value="PUBLIC_WORKS">PUBLIC_WORKS</option>
                    <option value="DEPT_OF_TRANSPORTATION">
                      DEPT_OF_TRANSPORTATION
                    </option>
                    <option value="UTILITIES_DEPT">UTILITIES_DEPT</option>
                    <option value="SANITATION">SANITATION</option>
                    <option value="POLICE_DEPT">POLICE_DEPT</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-semibold uppercase block mb-1">
                    Dispatch Notes
                  </label>
                  <textarea
                    rows="2"
                    value={dispatchNotes}
                    onChange={(e) => setDispatchNotes(e.target.value)}
                    placeholder="Enter dispatch instructions or status updates..."
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  />
                </div>

                {/* Transition Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleStatusTransition("IN_PROGRESS")}
                    disabled={
                      updatingStatus || selectedRequest.status === "IN_PROGRESS"
                    }
                    className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-xs transition disabled:opacity-50"
                  >
                    Mark IN_PROGRESS & Dispatch
                  </button>

                  <button
                    onClick={() => handleStatusTransition("RESOLVED")}
                    disabled={
                      updatingStatus || selectedRequest.status === "RESOLVED"
                    }
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs transition disabled:opacity-50"
                  >
                    Mark RESOLVED
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">
                Select a ticket from the table to inspect details.
              </p>
            )}
          </div>
        </div>

        {/* Modal: New Service Request */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-lg font-bold text-slate-900">
                  Submit Municipal Service Request
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              {submitError && (
                <div
                  role="alert"
                  className="p-3 bg-rose-50 text-rose-800 text-xs rounded border border-rose-200"
                >
                  {submitError}
                </div>
              )}

              <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700">
                    Request Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTicket.title}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, title: e.target.value })
                    }
                    placeholder="e.g. Main Street Water Leak"
                    className="w-full p-2 border rounded focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1 text-slate-700">
                      Category
                    </label>
                    <select
                      value={newTicket.category}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, category: e.target.value })
                      }
                      className="w-full p-2 border rounded bg-white"
                    >
                      <option value="WATER">WATER</option>
                      <option value="POWER">POWER</option>
                      <option value="ROADS">ROADS</option>
                      <option value="WASTE">WASTE</option>
                      <option value="PUBLIC_SAFETY">PUBLIC_SAFETY</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-slate-700">
                      Priority
                    </label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, priority: e.target.value })
                      }
                      className="w-full p-2 border rounded bg-white"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700">
                    City Zone
                  </label>
                  <select
                    value={newTicket.zone_id}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, zone_id: e.target.value })
                    }
                    className="w-full p-2 border rounded bg-white"
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.zone_code} - {z.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={newTicket.description}
                    onChange={(e) =>
                      setNewTicket({
                        ...newTicket,
                        description: e.target.value,
                      })
                    }
                    placeholder="Provide details about the issue..."
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border rounded text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold transition disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
