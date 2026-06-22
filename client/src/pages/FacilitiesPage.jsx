import React, { useState } from "react";
import AvailableFacilitiesList from "../components/facilities/AvailableFacilitiesList.jsx";
import BookingCalendar from "../components/facilities/BookingCalendar.jsx";
import Modal from "../components/common/Modal.jsx";
import Badge from "../components/common/Badge.jsx";

export default function FacilitiesPage({
  facilities = [],
  bookings = [],
  onBookFacility,
}) {
  const [selectedFacility, setSelectedFacility] = useState(null);

  const handleBookingSuccess = async (bookingData) => {
    await onBookFacility(bookingData);
    setSelectedFacility(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <AvailableFacilitiesList
        facilities={facilities}
        onBookClick={(facility) => setSelectedFacility(facility)}
      />

      <div className="card-surface p-6 w-full overflow-x-auto">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">
          Your Bookings
        </h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Facility</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Time Slot</th>
              <th className="py-3 px-4">Purpose</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-300 divide-y divide-slate-800">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-4 text-center text-slate-400">
                  No bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => {
                const facilityName =
                  facilities.find((f) => f.id === booking.facility_id)?.name ||
                  "Facility";
                const dateStr = new Date(
                  booking.start_time,
                ).toLocaleDateString();
                const startStr = new Date(
                  booking.start_time,
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const endStr = new Date(booking.end_time).toLocaleTimeString(
                  [],
                  { hour: "2-digit", minute: "2-digit" },
                );
                return (
                  <tr
                    key={booking.id}
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-slate-200">
                      {facilityName}
                    </td>
                    <td className="py-4 px-4">{dateStr}</td>
                    <td className="py-4 px-4">
                      {startStr} - {endStr}
                    </td>
                    <td className="py-4 px-4">{booking.purpose}</td>
                    <td className="py-4 px-4">
                      <Badge status={booking.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={!!selectedFacility}
        onClose={() => setSelectedFacility(null)}
        title="Book Facility"
      >
        {selectedFacility && (
          <BookingCalendar
            facility={selectedFacility}
            onBook={handleBookingSuccess}
            onCancel={() => setSelectedFacility(null)}
          />
        )}
      </Modal>
    </div>
  );
}
