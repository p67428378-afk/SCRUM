import React, { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  BookOpen,
  UserCheck,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Calculator,
  RefreshCw,
  Search,
} from "lucide-react";

export const StaffCirculation = () => {
  const { user, isStaffOrAdmin } = useAuth();

  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Checkout Form State
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedBookId, setSelectedBookId] = useState("");
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // Return Form State
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [returnSearchQuery, setReturnSearchQuery] = useState("");
  const [isProcessingReturn, setIsProcessingReturn] = useState(false);

  // Ledger Filter State
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState("");
  const [isRecalculating, setIsRecalculating] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [membersData, booksData, loansData] = await Promise.all([
        api.getMembers(),
        api.getBooks(),
        api.getLoans(),
      ]);
      setMembers(membersData);
      setBooks(booksData);
      setLoans(loansData);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to fetch circulation data",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Checkout
  const handleProcessCheckout = async (e) => {
    e.preventDefault();
    if (!selectedMemberId || !selectedBookId) {
      setError("Please select both an active member and a book to issue.");
      return;
    }

    setIsProcessingCheckout(true);
    setError(null);
    setActionSuccess(null);

    try {
      await api.checkoutBook({
        member_id: selectedMemberId,
        book_id: selectedBookId,
      });

      setActionSuccess(
        "Book checkout successfully processed! 14-day loan issued.",
      );
      setSelectedBookId("");
      await fetchData();
    } catch (err) {
      const detail =
        err.response?.data?.detail || err.message || "Checkout failed";
      setError(typeof detail === "string" ? detail : JSON.stringify(detail));
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // Handle Return
  const handleProcessReturn = async (loanIdToReturn) => {
    const loanId = loanIdToReturn || selectedLoanId;
    if (!loanId) {
      setError(
        "Please select a loan record or enter a loan ID to process return.",
      );
      return;
    }

    setIsProcessingReturn(true);
    setError(null);
    setActionSuccess(null);

    try {
      const res = await api.returnBook(loanId);
      const fineMsg =
        res.fine_amount > 0
          ? ` Overdue fine assessed: $${res.fine_amount.toFixed(2)}.`
          : " No overdue fines.";
      setActionSuccess(`Book return successfully confirmed!${fineMsg}`);
      setSelectedLoanId("");
      await fetchData();
    } catch (err) {
      const detail =
        err.response?.data?.detail || err.message || "Return processing failed";
      setError(typeof detail === "string" ? detail : JSON.stringify(detail));
    } finally {
      setIsProcessingReturn(false);
    }
  };

  // Handle Task Recalculate
  const handleRecalculateFines = async () => {
    setIsRecalculating(true);
    setError(null);
    setActionSuccess(null);
    try {
      const res = await api.recalculateOverdueFines();
      setActionSuccess(
        res.message || "Overdue fine recalculation job completed!",
      );
      await fetchData();
    } catch (err) {
      const detail =
        err.response?.data?.detail || err.message || "Recalculation failed";
      setError(typeof detail === "string" ? detail : JSON.stringify(detail));
    } finally {
      setIsRecalculating(false);
    }
  };

  // Selected Loan for Return preview
  const activeBorrowedLoans = loans.filter(
    (l) => l.status === "BORROWED" || l.status === "OVERDUE",
  );
  const previewLoan = loans.find((l) => l.id === selectedLoanId);

  // Compute fine preview for selected loan
  let previewDaysOverdue = 0;
  let previewFine = 0;
  if (previewLoan && previewLoan.due_date) {
    const dueDate = new Date(previewLoan.due_date);
    const now = new Date();
    if (now > dueDate) {
      const diffMs = now.getTime() - dueDate.getTime();
      previewDaysOverdue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      previewFine = Math.min(25.0, previewDaysOverdue * 0.5);
    }
  }

  const filteredLoans = ledgerStatusFilter
    ? loans.filter((l) => l.status === ledgerStatusFilter)
    : loans;

  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                Staff Circulation Desk
              </h1>
              <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                Desk Counter
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Issue books, process returns with real-time fine calculation, and
              oversee circulation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRecalculateFines}
              disabled={isRecalculating}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 transition-colors disabled:opacity-50"
            >
              <Calculator
                className={`w-3.5 h-3.5 ${isRecalculating ? "animate-spin" : ""}`}
              />
              Run Daily Fine Engine
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div
            role="alert"
            className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-3 text-sm animate-in fade-in"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Circulation Notice</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {actionSuccess && (
          <div
            role="status"
            className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-start gap-3 text-sm animate-in fade-in"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Operation Completed</p>
              <p className="text-xs text-emerald-700 mt-0.5">{actionSuccess}</p>
            </div>
          </div>
        )}

        {/* Dual Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel 1: Checkout Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#0F172A]">
                    Issue New Book Checkout
                  </h3>
                  <p className="text-xs text-slate-500">
                    Assign a 14-day book loan to an active library member
                  </p>
                </div>
              </div>

              <form onSubmit={handleProcessCheckout} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Select Member
                  </label>
                  <select
                    required
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Choose Member --</option>
                    {members.map((m) => {
                      const memberName =
                        m.user?.full_name || m.user?.email || m.id.slice(0, 8);
                      const isSuspended = m.status === "SUSPENDED";
                      return (
                        <option key={m.id} value={m.id} disabled={isSuspended}>
                          {memberName} ({m.membership_tier}){" "}
                          {isSuspended ? "[SUSPENDED]" : ""} - Unpaid: $
                          {Number(m.unpaid_fines || 0).toFixed(2)}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Select Book
                  </label>
                  <select
                    required
                    value={selectedBookId}
                    onChange={(e) => setSelectedBookId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Choose Book --</option>
                    {books.map((b) => (
                      <option
                        key={b.id}
                        value={b.id}
                        disabled={b.available_copies <= 0}
                      >
                        {b.title} (ISBN: {b.isbn}) - [{b.available_copies} of{" "}
                        {b.total_copies} available]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between font-medium">
                    <span>Loan Period:</span>
                    <span className="font-bold text-slate-800">
                      14 Calendar Days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tier Policy:</span>
                    <span>Standard (5 books) / Premium (10 books)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    isProcessingCheckout || !selectedMemberId || !selectedBookId
                  }
                  className="w-full bg-[#4F46E5] text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 active:scale-[0.99] transition-all disabled:opacity-50 shadow-sm shadow-indigo-100"
                >
                  {isProcessingCheckout
                    ? "Processing Checkout..."
                    : "Process Checkout"}
                </button>
              </form>
            </div>
          </div>

          {/* Panel 2: Process Return */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#0F172A]">
                    Process Book Return
                  </h3>
                  <p className="text-xs text-slate-500">
                    Reconcile book inventory and assess overdue fees ($0.50/day
                    up to $25)
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Scan or Select Active Loan
                  </label>
                  <select
                    value={selectedLoanId}
                    onChange={(e) => setSelectedLoanId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Select Active Loan Record --</option>
                    {activeBorrowedLoans.map((l) => {
                      const bookName = l.book?.title || l.book_id;
                      return (
                        <option key={l.id} value={l.id}>
                          {bookName} — Due:{" "}
                          {new Date(l.due_date).toLocaleDateString()} (
                          {l.status})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Overdue Calculation Banner */}
                {previewLoan && (
                  <div
                    className={`p-4 rounded-xl border text-sm space-y-1.5 ${
                      previewDaysOverdue > 0
                        ? "bg-amber-50 border-amber-200 text-amber-900"
                        : "bg-emerald-50 border-emerald-200 text-emerald-900"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>Status: {previewLoan.status}</span>
                      <span>
                        Due Date:{" "}
                        {new Date(previewLoan.due_date).toLocaleDateString()}
                      </span>
                    </div>
                    {previewDaysOverdue > 0 ? (
                      <p className="text-xs font-semibold">
                        ⚠️ Overdue Fine Calculation: {previewDaysOverdue} days
                        overdue × $0.50/day ={" "}
                        <span className="text-base font-extrabold text-rose-600">
                          ${previewFine.toFixed(2)}
                        </span>{" "}
                        (Capped at $25.00)
                      </p>
                    ) : (
                      <p className="text-xs font-medium text-emerald-700">
                        ✓ On-time return — No overdue fine will be assessed.
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleProcessReturn()}
                  disabled={isProcessingReturn || !selectedLoanId}
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 active:scale-[0.99] transition-all disabled:opacity-50 shadow-sm"
                >
                  {isProcessingReturn
                    ? "Processing Return..."
                    : previewDaysOverdue > 0
                      ? `Confirm Return & Accrue Fine ($${previewFine.toFixed(2)})`
                      : "Confirm Return & Restore Stock"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Full Circulation Ledger */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                All Circulation Loans Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Live feed of all issued, returned, and overdue loans
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={ledgerStatusFilter}
                onChange={(e) => setLedgerStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="BORROWED">BORROWED</option>
                <option value="OVERDUE">OVERDUE</option>
                <option value="RETURNED">RETURNED</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="p-4">Loan ID / Book</th>
                  <th className="p-4">Member</th>
                  <th className="p-4">Checkout Date</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Fine Amount</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLoans.map((loan) => {
                  const isOverdue = loan.status === "OVERDUE";
                  const isReturned = loan.status === "RETURNED";
                  const bookTitle =
                    loan.book?.title || loan.book_id.slice(0, 8);

                  return (
                    <tr
                      key={loan.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-bold text-slate-900">
                          {bookTitle}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ID: {loan.id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="p-4 text-xs text-slate-700 font-mono">
                        {loan.member_id.slice(0, 8)}...
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-600">
                        {loan.checkout_date
                          ? new Date(loan.checkout_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="p-4 text-xs font-mono">
                        <span
                          className={
                            isOverdue
                              ? "text-rose-600 font-bold"
                              : "text-slate-600"
                          }
                        >
                          {loan.due_date
                            ? new Date(loan.due_date).toLocaleDateString()
                            : "-"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                            isReturned
                              ? "bg-slate-100 text-slate-600 border-slate-200"
                              : isOverdue
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {loan.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-mono">
                        {loan.fine_amount > 0 ? (
                          <span className="text-rose-600 font-bold">
                            ${Number(loan.fine_amount).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-400">$0.00</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {!isReturned && (
                          <button
                            onClick={() => handleProcessReturn(loan.id)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors"
                          >
                            Return
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
