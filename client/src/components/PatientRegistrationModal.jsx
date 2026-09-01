import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  CheckCircle,
  User,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { createPatient } from "../services/api";

export default function PatientRegistrationModal({
  isOpen,
  onClose,
  onSuccess,
  onViewExistingPatient,
}) {
  const initialFormState = {
    full_name: "",
    date_of_birth: "",
    gender: "Male",
    contact_number: "",
    email: "",
    address: "",
    ssn: "",
    emergency_name: "",
    emergency_relation: "",
    emergency_phone: "",
    insurance_provider: "",
    insurance_policy: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e, overrideDuplicate = false) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    if (!overrideDuplicate) {
      setDuplicateWarning(null);
    }

    const payload = {
      full_name: formData.full_name,
      date_of_birth: formData.date_of_birth,
      gender: formData.gender,
      contact_number: formData.contact_number,
      email: formData.email || null,
      address: formData.address || null,
      ssn: formData.ssn || null,
      emergency_contact: formData.emergency_name
        ? {
            name: formData.emergency_name,
            relationship: formData.emergency_relation,
            phone: formData.emergency_phone,
          }
        : null,
      insurance_info: formData.insurance_provider
        ? {
            provider: formData.insurance_provider,
            policy_number: formData.insurance_policy,
          }
        : null,
    };

    try {
      const created = await createPatient(payload, overrideDuplicate);
      setIsSubmitting(false);
      setFormData(initialFormState);
      setDuplicateWarning(null);
      onSuccess(created);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      if (err.response?.status === 409 && err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === "object" && detail.duplicate_found) {
          setDuplicateWarning(detail);
          return;
        }
      }
      const msg =
        typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : err.message || "Failed to register patient record.";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 transform transition-all">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold">Register New Patient</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Duplicate Warning Banner */}
        {duplicateWarning && (
          <div className="bg-amber-50 border-b border-amber-200 p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Potential Duplicate Record Found!
                </h4>
                <p className="text-xs text-amber-800 mt-1">
                  {duplicateWarning.message ||
                    "A patient with matching SSN or Name & Date of Birth already exists."}
                </p>
                {duplicateWarning.existing_patient && (
                  <div className="mt-2 text-xs bg-white/80 p-2.5 rounded border border-amber-200 text-slate-800">
                    <div>
                      <strong>Code:</strong>{" "}
                      {duplicateWarning.existing_patient.patient_code}
                    </div>
                    <div>
                      <strong>Name:</strong>{" "}
                      {duplicateWarning.existing_patient.full_name}
                    </div>
                    <div>
                      <strong>DOB:</strong>{" "}
                      {duplicateWarning.existing_patient.date_of_birth}
                    </div>
                  </div>
                )}
                <div className="mt-3 flex items-center space-x-3">
                  {duplicateWarning.existing_patient?.id && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onViewExistingPatient)
                          onViewExistingPatient(
                            duplicateWarning.existing_patient.id,
                          );
                      }}
                      className="px-3 py-1.5 bg-amber-800 text-white text-xs font-semibold rounded hover:bg-amber-900 transition-colors"
                    >
                      View Existing Profile
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleSubmit(null, true)}
                    disabled={isSubmitting}
                    className="px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded hover:bg-amber-700 transition-colors inline-flex items-center"
                  >
                    Proceed & Override Duplicate
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="bg-red-50 border-b border-red-200 p-4 text-xs text-red-700 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Form Body */}
        <form
          onSubmit={(e) => handleSubmit(e, false)}
          className="p-6 space-y-5 max-h-[80vh] overflow-y-auto"
        >
          {/* Section 1: Demographics */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              1. Demographics & Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  required
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contact_number"
                  required
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="e.g. 555-0199"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SSN / National ID (for duplicate check)
                </label>
                <input
                  type="text"
                  name="ssn"
                  value={formData.ssn}
                  onChange={handleChange}
                  placeholder="e.g. XXX-XX-1234"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Home Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Health Ave, Suite 400, City, State"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Emergency Contact */}
          <div className="pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              2. Emergency Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  name="emergency_name"
                  value={formData.emergency_name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  name="emergency_relation"
                  value={formData.emergency_relation}
                  onChange={handleChange}
                  placeholder="Spouse / Parent"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="emergency_phone"
                  value={formData.emergency_phone}
                  onChange={handleChange}
                  placeholder="555-0188"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Insurance */}
          <div className="pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              3. Insurance Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Insurance Provider
                </label>
                <input
                  type="text"
                  name="insurance_provider"
                  value={formData.insurance_provider}
                  onChange={handleChange}
                  placeholder="BlueCross / Aetna / Medicare"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Policy / ID Number
                </label>
                <input
                  type="text"
                  name="insurance_policy"
                  value={formData.insurance_policy}
                  onChange={handleChange}
                  placeholder="INS-99882"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 inline-flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Registering...
                </>
              ) : (
                "Confirm & Register Patient"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
