import React, { useState } from "react";

export default function RegisterAlertForm({ onSubmit, loading }) {
  const [cardNumber, setCardNumber] = useState("4321432143214321");
  const [mobileNumber, setMobileNumber] = useState("+919876543210");
  const [dailySpendThreshold, setDailySpendThreshold] = useState(5000);
  const [alertDeliveryChannel, setAlertDeliveryChannel] = useState("SMS");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!cardNumber || cardNumber.length < 16) {
      setError("Please enter a valid 16-digit card number.");
      return;
    }
    if (!mobileNumber || mobileNumber.length < 10) {
      setError("Please enter a valid mobile number.");
      return;
    }
    if (!dailySpendThreshold || dailySpendThreshold <= 0) {
      setError("Please enter a valid daily spend threshold.");
      return;
    }

    onSubmit({
      cardNumber,
      mobileNumber,
      dailySpendThreshold: Number(dailySpendThreshold),
      alertDeliveryChannel,
    });
  };

  return (
    <div className="bg-surface-container rounded-xl border border-outline-variant p-lg shadow-sm glow-hover transition-all duration-300 flex flex-col">
      <div className="flex items-center justify-between mb-lg border-b border-outline-variant pb-md">
        <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">
            add_alert
          </span>
          Register Spend Alert
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-lg flex-1 flex flex-col">
        {error && (
          <div className="p-md bg-error-container/20 border border-error text-error rounded-lg text-body-sm">
            {error}
          </div>
        )}

        <div className="space-y-sm">
          <label className="font-label-md text-label-md text-on-surface-variant block">
            Select Card
          </label>
          <div className="relative">
            <select className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-10 py-3 font-body-md text-body-md text-on-surface appearance-none focus:border-primary focus:ring-1 focus:ring-primary transition-all">
              <option>Visa Debit ending in 4321</option>
              <option>Mastercard ending in 9876</option>
            </select>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary">
              credit_card
            </span>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
              expand_more
            </span>
          </div>
        </div>

        <div className="space-y-sm">
          <label className="font-label-md text-label-md text-on-surface-variant block">
            Card Number
          </label>
          <div className="relative">
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-3 font-code-md text-code-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              type="text"
              maxLength="16"
              placeholder="Enter 16-digit card number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
              required
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              lock
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-secondary flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-[14px]">
              verified_user
            </span>
            PCI-DSS Compliant Encryption
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div className="space-y-sm">
            <label className="font-label-md text-label-md text-on-surface-variant block">
              Alert Threshold (INR)
            </label>
            <div className="relative">
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-code-md text-code-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                type="number"
                value={dailySpendThreshold}
                onChange={(e) => setDailySpendThreshold(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-sm">
            <label className="font-label-md text-label-md text-on-surface-variant block">
              Notification Channel
            </label>
            <div className="relative">
              <select
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                value={alertDeliveryChannel}
                onChange={(e) => setAlertDeliveryChannel(e.target.value)}
              >
                <option value="SMS">SMS Only</option>
                <option value="EMAIL">Email Only</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-sm">
          <label className="font-label-md text-label-md text-on-surface-variant block">
            Registered Mobile
          </label>
          <div className="relative">
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-3 font-code-md text-code-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              type="text"
              placeholder="e.g. +919876543210"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              smartphone
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 italic">
            OTP will be sent to this verified number.
          </p>
        </div>

        <div className="pt-md mt-auto">
          <button
            className="w-full bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary font-label-md text-label-md py-3 px-6 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            <span className="material-symbols-outlined text-[20px]">sms</span>
            {loading ? "Sending OTP..." : "Send OTP to Verify"}
          </button>
        </div>
      </form>
    </div>
  );
}
