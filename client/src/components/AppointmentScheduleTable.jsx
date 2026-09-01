import React from "react";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

export default function AppointmentScheduleTable({
  appointments = [],
  doctors = [],
  loading = false,
  error = null,
  selectedDoctorId = "",
  selectedDate = "",
  selectedStatus = "",
  onDoctorFilterChange,
  onDateFilterChange,
  onStatusFilterChange,
  onOpenBookingModal,
  onUpdateStatus,
  onCancelAppointment,
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Cancelled</span>
          </span>
        );
      case "SCHEDULED":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>Scheduled</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      {/* Header Controls & Filters */}
      <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-700" />
            <span>Appointment Schedule</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage provider slots, view upcoming bookings, and update
            appointment statuses.
          </p>
        </div>

        <button
          onClick={onOpenBookingModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-medium text-sm rounded-lg transition-colors shadow-sm self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">
            Filter by Doctor
          </label>
          <select
            value={selectedDoctorId}
            onChange={(e) =>
              onDoctorFilterChange && onDoctorFilterChange(e.target.value)
            }
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Healthcare Providers</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                Dr. {doc.full_name} ({doc.specialty})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">
            Filter by Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) =>
              onDateFilterChange && onDateFilterChange(e.target.value)
            }
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">
            Filter by Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) =>
              onStatusFilterChange && onStatusFilterChange(e.target.value)
            }
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 text-sm">
          Failed to load appointments: {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-200">
              <th className="px-6 py-3">Date & Time Slot</th>
              <th className="px-6 py-3">Patient</th>
              <th className="px-6 py-3">Doctor / Specialty</th>
              <th className="px-6 py-3">Appointment Type</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-12 text-center text-slate-500"
                >
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700 mb-2"></div>
                  <p>Loading appointments...</p>
                </td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-12 text-center text-slate-500"
                >
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-medium text-slate-700">
                    No appointments found
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try changing your filters or schedule a new appointment.
                  </p>
                </td>
              </tr>
            ) : (
              appointments.map((apt) => (
                <tr
                  key={apt.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>{apt.appointment_date}</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{apt.time_slot}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">
                      {apt.patient?.full_name || "Patient"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {apt.patient?.phone || apt.patient_id}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">
                      Dr. {apt.doctor?.full_name || "Provider"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {apt.doctor?.specialty || "General"}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                      {apt.appointment_type}
                    </span>
                    {apt.notes && (
                      <p className="text-xs text-slate-400 italic mt-0.5 truncate max-w-xs">
                        "{apt.notes}"
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-4">{getStatusBadge(apt.status)}</td>

                  <td className="px-6 py-4 text-right">
                    {apt.status === "SCHEDULED" ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            onUpdateStatus &&
                            onUpdateStatus(apt.id, "COMPLETED")
                          }
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded transition-colors"
                          title="Mark as Completed"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() =>
                            onCancelAppointment && onCancelAppointment(apt.id)
                          }
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded transition-colors"
                          title="Cancel Appointment"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-mono">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
