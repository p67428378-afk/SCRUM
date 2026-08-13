import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Clock,
  Users,
  DollarSign,
  RefreshCw,
  AlertCircle,
  BarChart2,
} from "lucide-react";
import { getAdminAnalytics, getBooks } from "../../services/api";
import StatCard from "../common/StatCard";
import Button from "../common/Button";
import GenrePopularityChart from "./GenrePopularityChart";
import PurchasingRecommendationTable from "./PurchasingRecommendationTable";

export const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsData, booksData] = await Promise.all([
        getAdminAnalytics(),
        getBooks({ skip: 0, limit: 100 }),
      ]);
      setAnalytics(analyticsData);
      setBooks(Array.isArray(booksData) ? booksData : booksData.items || []);
    } catch (err) {
      console.error("Failed to load analytics data:", err);
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "Failed to load analytics dashboard. Please check API connection or librarian permissions.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 bg-slate-200 rounded-xl"></div>
          <div className="h-28 bg-slate-200 rounded-xl"></div>
          <div className="h-28 bg-slate-200 rounded-xl"></div>
          <div className="h-28 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="h-80 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3">
        <AlertCircle size={36} className="text-red-500" />
        <div>
          <h3 className="font-bold text-base">Analytics Data Unavailable</h3>
          <p className="text-xs text-red-600 mt-1 max-w-md">{error}</p>
        </div>
        <Button variant="danger" size="sm" onClick={fetchData}>
          <RefreshCw size={14} />
          <span>Retry Loading Analytics</span>
        </Button>
      </div>
    );
  }

  const popularGenres = analytics?.most_popular_genres || [];
  const topGenre = popularGenres.length > 0 ? popularGenres[0] : null;
  const turnAround = analytics?.turn_around_rates || {
    average_turnaround_days: 0,
    total_returned_loans: 0,
  };
  const activeMembers = analytics?.active_members_count || 0;
  const totalFines = analytics?.total_fines_collected || 0;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart2 className="text-purple-600" size={26} />
            <span>Admin Purchasing & Inventory Analytics</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time Operational metrics, borrowing trends, and stock
            purchasing decisions
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw size={16} />
          <span>Refresh Data</span>
        </Button>
      </div>

      {/* 4 Scorecard Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Most Popular Genre"
          value={topGenre ? topGenre.genre : "None"}
          description={
            topGenre
              ? `${topGenre.checkout_count} total checkouts`
              : "No checkout data"
          }
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Turnaround Rate"
          value={`${turnAround.average_turnaround_days.toFixed(1)} Days`}
          description={`${turnAround.total_returned_loans} returned loans`}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Active Members"
          value={activeMembers}
          description="Registered active borrowers"
          icon={Users}
          color="green"
        />
        <StatCard
          title="Overdue Fines Collected"
          value={`$${totalFines.toFixed(2)}`}
          description="Total collected revenue"
          icon={DollarSign}
          color="amber"
        />
      </div>

      {/* Chart Visualization Section */}
      <div className="grid grid-cols-1 gap-6">
        <GenrePopularityChart data={popularGenres} />
      </div>

      {/* Purchasing Decision Table */}
      <PurchasingRecommendationTable
        genres={popularGenres}
        books={books}
        avgTurnaround={turnAround.average_turnaround_days}
      />
    </div>
  );
};

export default AnalyticsDashboard;
