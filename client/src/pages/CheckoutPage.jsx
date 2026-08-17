import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPaymentIntent, bookTickets } from "../services/api";
import TimerBanner from "../components/common/TimerBanner";
import CurrencySelector from "../components/checkout/CurrencySelector";
import StripePaymentForm from "../components/checkout/StripePaymentForm";
import { ArrowLeft, Ticket, AlertTriangle, ShieldCheck } from "lucide-react";

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // State from ticket selection
  const reservation = location.state?.booking;
  const concert = location.state?.concert;
  const tier = location.state?.tier;

  const [selectedCurrency, setSelectedCurrency] = useState(
    reservation?.currency || "USD",
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [holdExpired, setHoldExpired] = useState(false);

  useEffect(() => {
    if (!reservation) {
      // If user navigated directly without reservation, redirect
      console.warn("No active reservation state found. Returning to concerts.");
    }
  }, [reservation]);

  if (!reservation) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-[#1f1f2e] border border-[#2d2d42] rounded-3xl text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-[#f5a826] mx-auto" />
        <h2 className="text-xl font-bold text-white">No Active Ticket Hold</h2>
        <p className="text-xs text-[#9ea3b8]">
          Please select a concert and ticket tier first to initiate a 10-minute
          seat hold lock.
        </p>
        <button
          onClick={() => navigate("/concerts")}
          className="px-6 py-2.5 bg-[#7a3bed] hover:bg-[#682bd6] text-white rounded-xl text-sm font-bold shadow-lg"
        >
          View Concert Schedule
        </button>
      </div>
    );
  }

  const {
    booking_id,
    booking_reference,
    total_amount,
    currency: defaultCurrency,
    hold_expires_at,
    quantity,
    user_email,
  } = reservation;

  // Real-time currency conversion multiplier for display
  const getConvertedAmount = (curr) => {
    const baseUSD = total_amount; // assuming base price
    switch (curr) {
      case "EUR":
        return baseUSD * 0.92;
      case "GBP":
        return baseUSD * 0.79;
      case "JPY":
        return baseUSD * 155.0;
      default:
        return baseUSD;
    }
  };

  const currentAmount = getConvertedAmount(selectedCurrency);

  const handleTimerExpire = () => {
    setHoldExpired(true);
    setErrorMessage(
      "Your 10-minute seat hold timer has expired. Seats have been released.",
    );
  };

  const handleProcessPayment = async (paymentDetails) => {
    if (holdExpired) {
      setErrorMessage("Hold timer expired. Please re-select your seats.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Generate unique idempotency key for double-charge prevention
      const idempotencyKey = `IDEM-${booking_reference}-${Date.now()}`;

      // 2. Call Stripe Payment Intent endpoint
      const intentResponse = await createPaymentIntent({
        booking_id: booking_id,
        currency: selectedCurrency,
        idempotency_key: idempotencyKey,
      });

      // 3. Confirm booking with payment intent
      const bookingResult = await bookTickets({
        booking_id: booking_id,
        payment_intent_id: intentResponse.payment_intent_id,
      });

      // 4. Navigate to confirmation page
      navigate(`/confirmation/${booking_reference}`, {
        state: {
          booking: bookingResult,
        },
      });
    } catch (err) {
      console.error("Checkout processing error:", err);
      const detail =
        err.response?.data?.detail ||
        "Payment authorization failed. Please verify your payment details and retry.";
      setErrorMessage(detail);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-xs font-bold text-[#9ea3b8] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Seat Selection</span>
      </button>

      {/* 10-Minute Hold Lock Banner */}
      <TimerBanner expiresAt={hold_expires_at} onExpire={handleTimerExpire} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left 1-col: Reservation Breakdown */}
        <div className="bg-[#1f1f2e] border border-[#2d2d42] rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="pb-4 border-b border-[#2d2d42]">
            <span className="text-[10px] font-extrabold text-[#7a3bed] uppercase tracking-widest block">
              Reservation Summary
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              {concert?.tour_name || "AURA World Tour"}
            </h3>
            <p className="text-xs text-[#9ea3b8]">
              {concert?.venue?.name}, {concert?.venue?.city}
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-[#9ea3b8]">
              <span>Booking Reference:</span>
              <strong className="text-white font-mono">
                {booking_reference}
              </strong>
            </div>

            <div className="flex justify-between text-[#9ea3b8]">
              <span>Ticket Tier:</span>
              <strong className="text-white">
                {tier?.tier_name || "Reserved Tier"}
              </strong>
            </div>

            <div className="flex justify-between text-[#9ea3b8]">
              <span>Quantity:</span>
              <strong className="text-white">{quantity} Ticket(s)</strong>
            </div>

            <div className="flex justify-between text-[#9ea3b8]">
              <span>Fan Email:</span>
              <strong className="text-white truncate max-w-[150px]">
                {user_email}
              </strong>
            </div>
          </div>

          <div className="pt-4 border-t border-[#2d2d42] space-y-3">
            <CurrencySelector
              selectedCurrency={selectedCurrency}
              onCurrencyChange={setSelectedCurrency}
            />

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs font-bold text-[#9ea3b8] uppercase">
                Total Charge:
              </span>
              <span className="text-2xl font-black text-[#21c45c]">
                {selectedCurrency === "EUR"
                  ? "€"
                  : selectedCurrency === "GBP"
                    ? "£"
                    : selectedCurrency === "JPY"
                      ? "¥"
                      : "$"}
                {currentAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Right 2-cols: Payment Form */}
        <div className="md:col-span-2">
          <StripePaymentForm
            amount={currentAmount}
            currency={selectedCurrency}
            onSubmitPayment={handleProcessPayment}
            isProcessing={isProcessing}
            error={errorMessage}
          />
        </div>
      </div>
    </div>
  );
}
