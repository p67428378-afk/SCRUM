import React, { useState } from "react";
import { Receipt, Trash2, CheckCircle, AlertCircle } from "lucide-react";

export default function OrderCartTicket({
  cartItems = [],
  onRemoveItem,
  onClearCart,
  onCheckout,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successOrder, setSuccessOrder] = useState(null);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.total_price || item.item_price * item.quantity),
    0,
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // Calculate leaf deduction estimates (e.g. 5g tea leaves per item)
  const estimatedLeavesGrams = cartItems.reduce(
    (sum, item) => sum + item.quantity * 5,
    0,
  );

  const handleProcessOrder = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const orderPayload = {
        items: cartItems.map((item) => ({
          tea_id: item.tea_id,
          quantity: item.quantity,
          sweetness_level: item.sweetness_level,
          temperature: item.temperature,
          milk_option: item.milk_option,
          add_ons: item.add_ons || [],
        })),
      };
      const result = await onCheckout(orderPayload);
      setSuccessOrder(result);
      onClearCart();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to process order payment.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between h-full">
      <div>
        <div className="border-b border-gray-200 pb-3 mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-gray-900">
              3. Order Ticket
            </h2>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successOrder && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Order Placed Successfully!</span>
              <p className="text-[11px] text-emerald-700">
                Ticket #
                {successOrder.order_number || successOrder.id?.slice(0, 8)}
              </p>
            </div>
          </div>
        )}

        {/* Cart items list */}
        {cartItems.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            Cart is empty. Add customized drinks to ticket.
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {cartItems.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-start"
              >
                <div className="pr-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      {item.quantity}x
                    </span>
                    <span className="font-bold text-gray-900 text-xs">
                      {item.tea_name}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {item.sweetness_level} Sweet | {item.temperature} |{" "}
                    {item.milk_option} Milk
                    {item.add_ons &&
                      item.add_ons.length > 0 &&
                      ` | ${item.add_ons.join(", ")}`}
                  </p>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className="font-bold text-xs text-gray-900">
                    $
                    {(
                      item.total_price || item.item_price * item.quantity
                    ).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(index)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totals & Checkout */}
      {cartItems.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 mb-3 text-[11px] text-amber-900 flex items-center justify-between">
            <span>Automated Leaf Deduction:</span>
            <span className="font-bold text-red-700">
              -{estimatedLeavesGrams}g tea stock
            </span>
          </div>

          <div className="space-y-1 text-xs text-gray-600 mb-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium text-gray-900">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8%):</span>
              <span className="font-medium text-gray-900">
                ${tax.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span className="text-emerald-700">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleProcessOrder}
            className="w-full py-3 bg-emerald-800 text-white font-bold text-sm rounded-xl hover:bg-emerald-900 transition flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
          >
            {loading
              ? "Processing Payment..."
              : `Process Payment & Complete ($${total.toFixed(2)})`}
          </button>
        </div>
      )}
    </div>
  );
}
