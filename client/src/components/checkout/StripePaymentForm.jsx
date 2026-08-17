import React, { useState } from "react";
import { CreditCard, Lock, ShieldCheck, AlertCircle } from "lucide-react";

export default function StripePaymentForm({
  amount,
  currency,
  onSubmitPayment,
  isProcessing,
  error,
}) {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardHolder, setCardHolder] = useState("John Fan");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("123");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitPayment({
      paymentMethod,
      cardHolder,
      cardNumber,
      expiry,
      cvc,
    });
  };

  const currencySymbol =
    currency === "EUR"
      ? "€"
      : currency === "GBP"
        ? "£"
        : currency === "JPY"
          ? "¥"
          : "$";

  return (
    <div className="bg-[#1f1f2e] border border-[#2d2d42] rounded-2xl p-6 sm:p-8 shadow-xl">
      <div className="flex items-center justify-between pb-6 border-b border-[#2d2d42] mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-[#7a3bed]" />
            <span>Secure Stripe Checkout</span>
          </h2>
          <p className="text-xs text-[#9ea3b8] mt-1">
            PCI-DSS Level 1 Encrypted Multi-Currency Payment
          </p>
        </div>
        <div className="flex items-center space-x-1 text-xs text-[#21c45c] bg-[#21c45c]/10 border border-[#21c45c]/30 px-3 py-1.5 rounded-full font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>256-bit SSL</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-[#db2626]/10 border border-[#db2626]/40 text-[#f5f5fa] p-4 rounded-xl flex items-start space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 text-[#db2626] flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#db2626] block">
              Payment Error
            </span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Express Payment Tabs */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setPaymentMethod("express")}
          className={`py-3 px-4 rounded-xl border font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
            paymentMethod === "express"
              ? "bg-[#7a3bed]/20 border-[#7a3bed] text-white shadow-lg"
              : "bg-[#12121c] border-[#2d2d42] text-[#9ea3b8] hover:text-white"
          }`}
        >
          <span> Pay / Google Pay</span>
        </button>
        <button
          type="button"
          onClick={() => setPaymentMethod("card")}
          className={`py-3 px-4 rounded-xl border font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
            paymentMethod === "card"
              ? "bg-[#7a3bed]/20 border-[#7a3bed] text-white shadow-lg"
              : "bg-[#12121c] border-[#2d2d42] text-[#9ea3b8] hover:text-white"
          }`}
        >
          <CreditCard className="w-4 h-4 text-[#7a3bed]" />
          <span>Credit / Debit Card</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {paymentMethod === "express" ? (
          <div className="p-6 bg-[#12121c] border border-[#2d2d42] rounded-xl text-center space-y-4">
            <p className="text-sm text-[#9ea3b8]">
              Instant Express Checkout via Apple Pay / Google Pay. Your default
              wallet card will be used.
            </p>
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-white text-black hover:bg-gray-200 py-3.5 rounded-xl font-bold text-base flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isProcessing
                  ? "Authorizing Payment..."
                  : `Pay ${currencySymbol}${amount?.toFixed(2)} with Express Pass`}
              </span>
            </button>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-xs font-semibold text-[#9ea3b8] uppercase mb-1">
                Cardholder Full Name
              </label>
              <input
                type="text"
                required
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                className="w-full bg-[#12121c] border border-[#2d2d42] rounded-xl px-4 py-2.5 text-white placeholder-[#5d637e] focus:outline-none focus:border-[#7a3bed] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#9ea3b8] uppercase mb-1">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-[#12121c] border border-[#2d2d42] rounded-xl pl-4 pr-10 py-2.5 text-white placeholder-[#5d637e] focus:outline-none focus:border-[#7a3bed] transition-colors font-mono"
                />
                <CreditCard className="w-5 h-5 text-[#7a3bed] absolute right-3 top-2.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#9ea3b8] uppercase mb-1">
                  Expiration (MM/YY)
                </label>
                <input
                  type="text"
                  required
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full bg-[#12121c] border border-[#2d2d42] rounded-xl px-4 py-2.5 text-white placeholder-[#5d637e] focus:outline-none focus:border-[#7a3bed] transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9ea3b8] uppercase mb-1">
                  CVC / CVV
                </label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  className="w-full bg-[#12121c] border border-[#2d2d42] rounded-xl px-4 py-2.5 text-white placeholder-[#5d637e] focus:outline-none focus:border-[#7a3bed] transition-colors font-mono"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#7a3bed] hover:bg-[#682bd6] text-white py-4 rounded-xl font-bold text-base shadow-xl shadow-[#7a3bed]/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <Lock className="w-5 h-5" />
                <span>
                  {isProcessing
                    ? "Processing Payment..."
                    : `Complete Payment — ${currencySymbol}${amount?.toFixed(2)} ${currency}`}
                </span>
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
