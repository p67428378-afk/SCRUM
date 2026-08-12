import React from "react";
import {
  Calendar,
  RotateCw,
  CornerDownLeft,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import Button from "../common/Button";
import Badge from "../common/Badge";

export const LoansTable = ({ loans, onReturn, onRenew, actionLoadingId }) => {
  if (!loans || loans.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
        <p className="text-slate-500 font-medium">
          You currently have no active or past loans.
        </p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = (dueDate, returnDate) => {
    if (returnDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Book Details</th>
              <th className="py-3.5 px-4">Checkout Date</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Fine Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {loans.map((loan) => {
              const overdue = isOverdue(loan.due_date, loan.return_date);
              const isActive = loan.status === "ACTIVE" || !loan.return_date;
              const bookTitle = loan.book?.title || "Unknown Title";
              const bookAuthor = loan.book?.author || "Unknown Author";
              const fineAmount = loan.fine?.amount || (loan.fine_amount ?? 0);

              return (
                <tr
                  key={loan.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-4 px-4 font-medium text-slate-900">
                    <div>{bookTitle}</div>
                    <div className="text-xs text-slate-500 font-normal">
                      By {bookAuthor}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      <span>{formatDate(loan.checkout_date)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div
                      className={`flex items-center gap-1.5 font-medium ${overdue ? "text-red-600" : "text-slate-700"}`}
                    >
                      <Calendar
                        size={14}
                        className={overdue ? "text-red-500" : "text-slate-400"}
                      />
                      <span>{formatDate(loan.due_date)}</span>
                      {overdue && (
                        <AlertCircle
                          size={14}
                          className="text-red-500 ml-0.5"
                        />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {isActive ? (
                      overdue ? (
                        <Badge variant="danger">Overdue</Badge>
                      ) : (
                        <Badge variant="info">Active Loan</Badge>
                      )
                    ) : (
                      <Badge variant="success">Returned</Badge>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {fineAmount > 0 ? (
                      <div className="flex items-center gap-1 text-red-600 font-semibold text-xs bg-red-50 px-2.5 py-1 rounded-md border border-red-100 w-fit">
                        <DollarSign size={14} />
                        <span>Fine: ${Number(fineAmount).toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No fines</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    {isActive && (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            loan.is_renewed ||
                            overdue ||
                            actionLoadingId === loan.id
                          }
                          onClick={() => onRenew(loan.id)}
                        >
                          <RotateCw size={14} />
                          <span>{loan.is_renewed ? "Renewed" : "Renew"}</span>
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={actionLoadingId === loan.id}
                          onClick={() => onReturn(loan.id)}
                        >
                          <CornerDownLeft size={14} />
                          <span>Return Book</span>
                        </Button>
                      </div>
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

export default LoansTable;
