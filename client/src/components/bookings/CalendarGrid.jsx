import React from "react";
import { Calendar, Trash2, AlertCircle } from "lucide-react";

export default function CalendarGrid({ bookings, rooms, onCancelBooking }) {
  // Generate next 14 days for the visual calendar
  const getNext14Days = () => {
    const days = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const days = getNext14Days();

  // Format date to YYYY-MM-DD in local timezone
  const formatDateString = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Check if a room is booked on a specific date
  const getBookingForDate = (roomId, dateStr) => {
    return bookings.find((b) => {
      if (b.room_id !== roomId || b.status === "Cancelled") return false;
      return dateStr >= b.check_in_date && dateStr < b.check_out_date;
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-indigo-600" />
          <h3 className="font-bold text-gray-900">
            Room Availability Timeline (Next 14 Days)
          </h3>
        </div>
        <div className="flex space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 bg-green-100 border border-green-300 rounded-sm inline-block"></span>
            <span className="text-gray-600 font-medium">Available</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 bg-indigo-600 rounded-sm inline-block"></span>
            <span className="text-gray-600 font-medium">Booked</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[120px] sticky left-0 bg-gray-50 z-10">
                Room
              </th>
              {days.map((day, idx) => (
                <th
                  key={idx}
                  className="p-3 text-center text-xs font-bold text-gray-500 border-r border-gray-200 min-w-[80px]"
                >
                  <div className="font-semibold">
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div className="text-lg font-extrabold text-gray-900">
                    {day.getDate()}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {day.toLocaleDateString("en-US", { month: "short" })}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr
                key={room.id}
                className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
              >
                <td className="p-4 font-bold text-gray-900 border-r border-gray-200 sticky left-0 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">
                  <div>Room {room.room_number}</div>
                  <div className="text-xs font-normal text-gray-400">
                    {room.type}
                  </div>
                </td>
                {days.map((day, idx) => {
                  const dateStr = formatDateString(day);
                  const booking = getBookingForDate(room.id, dateStr);

                  if (booking) {
                    const isCheckIn = booking.check_in_date === dateStr;
                    return (
                      <td
                        key={idx}
                        className="p-1 border-r border-gray-200 bg-indigo-50 text-center relative group"
                      >
                        <div className="bg-indigo-600 text-white text-[10px] font-bold py-1.5 px-2 rounded shadow-sm truncate cursor-pointer hover:bg-indigo-700 transition-colors">
                          {isCheckIn ? booking.guest_name : "Booked"}
                        </div>

                        {/* Tooltip / Action Popover */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-20 w-56 pointer-events-auto">
                          <div className="font-bold border-b border-gray-700 pb-1 mb-1.5">
                            {booking.guest_name}
                          </div>
                          <div className="space-y-1 text-gray-300 text-[11px]">
                            <div>In: {booking.check_in_date}</div>
                            <div>Out: {booking.check_out_date}</div>
                            <div>Total: ${booking.total_amount}</div>
                          </div>
                          <button
                            onClick={() => onCancelBooking(booking.id)}
                            className="mt-2 w-full flex items-center justify-center space-x-1 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-[10px] transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Cancel Booking</span>
                          </button>
                        </div>
                      </td>
                    );
                  }

                  return (
                    <td
                      key={idx}
                      className="p-2 border-r border-gray-200 bg-green-50/30 text-center"
                    >
                      <span className="text-xs text-green-700 font-semibold">
                        Available
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rooms.length === 0 && (
        <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center">
          <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
          <p className="font-medium">
            No rooms available to display in the timeline.
          </p>
        </div>
      )}
    </div>
  );
}
