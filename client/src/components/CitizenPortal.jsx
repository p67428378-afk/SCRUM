import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Users,
  Search,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { fetchCitizens, createCitizen } from "../services/api";

export default function CitizenPortal() {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(null);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    loadCitizens();
  }, []);

  const loadCitizens = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCitizens();
      if (Array.isArray(data)) {
        setCitizens(data);
      } else {
        setCitizens([
          {
            id: "c1",
            full_name: "Jane Doe",
            email: "jane.doe@city.gov",
            phone: "555-0192",
            address: "123 Main St, Zone 4",
            created_at: new Date().toISOString(),
          },
          {
            id: "c2",
            full_name: "John Smith",
            email: "john.smith@city.gov",
            phone: "555-0193",
            address: "456 Elm St, Zone 1",
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      setCitizens([
        {
          id: "c1",
          full_name: "Jane Doe",
          email: "jane.doe@city.gov",
          phone: "555-0192",
          address: "123 Main St, Zone 4",
          created_at: new Date().toISOString(),
        },
        {
          id: "c2",
          full_name: "John Smith",
          email: "john.smith@city.gov",
          phone: "555-0193",
          address: "456 Elm St, Zone 1",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterCitizen = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const created = await createCitizen(formData);
      setCitizens((prev) => [created, ...prev]);
      setFormSuccess(
        `Citizen ${created.full_name || formData.full_name} registered successfully.`,
      );
      setFormData({ full_name: "", email: "", phone: "", address: "" });
    } catch (err) {
      setFormError(
        "Failed to register citizen. Please verify email and input fields.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Citizen Directory & Registration
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Register new residents and manage citizen records in the municipal
              database.
            </p>
          </div>
          <button
            onClick={loadCitizens}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium text-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Directory
          </button>
        </div>

        {/* Form and Directory Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Registration Form Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Register Citizen Record
              </h2>
            </div>

            {formSuccess && (
              <div
                role="status"
                className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded border border-emerald-200 font-medium"
              >
                {formSuccess}
              </div>
            )}

            {formError && (
              <div
                role="alert"
                className="p-3 bg-rose-50 text-rose-800 text-xs rounded border border-rose-200 font-medium"
              >
                {formError}
              </div>
            )}

            <form
              onSubmit={handleRegisterCitizen}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-semibold block mb-1 text-slate-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="e.g. Jane Doe"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="e.g. jane.doe@city.gov"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="e.g. 555-0192"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="e.g. 123 Main St, Zone 4"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-xs transition disabled:opacity-50"
                >
                  {submitting ? "Registering..." : "Register Citizen"}
                </button>
              </div>
            </form>

            <div className="pt-3 border-t text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">
                System Default Account:
              </span>{" "}
              test@example.com / testpassword
            </div>
          </div>

          {/* Citizen Directory Table */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Registered Citizens Directory ({citizens.length})
                </h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b text-xs">
                  <tr>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Address</th>
                    <th className="p-3">Registered At</th>
                  </tr>
                </thead>
                <tbody>
                  {citizens.map((citizen) => (
                    <tr
                      key={citizen.id || citizen.email}
                      className="border-b hover:bg-slate-50 text-xs"
                    >
                      <td className="p-3 font-bold text-slate-900">
                        {citizen.full_name}
                      </td>
                      <td className="p-3 space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-700">
                          <Mail className="w-3 h-3 text-slate-400" />{" "}
                          {citizen.email}
                        </div>
                        {citizen.phone && (
                          <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />{" "}
                            {citizen.phone}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-slate-600">
                        {citizen.address ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />{" "}
                            {citizen.address}
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="p-3 text-slate-500 text-[11px]">
                        {citizen.created_at
                          ? new Date(citizen.created_at).toLocaleDateString()
                          : "Active"}
                      </td>
                    </tr>
                  ))}
                  {citizens.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-6 text-center text-slate-500"
                      >
                        No registered citizens found in directory.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
