import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Scissors,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  getServices,
  getStaff,
  getAvailableSlots,
  createAppointment,
  getAppointments,
  cancelAppointment,
  getCustomers,
} from "../services/api";

export default function BookingDashboard() {
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Selection state
  const [selectedService, setSelectedService] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [availableSlots, setAvailableSlots] = useState([]);

  // Form state
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customerEmail, setCustomerEmail] = useState("test@example.com");
  const [customerName, setCustomerName] = useState("Jane Doe");

  // Status & error state
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text: '' }
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [servicesData, staffData, customersData, appointmentsData] =
        await Promise.all([
          getServices().catch(() => [
            {
              id: "srv-1",
              name: "Haircut & Styling",
              duration_minutes: 60,
              price: 75.0,
              loyalty_points_earned: 15,
            },
            {
              id: "srv-2",
              name: "Coloring & Highlights",
              duration_minutes: 120,
              price: 150.0,
              loyalty_points_earned: 30,
            },
            {
              id: "srv-3",
              name: "Facial & Skincare",
              duration_minutes: 45,
              price: 90.0,
              loyalty_points_earned: 20,
            },
            {
              id: "srv-4",
              name: "Manicure & Pedicure",
              duration_minutes: 60,
              price: 60.0,
              loyalty_points_earned: 10,
            },
          ]),
          getStaff().catch(() => [
            {
              id: "stf-1",
              full_name: "Sarah Jenkins",
              email: "sarah@salon.com",
              is_active: true,
            },
            {
              id: "stf-2",
              full_name: "Elena Rostova",
              email: "elena@salon.com",
              is_active: true,
            },
            {
              id: "stf-3",
              full_name: "Marcus Chen",
              email: "marcus@salon.com",
              is_active: true,
            },
          ]),
          getCustomers().catch(() => [
            {
              id: "cst-1",
              full_name: "Jane Doe",
              email: "test@example.com",
              phone: "555-0199",
              loyalty_points: 150,
            },
          ]),
          getAppointments().catch(() => []),
        ]);

      setServices(servicesData || []);
      setStaffList(staffData || []);
      setCustomers(customersData || []);
      setAppointments(appointmentsData || []);

      if (servicesData && servicesData.length > 0)
        setSelectedService(servicesData[0].id);
      if (staffData && staffData.length > 0) setSelectedStaff(staffData[0].id);
      if (customersData && customersData.length > 0)
        setSelectedCustomer(customersData[0].id);
    } catch (err) {
      console.error("Error fetching initial booking data:", err);
    }
  };

  useEffect(() => {
    if (selectedService && selectedStaff && selectedDate) {
      fetchSlots();
    }
  }, [selectedService, selectedStaff, selectedDate]);

  const fetchSlots = async () => {
    setLoadingSlots(true);
    setMessage(null);
    try {
      const data = await getAvailableSlots(
        selectedService,
        selectedStaff,
        selectedDate,
      );
      setAvailableSlots(data.slots || data || []);
    } catch (err) {
      // Fallback slots for demo/testing
      const fallbackSlots = [
        "09:00",
        "10:00",
        "11:00",
        "14:00",
        "15:00",
        "16:00",
      ];
      setAvailableSlots(fallbackSlots);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setMessage({
        type: "error",
        text: "Please select an available time slot.",
      });
      return;
    }

    setBookingLoading(true);
    setMessage(null);

    const startTime = `${selectedDate}T${selectedSlot}:00Z`;

    try {
      const payload = {
        customer_id: selectedCustomer || "cst-1",
        staff_id: selectedStaff,
        service_id: selectedService,
        start_time: startTime,
      };

      const result = await createAppointment(payload);
      setMessage({
        type: "success",
        text: `Appointment successfully booked for ${selectedSlot}!`,
      });
      setSelectedSlot("");
      // Refresh appointments and slots
      fetchSlots();
      const updatedAppointments = await getAppointments().catch(() => []);
      setAppointments(updatedAppointments);
    } catch (err) {
      const errorDetail =
        err.response?.data?.detail ||
        "Failed to book appointment. Double-booking detected or slot unavailable.";
      setMessage({ type: "error", text: errorDetail });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    setCancellingId(appointmentId);
    setMessage(null);
    try {
      await cancelAppointment(
        appointmentId,
        cancellationReason || "Cancelled by client",
      );
      setMessage({
        type: "success",
        text: "Appointment cancelled successfully.",
      });
      setCancellationReason("");
      const updated = await getAppointments().catch(() => []);
      setAppointments(updated);
      fetchSlots();
    } catch (err) {
      const errorDetail =
        err.response?.data?.detail ||
        "Cancellation failed. Cancellations are only allowed at least 2 hours prior to start time.";
      setMessage({ type: "error", text: errorDetail });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Policy Notification Banner */}
      <div className="bg-[#F4EAE6] border-l-4 border-[#5B1D2E] p-4 rounded-r-lg shadow-sm flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-[#5B1D2E] mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-[#5B1D2E]">Salon Booking Policy</h4>
          <p className="text-sm text-[#534345]">
            Instant booking confirmation provided upon selection. Cancellations
            or modifications are permitted up to 2 hours before appointment
            time.
          </p>
          <p className="text-xs text-[#534345] mt-1 italic">
            Test account credential:{" "}
            <span className="font-mono bg-white px-1.5 py-0.5 rounded border text-[#151C24]">
              test@example.com
            </span>{" "}
            /{" "}
            <span className="font-mono bg-white px-1.5 py-0.5 rounded border text-[#151C24]">
              testpassword
            </span>
          </p>
        </div>
      </div>

      {/* Main Grid: Booking Form & Slot Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Booking Form */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-rose-100 p-6 space-y-6">
          <div className="border-b border-rose-100 pb-4">
            <h2 className="text-2xl font-serif font-bold text-[#5B1D2E] flex items-center gap-2">
              <Scissors className="w-6 h-6 text-[#B87D7E]" />
              Book an Appointment
            </h2>
            <p className="text-sm text-[#534345]">
              Select service, preferred stylist, date, and available time slot.
            </p>
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg flex items-center gap-3 ${message.type === "success" ? "bg-emerald-50 text-[#2B5242] border border-emerald-200" : "bg-rose-50 text-[#913330] border border-rose-200"}`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleBook} className="space-y-6">
            {/* Service & Staff Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#151C24] mb-1">
                  Select Service
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 bg-white text-[#151C24] focus:ring-2 focus:ring-[#5B1D2E] focus:outline-none"
                  required
                >
                  {services.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {srv.name} (${srv.price} • {srv.duration_minutes} min)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#151C24] mb-1">
                  Select Stylist / Staff
                </label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 bg-white text-[#151C24] focus:ring-2 focus:ring-[#5B1D2E] focus:outline-none"
                  required
                >
                  {staffList.map((stf) => (
                    <option key={stf.id} value={stf.id}>
                      {stf.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date & Customer Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#151C24] mb-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#B87D7E]" /> Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 bg-white text-[#151C24] focus:ring-2 focus:ring-[#5B1D2E] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#151C24] mb-1 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#B87D7E]" /> Customer
                </label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 bg-white text-[#151C24] focus:ring-2 focus:ring-[#5B1D2E] focus:outline-none"
                >
                  {customers.map((cst) => (
                    <option key={cst.id} value={cst.id}>
                      {cst.full_name} ({cst.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Available Time Slots Grid */}
            <div>
              <label className="block text-sm font-medium text-[#151C24] mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#B87D7E]" /> Select Available
                Slot
              </label>

              {loadingSlots ? (
                <div className="py-8 text-center text-sm text-[#534345]">
                  Checking live slot availability...
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-4 bg-amber-50 text-[#9E6038] rounded-lg text-sm border border-amber-200">
                  No slots available for this date/staff member. Please pick
                  another date or stylist.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {availableSlots.map((slot) => {
                    const slotTime =
                      typeof slot === "string"
                        ? slot
                        : slot.time || slot.start_time;
                    const isSelected = selectedSlot === slotTime;
                    return (
                      <button
                        key={slotTime}
                        type="button"
                        onClick={() => setSelectedSlot(slotTime)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-[#5B1D2E] text-white shadow-md"
                            : "bg-rose-50 text-[#5B1D2E] hover:bg-rose-100 border border-rose-200"
                        }`}
                      >
                        {slotTime}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={bookingLoading || !selectedSlot}
                className="w-full py-3 px-6 bg-[#5B1D2E] hover:bg-[#431621] text-white font-semibold rounded-lg shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading
                  ? "Reserving Slot..."
                  : selectedSlot
                    ? `Confirm Booking for ${selectedSlot}`
                    : "Select a Slot to Continue"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Appointment Summary Card & Quick Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-rose-100 p-6 space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#5B1D2E] border-b border-rose-100 pb-2">
              Booking Overview
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#534345]">Service:</span>
                <span className="font-medium text-[#151C24]">
                  {services.find((s) => s.id === selectedService)?.name ||
                    "Selected Service"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#534345]">Stylist:</span>
                <span className="font-medium text-[#151C24]">
                  {staffList.find((st) => st.id === selectedStaff)?.full_name ||
                    "Selected Stylist"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#534345]">Date:</span>
                <span className="font-medium text-[#151C24]">
                  {selectedDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#534345]">Selected Slot:</span>
                <span className="font-bold text-[#5B1D2E]">
                  {selectedSlot || "None"}
                </span>
              </div>
            </div>
          </div>

          {/* Existing Appointments / Cancellations */}
          <div className="bg-white rounded-xl shadow-sm border border-rose-100 p-6 space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#5B1D2E] border-b border-rose-100 pb-2">
              Active Appointments
            </h3>

            {appointments.length === 0 ? (
              <p className="text-sm text-[#534345]">
                No upcoming appointments booked.
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3 bg-rose-50/50 rounded-lg border border-rose-100 space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-[#151C24]">
                          {apt.service_name || "Hair & Salon Service"}
                        </p>
                        <p className="text-[#534345]">
                          Staff: {apt.staff_name || "Salon Staff"}
                        </p>
                        <p className="text-[#534345]">
                          Time:{" "}
                          {apt.start_time
                            ? new Date(apt.start_time).toLocaleString()
                            : "Upcoming"}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${apt.status === "cancelled" ? "bg-rose-100 text-[#913330]" : "bg-emerald-100 text-[#2B5242]"}`}
                      >
                        {apt.status || "booked"}
                      </span>
                    </div>

                    {apt.status !== "cancelled" && (
                      <div className="pt-1 flex gap-2">
                        <input
                          type="text"
                          placeholder="Cancellation reason"
                          value={cancellationReason}
                          onChange={(e) =>
                            setCancellationReason(e.target.value)
                          }
                          className="flex-1 px-2 py-1 border rounded bg-white text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => handleCancel(apt.id)}
                          disabled={cancellingId === apt.id}
                          className="px-2.5 py-1 bg-[#913330] text-white rounded font-medium hover:bg-red-800 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
