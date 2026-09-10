import React, { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  BookOpen,
  Calendar,
  DollarSign,
  User,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  X,
  Clock,
} from "lucide-react";

export const PatronDashboard = () => {
  const { user, member, isAuthenticated, refreshProfile } = useAuth();

  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [renewingLoanId, setRenewingLoanId] = useState(null);

  // Pay Fine Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [payTargetId, setPayTargetId] = useState("");

  const fetchLoans = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMyLoans();
      setLoans(data);
      if (refreshProfile) await refreshProfile();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to fetch personal loans",
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, refreshProfile]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleRenew = async (loanId) => {
    setError(null);
    setSuccessMsg(null);
    setRenewingLoanId(loanId);
    try {
      await api.renewLoan(loanId);
      setSuccessMsg("Loan successfully renewed for an additional 14 days!");
      await fetchLoans();
    } catch (err) {
      const detail =
        err.response?.data?.detail || err.message || "Failed to renew loan";
      setError(typeof detail === "string" ? detail : JSON.stringify(detail));
    } finally {
      setRenewingLoanId(null);
    }
  };

  const handleOpenPayModal = (targetId, currentFine) => {
    setPayTargetId(targetId);
    setPayAmount(currentFine > 0 ? currentFine.toFixed(2) : "5.00");
    setIsPayModalOpen(true);
  };

  const handlePayFineSubmit = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) {
      setError("Please enter a valid positive payment amount.");
      return;
    }
    setIsPaying(true);
    setError(null);
    try {
      const result = await api.payFine(payTargetId || member?.id, payAmount);
      setSuccessMsg(result.message || "Fine payment processed successfully!");
      setIsPayModalOpen(false);
      await fetchLoans();
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        err.message ||
        "Payment processing failed";
      setError(typeof detail === "string" ? detail : JSON.stringify(detail));
    } finally {
      setIsPaying(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md w-full text-center space-y-4 shadow-sm">
          <User className="w-12 h-12 text-indigo-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
          <p className="text-xs text-slate-500">
            Please sign in with your patron or staff credentials to view your
            borrowed books, renew loans, and manage fine settlements.
          </p>
        </div>
      </div>
    );
  }

  const activeLoans = loans.filter(
    (l) => l.status === "BORROWED" || l.status === "OVERDUE",
  );
  const maxLimit = member?.membership_tier === "PREMIUM" ? 10 : 5;
  const borrowingPercentage = Math.min(
    100,
    Math.round((activeLoans.length / maxLimit) * 100),
  );
  const totalUnpaidFines = member?.unpaid_fines ?? 0;

  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Banner header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Patron Dashboard & Loans
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track your active borrowings, upcoming due dates, and membership
              status.
            </p>
          </div>
          <button
            onClick={fetchLoans}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors self-start md:self-auto"
          >
            <RotateCcw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div
            role="alert"
            className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-3 text-sm animate-in fade-in"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Notice</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-start gap-3 text-sm animate-in fade-in"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Success</p>
              <p className="text-xs text-emerald-700 mt-0.5">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Patron Profile */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Patron Profile
            </p>
            <h3 className="font-bold text-lg text-slate-900">
              {user?.full_name || "Patron"}
            </h3>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-indigo-100">
                {member?.membership_tier || "STANDARD"} Member
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                  member?.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {member?.status || "ACTIVE"}
              </span>
            </div>
          </div>

          {/* Card 2: Active Borrowings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Borrowings
            </p>
            <h3 className="font-bold text-2xl text-slate-900">
              {activeLoans.length} / {maxLimit} Books
            </h3>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  borrowingPercentage >= 100
                    ? "bg-rose-600"
                    : borrowingPercentage >= 60
                      ? "bg-amber-500"
                      : "bg-indigo-600"
                }`}
                style={{ width: `${borrowingPercentage}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400">
              Limit: {maxLimit} concurrent items allowed
            </p>
          </div>

          {/* Card 3: Unpaid Fines */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Unpaid Fines
            </p>
            <div className="flex items-baseline justify-between">
              <h3
                className={`font-bold text-2xl ${
                  totalUnpaidFines > 0 ? "text-rose-600" : "text-slate-900"
                }`}
              >
                ${totalUnpaidFines.toFixed(2)}
              </h3>
              {totalUnpaidFines > 0 && (
                <button
                  onClick={() =>
                    handleOpenPayModal(member?.id, totalUnpaidFines)
                  }
                  className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1"
                >
                  <DollarSign className="w-3 h-3" /> Pay Fine
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {totalUnpaidFines >= 20
                ? "⚠️ Account suspension threshold reached"
                : "Rate: $0.50 / overdue day"}
            </p>
          </div>

          {/* Card 4: Next Due Alert */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Loan Policy
            </p>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" /> 14-Day Duration
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Loans can be renewed once before due date if no pending
              reservations exist.
            </p>
          </div>
        </div>

        {/* Loans Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              Your Borrowed Books & Loan History
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {loans.length} Total Loans
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Loading loan records...
            </div>
          ) : loans.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700">
                No active loans found
              </p>
              <p className="text-xs text-slate-500">
                You haven't borrowed any books yet. Browse the catalog to borrow
                your first book!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="p-4">Book Title / Author</th>
                    <th className="p-4">Checkout Date</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Accrued Fine</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loans.map((loan) => {
                    const isOverdue = loan.status === "OVERDUE";
                    const isReturned = loan.status === "RETURNED";
                    const bookTitle =
                      loan.book?.title || `Book ID: ${loan.book_id}`;
                    const bookAuthor = loan.book?.author || "";

                    return (
                      <tr
                        key={loan.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-bold text-slate-900">
                            {bookTitle}
                          </div>
                          {bookAuthor && (
                            <div className="text-xs text-slate-500">
                              by {bookAuthor}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-xs text-slate-600 font-mono">
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
                              onClick={() => handleRenew(loan.id)}
                              disabled={renewingLoanId === loan.id}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-colors disabled:opacity-50"
                            >
                              {renewingLoanId === loan.id
                                ? "Renewing..."
                                : "Renew (+14 Days)"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pay Fine Modal */}
        {isPayModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-100 relative">
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Pay Overdue Fine</h3>
                  <p className="text-xs text-slate-500">
                    Settle outstanding library fee balance
                  </p>
                </div>
              </div>

              <form onSubmit={handlePayFineSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Payment Amount ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPayModalOpen(false)}
                    className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPaying}
                    className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {isPaying ? "Processing..." : "Confirm Payment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
