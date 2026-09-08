import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  Lock,
  Truck,
  ArrowLeft,
} from "lucide-react";
import { orderService } from "../../services/api";

export default function CheckoutForm({
  user,
  cart,
  onOrderCompleted,
  onBackToCart,
}) {
  const [currentStep, setCurrentStep] = useState(2); // 2: Shipping, 3: Payment, 4: Confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completedOrder, setCompletedOrder] = useState(null);

  // Shipping form state
  const [shippingAddress, setShippingAddress] = useState({
    full_name: user?.full_name || "Alex Morgan",
    street_address: "123 Tech Blvd, Suite 400",
    city: "San Francisco",
    state: "CA",
    postal_code: "94105",
    country: "US",
    phone: "555-019-2834",
  });

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState({
    card_holder: user?.full_name || "Alex Morgan",
    card_number: "4242 •••• •••• 4242",
    card_number_last4: "4242",
    expiry: "12/28",
    cvv: "123",
    payment_type: "Credit Card",
  });

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentMethod((prev) => ({ ...prev, [name]: value }));
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (
      !shippingAddress.full_name ||
      !shippingAddress.street_address ||
      !shippingAddress.city ||
      !shippingAddress.postal_code
    ) {
      setError("Please fill in all required shipping fields.");
      return;
    }
    setError("");
    setCurrentStep(3);
  };

  const handleCompletePurchase = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const order = await orderService.checkout(shippingAddress, {
        card_holder: paymentMethod.card_holder,
        card_number_last4: paymentMethod.card_number_last4 || "4242",
        payment_type: paymentMethod.payment_type || "Credit Card",
      });
      setCompletedOrder(order);
      setCurrentStep(4);
      if (onOrderCompleted) {
        onOrderCompleted(order);
      }
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Failed to complete checkout. Please check your details and try again.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
      {/* 4-Step Stepper Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto text-xs sm:text-sm font-bold border-b border-slate-200 pb-4">
          <button
            type="button"
            onClick={onBackToCart}
            className="text-slate-500 hover:text-slate-800 flex items-center space-x-1"
          >
            <span>1. Cart Review</span>
          </button>
          <span className="text-slate-300">→</span>
          <span
            className={
              currentStep === 2
                ? "text-brand-950 border-b-2 border-brand-950 pb-1 font-extrabold"
                : currentStep > 2
                  ? "text-emerald-700"
                  : "text-slate-400"
            }
          >
            2. Shipping
          </span>
          <span className="text-slate-300">→</span>
          <span
            className={
              currentStep === 3
                ? "text-brand-950 border-b-2 border-brand-950 pb-1 font-extrabold"
                : currentStep > 3
                  ? "text-emerald-700"
                  : "text-slate-400"
            }
          >
            3. Payment
          </span>
          <span className="text-slate-300">→</span>
          <span
            className={
              currentStep === 4
                ? "text-brand-950 border-b-2 border-brand-950 pb-1 font-extrabold"
                : "text-slate-400"
            }
          >
            4. Confirmation
          </span>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3 shadow-sm"
        >
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600" />
          <div>
            <h4 className="font-bold text-red-800">Checkout Error</h4>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* STEP 2: Shipping Form */}
      {currentStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 mb-6">
              <Truck className="w-5 h-5 text-brand-950" />
              <h2 className="text-xl font-serif font-bold text-slate-900">
                Shipping Address
              </h2>
            </div>

            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div>
                <label
                  className="block text-xs font-bold text-slate-700 uppercase mb-1"
                  htmlFor="ship-name"
                >
                  Recipient Full Name *
                </label>
                <input
                  id="ship-name"
                  name="full_name"
                  type="text"
                  required
                  value={shippingAddress.full_name}
                  onChange={handleShippingChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-950"
                  placeholder="e.g. Alex Morgan"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-bold text-slate-700 uppercase mb-1"
                  htmlFor="ship-street"
                >
                  Street Address *
                </label>
                <input
                  id="ship-street"
                  name="street_address"
                  type="text"
                  required
                  value={shippingAddress.street_address}
                  onChange={handleShippingChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-950"
                  placeholder="e.g. 123 Tech Blvd, Suite 400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    className="block text-xs font-bold text-slate-700 uppercase mb-1"
                    htmlFor="ship-city"
                  >
                    City *
                  </label>
                  <input
                    id="ship-city"
                    name="city"
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={handleShippingChange}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-950"
                    placeholder="San Francisco"
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-bold text-slate-700 uppercase mb-1"
                    htmlFor="ship-state"
                  >
                    State / Province *
                  </label>
                  <input
                    id="ship-state"
                    name="state"
                    type="text"
                    required
                    value={shippingAddress.state}
                    onChange={handleShippingChange}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-950"
                    placeholder="CA"
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-bold text-slate-700 uppercase mb-1"
                    htmlFor="ship-zip"
                  >
                    Postal Code *
                  </label>
                  <input
                    id="ship-zip"
                    name="postal_code"
                    type="text"
                    required
                    value={shippingAddress.postal_code}
                    onChange={handleShippingChange}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-950"
                    placeholder="94105"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs font-bold text-slate-700 uppercase mb-1"
                    htmlFor="ship-country"
                  >
                    Country
                  </label>
                  <input
                    id="ship-country"
                    name="country"
                    type="text"
                    value={shippingAddress.country}
                    onChange={handleShippingChange}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-950"
                    placeholder="US"
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-bold text-slate-700 uppercase mb-1"
                    htmlFor="ship-phone"
                  >
                    Phone Number
                  </label>
                  <input
                    id="ship-phone"
                    name="phone"
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={handleShippingChange}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-950"
                    placeholder="(555) 000-0000"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onBackToCart}
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Cart</span>
                </button>
                <button
                  type="submit"
                  className="py-3 px-6 bg-accent hover:bg-accent-hover text-slate-950 font-bold rounded-lg transition-colors shadow-md text-sm"
                >
                  Continue to Payment →
                </button>
              </div>
            </form>
          </div>

          {/* Cart Summary Card */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-3 text-sm">
              <h3 className="font-serif font-bold text-base text-slate-900 pb-2 border-b">
                Order Breakdown
              </h3>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({cart?.item_count || 0} items)</span>
                <span className="font-semibold text-slate-900">
                  ${Number(cart?.subtotal || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (8%)</span>
                <span className="font-semibold text-slate-900">
                  ${Number(cart?.estimated_tax || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-semibold text-slate-900">
                  {cart?.estimated_shipping === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `$${Number(cart?.estimated_shipping || 5).toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="pt-3 border-t flex justify-between font-bold text-lg text-brand-950 font-serif">
                <span>Total</span>
                <span>${Number(cart?.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Payment Form */}
      {currentStep === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 mb-6">
              <CreditCard className="w-5 h-5 text-brand-950" />
              <h2 className="text-xl font-serif font-bold text-slate-900">
                Payment Details
              </h2>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Encrypted 256-Bit SSL Payment Processing</span>
              </div>
              <span className="font-semibold text-brand-950">
                Test Mode Active
              </span>
            </div>

            <form onSubmit={handleCompletePurchase} className="space-y-4">
              <div>
                <label
                  className="block text-xs font-bold text-slate-700 uppercase mb-1"
                  htmlFor="cardHolder"
                >
                  Cardholder Name
                </label>
                <input
                  id="cardHolder"
                  name="card_holder"
                  type="text"
                  required
                  value={paymentMethod.card_holder}
                  onChange={handlePaymentChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-950"
                  placeholder="Name on card"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-bold text-slate-700 uppercase mb-1"
                  htmlFor="cardNumber"
                >
                  Card Number
                </label>
                <input
                  id="cardNumber"
                  name="card_number"
                  type="text"
                  required
                  value={paymentMethod.card_number}
                  onChange={handlePaymentChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-950"
                  placeholder="4242 4242 4242 4242"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs font-bold text-slate-700 uppercase mb-1"
                    htmlFor="expiry"
                  >
                    Expiration (MM/YY)
                  </label>
                  <input
                    id="expiry"
                    name="expiry"
                    type="text"
                    required
                    value={paymentMethod.expiry}
                    onChange={handlePaymentChange}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-950"
                    placeholder="MM/YY"
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-bold text-slate-700 uppercase mb-1"
                    htmlFor="cvv"
                  >
                    CVV
                  </label>
                  <input
                    id="cvv"
                    name="cvv"
                    type="password"
                    maxLength="4"
                    required
                    value={paymentMethod.cvv}
                    onChange={handlePaymentChange}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-950"
                    placeholder="123"
                  />
                </div>
              </div>

              {/* Shipping Summary */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 text-slate-600">
                <span className="font-bold text-slate-900 block">
                  Delivering to:
                </span>
                <p>{shippingAddress.full_name}</p>
                <p>
                  {shippingAddress.street_address}, {shippingAddress.city},{" "}
                  {shippingAddress.state} {shippingAddress.postal_code}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Shipping</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="py-3 px-8 bg-accent hover:bg-accent-hover text-slate-950 font-bold rounded-lg transition-colors shadow-md text-sm disabled:opacity-50 active:scale-[0.99]"
                >
                  {loading
                    ? "Processing Order..."
                    : `Complete Purchase ($${Number(cart?.total_amount || 0).toFixed(2)})`}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-3 text-sm">
              <h3 className="font-serif font-bold text-base text-slate-900 pb-2 border-b">
                Order Summary
              </h3>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  ${Number(cart?.subtotal || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (8%)</span>
                <span className="font-semibold text-slate-900">
                  ${Number(cart?.estimated_tax || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-semibold text-slate-900">
                  {cart?.estimated_shipping === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `$${Number(cart?.estimated_shipping || 5).toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="pt-3 border-t flex justify-between font-bold text-lg text-brand-950 font-serif">
                <span>Total</span>
                <span>${Number(cart?.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Confirmation Screen */}
      {currentStep === 4 && completedOrder && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
            Thank You for Your Order!
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Your order has been received and is currently being processed. A
            confirmation has been recorded in your account.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left mb-6 space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Order Reference:</span>
              <span className="font-mono font-bold text-brand-950">
                {completedOrder.id}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Status:</span>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {completedOrder.status}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Items Ordered:</span>
              <span className="font-bold text-slate-800">
                {completedOrder.order_items
                  ? completedOrder.order_items.length
                  : 0}{" "}
                titles
              </span>
            </div>
            <div className="flex justify-between font-bold text-base text-slate-900 pt-1">
              <span>Total Paid:</span>
              <span className="text-brand-950 font-serif">
                ${Number(completedOrder.total_amount).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => (window.location.href = "/account")}
              className="py-2.5 px-6 bg-brand-950 hover:bg-brand-900 text-white font-bold rounded-lg text-sm transition-colors"
            >
              View in Order History
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="py-2.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-sm transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

CheckoutForm.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    email: PropTypes.string,
    full_name: PropTypes.string,
  }),
  cart: PropTypes.shape({
    id: PropTypes.string,
    item_count: PropTypes.number,
    subtotal: PropTypes.number,
    estimated_tax: PropTypes.number,
    estimated_shipping: PropTypes.number,
    total_amount: PropTypes.number,
    items: PropTypes.array,
  }),
  onOrderCompleted: PropTypes.func,
  onBackToCart: PropTypes.func.isRequired,
};
