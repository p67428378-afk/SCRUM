import React, { useState } from "react";
import Button from "../common/Button.jsx";

export default function PaymentGatewayPanel({
  bill,
  onPaymentSuccess,
  onCancel,
}) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Simple validation
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      setError("Card number must be 16 digits.");
      setIsSubmitting(false);
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setError("Expiry must be in MM/YY format.");
      setIsSubmitting(false);
      return;
    }
    if (cvv.length !== 3) {
      setError("CVV must be 3 digits.");
      setIsSubmitting(false);
      return;
    }

    try {
      await onPaymentSuccess({
        bill_id: bill.id,
        amount_paid: parseFloat(bill.amount),
        payment_method: "Card",
        card_details: {
          card_number: cardNumber,
          expiry,
          cvv,
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.detail || "Payment failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 flex justify-between items-center">
        <div>
          <h4 className="text-sm font-semibold text-slate-200">
            {bill.description}
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Due: {new Date(bill.due_date).toLocaleDateString()}
          </p>
        </div>
        <span className="text-lg font-bold text-emerald-400">
          ${parseFloat(bill.amount).toFixed(2)}
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-sm bg-red-500/10 text-red-400 border border-red-500/20">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-400 uppercase">
          Card Number
        </label>
        <input
          type="text"
          value={cardNumber}
          onChange={(e) =>
            setCardNumber(
              e.target.value
                .replace(/\D/g, "")
                .replace(/(.{4})/g, "$1 ")
                .trim()
                .slice(0, 19),
            )
          }
          required
          placeholder="1234 5678 1234 5678"
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-[#6366F1] text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-400 uppercase">
            Expiry Date
          </label>
          <input
            type="text"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value.slice(0, 5))}
            required
            placeholder="MM/YY"
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-[#6366F1] text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-400 uppercase">
            CVV
          </label>
          <input
            type="password"
            value={cvv}
            onChange={(e) =>
              setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
            }
            required
            placeholder="123"
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-[#6366F1] text-sm"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-4">
        <Button onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button type="submit" variant="success" disabled={isSubmitting}>
          {isSubmitting
            ? "Processing..."
            : `Pay $${parseFloat(bill.amount).toFixed(2)}`}
        </Button>
      </div>
    </form>
  );
}
