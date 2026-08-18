import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import TrackingStepper from "../components/orders/TrackingStepper";
import { getUserOrders, getOrderById } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Badge from "../components/common/Badge";
import {
  Package,
  User,
  Clock,
  ShoppingBag,
  Loader,
  AlertCircle,
} from "lucide-react";

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const highlightOrderId = searchParams.get("new_order_id");

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUserOrders();
        const list = data.orders || [];
        setOrders(list);

        if (highlightOrderId) {
          try {
            const single = await getOrderById(highlightOrderId);
            setSelectedOrder(single);
          } catch (err) {
            if (list.length > 0) setSelectedOrder(list[0]);
          }
        } else if (list.length > 0) {
          setSelectedOrder(list[0]);
        }
      } catch (err) {
        console.error("Failed to load order history", err);
        setError("Please log in to view your order history.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [highlightOrderId]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7fafc]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Account Header */}
        <div className="bg-white border border-[#e3e8f0] p-6 rounded-2xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#2663eb] text-white rounded-full flex items-center justify-center text-xl font-bold">
              {user?.full_name ? user.full_name.charAt(0) : "U"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#171c29]">
                {user?.full_name || "Valued Customer"}
              </h2>
              <p className="text-xs text-[#707a8c]">
                {user?.email || "test@example.com"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#f7fafc] border border-[#e3e8f0] px-4 py-2 rounded-xl text-right">
              <span className="block text-xs font-semibold text-[#707a8c]">
                Loyalty Tier
              </span>
              <span className="text-sm font-bold text-[#eb9917]">
                Gold Member (450 pts)
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Orders List */}
          <div className="space-y-4">
            <h3 className="font-bold text-[#171c29] text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-[#2663eb]" />
              <span>Order History ({orders.length})</span>
            </h3>

            {loading ? (
              <div className="bg-white p-8 rounded-2xl border border-[#e3e8f0] text-center">
                <Loader className="w-6 h-6 animate-spin mx-auto text-[#2663eb] mb-2" />
                <p className="text-xs text-[#707a8c]">Loading past orders...</p>
              </div>
            ) : error ? (
              <div className="bg-[#fee2e2] text-[#db2626] p-4 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white border border-[#e3e8f0] p-8 rounded-2xl text-center space-y-3">
                <ShoppingBag className="w-10 h-10 text-[#707a8c] mx-auto" />
                <p className="font-bold text-[#171c29]">No orders placed yet</p>
                <Link
                  to="/"
                  className="inline-block text-xs text-[#2663eb] font-bold underline"
                >
                  Start Shopping Now
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedOrder?.id === ord.id
                        ? "border-[#2663eb] bg-white shadow-md ring-2 ring-[#2663eb]/20"
                        : "border-[#e3e8f0] bg-white hover:border-[#2663eb]/50"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-xs text-[#171c29]">
                        Order #{ord.id.substring(0, 8)}
                      </span>
                      <Badge
                        variant={
                          ord.status === "Delivered" ? "success" : "info"
                        }
                      >
                        {ord.status}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center text-xs text-[#707a8c]">
                      <span>
                        {new Date(ord.created_at).toLocaleDateString()}
                      </span>
                      <span className="font-bold text-[#171c29] text-sm">
                        ${Number(ord.total_amount).toFixed(2)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Selected Order Detail & Real-Time Tracking Stepper */}
          <div className="lg:col-span-2 space-y-6">
            {selectedOrder ? (
              <>
                {/* Real-time Tracking Stepper */}
                <TrackingStepper
                  currentStatus={selectedOrder.status || "Pending"}
                />

                {/* Order Details Breakdown */}
                <div className="bg-white border border-[#e3e8f0] p-6 rounded-2xl space-y-6">
                  <div className="flex justify-between items-start border-b border-[#e3e8f0] pb-4">
                    <div>
                      <h3 className="font-bold text-[#171c29] text-lg">
                        Order #{selectedOrder.id}
                      </h3>
                      <p className="text-xs text-[#707a8c] mt-1">
                        Placed on{" "}
                        {new Date(selectedOrder.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="success">{selectedOrder.status}</Badge>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h4 className="text-xs font-semibold text-[#707a8c] uppercase tracking-wider mb-1">
                      Shipping Address
                    </h4>
                    <p className="text-sm font-medium text-[#171c29]">
                      {selectedOrder.shipping_address}
                    </p>
                  </div>

                  {/* Order Line Items */}
                  {selectedOrder.items && selectedOrder.items.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-[#707a8c] uppercase tracking-wider mb-3">
                        Items Purchased ({selectedOrder.items.length})
                      </h4>
                      <div className="divide-y border border-[#e3e8f0] rounded-xl overflow-hidden">
                        {selectedOrder.items.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 bg-[#f7fafc] flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-[#171c29]">
                                {item.variant?.product?.title ||
                                  "Clothing Item"}
                              </span>
                              <span className="text-[#707a8c] ml-2">
                                (Qty: {item.quantity})
                              </span>
                            </div>
                            <span className="font-semibold text-[#171c29]">
                              $
                              {(
                                Number(item.unit_price) * item.quantity
                              ).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Financial Summary */}
                  <div className="bg-[#f7fafc] p-4 rounded-xl space-y-2 text-xs text-[#707a8c]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-[#171c29]">
                        ${Number(selectedOrder.subtotal).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping Fee</span>
                      <span className="font-medium text-[#171c29]">
                        ${Number(selectedOrder.shipping_fee).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax Amount</span>
                      <span className="font-medium text-[#171c29]">
                        ${Number(selectedOrder.tax_amount).toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-[#e3e8f0] pt-2 flex justify-between text-sm font-bold text-[#171c29]">
                      <span>
                        Total Paid ({selectedOrder.payment_method || "Card"})
                      </span>
                      <span className="text-[#2663eb]">
                        ${Number(selectedOrder.total_amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white border border-[#e3e8f0] p-12 rounded-2xl text-center text-[#707a8c]">
                Select an order from the history list to inspect real-time
                tracking and purchase details.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
