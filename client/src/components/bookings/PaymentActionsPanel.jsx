import React, { useState, useEffect } from "react";

export default function PaymentActionsPanel({ booking, onUpdate }) {
  const [participants, setParticipants] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [status, setStatus] = useState("Pending");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (booking) {
      setParticipants(booking.participants);
      setPaymentStatus(booking.payment_status);
      setStatus(booking.status);
    }
  }, [booking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate({
        participants: parseInt(participants, 10),
        payment_status: paymentStatus,
        status: status,
      });
    } catch (err) {
      console.error("Failed to update booking", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container rounded-xl border border-outline-variant p-6">
      <h3 className="text-lg font-bold text-on-surface mb-4">
        Update Booking Details
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="participants-input"
            className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2"
          >
            Participants
          </label>
          <input
            id="participants-input"
            type="number"
            min="1"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
          />
        </div>

        <div>
          <label
            htmlFor="payment-status-select"
            className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2"
          >
            Payment Status
          </label>
          <select
            id="payment-status-select"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="booking-status-select"
            className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2"
          >
            Booking Status
          </label>
          <select
            id="booking-status-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
          >
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-on-primary hover:brightness-110 font-bold rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Booking"}
        </button>
      </form>
    </div>
  );
}
