import React from "react";
import Badge from "../common/Badge.jsx";

export default function PaymentHistoryTable({ bills = [] }) {
  const paidBills = bills.filter((b) => b.status?.toLowerCase() === "paid");

  return (
    <div className="card-surface p-6 w-full overflow-x-auto">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">
        Payment History
      </h3>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <th className="py-3 px-4">Description</th>
            <th className="py-3 px-4">Payment Date</th>
            <th className="py-3 px-4">Amount Paid</th>
            <th className="py-3 px-4">Status</th>
          </tr>
        </thead>
        <tbody className="text-sm text-slate-300 divide-y divide-slate-800">
          {paidBills.length === 0 ? (
            <tr>
              <td colSpan="4" className="py-4 text-center text-slate-400">
                No payment history available.
              </td>
            </tr>
          ) : (
            paidBills.map((bill) => (
              <tr
                key={bill.id}
                className="hover:bg-slate-800/50 transition-colors"
              >
                <td className="py-4 px-4 font-medium text-slate-200">
                  {bill.description}
                </td>
                <td className="py-4 px-4">
                  {bill.updated_at
                    ? new Date(bill.updated_at).toLocaleDateString()
                    : new Date().toLocaleDateString()}
                </td>
                <td className="py-4 px-4 font-semibold text-emerald-400">
                  ${parseFloat(bill.amount).toFixed(2)}
                </td>
                <td className="py-4 px-4">
                  <Badge status="Paid" />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
