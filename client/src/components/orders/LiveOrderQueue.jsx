import React, { useState } from "react";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  XCircle,
} from "lucide-react";

export default function LiveOrderQueue({
  orders = [],
  onUpdateStatus,
  onNewOrderClick,
}) {
  const [statusFilter, setStatusFilter] = useState("Active");

  const statusColors = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Preparing: "bg-blue-50 text-blue-700 border-blue-200",
    Ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Completed: "bg-slate-100 text-slate-600 border-slate-200",
    Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "Active") {
      return order.status !== "Completed" && order.status !== "Cancelled";
    }
    if (statusFilter === "All") return true;
    return order.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const getNextStatus = (currentStatus) => {
    if (currentStatus === "Pending") return "Preparing";
    if (currentStatus === "Preparing") return "Ready";
    if (currentStatus === "Ready") return "Completed";
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-5">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Live Order Queue</h2>
          <p className="text-xs text-slate-500">
            Track active order progression from kitchen to table pickup.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {onNewOrderClick && (
            <button
              onClick={onNewOrderClick}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              + Create Order
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["Active", "Pending", "Preparing", "Ready", "Completed", "All"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab}
            </button>
          ),
        )}
      </div>

      {/* Orders Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const nextStatus = getNextStatus(order.status);
            return (
              <div
                key={order.id}
                className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow space-y-4"
              >
                {/* Top info */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-extrabold text-slate-900">
                      {order.order_number || `#${order.id}`}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        statusColors[order.status] ||
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-3">
                    <span className="bg-slate-200/60 px-2 py-0.5 rounded text-slate-700 font-bold">
                      Table {order.table_number || order.table_id || "Takeout"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {order.created_at
                        ? new Date(order.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Just now"}
                    </span>
                  </div>

                  {/* Item List */}
                  <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200 text-xs">
                    {(order.items || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-slate-700"
                      >
                        <span className="font-semibold">
                          <span className="text-amber-600 font-bold mr-1">
                            {item.quantity}x
                          </span>
                          {item.name || item.menu_item_id}
                        </span>
                        <span className="text-slate-500">
                          ${(item.unit_price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer & Total & Action Buttons */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                      Total
                    </span>
                    <span className="text-base font-black text-slate-900">
                      $
                      {parseFloat(
                        order.total_price || order.subtotal || 0,
                      ).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {order.status !== "Completed" &&
                      order.status !== "Cancelled" && (
                        <button
                          onClick={() =>
                            onUpdateStatus &&
                            onUpdateStatus(order.id, "Cancelled")
                          }
                          title="Cancel Order"
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}

                    {nextStatus && (
                      <button
                        onClick={() =>
                          onUpdateStatus && onUpdateStatus(order.id, nextStatus)
                        }
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1"
                      >
                        <span>Mark {nextStatus}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm font-semibold">
              No orders found in status "{statusFilter}".
            </p>
            <p className="text-xs text-slate-400 mt-1">
              New customer orders will appear here in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
