import React, { useState } from "react";
import CalendarGrid from "../components/bookings/CalendarGrid.jsx";
import { Plus, Calendar, User, AlertCircle, CheckCircle2 } from "lucide-react";

export default function BookingsPage({
  bookings,
  rooms,
  onCreateBooking,
  onCancelBooking,
}) {
  const [showModal, setShowModal] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!guestName || !roomId || !checkInDate || !checkOutDate) {
      setError("All fields are required.");
      return;
    }

    try {
      await onCreateBooking({
        guest_name: guestName,
        room_id: roomId,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
      });
      setSuccess("Booking created successfully!");
      setGuestName("");
      setRoomId("");
      setCheckInDate("");
      setCheckOutDate("");
      setTimeout(() => {
        setShowModal(false);
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to create booking. Please check room availability.",
      );
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Booking Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, view, and cancel guest reservations.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="h-5 w-5" />
          <span>New Booking</span>
        </button>
      </div>

      {/* Calendar Grid */}
      <CalendarGrid
        bookings={bookings}
        rooms={rooms}
        onCancelBooking={onCancelBooking}
      />

      {/* New Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <span>Create New Booking</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Guest Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full text-sm border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Select Room
                </label>
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">-- Choose a Room --</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.room_number} - {room.type} ($
                      {room.price_per_night}/night)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Check-In
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Check-Out
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex space-x-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
