import React, { useState, useEffect } from "react";
import {
  BookMarked,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { getMyLoans, returnBook, renewLoan } from "../services/api";
import LoansTable from "../components/loans/LoansTable";
import StatCard from "../components/common/StatCard";

export const MyLoansPage = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const data = await getMyLoans();
      setLoans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching my loans:", err);
      showNotification("error", "Failed to load borrowing history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleReturn = async (loanId) => {
    setActionLoadingId(loanId);
    try {
      const result = await returnBook(loanId);
      const fineMsg = result?.fine?.amount
        ? ` Fine generated: $${result.fine.amount.toFixed(2)}.`
        : "";
      showNotification("success", `Book successfully returned!${fineMsg}`);
      fetchLoans();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Return operation failed.";
      showNotification("error", errorMsg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRenew = async (loanId) => {
    setActionLoadingId(loanId);
    try {
      await renewLoan(loanId);
      showNotification(
        "success",
        "Loan successfully renewed for another 14 days!",
      );
      fetchLoans();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Loan renewal failed.";
      showNotification("error", errorMsg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const activeLoans = loans.filter(
    (l) => l.status === "ACTIVE" || !l.return_date,
  );
  const overdueLoans = activeLoans.filter(
    (l) => new Date(l.due_date) < new Date(),
  );
  const totalFines = loans.reduce((sum, l) => {
    const amt = l.fine?.amount || l.fine_amount || 0;
    return sum + Number(amt);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          My Borrowings & Loans
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track your active checkouts, due dates, renewals, and history.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Checkouts"
          value={activeLoans.length}
          icon={BookMarked}
          color="blue"
        />
        <StatCard
          title="Overdue Items"
          value={overdueLoans.length}
          icon={Clock}
          color={overdueLoans.length > 0 ? "red" : "green"}
        />
        <StatCard
          title="Accrued Fines"
          value={`$${totalFines.toFixed(2)}`}
          icon={DollarSign}
          color={totalFines > 0 ? "amber" : "purple"}
        />
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-medium transition-all ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Loans Table */}
      {loading ? (
        <div className="h-64 bg-slate-100 rounded-xl animate-pulse"></div>
      ) : (
        <LoansTable
          loans={loans}
          onReturn={handleReturn}
          onRenew={handleRenew}
          actionLoadingId={actionLoadingId}
        />
      )}
    </div>
  );
};

export default MyLoansPage;
