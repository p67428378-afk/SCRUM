import React from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Calendar,
  Phone,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  AlertCircle,
} from "lucide-react";

export default function PatientDirectoryTable({
  patients = [],
  total = 0,
  skip = 0,
  limit = 20,
  onPageChange,
  isLoading = false,
  onOpenRegisterModal,
}) {
  const navigate = useNavigate();

  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.ceil(total / limit) || 1;

  const handleRowClick = (patientId) => {
    navigate(`/patients/${patientId}`);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Patient Code / ID
              </th>
              <th
                scope="col"
                className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Patient Name
              </th>
              <th
                scope="col"
                className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                DOB / Gender
              </th>
              <th
                scope="col"
                className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Contact Number
              </th>
              <th
                scope="col"
                className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Insurance Provider
              </th>
              <th
                scope="col"
                className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Last Visit / Created
              </th>
              <th
                scope="col"
                className="px-6 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-12 text-center text-slate-500"
                >
                  <div className="inline-flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading patient directory...</span>
                  </div>
                </td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="max-w-sm mx-auto text-center">
                    <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-slate-900 mb-1">
                      No patient records found
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Try adjusting your search criteria or register a new
                      patient profile.
                    </p>
                    <button
                      onClick={onOpenRegisterModal}
                      className="inline-flex items-center px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-md shadow-sm transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Register New Patient
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              patients.map((patient) => {
                const insurance =
                  typeof patient.insurance_info === "string"
                    ? patient.insurance_info
                    : patient.insurance_info?.provider ||
                      patient.insurance_info?.id ||
                      "Self-Pay / N/A";

                const formattedDOB = patient.date_of_birth
                  ? new Date(patient.date_of_birth).toLocaleDateString()
                  : "N/A";

                const lastVisitDate = patient.last_visit || patient.created_at;
                const formattedLastVisit = lastVisitDate
                  ? new Date(lastVisitDate).toLocaleDateString()
                  : "N/A";

                return (
                  <tr
                    key={patient.id}
                    onClick={() => handleRowClick(patient.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Patient Code */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 font-mono">
                        {patient.patient_code || patient.id?.substring(0, 8)}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs mr-3">
                          {patient.full_name
                            ? patient.full_name.charAt(0).toUpperCase()
                            : "P"}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {patient.full_name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {patient.email || "No email provided"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* DOB & Gender */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-800">
                        {formattedDOB}
                      </div>
                      <div className="text-xs text-slate-500">
                        {patient.gender || "Unspecified"}
                      </div>
                    </td>

                    {/* Contact Number */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      <div className="flex items-center text-slate-600">
                        <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        {patient.contact_number || "N/A"}
                      </div>
                    </td>

                    {/* Insurance Info */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      <div className="flex items-center">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                        <span
                          className="truncate max-w-[140px]"
                          title={insurance}
                        >
                          {insurance}
                        </span>
                      </div>
                    </td>

                    {/* Last Visit */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {formattedLastVisit}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(patient.id);
                        }}
                        className="inline-flex items-center text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View Profile
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-200/80 flex items-center justify-between">
        <div className="text-xs text-slate-600">
          Showing{" "}
          <span className="font-semibold text-slate-900">
            {total === 0 ? 0 : skip + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-slate-900">
            {Math.min(skip + limit, total)}
          </span>{" "}
          of <span className="font-semibold text-slate-900">{total}</span>{" "}
          patients
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          <span className="text-xs font-medium text-slate-700 px-2">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
