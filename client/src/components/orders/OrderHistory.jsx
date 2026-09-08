import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Package,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  CheckCircle,
  FileText,
  BookOpen,
} from "lucide-react";

export default function OrderHistory({ orders = [], loading = false }) {
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Delivered</span>
          </span>
        );
      case "shipped":
        return (
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
            <Package className="w-3.5 h-3.5" />
            <span>Shipped</span>
          </span>
        );
      default:
        return (
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{status || "Processing"}</span>
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2].map((n) => (
          <div
            key={n}
            className="bg-white p-6 rounded-xl border border-slate-200 h-32"
          />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Package className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-serif font-bold text-slate-800 mb-2">
          No Orders Found
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
          You haven&apos;t placed any orders yet. Once you complete a purchase,
          your itemized receipts and order tracking will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const isExpanded = expandedOrderId === order.id;
        const formattedDate = order.created_at
          ? new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Recent";

        const shipping = order.shipping_address || {};

        return (
          <div
            key={order.id}
            className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden transition-all"
          >
            {/* Summary Row */}
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <h3 className="font-serif font-bold text-lg text-brand-950">
                    Order #
                    {order.id ? order.id.slice(0, 8).toUpperCase() : "1001"}
                  </h3>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>Placed on: {formattedDate}</span>
                  <span>•</span>
                  <span>{order.order_items?.length || 0} item(s)</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400 block uppercase font-medium">
                    Total
                  </span>
                  <span className="text-lg font-bold text-slate-900 font-sans">
                    ${Number(order.total_amount || 0).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => toggleExpand(order.id)}
                  className="px-4 py-2 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-bold text-brand-950 hover:bg-slate-50 flex items-center space-x-1.5 transition-colors"
                  aria-expanded={isExpanded}
                >
                  <FileText className="w-3.5 h-3.5 text-accent" />
                  <span>{isExpanded ? "Hide Receipt" : "View Receipt"}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Collapsible Itemized Details */}
            {isExpanded && (
              <div className="bg-slate-50 p-5 sm:p-6 border-t border-slate-100 space-y-6 animate-fade-in">
                {/* Items breakdown */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Itemized Items
                  </h4>
                  <div className="space-y-3">
                    {order.order_items?.map((item) => {
                      const book = item.book || {};
                      return (
                        <div
                          key={item.id}
                          className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-14 bg-slate-100 rounded overflow-hidden flex-shrink-0 border border-slate-200">
                              {book.cover_image ? (
                                <img
                                  src={book.cover_image}
                                  alt={book.title || "Book cover"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-brand-950 text-accent">
                                  <BookOpen className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-serif font-bold text-sm text-slate-900 line-clamp-1">
                                {book.title || "Book Title"}
                              </p>
                              <p className="text-xs text-slate-500">
                                Qty: {item.quantity} × $
                                {Number(item.unit_price || 0).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-sm text-slate-900 font-sans">
                            $
                            {Number(
                              item.line_total ||
                                item.unit_price * item.quantity,
                            ).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery address & financial breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 border-t border-slate-200 text-xs">
                  <div>
                    <div className="flex items-center space-x-1.5 font-bold text-slate-800 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-brand-950" />
                      <span>Shipping Address</span>
                    </div>
                    <p className="text-slate-600">
                      {shipping.full_name || "N/A"}
                    </p>
                    <p className="text-slate-600">
                      {shipping.street_address || ""}
                    </p>
                    <p className="text-slate-600">
                      {[shipping.city, shipping.state, shipping.postal_code]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p className="text-slate-600">{shipping.country || ""}</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-1.5 text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-slate-900">
                        ${Number(order.subtotal || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (8%):</span>
                      <span className="font-semibold text-slate-900">
                        ${Number(order.tax_amount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span className="font-semibold text-slate-900">
                        ${Number(order.shipping_amount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-brand-950">
                      <span>Grand Total:</span>
                      <span>${Number(order.total_amount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

OrderHistory.propTypes = {
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      status: PropTypes.string,
      subtotal: PropTypes.number,
      tax_amount: PropTypes.number,
      shipping_amount: PropTypes.number,
      total_amount: PropTypes.number,
      created_at: PropTypes.string,
      shipping_address: PropTypes.object,
      order_items: PropTypes.array,
    }),
  ),
  loading: PropTypes.bool,
};
