import React, { useState } from "react";
import { ShoppingBag, ArrowRight, Tag } from "lucide-react";
import Button from "../common/Button";

export default function OrderSummary({
  subtotal = 0,
  shippingEstimate = 0,
  taxEstimate = 0,
  total = 0,
  onProceedToCheckout,
  loading = false,
  showCheckoutBtn = true,
}) {
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoCodeMessage] = useState("");

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "STYLE10") {
      setDiscount(subtotal * 0.1);
      setPromoCodeMessage("10% Promo Code Applied!");
    } else {
      setPromoCodeMessage("Invalid promo code");
    }
  };

  const finalTotal = Math.max(0, total - discount);

  return (
    <div className="bg-white border border-[#e3e8f0] p-6 rounded-xl space-y-5">
      <h3 className="font-bold text-[#171c29] text-lg border-b border-[#e3e8f0] pb-3">
        Order Summary
      </h3>

      {/* Promo Code Input */}
      <form onSubmit={handleApplyPromo} className="flex gap-2">
        <input
          type="text"
          placeholder="Promo code (e.g. STYLE10)"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          className="flex-1 bg-[#f7fafc] border border-[#e3e8f0] rounded-lg px-3 py-1.5 text-xs text-[#171c29] focus:outline-none focus:ring-1 focus:ring-[#2663eb]"
        />
        <Button type="submit" variant="secondary" size="sm">
          <Tag className="w-3.5 h-3.5 mr-1" /> Apply
        </Button>
      </form>
      {promoMessage && (
        <p
          className={`text-xs ${discount > 0 ? "text-[#17a34a]" : "text-[#db2626]"}`}
        >
          {promoMessage}
        </p>
      )}

      {/* Pricing Breakdown */}
      <div className="space-y-2.5 text-sm text-[#707a8c]">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-medium text-[#171c29]">
            ${Number(subtotal).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Estimated Shipping</span>
          <span className="font-medium text-[#171c29]">
            {shippingEstimate === 0 ? (
              <span className="text-[#17a34a]">FREE</span>
            ) : (
              `$${Number(shippingEstimate).toFixed(2)}`
            )}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Estimated Tax (8%)</span>
          <span className="font-medium text-[#171c29]">
            ${Number(taxEstimate).toFixed(2)}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-[#17a34a] font-medium">
            <span>Discount</span>
            <span>-${Number(discount).toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-[#e3e8f0] pt-3 flex justify-between text-base font-bold text-[#171c29]">
          <span>Total</span>
          <span className="text-[#2663eb]">
            ${Number(finalTotal).toFixed(2)}
          </span>
        </div>
      </div>

      {showCheckoutBtn && (
        <Button
          onClick={onProceedToCheckout}
          disabled={loading || subtotal <= 0}
          className="w-full py-3 mt-4"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
}
