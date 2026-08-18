import React, { useState } from "react";
import { createOrder } from "../../services/api";
import Card from "../common/Card";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function OrderSummary({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderCreated,
}) {
  const [orderType, setOrderType] = useState("Instant");
  const [customerName, setCustomerName] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setError("Please add at least one item to the cart.");
      return;
    }

    if (orderType === "Pre-Order" && !pickupDate) {
      setError("Pickup date and time are required for Pre-Orders.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const payload = {
      customer_name:
        customerName ||
        (orderType === "Instant" ? "Counter Customer" : "Pre-Order Customer"),
      order_type: orderType,
      pickup_date: pickupDate ? new Date(pickupDate).toISOString() : null,
      items: cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    };

    try {
      const createdOrder = await createOrder(payload);
      setSuccessMessage(
        `Order #${createdOrder.id.substring(0, 8)} successfully submitted!`,
      );
      onClearCart();
      setCustomerName("");
      setPickupDate("");
      if (onOrderCreated) onOrderCreated(createdOrder);
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to process order. Check ingredient inventory levels.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      title="Current Order & Checkout"
      subtitle="Review cart items and process transaction"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-[#D92D2D] rounded-md text-xs flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#1F9E4D] rounded-md text-xs flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Cart Item List */}
        {cartItems.length > 0 ? (
          <div className="divide-y divide-[#E5DED1] border border-[#E5DED1] rounded-md overflow-hidden bg-[#FAF7F2]">
            {cartItems.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="p-3 flex items-center justify-between text-xs"
              >
                <div className="flex-1 pr-2">
                  <div className="font-bold text-[#1F1A14]">{product.name}</div>
                  <div className="text-[#80756B]">
                    ${product.price.toFixed(2)} each
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                    className="p-1 bg-white border border-[#E5DED1] rounded hover:bg-[#F5F2EB]"
                  >
                    <Minus className="w-3 h-3 text-[#1F1A14]" />
                  </button>
                  <span className="font-bold w-5 text-center text-[#1F1A14]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                    className="p-1 bg-white border border-[#E5DED1] rounded hover:bg-[#F5F2EB]"
                  >
                    <Plus className="w-3 h-3 text-[#1F1A14]" />
                  </button>
                </div>

                <div className="w-16 text-right font-bold text-[#1F1A14]">
                  ${(product.price * quantity).toFixed(2)}
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveItem(product.id)}
                  className="ml-2 text-[#D92D2D] hover:text-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[#80756B] bg-[#FAF7F2] border border-dashed border-[#E5DED1] rounded-md">
            <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-[#80756B]/50" />
            <p className="text-xs">Your cart is currently empty.</p>
            <p className="text-[11px] text-[#80756B] mt-1">
              Select items from the list on the left to begin.
            </p>
          </div>
        )}

        {/* Order Details Form */}
        <form onSubmit={handleCheckout} className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-[#1F1A14] mb-1">
                Order Type
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-[#E5DED1] rounded-md focus:outline-none focus:ring-1 focus:ring-[#D96B1F]"
              >
                <option value="Instant">Instant POS Sale</option>
                <option value="Pre-Order">Customer Pre-Order</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1F1A14] mb-1">
                Customer Name
              </label>
              <input
                type="text"
                placeholder="Optional"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-[#E5DED1] rounded-md focus:outline-none focus:ring-1 focus:ring-[#D96B1F]"
              />
            </div>
          </div>

          {orderType === "Pre-Order" && (
            <div>
              <label className="block text-xs font-medium text-[#1F1A14] mb-1">
                Pickup Date & Time *
              </label>
              <input
                type="datetime-local"
                required={orderType === "Pre-Order"}
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-[#E5DED1] rounded-md focus:outline-none focus:ring-1 focus:ring-[#D96B1F]"
              />
            </div>
          )}

          {/* Subtotal & Total */}
          <div className="border-t border-[#E5DED1] pt-3 space-y-1">
            <div className="flex justify-between text-xs text-[#80756B]">
              <span>Subtotal:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#1F1A14]">
              <span>Total Amount:</span>
              <span className="text-[#D96B1F]">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={cartItems.length === 0 || submitting}
            className="w-full py-2.5 bg-[#D96B1F] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#B85310] disabled:bg-[#80756B]/40 transition-colors shadow"
          >
            {submitting ? "Processing Transaction..." : "Complete & Pay Order"}
          </button>
        </form>
      </div>
    </Card>
  );
}
