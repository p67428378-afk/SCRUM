import React, { useEffect, useState } from "react";
import { listOrders, updateOrderStatus, deleteOrder } from "../../services/api";
import Card from "../common/Card";
import Badge from "../common/Badge";
import {
  RefreshCw,
  Trash2,
  Calendar,
  User,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function OrderLifecycleTable({ refreshKey }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState("");
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listOrders(
        statusFilter || null,
        orderTypeFilter || null,
      );
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load order lifecycle records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, orderTypeFilter, refreshKey]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      console.error("Error updating order status:", err);
      setError("Failed to update status. Check inventory cancellation rules.");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this order history entry?",
      )
    ) {
      try {
        await deleteOrder(orderId);
        fetchOrders();
      } catch (err) {
        console.error("Error deleting order:", err);
        setError("Failed to delete order.");
      }
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Completed":
        return "success";
      case "Ready for Pickup":
        return "primary";
      case "In Production":
        return "warning";
      case "Pending":
        return "info";
      case "Cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const statuses = [
    "All",
    "Pending",
    "In Production",
    "Ready for Pickup",
    "Completed",
    "Cancelled",
  ];

  return (
    <Card
      title="Bakery Orders Lifecycle"
      subtitle="Track POS and Pre-Orders across production statuses"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-[#D92D2D] rounded-md text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs font-bold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF7F2] p-3 rounded-md border border-[#E5DED1]">
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs font-semibold text-[#80756B] mr-1">
              Status:
            </span>
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st === "All" ? "" : st)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  (st === "All" && !statusFilter) || statusFilter === st
                    ? "bg-[#D96B1F] text-white"
                    : "bg-white text-[#80756B] border border-[#E5DED1] hover:text-[#1F1A14]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value)}
              className="text-xs p-1.5 bg-white border border-[#E5DED1] rounded-md focus:outline-none focus:ring-1 focus:ring-[#D96B1F]"
            >
              <option value="">All Order Types</option>
              <option value="Instant">Instant Sales</option>
              <option value="Pre-Order">Pre-Orders</option>
            </select>

            <button
              onClick={fetchOrders}
              className="p-1.5 bg-white border border-[#E5DED1] rounded-md text-[#80756B] hover:text-[#1F1A14]"
              title="Refresh Orders"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Order Table */}
        {loading ? (
          <div className="flex items-center justify-center p-8 text-[#80756B]">
            <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#D96B1F]" />
            <span>Loading order history...</span>
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E5DED1] text-sm">
              <thead>
                <tr className="bg-[#FAF7F2] text-left text-xs uppercase font-semibold text-[#80756B]">
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Type & Customer</th>
                  <th className="px-4 py-3">Items Summary</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Status Lifecycle</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DED1]">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#FAF7F2] transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-bold text-[#1F1A14]">
                      #{order.id.substring(0, 8)}
                      <div className="text-[10px] text-[#80756B] font-sans font-normal mt-0.5">
                        {new Date(order.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1.5">
                        <Badge
                          variant={
                            order.order_type === "Pre-Order"
                              ? "warning"
                              : "primary"
                          }
                        >
                          {order.order_type}
                        </Badge>
                        <span className="font-semibold text-[#1F1A14]">
                          {order.customer_name || "Counter Customer"}
                        </span>
                      </div>
                      {order.pickup_date && (
                        <div className="text-xs text-[#80756B] flex items-center mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>
                            Pickup:{" "}
                            {new Date(order.pickup_date).toLocaleString([], {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-xs space-y-0.5">
                        {order.items &&
                          order.items.map((item) => (
                            <div key={item.id} className="text-[#1F1A14]">
                              <span className="font-bold">
                                {item.quantity}x
                              </span>{" "}
                              {item.product_name || "Item"}
                            </div>
                          ))}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-bold text-[#1F1A14]">
                      ${order.total_amount.toFixed(2)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          className="text-xs p-1 bg-white border border-[#E5DED1] rounded text-[#80756B] focus:outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Production">In Production</option>
                          <option value="Ready for Pickup">
                            Ready for Pickup
                          </option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-[#D92D2D] hover:text-red-700 p-1"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[#80756B] italic py-8 text-center">
            No orders match the selected filters.
          </p>
        )}
      </div>
    </Card>
  );
}
