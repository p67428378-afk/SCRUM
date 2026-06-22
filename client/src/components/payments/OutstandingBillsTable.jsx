import React from "react";
import Badge from "../common/Badge.jsx";
import Button from "../common/Button.jsx";

export default function OutstandingBillsTable({ bills = [], onPayClick }) {
  const unpaidBills = bills.filter((b) => b.status?.toLowerCase() === "unpaid");

  return (
    <div className="card-surface p-6 w-full overflow-x-auto">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">
        Outstanding Dues
      </h3>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <th className="py-3 px-4">Description</th>
            <th className="py-3 px-4">Due Date</th>
            <th className="py-3 px-4">Amount</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="text-sm text-slate-300 divide-y divide-slate-800">
          {unpaidBills.length === 0 ? (
            <tr>
              <td colSpan="5" className="py-4 text-center text-slate-400">
                No outstanding dues. All bills are paid!
              </td>
            </tr>
          ) : (
            unpaidBills.map((bill) => (
              <tr
                key={bill.id}
                className="hover:bg-slate-800/50 transition-colors"
              >
                <td className="py-4 px-4 font-medium text-slate-200">
                  {bill.description}
                </td>
                <td className="py-4 px-4">
                  {new Date(bill.due_date).toLocaleDateString()}
                </td>
                <td className="py-4 px-4 font-semibold text-slate-200">
                  ${parseFloat(bill.amount).toFixed(2)}
                </td>
                <td className="py-4 px-4">
                  <Badge status={bill.status} />
                </td>
                <td className="py-4 px-4 text-right">
                  <Button
                    onClick={() => onPayClick(bill)}
                    variant="success"
                    className="px-3 py-1.5 text-xs ml-auto"
                  >
                    Pay Now
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
