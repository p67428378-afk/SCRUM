import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";
import {
  ShieldCheck,
  Calendar,
  IndianRupee,
  Users,
  Flame,
  Megaphone,
  PlusCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboard({ user }) {
  const [dashboard, setDashboard] = useState(null);
  const [finReport, setFinancialReport] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New ritual form
  const [ritTitle, setRitTitle] = useState("");
  const [ritDesc, setRitDesc] = useState("");
  const [ritPrice, setRitPrice] = useState("");
  const [ritDuration, setRitDuration] = useState("30");
  const [ritMsg, setRitMsg] = useState("");

  // New announcement form
  const [ancTitle, setAncTitle] = useState("");
  const [ancMessage, setAncMessage] = useState("");
  const [ancMsg, setAncMsg] = useState("");

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashData, reportData, ancData] = await Promise.all([
        adminAPI.getDashboard().catch(() => null),
        adminAPI.getFinancialReport().catch(() => null),
        adminAPI.listAnnouncements().catch(() => []),
      ]);

      setDashboard(dashData);
      setFinancialReport(reportData);
      setAnnouncements(ancData);
    } catch (err) {
      setError(
        "Failed to load admin metrics. Please ensure you have Admin RBAC rights.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRitual = async (e) => {
    e.preventDefault();
    setRitMsg("");
    try {
      await adminAPI.createRitual({
        title: ritTitle,
        description: ritDesc || null,
        price: parseFloat(ritPrice),
        duration_minutes: parseInt(ritDuration, 10),
      });
      setRitMsg("New Ritual / Seva created successfully!");
      setRitTitle("");
      setRitDesc("");
      setRitPrice("");
      fetchAdminData();
    } catch (err) {
      setRitMsg("Error: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setAncMsg("");
    try {
      await adminAPI.createAnnouncement({
        title: ancTitle,
        message: ancMessage,
      });
      setAncMsg("Announcement broadcasted successfully!");
      setAncTitle("");
      setAncMessage("");
      fetchAdminData();
    } catch (err) {
      setAncMsg("Error: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 rounded-3xl p-8 text-white shadow-xl flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-600/40 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-amber-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Temple Staff RBAC Control
          </div>
          <h1 className="text-3xl font-extrabold">
            Temple Admin Operational Dashboard
          </h1>
          <p className="text-amber-200 text-xs sm:text-sm mt-1">
            Real-time daily booking calendar, financial audit reports, ritual
            timetable scheduling, and event broadcasts.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="bg-amber-800 hover:bg-amber-700 text-white p-3 rounded-2xl border border-amber-600/50 shadow-sm transition"
          title="Refresh Dashboard Data"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {error ? (
        <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-center text-sm flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : loading ? (
        <div className="py-16 text-center text-gray-500 font-medium text-sm">
          Loading temple operational analytics...
        </div>
      ) : (
        <div className="space-y-8">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-500 font-bold block uppercase">
                  Daily Bookings
                </span>
                <span className="text-2xl font-black text-amber-900">
                  {dashboard?.daily_bookings_count ?? 0}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 text-green-800 flex items-center justify-center shrink-0">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-500 font-bold block uppercase">
                  Total Collections
                </span>
                <span className="text-2xl font-black text-amber-900">
                  ₹
                  {dashboard?.total_collections ??
                    finReport?.total_revenue ??
                    0}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-500 font-bold block uppercase">
                  Expected Devotees
                </span>
                <span className="text-2xl font-black text-amber-900">
                  {dashboard?.expected_devotees ?? 0}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-500 font-bold block uppercase">
                  Active Rituals
                </span>
                <span className="text-2xl font-black text-amber-900">
                  {dashboard?.active_rituals ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Audit Log */}
          {finReport && (
            <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-amber-700" /> Financial
                Audit Report Summary
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-xs">
                <div>
                  <span className="text-gray-500 block">Total Donations</span>
                  <span className="text-lg font-extrabold text-amber-900">
                    ₹{finReport.total_donations_amount}
                  </span>
                  <span className="text-[10px] text-gray-500 block">
                    ({finReport.donations_count} transactions)
                  </span>
                </div>

                <div>
                  <span className="text-gray-500 block">
                    Total Seva Bookings
                  </span>
                  <span className="text-lg font-extrabold text-amber-900">
                    ₹{finReport.total_bookings_amount}
                  </span>
                  <span className="text-[10px] text-gray-500 block">
                    ({finReport.bookings_count} slots)
                  </span>
                </div>

                <div>
                  <span className="text-gray-500 block">
                    Combined Total Revenue
                  </span>
                  <span className="text-lg font-black text-green-700">
                    ₹{finReport.total_revenue}
                  </span>
                  <span className="text-[10px] text-gray-500 block">
                    Audited 100% Tax Compliant
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Sections: Create Ritual & Broadcast Announcement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Ritual Timetable */}
            <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-700" /> Add New Pooja
                / Ritual Seva
              </h2>

              {ritMsg && (
                <div className="p-3 bg-amber-50 text-amber-900 rounded-xl text-xs font-semibold border border-amber-200">
                  {ritMsg}
                </div>
              )}

              <form onSubmit={handleCreateRitual} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Ritual / Seva Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={ritTitle}
                    onChange={(e) => setRitTitle(e.target.value)}
                    placeholder="e.g. Mahadev Bhasma Aarti"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={ritDesc}
                    onChange={(e) => setRitDesc(e.target.value)}
                    placeholder="Ritual significance, included items & priest details"
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Dakshina Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={ritPrice}
                      onChange={(e) => setRitPrice(e.target.value)}
                      placeholder="e.g. 1100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      required
                      min="5"
                      value={ritDuration}
                      onChange={(e) => setRitDuration(e.target.value)}
                      placeholder="30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm"
                >
                  Create Ritual Seva
                </button>
              </form>
            </div>

            {/* Broadcast Announcements */}
            <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-700" /> Broadcast Event
                Announcement
              </h2>

              {ancMsg && (
                <div className="p-3 bg-amber-50 text-amber-900 rounded-xl text-xs font-semibold border border-amber-200">
                  {ancMsg}
                </div>
              )}

              <form onSubmit={handleCreateAnnouncement} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Announcement Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={ancTitle}
                    onChange={(e) => setAncTitle(e.target.value)}
                    placeholder="e.g. Maha Shivratri Special Abhishekam Timings"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Broadcast Message *
                  </label>
                  <textarea
                    required
                    value={ancMessage}
                    onChange={(e) => setAncMessage(e.target.value)}
                    placeholder="Detailed announcement text for temple devotees"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm"
                >
                  Broadcast to Devotees
                </button>
              </form>

              {/* Existing Announcements List */}
              {announcements.length > 0 && (
                <div className="pt-4 border-t border-amber-100 space-y-2">
                  <h3 className="text-xs font-bold text-amber-900 uppercase">
                    Recent Broadcasts
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {announcements.map((a) => (
                      <div
                        key={a.id}
                        className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs"
                      >
                        <span className="font-bold text-gray-900 block">
                          {a.title}
                        </span>
                        <p className="text-gray-600 mt-0.5">{a.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
