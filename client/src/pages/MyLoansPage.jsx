import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { loansApi } from "../services/api";
import { LoansTable } from "../components/LoansTable";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  Bookmark,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export const MyLoansPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("active"); // 'active' | 'all' | 'overdue'

  const fetchLoans = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await loansApi.getPatronLoans(user.id);
      setLoans(data);
    } catch (err) {
      console.error("Error fetching patron loans:", err);
      setError("Failed to retrieve your loan records. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLoans();
    }
  }, [isAuthenticated, fetchLoans]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-12 max-w-md mx-auto shadow-sm">
          <Bookmark className="w-12 h-12 text-[#122338] mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-[#111c2d]">
            Patron Sign In Required
          </h2>
          <p className="text-sm text-[#566070] mt-2">
            Please log in to your library account to view your active book
            loans, renew borrow periods, and check return statuses.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center px-6 py-2.5 bg-[#122338] text-white text-sm font-semibold rounded-lg hover:bg-[#1f3552] transition shadow-md"
          >
            Sign In to Athenaeum
          </Link>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const activeLoans = loans.filter((l) => l.status === "active");
  const overdueLoans = activeLoans.filter(
    (l) => new Date(l.due_date) < new Date(),
  );
  const returnedLoans = loans.filter((l) => l.status === "returned");

  // Filtered loans based on tab
  const displayedLoans = loans.filter((l) => {
    if (activeTab === "active") return l.status === "active";
    if (activeTab === "overdue")
      return l.status === "active" && new Date(l.due_date) < new Date();
    return true; // 'all'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#111c2d] tracking-tight">
            Patron Circulation Dashboard
          </h1>
          <p className="text-sm text-[#566070] mt-1">
            Review your active loans, track upcoming due dates, and request loan
            renewals.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchLoans}
            className="inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition"
            title="Refresh loans"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            Refresh
          </button>
          <Link
            to="/catalog"
            className="inline-flex items-center px-4 py-2 bg-[#122338] hover:bg-[#1f3552] text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            Browse Catalog
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </div>
      </div>

      {/* Overdue Warning Alert Banner */}
      {overdueLoans.length > 0 && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-[#ba1a1a] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-[#ba1a1a]">
              Action Required: Overdue Items Detected
            </h4>
            <p className="text-xs text-rose-800 mt-0.5">
              You have <strong>{overdueLoans.length}</strong> book(s) past their
              scheduled return date. Please return or renew them promptly to
              maintain your borrowing privileges.
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-[#ba1a1a] flex-shrink-0" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {/* Active Loans */}
        <div
          onClick={() => setActiveTab("active")}
          className={`cursor-pointer bg-white rounded-xl border p-5 shadow-sm hover:shadow transition ${
            activeTab === "active"
              ? "border-[#122338] ring-2 ring-[#122338]/10"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#566070] uppercase tracking-wider">
              Active Loans
            </span>
            <div className="p-2 bg-emerald-50 rounded-lg text-[#0d6847]">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-serif font-bold text-[#111c2d]">
              {activeLoans.length}
            </span>
            <span className="text-xs text-[#566070]">books in possession</span>
          </div>
        </div>

        {/* Overdue Items */}
        <div
          onClick={() => setActiveTab("overdue")}
          className={`cursor-pointer bg-white rounded-xl border p-5 shadow-sm hover:shadow transition ${
            activeTab === "overdue"
              ? "border-[#ba1a1a] ring-2 ring-[#ba1a1a]/10"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#566070] uppercase tracking-wider">
              Overdue Items
            </span>
            <div className="p-2 bg-rose-50 rounded-lg text-[#ba1a1a]">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span
              className={`text-3xl font-serif font-bold ${overdueLoans.length > 0 ? "text-[#ba1a1a]" : "text-[#111c2d]"}`}
            >
              {overdueLoans.length}
            </span>
            <span className="text-xs text-[#566070]">past due date</span>
          </div>
        </div>

        {/* Returned History */}
        <div
          onClick={() => setActiveTab("all")}
          className={`cursor-pointer bg-white rounded-xl border p-5 shadow-sm hover:shadow transition ${
            activeTab === "all"
              ? "border-[#122338] ring-2 ring-[#122338]/10"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#566070] uppercase tracking-wider">
              Borrowing History
            </span>
            <div className="p-2 bg-gray-100 rounded-lg text-[#566070]">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-serif font-bold text-[#111c2d]">
              {returnedLoans.length}
            </span>
            <span className="text-xs text-[#566070]">completed returns</span>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center space-x-2 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("active")}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition ${
            activeTab === "active"
              ? "border-[#122338] text-[#122338]"
              : "border-transparent text-gray-500 hover:text-[#111c2d]"
          }`}
        >
          Active Loans ({activeLoans.length})
        </button>
        <button
          onClick={() => setActiveTab("overdue")}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition ${
            activeTab === "overdue"
              ? "border-[#ba1a1a] text-[#ba1a1a]"
              : "border-transparent text-gray-500 hover:text-[#ba1a1a]"
          }`}
        >
          Overdue ({overdueLoans.length})
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition ${
            activeTab === "all"
              ? "border-[#122338] text-[#122338]"
              : "border-transparent text-gray-500 hover:text-[#111c2d]"
          }`}
        >
          All Loan Records ({loans.length})
        </button>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto"></div>
        </div>
      ) : (
        <LoansTable
          loans={displayedLoans}
          onActionSuccess={fetchLoans}
          isAdminView={false}
        />
      )}
    </div>
  );
};
