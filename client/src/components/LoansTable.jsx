import React, { useState } from "react";
import {
  Calendar,
  Clock,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  BookCheck,
  ShieldAlert,
} from "lucide-react";
import { loansApi } from "../services/api";

export const LoansTable = ({
  loans = [],
  onActionSuccess,
  isAdminView = false,
}) => {
  const [processingId, setProcessingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const safeLoans = Array.isArray(loans) ? loans : [];

  const handleReturn = async (loanId) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setProcessingId(loanId);
    try {
      await loansApi.returnBook(loanId);
      setSuccessMsg("Book successfully returned and inventory restored.");
      if (onActionSuccess) onActionSuccess();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to return book.";
      setErrorMsg(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRenew = async (loanId) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setProcessingId(loanId);
    try {
      await loansApi.renewLoan(loanId);
      setSuccessMsg("Loan successfully renewed (+14 days added to due date).");
      if (onActionSuccess) onActionSuccess();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to renew loan.";
      setErrorMsg(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = (status, dueDate) => {
    const isPastDue =
      status === "active" && dueDate && new Date(dueDate) < new Date();
    const effectiveStatus = isPastDue ? "overdue" : status;

    switch (effectiveStatus) {
      case "overdue":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-[#ba1a1a] border border-rose-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Overdue
          </span>
        );
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-[#0d6847] border border-emerald-200">
            <Clock className="w-3 h-3 mr-1" />
            Active Loan
          </span>
        );
      case "returned":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-[#566070] border border-gray-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Returned
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  if (safeLoans.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <BookCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-[#111c2d]">
          No loan records found
        </h4>
        <p className="text-xs text-[#566070] mt-1">
          {isAdminView
            ? "There are currently no circulation loan records in the system."
            : "You have not checked out any books yet. Visit the catalog to borrow."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Alert Messages */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-[#ba1a1a]" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-rose-600 hover:text-rose-900 font-bold"
          >
            ×
          </button>
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-[#0d6847]" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold"
          >
            ×
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-[#122338]/5 text-[#566070] text-xs uppercase font-semibold">
            <tr>
              <th scope="col" className="px-6 py-3.5">
                Book Details
              </th>
              {isAdminView && (
                <th scope="col" className="px-6 py-3.5">
                  Patron
                </th>
              )}
              <th scope="col" className="px-6 py-3.5">
                Checked Out
              </th>
              <th scope="col" className="px-6 py-3.5">
                Due Date
              </th>
              <th scope="col" className="px-6 py-3.5">
                Status
              </th>
              <th scope="col" className="px-6 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {safeLoans.map((loan) => {
              const isActive = loan.status === "active";
              const isOverdue =
                isActive &&
                loan.due_date &&
                new Date(loan.due_date) < new Date();
              const isBusy = processingId === loan.id;

              return (
                <tr key={loan.id} className="hover:bg-gray-50/80 transition">
                  {/* Book Details */}
                  <td className="px-6 py-4">
                    <div className="font-serif font-semibold text-[#111c2d] text-base">
                      {loan.book?.title || "Unknown Title"}
                    </div>
                    <div className="text-xs text-[#566070] mt-0.5">
                      {loan.book?.author ? `by ${loan.book.author}` : ""}
                      {loan.book?.isbn && (
                        <span className="ml-2 font-mono text-[11px] bg-gray-100 px-1.5 py-0.5 rounded">
                          ISBN: {loan.book.isbn}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Patron details for Admin View */}
                  {isAdminView && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#111c2d]">
                        {loan.patron?.full_name || "Patron"}
                      </div>
                      <div className="text-xs text-[#566070]">
                        {loan.patron?.email || loan.patron_id}
                      </div>
                    </td>
                  )}

                  {/* Checkout Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-[#566070]">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{formatDate(loan.checkout_date)}</span>
                    </div>
                  </td>

                  {/* Due Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-xs">
                    <div
                      className={`flex items-center space-x-1.5 font-medium ${
                        isOverdue
                          ? "text-[#ba1a1a] font-semibold"
                          : "text-[#111c2d]"
                      }`}
                    >
                      <Clock
                        className={`w-3.5 h-3.5 ${isOverdue ? "text-[#ba1a1a]" : "text-gray-400"}`}
                      />
                      <span>{formatDate(loan.due_date)}</span>
                    </div>
                    {loan.return_date && (
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        Returned: {formatDate(loan.return_date)}
                      </div>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(loan.status, loan.due_date)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                    {isActive ? (
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleRenew(loan.id)}
                          disabled={isBusy}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-[#111c2d] bg-white hover:bg-gray-50 focus:outline-none transition disabled:opacity-50"
                          title="Extend due date by 14 days"
                        >
                          <RefreshCw
                            className={`w-3 h-3 mr-1 text-gray-500 ${isBusy ? "animate-spin" : ""}`}
                          />
                          <span>Renew</span>
                        </button>
                        <button
                          onClick={() => handleReturn(loan.id)}
                          disabled={isBusy}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-[#0d6847] hover:bg-[#0d6847]/90 shadow-sm transition disabled:opacity-50"
                          title="Process Return"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          <span>Return</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        Completed
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
