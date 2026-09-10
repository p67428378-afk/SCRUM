import React from "react";
import BookingDashboard from "../components/BookingDashboard";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-rose-200 pb-4">
        <h1 className="text-3xl font-serif font-bold text-[#5B1D2E]">
          Salon Appointment Booking
        </h1>
        <p className="text-sm text-[#534345]">
          Select services, available stylists, and time slots for instant
          reservation.
        </p>
      </div>

      <BookingDashboard />
    </div>
  );
}
