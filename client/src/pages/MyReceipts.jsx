import React, { useState, useEffect } from "react";
import { bookingAPI, donationAPI } from "../services/api";
import {
  CalendarCheck,
  HeartHandshake,
  Download,
  XCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function MyReceipts({ user }) {
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "bookings") {
        const data = await bookingAPI.getMyBookings();
        setBookings(data);
      } else {
        const data = await donationAPI.getMyDonations();
        setDonations(data);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError(
          "Please log in via the Devotee Portal to view your bookings and receipts.",
        );
      } else {
        setError("Failed to fetch records. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (
      !window.confirm("Are you sure you want to cancel this Seva slot booking?")
    )
      return;
    try {
      await bookingAPI.cancelBooking(bookingId);
      fetchData();
    } catch (err) {
      alert(
        "Failed to cancel booking: " +
          (err.response?.data?.detail || err.message),
      );
    }
  };

  const handleDownloadReceipt = async (donationId, receiptNumber) => {
    try {
      await donationAPI.downloadReceipt(donationId, receiptNumber);
    } catch (err) {
      alert(
        "Failed to download PDF receipt. Please make sure you are logged in.",
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-800 to-amber-900 rounded-3xl p-8 text-white shadow-xl flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-600/40 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-amber-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Personal Devotee Ledger
          </div>
          <h1 className="text-3xl font-extrabold">My Bookings & E-Receipts</h1>
          <p className="text-amber-100 text-xs sm:text-sm mt-1">
            Track your scheduled Seva slots, booking references, and download
            80G tax exemption receipts.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-amber-200">
        <button
          onClick={() => setActiveTab("bookings")}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition ${
            activeTab === "bookings"
              ? "border-amber-700 text-amber-900 bg-amber-50/50 rounded-t-xl"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <CalendarCheck className="w-4 h-4 text-amber-600" /> My Seva Bookings
          ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab("donations")}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition ${
            activeTab === "donations"
              ? "border-amber-700 text-amber-900 bg-amber-50/50 rounded-t-xl"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <HeartHandshake className="w-4 h-4 text-amber-600" /> My Donations &
          Receipts ({donations.length})
        </button>
      </div>

      {error ? (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-amber-800 text-center text-sm flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-700" />
          <span>{error}</span>
        </div>
      ) : loading ? (
        <div className="py-16 text-center text-gray-500 text-sm font-medium">
          Loading devotee ledger...
        </div>
      ) : activeTab === "bookings" ? (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="py-12 bg-white rounded-2xl border border-amber-200 text-center text-gray-500 text-sm">
              No Seva bookings found. Visit the Pooja Catalog to reserve a slot.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs relative"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        {b.booking_type}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 mt-2">
                        Ref:{" "}
                        <span className="font-mono text-amber-900">
                          {b.booking_reference}
                        </span>
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Devotee: <strong>{b.devotee_name}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                          b.status === "Confirmed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {b.status}
                      </span>
                      <p className="text-base font-extrabold text-amber-900 mt-2">
                        ₹{b.amount_paid}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-amber-100 text-xs text-gray-600 flex items-center justify-between">
                    <span>
                      Gotra: {b.gotra || "Kashyap"} • Nakshatra:{" "}
                      {b.nakshatra || "Rohini"}
                    </span>

                    {b.status === "Confirmed" && (
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Cancel Slot
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {donations.length === 0 ? (
            <div className="py-12 bg-white rounded-2xl border border-amber-200 text-center text-gray-500 text-sm">
              No donation records found. Visit the Donation Portal to make a
              contribution.
            </div>
          ) : (
            <div className="space-y-3">
              {donations.map((d) => (
                <div
                  key={d.id}
                  className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs flex items-center justify-between flex-wrap gap-4"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      {d.receipt_number}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 mt-2">
                      {d.donor_name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Purpose: {d.purpose} • Method: {d.payment_method}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-lg font-black text-amber-900 block">
                        ₹{d.amount}
                      </span>
                      <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                        {d.tax_exemption_80g
                          ? "80G Tax Exempt"
                          : "Standard Donation"}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        handleDownloadReceipt(d.id, d.receipt_number)
                      }
                      className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
