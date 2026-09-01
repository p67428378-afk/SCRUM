import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  createAppointment,
  getDoctors,
  getPatients,
  getAvailableSlots,
} from "../services/api";

export default function AppointmentBookingForm({
  isOpen,
  onClose,
  initialPatientId = "",
  onAppointmentCreated,
}) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: initialPatientId || "",
    doctor_id: "",
    appointment_date: new Date().toISOString().split("T")[0],
    time_slot: "",
    appointment_type: "General Consultation",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collisionError, setCollisionError] = useState(null);

  useEffect(() => {
    if (initialPatientId) {
      setFormData((prev) => ({ ...prev, patient_id: initialPatientId }));
    }
  }, [initialPatientId]);

  useEffect(() => {
    if (isOpen) {
      // Load patients and doctors
      getPatients(0, 100)
        .then((data) => setPatients(data || []))
        .catch((err) =>
          console.error("Failed to load patients for booking:", err),
        );

      getDoctors()
        .then((data) => setDoctors(data || []))
        .catch((err) =>
          console.error("Failed to load doctors for booking:", err),
        );
    }
  }, [isOpen]);

  // Fetch available slots when doctor_id and appointment_date change
  useEffect(() => {
    if (formData.doctor_id && formData.appointment_date) {
      setLoadingSlots(true);
      getAvailableSlots(formData.doctor_id, formData.appointment_date)
        .then((slots) => {
          setAvailableSlots(slots || []);
          setLoadingSlots(false);
          // If current time_slot not in available slots, reset or auto-select first
          if (
            slots &&
            slots.length > 0 &&
            !slots.includes(formData.time_slot)
          ) {
            setFormData((prev) => ({ ...prev, time_slot: slots[0] }));
          }
        })
        .catch((err) => {
          console.error("Failed to fetch available slots:", err);
          setLoadingSlots(false);
          // Fallback slots if endpoint fails
          const defaultSlots = [
            "09:00 AM",
            "10:00 AM",
            "11:00 AM",
            "01:00 PM",
            "02:00 PM",
            "03:00 PM",
            "04:00 PM",
          ];
          setAvailableSlots(defaultSlots);
          if (!formData.time_slot) {
            setFormData((prev) => ({ ...prev, time_slot: defaultSlots[0] }));
          }
        });
    }
  }, [formData.doctor_id, formData.appointment_date]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setCollisionError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCollisionError(null);

    try {
      const payload = {
        patient_id: formData.patient_id,
        doctor_id: formData.doctor_id,
        appointment_date: formData.appointment_date,
        time_slot: formData.time_slot,
        appointment_type: formData.appointment_type,
        notes: formData.notes.trim() || null,
      };

      const result = await createAppointment(payload);
      setLoading(false);
      if (onAppointmentCreated) {
        onAppointmentCreated(result);
      }
      onClose();
    } catch (err) {
      setLoading(false);
      const detail = err.response?.data?.detail;
      if (err.response?.status === 400) {
        setCollisionError(
          typeof detail === "string"
            ? detail
            : "Slot collision: Doctor is unavailable at this time slot. Please choose another slot.",
        );
      } else if (Array.isArray(detail)) {
        const msgs = detail
          .map((d) => `${d.loc.join(".")}: ${d.msg}`)
          .join(", ");
        setError(msgs);
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("Failed to book appointment. Please check required fields.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-xl w-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-lg">
            <Calendar className="w-5 h-5" />
            <span>Book New Patient Appointment</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div
              role="alert"
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {collisionError && (
            <div
              role="alert"
              className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 mb-0.5">
                  Slot Collision Error (400)
                </p>
                <p>{collisionError}</p>
                {availableSlots.length > 0 && (
                  <p className="mt-1 font-semibold text-amber-700">
                    Alternative available slots: {availableSlots.join(", ")}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Patient Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Select Patient <span className="text-red-500">*</span>
            </label>
            <select
              name="patient_id"
              required
              value={formData.patient_id}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="">Select Patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.phone || p.id.slice(0, 8)})
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Select Doctor <span className="text-red-500">*</span>
            </label>
            <select
              name="doctor_id"
              required
              value={formData.doctor_id}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="">Select Healthcare Provider</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.full_name} — {d.specialty}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time Slot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Appointment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="appointment_date"
                required
                value={formData.appointment_date}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Time Slot <span className="text-red-500">*</span>
              </label>
              {loadingSlots ? (
                <div className="px-3 py-2 text-xs text-slate-400 border border-slate-200 rounded-lg">
                  Checking provider availability...
                </div>
              ) : availableSlots.length > 0 ? (
                <select
                  name="time_slot"
                  required
                  value={formData.time_slot}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="">Select Available Slot</option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="time_slot"
                  required
                  value={formData.time_slot}
                  onChange={handleChange}
                  placeholder="e.g. 09:00 AM"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              )}
            </div>
          </div>

          {/* Appointment Type */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Appointment Type <span className="text-red-500">*</span>
            </label>
            <select
              name="appointment_type"
              value={formData.appointment_type}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="General Consultation">General Consultation</option>
              <option value="Follow-up Visit">Follow-up Visit</option>
              <option value="Emergency Intake">Emergency Intake</option>
              <option value="Routine Checkup">Routine Checkup</option>
              <option value="Specialist Referral">Specialist Referral</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Reason / Notes
            </label>
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Chief complaint or consultation reason..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-medium text-sm rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Reserving Slot...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Booking</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
