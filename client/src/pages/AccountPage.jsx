import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { User, Mail, Shield, BookOpen, RefreshCw } from "lucide-react";
import { orderService } from "../services/api";
import OrderHistory from "../components/orders/OrderHistory";

export default function AccountPage({ user, onOpenAuth }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setRefreshing(true);
    try {
      const data = await orderService.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 shadow-sm">
          <div className="w-16 h-16 bg-brand-100 text-brand-950 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
            Account Sign In Required
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Please sign in to view your profile details, past orders, and
            shipment tracking receipts.
          </p>
          <button
            onClick={() => onOpenAuth("login")}
            className="bg-accent hover:bg-accent-hover text-slate-950 font-bold px-6 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
          >
            Sign In to Your Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* User Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-brand-950 text-accent font-serif font-bold text-2xl flex items-center justify-center border-2 border-accent shadow-inner">
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-serif font-bold text-slate-900">
                Welcome back, {user.full_name || "Book Lover"}
              </h1>
              {user.role === "admin" && (
                <span className="bg-purple-100 text-purple-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Admin</span>
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 flex items-center space-x-1.5 mt-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 border-t sm:border-t-0 pt-3 sm:pt-0">
          <button
            onClick={fetchOrders}
            disabled={refreshing}
            className="text-xs font-semibold text-slate-600 hover:text-brand-950 flex items-center space-x-1 px-3 py-2 border rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh order history"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-serif font-bold text-slate-900">
              Your Order History
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {orders.length} order{orders.length === 1 ? "" : "s"} recorded
          </span>
        </div>

        <OrderHistory orders={orders} loading={loading} />
      </div>
    </div>
  );
}

AccountPage.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    email: PropTypes.string,
    full_name: PropTypes.string,
    role: PropTypes.string,
  }),
  onOpenAuth: PropTypes.func.isRequired,
};
