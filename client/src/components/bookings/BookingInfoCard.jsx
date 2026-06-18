import React from "react";

export default function BookingInfoCard({ booking }) {
  if (!booking) return null;

  return (
    <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
      <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-high/50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-on-surface">Booking Details</h3>
        <span className="font-mono text-sm text-secondary">
          #{booking.booking_id.slice(0, 8)}
        </span>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Client Information
            </h4>
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 space-y-2">
              <p className="text-sm font-bold text-on-surface">
                {booking.client_name}
              </p>
              <p className="text-xs text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">mail</span>
                {booking.client_contact}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Trek Information
            </h4>
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 space-y-2">
              <p className="text-sm font-bold text-on-surface">
                {booking.trek_name}
              </p>
              <p className="text-xs text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">
                  calendar_today
                </span>
                {booking.trek_date}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Participants
            </h4>
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">
                groups
              </span>
              <span className="text-lg font-bold text-on-surface">
                {booking.participants}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Payment Status
            </h4>
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex items-center gap-3">
              <span
                className={`material-symbols-outlined ${booking.payment_status === "Paid" ? "text-primary" : "text-tertiary"}`}
              >
                payments
              </span>
              <span
                className={`text-sm font-bold ${booking.payment_status === "Paid" ? "text-primary" : "text-tertiary"}`}
              >
                {booking.payment_status}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Booking Status
            </h4>
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex items-center gap-3">
              <span
                className={`material-symbols-outlined ${
                  booking.status === "Confirmed"
                    ? "text-primary"
                    : booking.status === "Pending"
                      ? "text-tertiary"
                      : "text-error"
                }`}
              >
                {booking.status === "Confirmed"
                  ? "check_circle"
                  : booking.status === "Pending"
                    ? "schedule"
                    : "block"}
              </span>
              <span
                className={`text-sm font-bold ${
                  booking.status === "Confirmed"
                    ? "text-primary"
                    : booking.status === "Pending"
                      ? "text-tertiary"
                      : "text-error"
                }`}
              >
                {booking.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
