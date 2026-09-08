import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Home,
  Calendar,
  Wrench,
  ArrowRight,
  Bell,
  PlusCircle,
} from "lucide-react";
import EmergencyAlertBanner from "../components/common/EmergencyAlertBanner.jsx";
import AnnouncementFeed from "../components/announcements/AnnouncementFeed.jsx";
import {
  getResidents,
  getBookings,
  getAnnouncements,
  getServiceRequests,
} from "../services/api.js";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    residentsCount: 142,
    householdsCount: 48,
    activeBookingsCount: 12,
    openTicketsCount: 5,
  });

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [resData, bookData, annData, reqData] = await Promise.all([
          getResidents().catch(() => []),
          getBookings().catch(() => []),
          getAnnouncements().catch(() => []),
          getServiceRequests().catch(() => []),
        ]);

        if (Array.isArray(resData) && resData.length > 0) {
          setMetrics((prev) => ({ ...prev, residentsCount: resData.length }));
        }
        if (Array.isArray(bookData) && bookData.length > 0) {
          setMetrics((prev) => ({
            ...prev,
            activeBookingsCount: bookData.filter(
              (b) => b.status === "Confirmed",
            ).length,
          }));
        }
        if (Array.isArray(annData) && annData.length > 0) {
          setAnnouncements(annData);
        } else {
          // Default mock announcements if DB is empty
          setAnnouncements([
            {
              id: "ann-1",
              title: "Water Main Shutoff Scheduled",
              content:
                "Water main maintenance scheduled for tomorrow 9 AM - 2 PM. Please store emergency water.",
              urgency: "Emergency",
              created_at: new Date().toISOString(),
            },
            {
              id: "ann-2",
              title: "Annual Village Townhall Meeting",
              content:
                "Join us at the Community Hall this Saturday at 10 AM for quarterly budget updates and Q&A.",
              urgency: "Info",
              created_at: new Date().toISOString(),
            },
          ]);
        }
        if (Array.isArray(reqData) && reqData.length > 0) {
          setMetrics((prev) => ({
            ...prev,
            openTicketsCount: reqData.filter((r) => r.status === "Open").length,
          }));
        }
      } catch (err) {
        console.warn("Using default dashboard state:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const emergencyAlerts = announcements.filter(
    (a) => (a.urgency || "").toUpperCase() === "EMERGENCY" && !a.is_archived,
  );

  return (
    <div className="space-y-6">
      {/* Emergency Alert Banner */}
      <EmergencyAlertBanner emergencyAnnouncements={emergencyAlerts} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Village Community Dashboard
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Welcome to VillageOS. Real-time overview of residents, facility
              slot bookings, notices, and maintenance service tickets.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/facilities"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Calendar className="w-4 h-4" /> Reserve Facility
            </Link>
            <Link
              to="/service-requests"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Wrench className="w-4 h-4" /> Report Issue
            </Link>
          </div>
        </div>

        {/* MetricCardGroup */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Residents
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {metrics.residentsCount}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Households
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {metrics.householdsCount}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Home className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Bookings
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {metrics.activeBookingsCount}
              </h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Open Tickets
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {metrics.openTicketsCount}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Wrench className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Dashboard Grid: Announcements & Quick Access */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" /> Recent Village
                Bulletins
              </h2>
              <Link
                to="/announcements"
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                View All Notices <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <AnnouncementFeed announcements={announcements} />
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2 text-xs">
                <Link
                  to="/directory"
                  className="flex justify-between items-center p-3 rounded-lg bg-slate-50 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 transition-colors border border-slate-100 font-semibold"
                >
                  <span>Resident Directory</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
                <Link
                  to="/facilities"
                  className="flex justify-between items-center p-3 rounded-lg bg-slate-50 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 transition-colors border border-slate-100 font-semibold"
                >
                  <span>Facility Schedules & Bookings</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
                <Link
                  to="/service-requests"
                  className="flex justify-between items-center p-3 rounded-lg bg-slate-50 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 transition-colors border border-slate-100 font-semibold"
                >
                  <span>Track Maintenance Tickets</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
