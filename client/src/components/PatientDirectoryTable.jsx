import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  User,
  Phone,
  Mail,
  FileText,
  Calendar,
} from "lucide-react";

export default function PatientDirectoryTable({
  patients = [],
  loading = false,
  error = null,
  searchQuery = "",
  onSearchChange,
  onOpenIntakeModal,
  page = 0,
  limit = 20,
  onPageChange,
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Patient Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, filter, and manage patient profiles across the facility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Name, ID, or Phone..."
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>

          {/* Register Patient Button */}
          <button
            onClick={onOpenIntakeModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Patient Intake</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>Failed to load patient records: {error}</span>
        </div>
      )}

      {/* Patients Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-200">
              <th className="px-6 py-3">Patient Name & ID</th>
              <th className="px-6 py-3">DOB & Gender</th>
              <th className="px-6 py-3">Contact</th>
              <th className="px-6 py-3">Insurance</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-slate-500"
                >
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700 mb-2"></div>
                  <p>Loading patient directory...</p>
                </td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-slate-500"
                >
                  <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-medium text-slate-700">
                    No patients found
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try adjusting your search criteria or register a new
                    patient.
                  </p>
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">
                      {patient.full_name}
                    </div>
                    <div className="text-xs font-mono text-slate-500 mt-0.5">
                      {patient.id}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900">{patient.dob}</div>
                    <div className="text-xs text-slate-500 capitalize">
                      {patient.gender}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{patient.phone}</span>
                    </div>
                    {patient.email && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{patient.email}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {patient.insurance_provider ? (
                      <div>
                        <span className="font-medium text-slate-800">
                          {patient.insurance_provider}
                        </span>
                        {patient.insurance_policy_number && (
                          <div className="text-xs text-slate-500 font-mono">
                            #{patient.insurance_policy_number}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Self-pay / Unspecified
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/patients/${patient.id}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded transition-colors"
                        title="View Medical Chart & Records"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View EMR</span>
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/appointments?patient_id=${patient.id}`)
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded transition-colors"
                        title="Schedule Appointment"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Schedule</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Pagination */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing page{" "}
          <span className="font-semibold text-slate-700">{page + 1}</span> (
          {patients.length} items shown)
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 0 || loading}
            onClick={() => onPageChange && onPageChange(page - 1)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded font-medium hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            disabled={patients.length < limit || loading}
            onClick={() => onPageChange && onPageChange(page + 1)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded font-medium hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
