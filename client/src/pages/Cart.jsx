import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  Tag,
  Truck,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cart, updateQuantity, removeItem, clearCart, applyCoupon } =
    useCart();
  const [couponInput, setCouponInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const navigate = useNavigate();

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    await applyCoupon(couponInput.trim());
    setIsApplyingCoupon(false);
    setCouponInput("");
  };

  const items = cart.items || [];
  const subtotal = Number(cart.subtotal || 0);
  const discountAmount = Number(cart.discount_amount || 0);
  const taxAmount = Number(cart.tax_amount || 0);
  const shippingAmount = Number(cart.shipping_amount || 0);
  const totalAmount = Number(cart.total_amount || 0);

  // Free shipping progress calculation
  const freeShippingThreshold = 1000;
  const amountNeededForFreeShipping = Math.max(
    0,
    freeShippingThreshold - subtotal,
  );
  const freeShippingProgress = Math.min(
    100,
    (subtotal / freeShippingThreshold) * 100,
  );

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white border border-borderline rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 bg-bgsoft text-textmuted rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-textmain">
            Your Shopping Cart is Empty
          </h2>
          <p className="text-xs text-textmuted">
            Looks like you haven&apos;t added any handcrafted furniture items to
            your cart yet.
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-textmain">
            Shopping Cart
          </h1>
          <p className="text-xs text-textmuted mt-1">
            Review your customized furniture selections before secure checkout.
          </p>
        </div>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Free Delivery Bar */}
          <div className="bg-white p-4 rounded-xl border border-borderline shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-textmain mb-1.5">
              <div className="flex items-center gap-1.5 text-primary">
                <Truck className="w-4 h-4" />
                <span>
                  {amountNeededForFreeShipping === 0
                    ? "🎉 You unlocked Free White-Glove Delivery!"
                    : `Add $${amountNeededForFreeShipping.toFixed(2)} more for Free White-Glove Delivery`}
                </span>
              </div>
              <span className="text-textmuted">
                {Math.round(freeShippingProgress)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Items Container */}
          <div className="bg-white rounded-xl border border-borderline shadow-sm divide-y divide-borderline">
            {items.map((item) => {
              const product = item.product || {};
              const itemTotal = Number(item.unit_price) * item.quantity;
              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                >
                  {/* Thumbnail & Meta */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-bgsoft border border-borderline flex-shrink-0">
                      <img
                        src={
                          product.image_url ||
                          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"
                        }
                        alt={product.name || "Furniture Item"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <Link
                        to={`/product/${item.product_id}`}
                        className="text-sm font-semibold text-textmain hover:text-primary transition-colors line-clamp-1"
                      >
                        {product.name || "Handcrafted Furniture"}
                      </Link>
                      <div className="text-xs text-textmuted space-y-0.5">
                        {item.selected_finish && (
                          <div>
                            Finish:{" "}
                            <span className="text-textmain font-medium">
                              {item.selected_finish}
                            </span>
                          </div>
                        )}
                        {item.selected_dimension && (
                          <div>
                            Size:{" "}
                            <span className="text-textmain font-medium">
                              {item.selected_dimension}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-textmain sm:hidden">
                        ${Number(item.unit_price).toFixed(2)} each
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-borderline">
                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-borderline rounded-lg bg-white overflow-hidden">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1),
                            item.selected_finish,
                            item.selected_dimension,
                          )
                        }
                        className="px-2.5 py-1 text-xs font-bold text-textmuted hover:bg-bgsoft"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-textmain min-w-[28px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.quantity + 1,
                            item.selected_finish,
                            item.selected_dimension,
                          )
                        }
                        className="px-2.5 py-1 text-xs font-bold text-textmuted hover:bg-bgsoft"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Price Column */}
                    <div className="text-right min-w-[80px]">
                      <span className="text-sm font-bold text-textmain block">
                        ${itemTotal.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-textmuted hidden sm:block">
                        ${Number(item.unit_price).toFixed(2)}/ea
                      </span>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-textmuted hover:text-danger rounded-md transition-colors"
                      title="Remove from cart"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clear Cart Button */}
          <div className="flex justify-end">
            <button
              onClick={clearCart}
              className="text-xs text-danger hover:underline font-medium flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Shopping Cart</span>
            </button>
          </div>
        </div>

        {/* Right Col: Promo Code & Order Summary */}
        <div className="space-y-6">
          {/* Promo Code Card */}
          <div className="bg-white p-5 rounded-xl border border-borderline shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-textmain">
              <Tag className="w-4 h-4 text-accent" />
              <span>Promotional Discount Code</span>
            </div>
            <form onSubmit={handleCouponSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. FURNITURE20"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="flex-1 text-xs px-3 py-2 border border-borderline rounded-lg focus:outline-none focus:ring-1 focus:ring-primary uppercase font-mono"
              />
              <button
                type="submit"
                disabled={isApplyingCoupon || !couponInput.trim()}
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors"
              >
                {isApplyingCoupon ? "Applying..." : "Apply"}
              </button>
            </form>

            {/* Quick coupon tags */}
            <div className="pt-2 border-t border-borderline">
              <span className="text-[11px] text-textmuted block mb-1.5">
                Available promo codes:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {["FURNITURE20", "WELCOME15", "SAVE10"].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => applyCoupon(code)}
                    className="text-[10px] font-mono font-bold bg-bgsoft hover:bg-accent hover:text-white text-textmain px-2 py-0.5 rounded border border-borderline transition-colors"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {cart.coupon_code && (
              <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-lg text-xs flex items-center justify-between border border-emerald-200">
                <span>
                  Code <strong>{cart.coupon_code}</strong> applied (
                  {cart.discount_percent}% off)
                </span>
                <span className="font-bold">-${discountAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Order Summary Card */}
          <div className="bg-white p-6 rounded-xl border border-borderline shadow-sm space-y-4">
            <h2 className="text-base font-bold text-textmain pb-3 border-b border-borderline">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs text-textmuted">
              <div className="flex justify-between">
                <span>Cart Subtotal</span>
                <span className="font-semibold text-textmain">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount ({cart.discount_percent}%)</span>
                  <span className="font-semibold">
                    -${discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Sales Tax (8%)</span>
                <span className="font-semibold text-textmain">
                  ${taxAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-textmain">
                  {shippingAmount === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    `$${shippingAmount.toFixed(2)}`
                  )}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-borderline flex justify-between items-baseline">
              <div>
                <span className="text-sm font-bold text-textmain block">
                  Estimated Total
                </span>
                <span className="text-[11px] text-textmuted">
                  USD including taxes & delivery
                </span>
              </div>
              <span className="text-2xl font-bold text-textmain">
                ${totalAmount.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full py-3 px-6 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-textmuted">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Guaranteed 256-Bit Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
