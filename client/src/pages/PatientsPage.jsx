import React, { useState, useEffect } from "react";
import PatientDirectoryTable from "../components/PatientDirectoryTable";
import PatientIntakeForm from "../components/PatientIntakeForm";
import {
  getPatients,
  searchPatients,
  getAppointments,
  getDoctors,
} from "../services/api";
import { Users, Calendar, Stethoscope, UserCheck } from "lucide-react";

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const [isIntakeOpen, setIsIntakeOpen] = useState(false);

  // Summary Metrics State
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayRegistrations: 0,
    scheduledAppointments: 0,
    availableDoctors: 0,
  });

  const fetchPatientsList = async () => {
    setLoading(true);
    setError(null);
    try {
      let data = [];
      if (searchQuery.trim()) {
        data = await searchPatients(searchQuery.trim(), page * limit, limit);
      } else {
        data = await getPatients(page * limit, limit);
      }
      setPatients(data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError(err.message || "Failed to fetch patients.");
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const [allPats, allApts, allDocs] = await Promise.all([
        getPatients(0, 100),
        getAppointments(),
        getDoctors(),
      ]);

      const total = allPats ? allPats.length : 0;
      const todayStr = new Date().toISOString().split("T")[0];
      const todayRegs = allPats
        ? allPats.filter(
            (p) => p.created_at && p.created_at.startsWith(todayStr),
          ).length
        : 0;
      const scheduledCount = allApts
        ? allApts.filter((a) => a.status === "SCHEDULED").length
        : 0;
      const doctorsCount = allDocs ? allDocs.length : 0;

      setStats({
        totalPatients: total,
        todayRegistrations: todayRegs,
        scheduledAppointments: scheduledCount,
        availableDoctors: doctorsCount,
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    }
  };

  useEffect(() => {
    fetchPatientsList();
  }, [searchQuery, page]);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handlePatientCreated = (newPatient) => {
    fetchPatientsList();
    fetchMetrics();
  };

  return (
    <div className="space-y-6">
      {/* Summary Key Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Registered Patients
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {stats.totalPatients}
            </h3>
            <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">
              Active EMR Profiles
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Today's Intake Registrations
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {stats.todayRegistrations}
            </h3>
            <span className="text-xs text-blue-600 font-semibold mt-1 inline-block">
              Intake Queue Active
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Scheduled Appointments
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {stats.scheduledAppointments}
            </h3>
            <span className="text-xs text-blue-600 font-semibold mt-1 inline-block">
              Facility Slots Booked
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Healthcare Providers
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {stats.availableDoctors} Doctors
            </h3>
            <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">
              On Duty
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <PatientDirectoryTable
        patients={patients}
        loading={loading}
        error={error}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setPage(0);
        }}
        onOpenIntakeModal={() => setIsIntakeOpen(true)}
        page={page}
        limit={limit}
        onPageChange={(p) => setPage(p)}
      />

      {/* Intake Modal */}
      <PatientIntakeForm
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        onPatientCreated={handlePatientCreated}
      />
    </div>
  );
}
