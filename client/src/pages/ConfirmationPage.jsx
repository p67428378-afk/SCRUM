import React, { useState, useEffect } from "react";
import {
  useParams,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import DigitalPassCard from "../components/confirmation/DigitalPassCard";
import { Sparkles, Calendar, ArrowLeft, Mail, AlertCircle } from "lucide-react";

export default function ConfirmationPage() {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const passedBooking = location.state?.booking;
  const emailQuery = searchParams.get("email");

  const [booking, setBooking] = useState(passedBooking || null);
  const [loading, setLoading] = useState(!passedBooking);

  useEffect(() => {
    if (!passedBooking) {
      // Simulate retrieving booking details by reference from backend / session
      const timer = setTimeout(() => {
        setBooking({
          booking_reference: bookingId || "BK-8F3E2D1C",
          status: "CONFIRMED",
          user_email: emailQuery || "test@example.com",
          concert: {
            tour_name: "AURA • World Tour 2026",
            city: "London",
            venue: "The O2 Arena",
            event_date: new Date(Date.now() + 86400000 * 60).toISOString(),
          },
          digital_pass: {
            qr_code_data: `TICKET-${bookingId || "BK-8F3E2D1C"}-${emailQuery || "test@example.com"}`,
            pdf_download_url: `https://tickets.example.com/pdf/${bookingId || "BK-8F3E2D1C"}`,
          },
        });
        setLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [bookingId, passedBooking, emailQuery]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <Sparkles className="w-10 h-10 text-[#7a3bed] animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-white">
          Generating Digital QR Pass...
        </h2>
        <p className="text-xs text-[#9ea3b8]">
          Verifying transaction & preparing downloadable ticket PDF
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/concerts")}
          className="inline-flex items-center space-x-2 text-xs font-bold text-[#9ea3b8] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Concert Schedule</span>
        </button>

        <div className="flex items-center space-x-2 text-xs text-[#21c45c] bg-[#21c45c]/10 border border-[#21c45c]/30 px-3 py-1 rounded-full font-semibold">
          <Mail className="w-3.5 h-3.5" />
          <span>Email Receipt Sent</span>
        </div>
      </div>

      {/* Main Digital Pass Card */}
      <DigitalPassCard booking={booking} />

      {/* Order Lookup & Support Note */}
      <div className="bg-[#1f1f2e] border border-[#2d2d42] rounded-2xl p-6 text-center space-y-3">
        <h4 className="text-sm font-bold text-white">
          Need to access your tickets later?
        </h4>
        <p className="text-xs text-[#9ea3b8] max-w-lg mx-auto">
          Bookmark this page URL or use the <strong>Order Lookup</strong> tool
          in the top navigation bar anytime with reference code{" "}
          <strong className="text-[#a855f7] font-mono">
            {booking?.booking_reference}
          </strong>{" "}
          and email{" "}
          <strong className="text-white">{booking?.user_email}</strong>.
        </p>
      </div>
    </div>
  );
}
