import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AppointmentScheduleTable from "../components/AppointmentScheduleTable";
import AppointmentBookingForm from "../components/AppointmentBookingForm";
import {
  getAppointments,
  getDoctors,
  updateAppointment,
  cancelAppointment,
} from "../services/api";

export default function AppointmentsPage() {
  const [searchParams] = useSearchParams();
  const queryPatientId = searchParams.get("patient_id") || "";

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [isBookingModalOpen, setIsBookingModalOpen] =
    useState(!!queryPatientId);

  const fetchDoctors = async () => {
    try {
      const data = await getDoctors();
      setDoctors(data || []);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    }
  };

  const fetchAppointmentsList = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedDoctorId) params.doctor_id = selectedDoctorId;
      if (selectedDate) params.date = selectedDate;
      if (selectedStatus) params.status = selectedStatus;
      if (queryPatientId) params.patient_id = queryPatientId;

      const data = await getAppointments(params);
      setAppointments(data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err.message || "Failed to load appointments.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchAppointmentsList();
  }, [selectedDoctorId, selectedDate, selectedStatus, queryPatientId]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateAppointment(id, { status });
      fetchAppointmentsList();
    } catch (err) {
      alert(
        "Failed to update status: " +
          (err.response?.data?.detail || err.message),
      );
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await cancelAppointment(id);
        fetchAppointmentsList();
      } catch (err) {
        alert(
          "Failed to cancel appointment: " +
            (err.response?.data?.detail || err.message),
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      <AppointmentScheduleTable
        appointments={appointments}
        doctors={doctors}
        loading={loading}
        error={error}
        selectedDoctorId={selectedDoctorId}
        selectedDate={selectedDate}
        selectedStatus={selectedStatus}
        onDoctorFilterChange={(id) => setSelectedDoctorId(id)}
        onDateFilterChange={(d) => setSelectedDate(d)}
        onStatusFilterChange={(s) => setSelectedStatus(s)}
        onOpenBookingModal={() => setIsBookingModalOpen(true)}
        onUpdateStatus={handleUpdateStatus}
        onCancelAppointment={handleCancel}
      />

      <AppointmentBookingForm
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialPatientId={queryPatientId}
        onAppointmentCreated={() => fetchAppointmentsList()}
      />
    </div>
  );
}
