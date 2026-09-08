import React, { useState, useEffect } from "react";
import { Users, UserPlus, AlertCircle, X, ShieldCheck } from "lucide-react";
import ResidentDirectoryTable from "../components/directory/ResidentDirectoryTable.jsx";
import HouseholdOverviewPanel from "../components/directory/HouseholdOverviewPanel.jsx";
import { getResidents, registerUser } from "../services/api.js";

export default function DirectoryPage() {
  const [residents, setResidents] = useState([]);
  const [selectedResident, setSelectedResident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Resident Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Resident");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("password123");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchResidentList = async () => {
    try {
      const data = await getResidents();
      if (Array.isArray(data) && data.length > 0) {
        setResidents(data);
        if (!selectedResident) {
          setSelectedResident(data[0]);
        }
      } else {
        // Fallback default mock residents
        const mockData = [
          {
            id: "res-1",
            full_name: "John Doe",
            email: "john.doe@example.com",
            phone: "+1 (555) 012-3456",
            role: "Resident",
            household_address: "House #12 - Elm Street",
            is_active: true,
          },
          {
            id: "res-2",
            full_name: "Jane Smith",
            email: "admin.jane@village.org",
            phone: "+1 (555) 987-6543",
            role: "Admin",
            household_address: "Administration Office",
            is_active: true,
          },
          {
            id: "res-3",
            full_name: "Robert Johnson",
            email: "staff.robert@village.org",
            phone: "+1 (555) 456-7890",
            role: "Staff",
            household_address: "Maintenance Depot",
            is_active: true,
          },
        ];
        setResidents(mockData);
        setSelectedResident(mockData[0]);
      }
    } catch (err) {
      console.warn("Using default residents fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidentList();
  }, []);

  const handleAddResidentSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    setIsSubmitting(true);
    try {
      await registerUser({
        full_name: fullName,
        email,
        phone,
        role,
        household_address: address,
        password,
      });

      setShowAddModal(false);
      setFullName("");
      setEmail("");
      setPhone("");
      setAddress("");
      await fetchResidentList();
    } catch (err) {
      if (err.response?.status === 409) {
        setErrorMsg(
          "409 Conflict: A resident with this email address already exists.",
        );
      } else {
        setErrorMsg(
          err.response?.data?.detail || "Failed to register resident.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Resident Directory &
            Household Profiles
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage village resident records, search profiles, inspect household
            addresses, and assign RBAC roles (Admin, Resident, Staff).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Resident</span>
        </button>
      </div>

      {/* Grid: Directory Table & Household Side Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ResidentDirectoryTable
            residents={residents}
            onSelectResident={(r) => setSelectedResident(r)}
            onAddResident={() => setShowAddModal(true)}
          />
        </div>

        <div>
          <HouseholdOverviewPanel selectedResident={selectedResident} />
        </div>
      </div>

      {/* Add Resident Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 text-slate-900 border border-slate-200">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" /> Register Resident
                Account
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form
              onSubmit={handleAddResidentSubmit}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alice Johnson"
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alice@example.com"
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-2.5 border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    RBAC Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                  >
                    <option value="Resident">Resident</option>
                    <option value="Admin">Admin</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Household Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. House #24 - Maple Drive"
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? "Registering..." : "Register Resident"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
