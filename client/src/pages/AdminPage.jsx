import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { booksApi, loansApi, authApi } from "../services/api";
import { AddBookForm } from "../components/AddBookForm";
import { LoansTable } from "../components/LoansTable";
import {
  Shield,
  BookOpen,
  Layers,
  Clock,
  AlertTriangle,
  Users,
  RefreshCw,
  Bell,
  CheckCircle2,
  Trash2,
  UserCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

export const AdminPage = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [patrons, setPatrons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reminderStatus, setReminderStatus] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'catalog' | 'loans' | 'overdue' | 'patrons'

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedBooks, fetchedLoans, fetchedOverdue, fetchedPatrons] =
        await Promise.all([
          booksApi.getBooks({ limit: 100 }),
          loansApi.getAllLoans(0, 100),
          loansApi.getOverdueLoans(),
          authApi.getPatrons(0, 100),
        ]);

      setBooks(fetchedBooks || []);
      setLoans(fetchedLoans || []);
      setOverdueLoans(fetchedOverdue || []);
      setPatrons(fetchedPatrons || []);
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
      setError(
        "Failed to load administrative records. Please ensure backend permissions are satisfied.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchData();
    }
  }, [isAuthenticated, isAdmin, fetchData]);

  const handleSendReminder = (loanId, patronName, bookTitle) => {
    setReminderStatus(
      `Reminder notice dispatched to ${patronName || "patron"} for overdue return of "${bookTitle || "Book"}".`,
    );
    setTimeout(() => setReminderStatus(null), 4000);
  };

  const handleDeleteBook = async (bookId) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this book from the catalog?",
      )
    )
      return;
    try {
      await booksApi.deleteBook(bookId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete book.");
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-12 max-w-md mx-auto shadow-sm">
          <Shield className="w-12 h-12 text-[#ba1a1a] mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-[#111c2d]">
            Administrator Access Required
          </h2>
          <p className="text-sm text-[#566070] mt-2">
            This console is restricted to Library Staff and Administrators.
            Please sign in with administrator credentials.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center px-6 py-2.5 bg-[#122338] text-white text-sm font-semibold rounded-lg hover:bg-[#1f3552] transition shadow-md"
          >
            Sign In as Admin
          </Link>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalBooksCount = books.length;
  const totalCopiesCount = books.reduce(
    (acc, b) => acc + (b.total_copies || 0),
    0,
  );
  const activeLoansCount = loans.filter((l) => l.status === "active").length;
  const overdueLoansCount = overdueLoans.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-serif text-3xl font-bold text-[#111c2d] tracking-tight">
              Circulation & Catalog Control Console
            </h1>
            <span className="bg-[#122338] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              Admin
            </span>
          </div>
          <p className="text-sm text-[#566070] mt-1">
            Real-time tracking of book inventory, circulation loans, overdue
            compliance, and patron accounts.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-medium text-[#111c2d] bg-white hover:bg-gray-50 shadow-sm transition"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
          Refresh Console
        </button>
      </div>

      {/* Reminder notification toast */}
      {reminderStatus && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#0d6847]" />
            <span className="font-medium">{reminderStatus}</span>
          </div>
          <button
            onClick={() => setReminderStatus(null)}
            className="font-bold text-emerald-900"
          >
            ×
          </button>
        </div>
      )}

      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#566070] uppercase tracking-wider">
              Catalog Titles
            </span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-serif font-bold text-[#111c2d]">
              {totalBooksCount}
            </span>
            <span className="text-xs text-[#566070]">unique titles</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#566070] uppercase tracking-wider">
              Total Inventory
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-serif font-bold text-[#111c2d]">
              {totalCopiesCount}
            </span>
            <span className="text-xs text-[#566070]">physical copies</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#566070] uppercase tracking-wider">
              Active Loans
            </span>
            <div className="p-2 bg-emerald-50 text-[#0d6847] rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-serif font-bold text-[#111c2d]">
              {activeLoansCount}
            </span>
            <span className="text-xs text-[#566070]">currently borrowed</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#566070] uppercase tracking-wider">
              Overdue Items
            </span>
            <div className="p-2 bg-rose-50 text-[#ba1a1a] rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span
              className={`text-3xl font-serif font-bold ${overdueLoansCount > 0 ? "text-[#ba1a1a]" : "text-[#111c2d]"}`}
            >
              {overdueLoansCount}
            </span>
            <span className="text-xs text-[#566070]">past return date</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
            activeTab === "overview"
              ? "border-[#122338] text-[#122338]"
              : "border-transparent text-gray-500 hover:text-[#111c2d]"
          }`}
        >
          Console Overview & Ingest
        </button>
        <button
          onClick={() => setActiveTab("overdue")}
          className={`py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
            activeTab === "overdue"
              ? "border-[#ba1a1a] text-[#ba1a1a]"
              : "border-transparent text-gray-500 hover:text-[#ba1a1a]"
          }`}
        >
          Overdue Monitor ({overdueLoansCount})
        </button>
        <button
          onClick={() => setActiveTab("loans")}
          className={`py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
            activeTab === "loans"
              ? "border-[#122338] text-[#122338]"
              : "border-transparent text-gray-500 hover:text-[#111c2d]"
          }`}
        >
          All Circulation Loans ({loans.length})
        </button>
        <button
          onClick={() => setActiveTab("catalog")}
          className={`py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
            activeTab === "catalog"
              ? "border-[#122338] text-[#122338]"
              : "border-transparent text-gray-500 hover:text-[#111c2d]"
          }`}
        >
          Catalog Inventory ({books.length})
        </button>
        <button
          onClick={() => setActiveTab("patrons")}
          className={`py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
            activeTab === "patrons"
              ? "border-[#122338] text-[#122338]"
              : "border-transparent text-gray-500 hover:text-[#111c2d]"
          }`}
        >
          Patron Directory ({patrons.length})
        </button>
      </div>

      {/* Tab: Overview & Ingest */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ingest Form on the left/top */}
          <div className="lg:col-span-1">
            <AddBookForm onBookAdded={fetchData} />
          </div>

          {/* Overdue alert panel on the right */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-rose-50 text-[#ba1a1a] rounded-lg">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#111c2d]">
                      Overdue Loans Monitoring
                    </h3>
                    <p className="text-xs text-[#566070]">
                      Books requiring return action
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-rose-100 text-[#ba1a1a] rounded-full">
                  {overdueLoans.length} Overdue
                </span>
              </div>

              {overdueLoans.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    All loans are currently up to date!
                  </p>
                  <p className="text-xs text-gray-500">
                    No overdue items detected across patrons.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead>
                      <tr className="text-[#566070] font-semibold">
                        <th className="py-2 text-left">Book</th>
                        <th className="py-2 text-left">Patron</th>
                        <th className="py-2 text-left">Due Date</th>
                        <th className="py-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {overdueLoans.slice(0, 5).map((l) => (
                        <tr key={l.id} className="hover:bg-rose-50/50">
                          <td className="py-3 font-semibold text-[#111c2d]">
                            {l.book?.title}
                          </td>
                          <td className="py-3 text-[#566070]">
                            {l.patron?.full_name || l.patron_id}
                          </td>
                          <td className="py-3 font-semibold text-[#ba1a1a]">
                            {new Date(l.due_date).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() =>
                                handleSendReminder(
                                  l.id,
                                  l.patron?.full_name,
                                  l.book?.title,
                                )
                              }
                              className="inline-flex items-center px-2.5 py-1 bg-[#122338] hover:bg-[#1f3552] text-white rounded text-[11px] font-medium transition"
                            >
                              <Bell className="w-3 h-3 mr-1" />
                              Send Notice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Circulation Activity */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-serif text-lg font-bold text-[#111c2d] mb-4">
                Recent Circulation Transactions
              </h3>
              <LoansTable
                loans={loans.slice(0, 5)}
                onActionSuccess={fetchData}
                isAdminView={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Overdue Monitor */}
      {activeTab === "overdue" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-[#111c2d] mb-2">
              Overdue Loans Console
            </h3>
            <p className="text-xs text-[#566070] mb-6">
              List of active loans that have exceeded the 14-day borrowing
              duration.
            </p>
            <LoansTable
              loans={overdueLoans}
              onActionSuccess={fetchData}
              isAdminView={true}
            />
          </div>
        </div>
      )}

      {/* Tab: All Circulation Loans */}
      {activeTab === "loans" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-[#111c2d] mb-2">
              Full Circulation Records
            </h3>
            <p className="text-xs text-[#566070] mb-6">
              Complete audit history of active and completed book borrowings.
            </p>
            <LoansTable
              loans={loans}
              onActionSuccess={fetchData}
              isAdminView={true}
            />
          </div>
        </div>
      )}

      {/* Tab: Catalog Inventory Management */}
      {activeTab === "catalog" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#111c2d]">
                Catalog Inventory Records
              </h3>
              <p className="text-xs text-[#566070]">
                Manage books, total stock, and availability counts
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 text-[#566070] uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Book Title</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">ISBN</th>
                  <th className="px-4 py-3">Genre</th>
                  <th className="px-4 py-3 text-center">Available / Total</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {books.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-[#111c2d]">
                      {b.title}
                    </td>
                    <td className="px-4 py-3 text-[#566070]">{b.author}</td>
                    <td className="px-4 py-3 font-mono text-gray-500">
                      {b.isbn}
                    </td>
                    <td className="px-4 py-3">{b.genre}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-emerald-700">
                        {b.available_copies}
                      </span>{" "}
                      / {b.total_copies}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteBook(b.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded transition"
                        title="Delete book"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Patron Directory */}
      {activeTab === "patrons" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6">
          <div className="mb-6">
            <h3 className="font-serif text-xl font-bold text-[#111c2d]">
              Registered Library Members
            </h3>
            <p className="text-xs text-[#566070]">
              Patron profiles, roles, and membership statuses
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 text-[#566070] uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Patron ID</th>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {patrons.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td
                      className="px-4 py-3 font-mono text-gray-500 text-[11px] truncate max-w-[120px]"
                      title={p.id}
                    >
                      {p.id}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#111c2d] flex items-center space-x-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                      <span>{p.full_name}</span>
                    </td>
                    <td className="px-4 py-3 text-[#566070]">{p.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          p.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {p.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
