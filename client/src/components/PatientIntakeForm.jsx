import React, { useState } from "react";
import { X, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import { createPatient } from "../services/api";

export default function PatientIntakeForm({
  isOpen,
  onClose,
  onPatientCreated,
}) {
  const [formData, setFormData] = useState({
    full_name: "",
    dob: "",
    gender: "Male",
    phone: "",
    email: "",
    emergency_contact: "",
    insurance_provider: "",
    insurance_policy_number: "",
    ssn: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setDuplicateWarning(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDuplicateWarning(null);

    try {
      const payload = {
        full_name: formData.full_name.trim(),
        dob: formData.dob,
        gender: formData.gender,
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        emergency_contact: formData.emergency_contact.trim(),
        insurance_provider: formData.insurance_provider.trim() || null,
        insurance_policy_number:
          formData.insurance_policy_number.trim() || null,
        ssn: formData.ssn.trim() || null,
      };

      const result = await createPatient(payload);
      setLoading(false);
      if (onPatientCreated) {
        onPatientCreated(result);
      }
      onClose();
    } catch (err) {
      setLoading(false);
      const detail = err.response?.data?.detail;
      if (
        err.response?.status === 400 &&
        typeof detail === "string" &&
        detail.toLowerCase().includes("ssn")
      ) {
        setDuplicateWarning(
          detail ||
            "Warning: Patient with this SSN already exists in the system.",
        );
      } else if (Array.isArray(detail)) {
        const msgs = detail
          .map((d) => `${d.loc.join(".")}: ${d.msg}`)
          .join(", ");
        setError(msgs);
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("Failed to register patient. Please check required fields.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-lg">
            <UserPlus className="w-5 h-5" />
            <span>New Patient Registration Intake</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Error & Warning Alerts */}
          {error && (
            <div
              role="alert"
              className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Registration Failed</p>
                <p className="text-xs text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {duplicateWarning && (
            <div
              role="alert"
              className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-start gap-2"
            >
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Duplicate Profile Warning</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {duplicateWarning}
                </p>
              </div>
            </div>
          )}

          {/* Section 1: Demographic Info */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Demographic Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dob"
                  required
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Social Security Number (SSN)
                </label>
                <input
                  type="text"
                  name="ssn"
                  value={formData.ssn}
                  onChange={handleChange}
                  placeholder="XXX-XX-XXXX"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Info */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Contact & Emergency Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1-555-0199"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="patient@example.com"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Emergency Contact <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="emergency_contact"
                  required
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  placeholder="Name and phone number of contact"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Insurance Details */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Insurance Coverage (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Insurance Provider
                </label>
                <input
                  type="text"
                  name="insurance_provider"
                  value={formData.insurance_provider}
                  onChange={handleChange}
                  placeholder="e.g. HealthShield"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Policy Number
                </label>
                <input
                  type="text"
                  name="insurance_policy_number"
                  value={formData.insurance_policy_number}
                  onChange={handleChange}
                  placeholder="e.g. HS-998822"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
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
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Register Patient</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
