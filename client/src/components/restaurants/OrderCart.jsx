import React, { useState } from "react";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function OrderCart({
  cart,
  restaurant,
  bookings,
  onUpdateQuantity,
  onRemoveFromCart,
  onPlaceOrder,
  onClearCart,
}) {
  const [bookingId, setBookingId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const cartItems = Object.values(cart);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Filter active bookings to show in dropdown
  const activeBookings = bookings.filter(
    (b) => b.status === "Checked In" || b.status === "Confirmed",
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const orderData = {
        restaurant_id: restaurant.id,
        booking_id: bookingId || null,
        notes: notes || null,
        items: cartItems.map((item) => ({
          menu_item_id: item.id,
          quantity: item.quantity,
        })),
      };

      await onPlaceOrder(orderData);
      setSuccess(true);
      onClearCart();
      setBookingId("");
      setNotes("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to place order. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">
          Order Placed Successfully!
        </h3>
        <p className="text-sm text-gray-500">
          The kitchen has received the order and is preparing it.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold text-sm transition-colors"
        >
          Place Another Order
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center py-12 space-y-3">
        <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto" />
        <h3 className="font-bold text-gray-900">Your Cart is Empty</h3>
        <p className="text-sm text-gray-500">
          Add delicious items from the menu to start ordering.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-indigo-600" />
          Your Order
        </h3>
        <button
          onClick={onClearCart}
          className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear All
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Cart Items List */}
      <div className="space-y-4 max-h-[240px] overflow-y-auto pr-1">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center text-sm"
          >
            <div className="flex-1 min-w-0 pr-2">
              <p className="font-semibold text-gray-900 truncate">
                {item.name}
              </p>
              <p className="text-xs text-gray-500">
                ${parseFloat(item.price).toFixed(2)} each
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  className="p-1 hover:bg-gray-50 text-gray-500"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="px-2 text-xs font-bold text-gray-700">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="p-1 hover:bg-gray-50 text-gray-500"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="font-bold text-gray-900 w-16 text-right">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Order Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 pt-4 border-t border-gray-100"
      >
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Associate with Room / Guest
          </label>
          <select
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Guest Booking (Optional)</option>
            {activeBookings.map((b) => (
              <option key={b.id} value={b.id}>
                Room {b.room?.room_number || "N/A"} - {b.guest_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Special Instructions
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g., No onions, extra spicy, deliver to room balcony..."
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-16 resize-none"
          />
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Delivery Fee</span>
            <span className="text-emerald-600 font-semibold">FREE</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
            <span>Total Price</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-bold text-sm shadow-sm transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              Place Order
            </>
          )}
        </button>
      </form>
    </div>
  );
}
