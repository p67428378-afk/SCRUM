import React, { useState } from "react";
import {
  Search,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function TransferHistoryTable({
  transfers = [],
  isLoading,
  onRefresh,
  onViewReceipt,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredTransfers = transfers.filter((item) => {
    const matchesSearch =
      (item.id && item.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.sender_id &&
        item.sender_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.receiver_id &&
        item.receiver_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.amount && item.amount.toString().includes(searchTerm));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "COMPLETED" && item.status === "COMPLETED") ||
      (statusFilter === "OTHER" && item.status !== "COMPLETED");

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Transfer Activity & Audit Ledger
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time record of all peer-to-peer transactions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, sender, recipient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 rounded-md transition-all ${
                statusFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("COMPLETED")}
              className={`px-3 py-1 rounded-md transition-all ${
                statusFilter === "COMPLETED"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "hover:text-slate-900"
              }`}
            >
              Completed
            </button>
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh Transactions"
              className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Transaction UUID</th>
              <th className="py-3 px-4">Sender Account</th>
              <th className="py-3 px-4">Recipient Account</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Date & Time (UTC)</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400">
                  <div className="inline-flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Loading transfer transactions...</span>
                  </div>
                </td>
              </tr>
            ) : filteredTransfers.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto text-center space-y-2">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-semibold text-slate-600">
                      No transfers found
                    </p>
                    <p className="text-xs text-slate-400">
                      {searchTerm
                        ? "No transactions match your search filter."
                        : "Initiate your first P2P transfer using the form above."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransfers.map((item) => {
                const amountFormatted = Number(item.amount).toLocaleString(
                  "en-US",
                  {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 2,
                  },
                );
                const dateFormatted = item.created_at
                  ? new Date(item.created_at).toLocaleString("en-US", {
                      timeZone: "UTC",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Just now";

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {item.id
                        ? `${item.id.slice(0, 8)}...${item.id.slice(-4)}`
                        : "N/A"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {item.sender_id
                        ? `${item.sender_id.slice(0, 8)}...`
                        : "N/A"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {item.receiver_id
                        ? `${item.receiver_id.slice(0, 8)}...`
                        : "N/A"}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {amountFormatted}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        {item.status || "COMPLETED"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {dateFormatted}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {onViewReceipt && (
                        <button
                          type="button"
                          onClick={() => onViewReceipt(item)}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-xs hover:underline"
                        >
                          View Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Compliance & Security Footer Banner */}
      <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            Synchronous fraud checks & Real-time ledger synchronization active
          </span>
        </div>
        <span className="font-semibold text-slate-600">
          Total: {filteredTransfers.length} transaction
          {filteredTransfers.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
