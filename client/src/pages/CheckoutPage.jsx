import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import CartItemRow from "../components/cart/CartItemRow";
import OrderSummary from "../components/cart/OrderSummary";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { checkout } from "../services/api";
import Button from "../components/common/Button";
import {
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

export default function CheckoutPage() {
  const { cart, updateQuantity, removeItem, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.full_name || "Alex Smith",
    email: user?.email || "alex.smith@example.com",
    street: "123 Fashion Street, Suite 400",
    city: "New York",
    state: "NY",
    zip: "10001",
  });

  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddressChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("Please log in or register before completing checkout.");
      return;
    }

    if (cart.items.length === 0) {
      setError("Your shopping cart is empty.");
      return;
    }

    const formattedAddress = `${shippingAddress.fullName}, ${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip} (${shippingAddress.email})`;

    setLoading(true);
    try {
      const order = await checkout({
        shipping_address: formattedAddress,
        payment_method: paymentMethod,
      });
      await refreshCart();
      navigate(`/orders?new_order_id=${order.id}`);
    } catch (err) {
      console.error("Checkout failed", err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Checkout failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7fafc]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-[#707a8c] hover:text-[#2663eb] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Continue Shopping
        </Link>

        <h1 className="text-2xl lg:text-3xl font-bold text-[#171c29] mb-6 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-[#2663eb]" />
          <span>
            Your Shopping Cart ({cart.items.reduce((s, i) => s + i.quantity, 0)}{" "}
            Items)
          </span>
        </h1>

        {cart.items.length === 0 ? (
          <div className="bg-white border border-[#e3e8f0] rounded-2xl p-12 text-center space-y-4">
            <p className="text-xl font-bold text-[#171c29]">
              Your shopping cart is currently empty
            </p>
            <p className="text-sm text-[#707a8c]">
              Explore our catalog to add clothes and accessories.
            </p>
            <Link
              to="/"
              className="inline-block bg-[#2663eb] text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-[#1d4ed8]"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Items & Shipping Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Line Items List */}
              <div className="space-y-3">
                <h3 className="font-bold text-[#171c29] text-lg">Cart Items</h3>
                {cart.items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>

              {/* Shipping Address Form */}
              <div className="bg-white border border-[#e3e8f0] p-6 rounded-2xl space-y-4">
                <h3 className="font-bold text-[#171c29] text-lg border-b border-[#e3e8f0] pb-3">
                  Shipping Details
                </h3>

                <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#707a8c] mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleAddressChange}
                      className="w-full bg-[#f7fafc] border border-[#e3e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2663eb]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#707a8c] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={shippingAddress.email}
                      onChange={handleAddressChange}
                      className="w-full bg-[#f7fafc] border border-[#e3e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2663eb]"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#707a8c] mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={shippingAddress.street}
                      onChange={handleAddressChange}
                      className="w-full bg-[#f7fafc] border border-[#e3e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2663eb]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#707a8c] mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleAddressChange}
                      className="w-full bg-[#f7fafc] border border-[#e3e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2663eb]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#707a8c] mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleAddressChange}
                        className="w-full bg-[#f7fafc] border border-[#e3e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2663eb]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#707a8c] mb-1">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        name="zip"
                        value={shippingAddress.zip}
                        onChange={handleAddressChange}
                        className="w-full bg-[#f7fafc] border border-[#e3e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2663eb]"
                        required
                      />
                    </div>
                  </div>
                </form>
              </div>

              {/* Payment Method Selector */}
              <div className="bg-white border border-[#e3e8f0] p-6 rounded-2xl space-y-4">
                <h3 className="font-bold text-[#171c29] text-lg border-b border-[#e3e8f0] pb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#2663eb]" />
                  <span>Payment Selection</span>
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {["Credit Card", "PayPal", "Apple Pay"].map((method) => (
                    <label
                      key={method}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        paymentMethod === method
                          ? "border-[#2663eb] bg-[#e0e7ff]/30 text-[#2663eb] font-bold"
                          : "border-[#e3e8f0] bg-[#f7fafc] text-[#171c29]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        className="text-[#2663eb] focus:ring-[#2663eb]"
                      />
                      <span className="text-sm">{method}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary Sidebar */}
            <div>
              <div className="sticky top-24 space-y-4">
                <OrderSummary
                  subtotal={cart.subtotal}
                  shippingEstimate={cart.shipping_estimate}
                  taxEstimate={cart.tax_estimate}
                  total={cart.total}
                  onProceedToCheckout={handleCheckoutSubmit}
                  loading={loading}
                />

                {!user && (
                  <div className="bg-[#fef3c7] border border-[#eb9917] p-4 rounded-xl text-xs text-[#eb9917] space-y-2">
                    <p className="font-bold flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Account Login Required
                    </p>
                    <p>
                      Please log in to complete checkout and save your order
                      history.
                    </p>
                    <Link
                      to="/login"
                      className="underline font-bold text-[#171c29]"
                    >
                      Click here to Sign In / Register
                    </Link>
                  </div>
                )}

                {error && (
                  <div className="bg-[#fee2e2] border border-[#db2626] p-4 rounded-xl text-xs text-[#db2626]">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-xs text-[#707a8c]">
                  <ShieldCheck className="w-4 h-4 text-[#17a34a]" />
                  <span>256-bit SSL Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
