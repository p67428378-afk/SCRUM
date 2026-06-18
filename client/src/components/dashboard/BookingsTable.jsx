import React from "react";
import { useNavigate } from "react-router-dom";

export default function BookingsTable({ bookings = [] }) {
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <section className="col-span-12 lg:col-span-8 bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
      <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-high/50">
        <h3 className="text-lg font-bold">Upcoming Bookings</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-on-surface-variant text-xs uppercase tracking-wider border-b border-outline-variant/30">
              <th className="px-6 py-4 font-semibold">ID</th>
              <th className="px-6 py-4 font-semibold">Client</th>
              <th className="px-6 py-4 font-semibold">Trek</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold text-center">
                Participants
              </th>
              <th className="px-6 py-4 font-semibold text-center">Payment</th>
              <th className="px-6 py-4 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {bookings.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-8 text-center text-on-surface-variant"
                >
                  No bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr
                  key={booking.booking_id}
                  onClick={() => navigate(`/bookings/${booking.booking_id}`)}
                  className="hover:bg-surface-container-high transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4 font-mono text-sm text-secondary">
                    #{booking.booking_id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {getInitials(booking.client_name)}
                      </div>
                      <span className="text-sm font-medium">
                        {booking.client_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {booking.trek_name}
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant text-xs">
                    {booking.trek_date}
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    {booking.participants}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                        booking.payment_status === "Paid"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-tertiary/10 text-tertiary border-tertiary/20"
                      }`}
                    >
                      {booking.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                        booking.status === "Confirmed"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : booking.status === "Pending"
                            ? "bg-tertiary/10 text-tertiary border-tertiary/20"
                            : "bg-error/10 text-error border-error/20"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
