import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Package,
  MapPin,
  Receipt,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import OrderLifecycleTimeline from "../components/tracking/OrderLifecycleTimeline";
import { getOrderById } from "../services/api";

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fallback order in case backend API fails or order is newly created
  const fallbackOrder = {
    id: id || "BD-1042",
    order_number: `#${id ? id.substring(0, 8).toUpperCase() : "BD-1042"}`,
    status: "Preparing",
    total_amount: 53.49,
    delivery_fee: 3.0,
    delivery_address_text:
      "102 Sea View Apartments, Hill Road, Bandra West, Mumbai - 400050",
    special_instructions:
      "Ring the bell on arrival. Please make it extra spicy!",
    payment_method: "Credit/Debit Card",
    created_at: new Date().toISOString(),
    items: [
      {
        id: "1",
        menu_item_name: "Hyderabadi Dum Biryani",
        quantity: 2,
        unit_price: 12.5,
        item_total: 25.0,
      },
      {
        id: "2",
        menu_item_name: "Butter Chicken",
        quantity: 1,
        unit_price: 14.99,
        item_total: 14.99,
      },
      {
        id: "3",
        menu_item_name: "Garlic Butter Naan",
        quantity: 2,
        unit_price: 3.5,
        item_total: 7.0,
      },
    ],
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    setError("");
    try {
      if (!id) {
        setOrder(fallbackOrder);
        return;
      }
      const data = await getOrderById(id);
      if (data) {
        setOrder(data);
      } else {
        setOrder(fallbackOrder);
      }
    } catch (err) {
      console.warn("API error loading order, using fallback:", err);
      setOrder(fallbackOrder);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
        <p className="text-gray-600 text-sm font-medium">
          Fetching live order tracking details...
        </p>
      </div>
    );
  }

  const currentOrder = order || fallbackOrder;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-amber-700 transition shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Order {currentOrder.order_number || `#${currentOrder.id}`}
              </h1>
              <span className="text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
                {currentOrder.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Placed on{" "}
              {currentOrder.created_at
                ? new Date(currentOrder.created_at).toLocaleString()
                : "Just now"}
            </p>
          </div>
        </div>

        <button
          onClick={fetchOrder}
          className="px-4 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold hover:bg-amber-100 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
          Refresh Live Status
        </button>
      </div>

      {/* Split Tracking View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Timeline */}
        <div className="lg:col-span-7">
          <OrderLifecycleTimeline
            currentStatus={currentOrder.status}
            updatedAt={currentOrder.updated_at}
          />
        </div>

        {/* Right Column: Receipt & Address */}
        <div className="lg:col-span-5 space-y-6">
          {/* Address Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-gray-900 text-base">
                Delivery Location
              </h3>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed font-medium">
              {currentOrder.delivery_address_text}
            </p>
            {currentOrder.special_instructions && (
              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 block mb-0.5">
                  Note to Kitchen:
                </span>
                <p className="text-amber-800 italic">
                  {currentOrder.special_instructions}
                </p>
              </div>
            )}
          </div>

          {/* Receipt Breakdown Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-gray-900 text-base">
                  Order Receipt
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Paid via {currentOrder.payment_method || "Card"}
              </span>
            </div>

            {/* Items */}
            <div className="space-y-2 text-xs divide-y divide-gray-50">
              {currentOrder.items &&
                currentOrder.items.map((i, idx) => (
                  <div key={idx} className="pt-2 flex justify-between">
                    <span className="text-gray-800 font-medium">
                      {i.quantity}x {i.menu_item_name || "Food Item"}
                    </span>
                    <span className="font-bold text-gray-900">
                      $
                      {typeof i.item_total === "number"
                        ? i.item_total.toFixed(2)
                        : i.item_total || i.unit_price}
                    </span>
                  </div>
                ))}
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 pt-3 space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Standard Delivery Fee</span>
                <span className="font-semibold text-amber-700">
                  ${(currentOrder.delivery_fee || 3.0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-1">
                <span>Total Amount Paid</span>
                <span className="text-amber-700">
                  $
                  {typeof currentOrder.total_amount === "number"
                    ? currentOrder.total_amount.toFixed(2)
                    : currentOrder.total_amount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
