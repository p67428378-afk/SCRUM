import React, { useState } from "react";
import { bookingAPI } from "../services/api";
import {
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
  User,
  Phone,
  IndianRupee,
} from "lucide-react";

export default function BookingModal({
  pooja,
  slot,
  onClose,
  onBookingComplete,
}) {
  const [devoteeName, setDevoteeName] = useState("");
  const [devoteePhone, setDevoteePhone] = useState("");
  const [gotra, setGotra] = useState("");
  const [nakshatra, setNakshatra] = useState("");
  const [bookingType, setBookingType] = useState("Online");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!devoteeName.trim()) {
      setError("Devotee Name is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        slot_id: slot.id,
        devotee_name: devoteeName,
        devotee_phone: devoteePhone || null,
        gotra: gotra || null,
        nakshatra: nakshatra || null,
        booking_type: bookingType,
      };

      const result = await bookingAPI.createBooking(payload);
      setConfirmedBooking(result);
      if (onBookingComplete) {
        onBookingComplete(result);
      }
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Failed to complete booking. Please login or try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-amber-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition text-amber-100"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Devotee Gotra & Sankalpam Form
          </div>
          <h2 className="text-xl font-bold">{pooja?.title}</h2>
          <p className="text-xs text-amber-200 mt-1">
            Date: {slot?.slot_date} • Time: {slot?.start_time} -{" "}
            {slot?.end_time}
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {confirmedBooking ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Pooja Slot Confirmed!
              </h3>
              <p className="text-xs text-gray-600">
                Your divine Seva booking reference ID is generated below:
              </p>

              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 inline-block w-full">
                <span className="text-xs text-amber-800 uppercase tracking-wider font-bold block mb-1">
                  Booking Reference ID
                </span>
                <span className="text-2xl font-black text-amber-900 font-mono tracking-widest block">
                  {confirmedBooking.booking_reference}
                </span>
              </div>

              <div className="text-left text-xs bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1.5 text-gray-700">
                <p>
                  <strong>Devotee Name:</strong> {confirmedBooking.devotee_name}
                </p>
                <p>
                  <strong>Gotra / Nakshatra:</strong>{" "}
                  {confirmedBooking.gotra || "Kashyap"} /{" "}
                  {confirmedBooking.nakshatra || "Rohini"}
                </p>
                <p>
                  <strong>Dakshina Paid:</strong> ₹
                  {confirmedBooking.amount_paid}
                </p>
                <p>
                  <strong>Attendance Mode:</strong>{" "}
                  {confirmedBooking.booking_type}
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 rounded-xl text-sm transition"
              >
                Close & View My Bookings
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-900">
                  Seva Dakshina Amount:
                </span>
                <span className="font-extrabold text-amber-900 text-sm flex items-center">
                  <IndianRupee className="w-3.5 h-3.5" /> {pooja?.price}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Devotee Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={devoteeName}
                    onChange={(e) => setDevoteeName(e.target.value)}
                    placeholder="Full name for Sankalpam"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={devoteePhone}
                    onChange={(e) => setDevoteePhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Gotra
                  </label>
                  <input
                    type="text"
                    value={gotra}
                    onChange={(e) => setGotra(e.target.value)}
                    placeholder="e.g. Kashyap"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nakshatra
                  </label>
                  <input
                    type="text"
                    value={nakshatra}
                    onChange={(e) => setNakshatra(e.target.value)}
                    placeholder="e.g. Rohini"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Attendance Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingType("Online")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      bookingType === "Online"
                        ? "bg-amber-700 text-white border-amber-700"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-amber-50"
                    }`}
                  >
                    Online / Live Stream
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingType("Offline")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      bookingType === "Offline"
                        ? "bg-amber-700 text-white border-amber-700"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-amber-50"
                    }`}
                  >
                    In-Person Temple Visit
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 rounded-xl text-sm transition shadow-md disabled:opacity-50 mt-2"
              >
                {loading
                  ? "Registering Sankalpam..."
                  : "Confirm & Book Seva Slot"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
