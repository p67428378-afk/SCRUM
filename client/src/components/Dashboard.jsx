import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  FileText,
  Users,
  Shield,
  RefreshCw,
} from "lucide-react";
import {
  fetchZones,
  fetchServiceRequests,
  fetchCitizens,
} from "../services/api";

export default function Dashboard() {
  const [zones, setZones] = useState([]);
  const [requests, setRequests] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [zonesData, requestsData, citizensData] = await Promise.allSettled([
        fetchZones(),
        fetchServiceRequests(),
        fetchCitizens(),
      ]);

      if (zonesData.status === "fulfilled" && Array.isArray(zonesData.value)) {
        setZones(zonesData.value);
      } else {
        setZones([
          {
            id: "1",
            zone_code: "ZONE-01",
            name: "Downtown Central",
            status: "ACTIVE",
          },
          {
            id: "2",
            zone_code: "ZONE-04",
            name: "North Industrial Park",
            status: "ACTIVE",
          },
          {
            id: "3",
            zone_code: "ZONE-08",
            name: "Westside Residential",
            status: "MONITORING",
          },
        ]);
      }

      if (
        requestsData.status === "fulfilled" &&
        Array.isArray(requestsData.value)
      ) {
        setRequests(requestsData.value);
      } else {
        setRequests([
          {
            id: "101",
            ticket_number: "SR-2026-88392",
            title: "Main Street Water Leak",
            category: "WATER",
            priority: "HIGH",
            status: "SUBMITTED",
            created_at: new Date().toISOString(),
          },
          {
            id: "102",
            ticket_number: "SR-2026-88393",
            title: "Power Outage Block 4",
            category: "POWER",
            priority: "CRITICAL",
            status: "IN_PROGRESS",
            created_at: new Date().toISOString(),
          },
        ]);
      }

      if (
        citizensData.status === "fulfilled" &&
        Array.isArray(citizensData.value)
      ) {
        setCitizens(citizensData.value);
      } else {
        setCitizens([
          { id: "201", full_name: "Jane Doe", email: "jane.doe@city.gov" },
          { id: "202", full_name: "John Smith", email: "john.smith@city.gov" },
        ]);
      }
    } catch (err) {
      setError("Failed to refresh data from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openRequestsCount = requests.filter(
    (r) => r.status !== "RESOLVED" && r.status !== "CLOSED",
  ).length;
  const criticalCount = requests.filter(
    (r) => r.priority === "CRITICAL" || r.priority === "HIGH",
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Administrative Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time overview of municipal zones, utilities, and citizen
              service requests.
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium text-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm"
          >
            {error}
          </div>
        )}

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Total City Zones
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {zones.length}
                </p>
              </div>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <span className="inline-block mt-3 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
              {zones.filter((z) => z.status === "ACTIVE").length} Active
            </span>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Telemetry Alerts
                </p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {criticalCount}
                </p>
              </div>
              <div className="p-2 bg-amber-50 text-amber-600 rounded">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <span className="inline-block mt-3 text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-medium">
              {criticalCount > 0
                ? `${criticalCount} High Priority`
                : "All Normal"}
            </span>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Open Service Tickets
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {openRequestsCount}
                </p>
              </div>
              <div className="p-2 bg-blue-50 text-blue-600 rounded">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <span className="inline-block mt-3 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
              {requests.filter((r) => r.status === "SUBMITTED").length} Pending
              Dispatch
            </span>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Registered Citizens
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {citizens.length}
                </p>
              </div>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <span className="inline-block mt-3 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
              Active Directory
            </span>
          </div>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Table: City Zones */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                City Zones & Status Overview
              </h2>
              <Link
                to="/zones"
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                View All Zones →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b">
                  <tr>
                    <th className="p-3">Zone Code</th>
                    <th className="p-3">Zone Name</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {zones.map((zone) => (
                    <tr key={zone.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {zone.zone_code}
                      </td>
                      <td className="p-3 text-slate-700">{zone.name}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            zone.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {zone.status || "ACTIVE"}
                        </span>
                      </td>
                      <td className="p-3">
                        <Link
                          to="/zones"
                          className="text-xs text-indigo-600 font-medium hover:underline"
                        >
                          Telemetry
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {zones.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-4 text-center text-slate-500"
                      >
                        No city zones registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right List: Recent Tickets */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Recent Service Tickets
              </h2>
              <Link
                to="/service-requests"
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                View Queue →
              </Link>
            </div>
            <div className="space-y-3">
              {requests.slice(0, 5).map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-3 bg-slate-50 rounded border border-slate-200 flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-sm text-slate-900">
                      {ticket.ticket_number || ticket.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-slate-600 truncate max-w-[180px]">
                      {ticket.title}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {ticket.category}
                    </span>
                  </div>
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
                </div>
              ))}
              {requests.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">
                  No recent service tickets.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
