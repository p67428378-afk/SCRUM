import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Truck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ShoppingBag,
  MapPin,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { orderApi } from "../services/api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80";
const SVG_FALLBACK =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%23F7F7F5'/%3E%3Cg transform='translate(150, 150)' fill='%232E4F3D' opacity='0.25'%3E%3Cpath d='M40 80h220v80H40zM20 160h260v40H20zM30 200h30v60H30zM240 200h30v60h-30z'/%3E%3C/g%3E%3Ctext x='50%25' y='72%25' fill='%23737A75' font-family='sans-serif' font-size='20' font-weight='600' text-anchor='middle'%3EFurniCraft%3C/text%3E%3C/svg%3E";

export default function Checkout() {
  const navigate = useNavigate();
  const { user, addresses, addAddress } = useAuth();
  const { cart, fetchCart } = useCart();

  const handleImageError = (e) => {
    if (e.currentTarget.src !== FALLBACK_IMAGE) {
      e.currentTarget.src = FALLBACK_IMAGE;
    } else {
      e.currentTarget.src = SVG_FALLBACK;
    }
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);

  // Form State: Shipping Address
  const [shippingAddress, setShippingAddress] = useState({
    full_name: user?.full_name || "Jane Doe",
    address_line1: "123 Craftsman Way",
    address_line2: "Apt 4B",
    city: "San Francisco",
    state: "CA",
    postal_code: "94107",
    country: "US",
    phone: "555-019-2834",
  });

  // Form State: Delivery & Payment
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [paymentDetails, setPaymentDetails] = useState({
    cardholder_name: user?.full_name || "Jane Doe",
    card_number: "4242 •••• •••• 4242",
    card_expiry: "12/28",
    card_cvv: "888",
  });

  // Estimate calculation from API
  const [estimate, setEstimate] = useState(null);

  const items = cart.items || [];
  const subtotal = Number(cart.subtotal || 0);

  useEffect(() => {
    if (items.length === 0 && !createdOrder) {
      // If cart empty and order not yet placed, estimate is 0
    }
  }, [items, createdOrder]);

  // Update estimate on step change or shipping method change
  useEffect(() => {
    async function updateEstimate() {
      if (items.length === 0) return;
      try {
        const res = await orderApi.estimateCheckout({
          shipping_address: shippingAddress,
          coupon_code: cart.coupon_code,
          subtotal: subtotal,
          shipping_method: shippingMethod,
        });
        setEstimate(res.data);
      } catch {
        // Use cart totals as fallback estimate
      }
    }
    updateEstimate();
  }, [
    items.length,
    subtotal,
    shippingMethod,
    cart.coupon_code,
    shippingAddress,
  ]);

  const handleAddressChange = (field, val) => {
    setShippingAddress((prev) => ({ ...prev, [field]: val }));
  };

  const handlePaymentChange = (field, val) => {
    setPaymentDetails((prev) => ({ ...prev, [field]: val }));
  };

  const handleSelectSavedAddress = (addr) => {
    setShippingAddress({
      full_name: addr.full_name || "",
      address_line1: addr.address_line1 || "",
      address_line2: addr.address_line2 || "",
      city: addr.city || "",
      state: addr.state || "",
      postal_code: addr.postal_code || "",
      country: addr.country || "US",
      phone: addr.phone || "",
    });
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    setError(null);
    if (
      !shippingAddress.full_name ||
      !shippingAddress.address_line1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postal_code
    ) {
      setError("Please fill in all required shipping address fields.");
      return;
    }
    if (saveAddressToProfile && user) {
      addAddress(shippingAddress).catch(() => {});
    }
    setCurrentStep(2);
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    setError(null);
    setCurrentStep(3);
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      setError("Cannot place order with an empty shopping cart.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const orderPayload = {
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        card_number: paymentDetails.card_number,
        card_expiry: paymentDetails.card_expiry,
        card_cvv: paymentDetails.card_cvv,
        coupon_code: cart.coupon_code || null,
      };

      const res = await orderApi.createOrder(orderPayload);
      setCreatedOrder(res.data);
      await fetchCart(); // Refresh cart (will be empty)
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        "Failed to process order. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Confirmation Screen if order was placed
  if (createdOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-borderline rounded-2xl p-8 sm:p-12 text-center shadow-sm space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-textmain">
              Thank You for Your Order!
            </h1>
            <p className="text-xs text-textmuted max-w-md mx-auto">
              Your handcrafted furniture is being prepared with white-glove
              inspection. We&apos;ve sent an order receipt and tracking link to
              your email.
            </p>
          </div>

          {/* Tracking ID Box */}
          <div className="bg-bgsoft border border-borderline rounded-xl p-5 max-w-md mx-auto space-y-2 text-left">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-borderline">
              <span className="text-textmuted">Order ID:</span>
              <span className="font-mono font-bold text-textmain">
                {createdOrder.id.substring(0, 8)}...
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-borderline">
              <span className="text-textmuted">Tracking ID:</span>
              <span className="font-mono font-bold text-accent">
                {createdOrder.tracking_id}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-borderline">
              <span className="text-textmuted">Order Status:</span>
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded text-[11px] border border-amber-200">
                {createdOrder.status}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-textmuted">Total Paid:</span>
              <span className="font-bold text-base text-textmain">
                ${Number(createdOrder.total_amount).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Delivery Address Review */}
          <div className="text-xs text-textmuted max-w-md mx-auto text-left bg-white p-4 rounded-lg border border-borderline space-y-1">
            <div className="font-semibold text-textmain flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>Delivering to:</span>
            </div>
            <p className="text-textmain font-medium">
              {createdOrder.shipping_address?.full_name}
            </p>
            <p>
              {createdOrder.shipping_address?.address_line1}{" "}
              {createdOrder.shipping_address?.address_line2}
            </p>
            <p>
              {createdOrder.shipping_address?.city},{" "}
              {createdOrder.shipping_address?.state}{" "}
              {createdOrder.shipping_address?.postal_code}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              to="/orders"
              className="px-6 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover transition-colors shadow-sm"
            >
              View Order History & Tracking
            </Link>
            <Link
              to="/catalog"
              className="px-6 py-2.5 bg-bgsoft text-textmain text-xs font-semibold rounded-xl hover:bg-borderline transition-colors border border-borderline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty and no order placed
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-textmuted mx-auto" />
        <h2 className="text-xl font-bold text-textmain">Your Cart is Empty</h2>
        <p className="text-xs text-textmuted">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  const finalSubtotal = estimate?.subtotal ?? subtotal;
  const finalDiscount = estimate?.discount_amount ?? cart.discount_amount ?? 0;
  const finalTax = estimate?.tax_amount ?? subtotal * 0.08;
  const finalShipping =
    estimate?.shipping_amount ?? (subtotal >= 1000 ? 0 : 50);
  const finalTotal =
    estimate?.total_amount ??
    finalSubtotal - finalDiscount + finalTax + finalShipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-textmain">
          Checkout
        </h1>
        <p className="text-xs text-textmuted mt-1">
          Complete your shipping and payment information.
        </p>
      </div>

      {/* Stepper Header */}
      <div className="bg-white p-4 rounded-xl border border-borderline shadow-sm mb-8">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === 1
                  ? "bg-primary text-white"
                  : currentStep > 1
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {currentStep > 1 ? "✓" : "1"}
            </div>
            <span
              className={`text-xs font-semibold hidden sm:inline ${currentStep === 1 ? "text-textmain" : "text-textmuted"}`}
            >
              Shipping Address
            </span>
          </div>

          <div className="flex-1 h-0.5 mx-3 bg-borderline"></div>

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === 2
                  ? "bg-primary text-white"
                  : currentStep > 2
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {currentStep > 2 ? "✓" : "2"}
            </div>
            <span
              className={`text-xs font-semibold hidden sm:inline ${currentStep === 2 ? "text-textmain" : "text-textmuted"}`}
            >
              Payment & Delivery
            </span>
          </div>

          <div className="flex-1 h-0.5 mx-3 bg-borderline"></div>

          {/* Step 3 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === 3
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              3
            </div>
            <span
              className={`text-xs font-semibold hidden sm:inline ${currentStep === 3 ? "text-textmain" : "text-textmuted"}`}
            >
              Review & Place Order
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div
          className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs mb-6 flex items-center gap-2"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Step Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: Shipping Address Form */}
          {currentStep === 1 && (
            <form
              onSubmit={handleStep1Submit}
              className="bg-white p-6 sm:p-8 rounded-xl border border-borderline shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-borderline">
                <h2 className="text-base font-bold text-textmain flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>1. Shipping Address</span>
                </h2>
                {user && (
                  <span className="text-xs text-textmuted">
                    Logged in as {user.email}
                  </span>
                )}
              </div>

              {/* Saved Address Quick Selector if available */}
              {addresses.length > 0 && (
                <div className="space-y-2 pb-4 border-b border-borderline">
                  <span className="text-xs font-bold uppercase tracking-wider text-textmain block">
                    Saved Addresses:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {addresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => handleSelectSavedAddress(addr)}
                        className="text-left text-xs p-3 rounded-lg border border-borderline hover:border-primary bg-bgsoft transition-all"
                      >
                        <div className="font-semibold text-textmain">
                          {addr.full_name}
                        </div>
                        <div className="text-textmuted truncate">
                          {addr.address_line1}, {addr.city}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Address Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-textmain">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.full_name}
                    onChange={(e) =>
                      handleAddressChange("full_name", e.target.value)
                    }
                    className="w-full text-xs px-3 py-2 border border-borderline rounded-lg focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-textmain">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="123 Main Street"
                    value={shippingAddress.address_line1}
                    onChange={(e) =>
                      handleAddressChange("address_line1", e.target.value)
                    }
                    className="w-full text-xs px-3 py-2 border border-borderline rounded-lg focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-textmain">
                    Apartment, Suite, Unit (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Apt 4B"
                    value={shippingAddress.address_line2 || ""}
                    onChange={(e) =>
                      handleAddressChange("address_line2", e.target.value)
                    }
                    className="w-full text-xs px-3 py-2 border border-borderline rounded-lg focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-textmain">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value)
                    }
                    className="w-full text-xs px-3 py-2 border border-borderline rounded-lg focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-textmain">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.state}
                      onChange={(e) =>
                        handleAddressChange("state", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 border border-borderline rounded-lg focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-textmain">
                      Zip Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.postal_code}
                      onChange={(e) =>
                        handleAddressChange("postal_code", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 border border-borderline rounded-lg focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-textmain">
                    Country
                  </label>
                  <input
                    type="text"
                    disabled
                    value="United States (US)"
                    className="w-full text-xs px-3 py-2 border border-borderline bg-gray-50 text-textmuted rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-textmain">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="555-019-2834"
                    value={shippingAddress.phone || ""}
                    onChange={(e) =>
                      handleAddressChange("phone", e.target.value)
                    }
                    className="w-full text-xs px-3 py-2 border border-borderline rounded-lg focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              {user && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="saveAddress"
                    checked={saveAddressToProfile}
                    onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="saveAddress"
                    className="text-xs text-textmuted cursor-pointer"
                  >
                    Save this address to my profile for future orders
                  </label>
                </div>
              )}

              <div className="pt-4 flex justify-between items-center">
                <Link
                  to="/cart"
                  className="text-xs text-textmuted hover:text-primary flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Cart
                </Link>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover flex items-center gap-2 shadow-sm"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Shipping Method & Payment Form */}
          {currentStep === 2 && (
            <form
              onSubmit={handleStep2Submit}
              className="bg-white p-6 sm:p-8 rounded-xl border border-borderline shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-borderline">
                <h2 className="text-base font-bold text-textmain flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <span>2. Delivery & Payment</span>
                </h2>
              </div>

              {/* Delivery Speed Options */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-textmain">
                  Select Delivery Service:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                      shippingMethod === "standard"
                        ? "border-primary bg-primary-light/50 ring-1 ring-primary"
                        : "border-borderline bg-white hover:bg-bgsoft"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping_method"
                          value="standard"
                          checked={shippingMethod === "standard"}
                          onChange={() => setShippingMethod("standard")}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-xs font-bold text-textmain">
                          Standard White-Glove
                        </span>
                      </div>
                      <span className="text-xs font-bold text-primary">
                        {subtotal >= 1000 ? "FREE" : "$50.00"}
                      </span>
                    </div>
                    <p className="text-[11px] text-textmuted mt-2 ml-5">
                      Delivered in 5-8 business days with in-room assembly
                    </p>
                  </label>

                  <label
                    className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                      shippingMethod === "express"
                        ? "border-primary bg-primary-light/50 ring-1 ring-primary"
                        : "border-borderline bg-white hover:bg-bgsoft"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping_method"
                          value="express"
                          checked={shippingMethod === "express"}
                          onChange={() => setShippingMethod("express")}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-xs font-bold text-textmain">
                          Express Priority Freight
                        </span>
                      </div>
                      <span className="text-xs font-bold text-textmain">
                        $95.00
                      </span>
                    </div>
                    <p className="text-[11px] text-textmuted mt-2 ml-5">
                      Delivered in 2-4 business days with priority scheduled
                      slot
                    </p>
                  </label>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-textmain">
                  Payment Method:
                </label>
                <div className="flex gap-4">
                  <label
                    className={`flex-1 p-3.5 rounded-xl border cursor-pointer flex items-center justify-between ${
                      paymentMethod === "Credit Card"
                        ? "border-primary bg-primary-light/40 ring-1 ring-primary"
                        : "border-borderline"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="payment_method"
                        value="Credit Card"
                        checked={paymentMethod === "Credit Card"}
                        onChange={() => setPaymentMethod("Credit Card")}
                        className="text-primary"
                      />
                      <span className="text-xs font-semibold text-textmain">
                        Credit / Debit Card
                      </span>
                    </div>
                    <CreditCard className="w-4 h-4 text-primary" />
                  </label>

                  <label
                    className={`flex-1 p-3.5 rounded-xl border cursor-pointer flex items-center justify-between ${
                      paymentMethod === "PayPal"
                        ? "border-primary bg-primary-light/40 ring-1 ring-primary"
                        : "border-borderline"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="payment_method"
                        value="PayPal"
                        checked={paymentMethod === "PayPal"}
                        onChange={() => setPaymentMethod("PayPal")}
                        className="text-primary"
                      />
                      <span className="text-xs font-semibold text-textmain">
                        PayPal Checkout
                      </span>
                    </div>
                    <span className="text-xs font-bold text-blue-700 font-mono">
                      PayPal
                    </span>
                  </label>
                </div>
              </div>

              {/* Credit Card Input Fields */}
              {paymentMethod === "Credit Card" && (
                <div className="p-4 bg-bgsoft rounded-xl border border-borderline space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-textmain">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentDetails.cardholder_name}
                      onChange={(e) =>
                        handlePaymentChange("cardholder_name", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 bg-white border border-borderline rounded-lg focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-textmain">
                      Card Number
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentDetails.card_number}
                      onChange={(e) =>
                        handlePaymentChange("card_number", e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 bg-white border border-borderline rounded-lg font-mono focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-textmain">
                        Expiration (MM/YY)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="12/28"
                        value={paymentDetails.card_expiry}
                        onChange={(e) =>
                          handlePaymentChange("card_expiry", e.target.value)
                        }
                        className="w-full text-xs px-3 py-2 bg-white border border-borderline rounded-lg font-mono focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-textmain">
                        CVV Security Code
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="•••"
                        value={paymentDetails.card_cvv}
                        onChange={(e) =>
                          handlePaymentChange("card_cvv", e.target.value)
                        }
                        className="w-full text-xs px-3 py-2 bg-white border border-borderline rounded-lg font-mono focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-textmuted hover:text-primary flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Shipping
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover flex items-center gap-2 shadow-sm"
                >
                  <span>Review Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Review & Final Confirmation */}
          {currentStep === 3 && (
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-borderline shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-borderline">
                <h2 className="text-base font-bold text-textmain flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>3. Final Review & Confirm</span>
                </h2>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Shipping summary */}
                <div className="p-4 bg-bgsoft rounded-xl border border-borderline space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-textmain">
                      Shipping To:
                    </span>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-primary hover:underline text-[11px]"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="font-medium text-textmain">
                    {shippingAddress.full_name}
                  </p>
                  <p className="text-textmuted">
                    {shippingAddress.address_line1}{" "}
                    {shippingAddress.address_line2}
                  </p>
                  <p className="text-textmuted">
                    {shippingAddress.city}, {shippingAddress.state}{" "}
                    {shippingAddress.postal_code}
                  </p>
                  <p className="text-textmuted">{shippingAddress.phone}</p>
                </div>

                {/* Payment summary */}
                <div className="p-4 bg-bgsoft rounded-xl border border-borderline space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-textmain">
                      Payment & Delivery:
                    </span>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-primary hover:underline text-[11px]"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="font-medium text-textmain">{paymentMethod}</p>
                  {paymentMethod === "Credit Card" && (
                    <p className="text-textmuted font-mono">
                      {paymentDetails.card_number} (Exp:{" "}
                      {paymentDetails.card_expiry})
                    </p>
                  )}
                  <p className="text-textmuted capitalize">
                    Delivery: {shippingMethod} Freight
                  </p>
                </div>
              </div>

              {/* Items List Review */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-textmain block">
                  Cart Items ({items.length}):
                </span>
                <div className="divide-y divide-borderline border border-borderline rounded-xl overflow-hidden">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product?.image_url || FALLBACK_IMAGE}
                          alt={item.product?.name}
                          onError={handleImageError}
                          className="w-12 h-12 object-cover rounded bg-bgsoft"
                        />
                        <div>
                          <div className="font-semibold text-textmain">
                            {item.product?.name || "Furniture Item"}
                          </div>
                          <div className="text-textmuted text-[11px]">
                            {item.selected_finish} &bull;{" "}
                            {item.selected_dimension} &bull; Qty:{" "}
                            {item.quantity}
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-textmain">
                        ${(item.unit_price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-textmuted hover:text-primary flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Payment
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-xl shadow transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Placing Order..."
                    : `Authorize & Pay $${finalTotal.toFixed(2)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Sticky Price Breakdown */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-borderline shadow-sm space-y-4 sticky top-24">
            <h3 className="text-sm font-bold text-textmain pb-3 border-b border-borderline">
              Order Breakdown
            </h3>

            <div className="space-y-2.5 text-xs text-textmuted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-textmain">
                  ${finalSubtotal.toFixed(2)}
                </span>
              </div>

              {finalDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Promo Code Discount</span>
                  <span className="font-semibold">
                    -${finalDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Sales Tax</span>
                <span className="font-semibold text-textmain">
                  ${finalTax.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>White-Glove Freight</span>
                <span className="font-semibold text-textmain">
                  {finalShipping === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    `$${finalShipping.toFixed(2)}`
                  )}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-borderline flex justify-between items-baseline">
              <span className="text-sm font-bold text-textmain">Total USD</span>
              <span className="text-2xl font-bold text-textmain">
                ${finalTotal.toFixed(2)}
              </span>
            </div>

            <div className="bg-bgsoft p-3 rounded-lg text-[11px] text-textmuted space-y-1">
              <div className="flex items-center gap-1 font-semibold text-textmain">
                <Truck className="w-3.5 h-3.5 text-primary" />
                <span>Delivery Guarantee</span>
              </div>
              <p>
                Inspected and assembled upon delivery. 30-day money-back
                guarantee.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
