import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import AddressForm from "../components/checkout/AddressForm";
import { placeOrder, getAddresses, addAddress } from "../services/api";

export default function CheckoutPage({
  cartItems,
  onClearCart,
  specialInstructions,
}) {
  const navigate = useNavigate();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [deliveryAddressText, setDeliveryAddressText] = useState(
    "102 Sea View Apartments, Hill Road, Bandra West, Mumbai - 400050",
  );
  const [paymentMethod, setPaymentMethod] = useState("Credit/Debit Card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const deliveryFee = 3.0;
  const tax = subtotal * 0.05;
  const totalAmount = subtotal > 0 ? subtotal + deliveryFee + tax : 0;

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const addresses = await getAddresses();
      setSavedAddresses(addresses || []);
      if (addresses && addresses.length > 0) {
        const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
        setSelectedAddressId(defaultAddr.id);
        setDeliveryAddressText(
          `${defaultAddr.street_address}, ${defaultAddr.city} - ${defaultAddr.postal_code}`,
        );
      }
    } catch (err) {
      console.warn("Could not fetch saved addresses:", err);
    }
  };

  const handleSaveNewAddress = async (newAddrData) => {
    try {
      const created = await addAddress(newAddrData);
      setSavedAddresses((prev) => [...prev, created]);
      setSelectedAddressId(created.id);
      setDeliveryAddressText(
        `${created.street_address}, ${created.city} - ${created.postal_code}`,
      );
    } catch (err) {
      console.error("Error saving address:", err);
      throw err;
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }
    if (!deliveryAddressText.trim()) {
      setError("Please provide a valid delivery address");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const payload = {
        items: cartItems.map((i) => ({
          menu_item_id: i.id,
          quantity: i.quantity,
        })),
        delivery_address_text: deliveryAddressText,
        address_id: selectedAddressId || undefined,
        special_instructions: specialInstructions || undefined,
        payment_method: paymentMethod,
      };

      const res = await placeOrder(payload);
      if (res && res.id) {
        if (onClearCart) onClearCart();
        navigate(`/orders/${res.id}`);
      } else {
        throw new Error("Invalid order response received");
      }
    } catch (err) {
      console.error("Failed to place order:", err);
      const detail =
        err.response?.data?.detail ||
        err.message ||
        "Failed to place order. Please try again.";
      setError(typeof detail === "string" ? detail : JSON.stringify(detail));
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Your Cart is Empty</h2>
        <p className="text-gray-600 text-sm">
          Please select items from the digital menu before proceeding to
          checkout.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Menu
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Order Checkout</h1>
      </div>

      {/* Stepper Progress */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center justify-around text-xs font-bold">
        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCircle2 className="w-4 h-4" />
          <span>1. Cart</span>
        </div>
        <div className="h-0.5 w-12 bg-amber-500" />
        <div className="flex items-center gap-2 text-amber-700">
          <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">
            2
          </span>
          <span>2. Address & Payment</span>
        </div>
        <div className="h-0.5 w-12 bg-gray-200" />
        <div className="flex items-center gap-2 text-gray-400">
          <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px]">
            3
          </span>
          <span>3. Order Tracking</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Split Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Address & Payment */}
        <div className="lg:col-span-7 space-y-6">
          <AddressForm
            savedAddresses={savedAddresses}
            selectedAddressId={selectedAddressId}
            onSelectAddress={setSelectedAddressId}
            onSaveNewAddress={handleSaveNewAddress}
            deliveryAddressText={deliveryAddressText}
            onUpdateAddressText={setDeliveryAddressText}
          />

          {/* Payment Methods */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Payment Option
              </h3>
            </div>

            <div className="space-y-3">
              {[
                "Credit/Debit Card",
                "UPI / Net Banking",
                "Cash on Delivery",
              ].map((method) => (
                <label
                  key={method}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    paymentMethod === method
                      ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm font-semibold text-gray-900">
                      {method}
                    </span>
                  </div>
                  {method === "Cash on Delivery" && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Pay on Arrival
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Itemization Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
              Order Summary ({cartItems.reduce((a, b) => a + b.quantity, 0)}{" "}
              items)
            </h3>

            {/* Itemized List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex-1 pr-2">
                    <span className="font-semibold text-gray-800">
                      {item.quantity}x {item.name}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {specialInstructions && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 block mb-0.5">
                  Special Instructions:
                </span>
                <p className="text-amber-800 italic">{specialInstructions}</p>
              </div>
            )}

            {/* Price Calculations */}
            <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-900">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Flat Delivery Fee</span>
                <span className="font-bold text-amber-700">
                  ${deliveryFee.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Charges (5%)</span>
                <span className="font-semibold text-gray-900">
                  ${tax.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-bold text-gray-900">
                <span>Total Payable</span>
                <span className="text-amber-700">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 transition shadow-md active:scale-[0.98] ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading
                ? "Processing Order..."
                : `Place Order ($${totalAmount.toFixed(2)})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
