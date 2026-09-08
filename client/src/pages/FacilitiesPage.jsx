import React, { useState, useEffect } from "react";
import { Calendar, Plus, ShieldCheck } from "lucide-react";
import FacilityCardGrid from "../components/facilities/FacilityCardGrid.jsx";
import BookingScheduleTable from "../components/facilities/BookingScheduleTable.jsx";
import ReserveFacilityDrawer from "../components/facilities/ReserveFacilityDrawer.jsx";
import {
  getFacilities,
  getBookings,
  createBooking,
  cancelBooking,
} from "../services/api.js";

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFacilitiesAndBookings = async () => {
    try {
      const [facData, bookData] = await Promise.all([
        getFacilities().catch(() => []),
        getBookings().catch(() => []),
      ]);

      if (Array.isArray(facData) && facData.length > 0) {
        setFacilities(facData);
      } else {
        setFacilities([
          {
            id: "fac-1",
            name: "Community Hall",
            description:
              "Spacious air-conditioned hall for events, banquets, and village meetings.",
            capacity: 200,
            hourly_rate: 50,
            is_active: true,
          },
          {
            id: "fac-2",
            name: "Sports Complex & Tennis Court",
            description:
              "Outdoor floodlit courts for tennis, pickleball, and basketball games.",
            capacity: 30,
            hourly_rate: 25,
            is_active: true,
          },
          {
            id: "fac-3",
            name: "Village Swimming Pool & Pavilion",
            description:
              "Olympic-sized pool with sun deck, poolside lounge, and BBQ pits.",
            capacity: 50,
            hourly_rate: 35,
            is_active: true,
          },
          {
            id: "fac-4",
            name: "Conference Room B",
            description:
              "Executive board room equipped with projector, high-speed WiFi, and AV system.",
            capacity: 15,
            hourly_rate: 20,
            is_active: true,
          },
        ]);
      }

      if (Array.isArray(bookData) && bookData.length > 0) {
        setBookings(bookData);
      } else {
        setBookings([
          {
            id: "book-101",
            facility_id: "fac-1",
            booking_date: "2026-06-01",
            start_time: "14:00",
            end_time: "17:00",
            purpose: "HOA Annual General Assembly",
            status: "Confirmed",
          },
          {
            id: "book-102",
            facility_id: "fac-2",
            booking_date: "2026-06-02",
            start_time: "09:00",
            end_time: "11:00",
            purpose: "Junior Tennis Tournament",
            status: "Confirmed",
          },
        ]);
      }
    } catch (err) {
      console.warn("Error fetching facility data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilitiesAndBookings();
  }, []);

  const handleCreateBookingSubmit = async (bookingPayload) => {
    const res = await createBooking(bookingPayload);
    await fetchFacilitiesAndBookings();
    return res;
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await cancelBooking(bookingId);
      await fetchFacilitiesAndBookings();
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      // Fallback optimistic UI update for mock items
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "CANCELLED" } : b,
        ),
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" /> Village Facilities &
            Slot Reservations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse available village amenities, check capacity & pricing rules,
            and reserve time slots with real-time conflict checking.
          </p>
        </div>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Reserve Facility</span>
        </button>
      </div>

      {/* Facility Grid */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Available Village Amenities
        </h2>
        <FacilityCardGrid
          facilities={facilities}
          onBookFacility={(fac) => setIsDrawerOpen(true)}
        />
      </section>

      {/* Booking Schedule Table */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Scheduled Reservations Log
        </h2>
        <BookingScheduleTable
          bookings={bookings}
          facilities={facilities}
          onCancelBooking={handleCancelBooking}
        />
      </section>

      {/* Slide-In Drawer */}
      <ReserveFacilityDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        facilities={facilities}
        onSubmitBooking={handleCreateBookingSubmit}
      />
    </div>
  );
}
