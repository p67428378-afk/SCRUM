import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Loader2, AlertCircle } from "lucide-react";
import { orderService } from "../services/api.js";
import OrderTable from "../components/orders/OrderTable.jsx";

export default function OrdersPage({ userRole }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter State
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (err) {
      setError("Failed to load food orders. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const updated = await orderService.updateOrderStatus(orderId, newStatus);
      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: updated.status } : o,
        ),
      );
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update order status.");
    }
  };

  // Filter orders based on search and status
  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      statusFilter === "All Statuses" ||
      o.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.booking?.guest_name &&
        o.booking.guest_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (o.restaurant?.name &&
        o.restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const statuses = [
    "All Statuses",
    "Placed",
    "In the Kitchen",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Food Orders</h2>
        <p className="text-sm text-gray-500">
          Track and manage guest food delivery orders
        </p>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID, guest, or restaurant..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          <SlidersHorizontal className="h-4 w-4" />
          More Filters
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm text-gray-500 font-medium">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center space-x-3 max-w-2xl mx-auto shadow-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-bold">Error Loading Orders</p>
            <p className="mt-0.5">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-2 text-xs font-bold underline hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <OrderTable
          orders={filteredOrders}
          onStatusChange={handleStatusChange}
          userRole={userRole}
        />
      )}
    </div>
  );
}
