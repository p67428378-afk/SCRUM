import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Package, BarChart2 } from "lucide-react";
import AnalyticsDashboard from "../components/admin/AnalyticsDashboard";

export const AdminAnalyticsPage = () => {
  const location = useLocation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Navigation Sub-Header / Admin Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-4 text-sm font-semibold">
        <Link
          to="/admin"
          className={`pb-3 px-1 border-b-2 flex items-center gap-2 transition-colors ${
            location.pathname === "/admin"
              ? "border-purple-600 text-purple-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Package size={18} />
          <span>Inventory Management</span>
        </Link>
        <Link
          to="/admin/analytics"
          className={`pb-3 px-1 border-b-2 flex items-center gap-2 transition-colors ${
            location.pathname === "/admin/analytics"
              ? "border-purple-600 text-purple-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BarChart2 size={18} />
          <span>Purchasing & Analytics</span>
        </Link>
      </div>

      {/* Main Analytics Dashboard */}
      <AnalyticsDashboard />
    </div>
  );
};

export default AdminAnalyticsPage;
