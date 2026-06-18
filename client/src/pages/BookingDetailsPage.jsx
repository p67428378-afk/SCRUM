import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BookingInfoCard from "../components/bookings/BookingInfoCard";
import PaymentActionsPanel from "../components/bookings/PaymentActionsPanel";
import Header from "../components/layout/Header";
import { bookingsService } from "../services/api";

export default function BookingDetailsPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookingDetails = async () => {
    try {
      const data = await bookingsService.getBookingDetails(bookingId);
      setBooking(data);
    } catch (err) {
      console.error("Failed to fetch booking details", err);
      setError("Booking not found or access denied.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const handleUpdateBooking = async (updatedData) => {
    try {
      const data = await bookingsService.updateBooking(bookingId, updatedData);
      setBooking(data);
    } catch (err) {
      console.error("Failed to update booking", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Header />
        <div className="pt-16 text-center max-w-md mx-auto space-y-4">
          <span className="material-symbols-outlined text-error text-6xl">
            error
          </span>
          <h3 className="text-xl font-bold text-on-surface">{error}</h3>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-primary text-on-primary font-bold rounded-full hover:brightness-110 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header />

      <div className="pt-16">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="text-3xl font-bold text-on-surface mb-2">
              Booking Details
            </h2>
            <p className="text-on-surface-variant text-sm">
              View and manage client booking information.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <BookingInfoCard booking={booking} />
          </div>
          <div>
            <PaymentActionsPanel
              booking={booking}
              onUpdate={handleUpdateBooking}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
