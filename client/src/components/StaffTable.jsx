import React, { useState } from "react";
import { UserPlus, Search, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function StaffTable({
  staffList = [],
  services = [],
  onStaffCreated,
}) {
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New staff form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [workingHours, setWorkingHours] = useState("09:00 - 17:00");
  const [selectedServices, setSelectedServices] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const filteredStaff = staffList.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleToggleService = (srvId) => {
    setSelectedServices((prev) =>
      prev.includes(srvId)
        ? prev.filter((id) => id !== srvId)
        : [...prev, srvId],
    );
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        full_name: fullName,
        email,
        phone,
        working_hours: workingHours,
        service_ids: selectedServices,
        is_active: true,
      };
      if (onStaffCreated) {
        await onStaffCreated(payload);
      }
      setShowAddModal(false);
      setFullName("");
      setEmail("");
      setPhone("");
      setSelectedServices([]);
    } catch (err) {
      console.error("Failed to create staff:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-rose-100 p-6 space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-rose-100 pb-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#5B1D2E]">
            Staff Directory & Profiles
          </h2>
          <p className="text-sm text-[#534345]">
            Manage stylist qualifications, working shifts, and callable
            services.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search staff members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5B1D2E]"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#5B1D2E] hover:bg-[#431621] text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap shadow-sm"
          >
            <UserPlus className="w-4 h-4" /> Add Staff
          </button>
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-rose-50/60 text-[#5B1D2E] text-xs font-semibold uppercase tracking-wider border-b border-rose-100">
              <th className="p-3">Staff Member</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Working Shift</th>
              <th className="p-3">Assigned Services</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-100 text-sm">
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-[#534345]">
                  No staff members found matching search.
                </td>
              </tr>
            ) : (
              filteredStaff.map((staff) => (
                <tr
                  key={staff.id}
                  className="hover:bg-rose-50/30 transition-colors"
                >
                  <td className="p-3 font-medium text-[#151C24] flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F4EAE6] text-[#5B1D2E] font-serif font-bold flex items-center justify-center">
                      {staff.full_name ? staff.full_name.charAt(0) : "S"}
                    </div>
                    <div>
                      <p className="font-semibold text-[#151C24]">
                        {staff.full_name}
                      </p>
                      <p className="text-xs text-[#534345]">
                        ID: {staff.id?.slice(0, 8)}
                      </p>
                    </div>
                  </td>
                  <td className="p-3 text-[#534345]">
                    <p>{staff.email}</p>
                    <p className="text-xs">{staff.phone || "555-0100"}</p>
                  </td>
                  <td className="p-3 text-[#534345]">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-[#9E6038] text-xs font-medium border border-amber-200">
                      <Clock className="w-3.5 h-3.5" />
                      {staff.working_hours || "09:00 - 17:00"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {staff.services && staff.services.length > 0 ? (
                        staff.services.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-rose-100 text-[#5B1D2E] rounded text-xs"
                          >
                            {typeof s === "string" ? s : s.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">
                          Styling, Coloring, Treatments
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    {staff.is_active !== false ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-[#2B5242]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                        <XCircle className="w-3.5 h-3.5" /> Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-rose-100">
            <h3 className="text-lg font-serif font-bold text-[#5B1D2E]">
              Add New Staff Profile
            </h3>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#151C24] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-[#5B1D2E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#151C24] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. elena@salon.com"
                  className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-[#5B1D2E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#151C24] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 555-0144"
                  className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-[#5B1D2E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#151C24] mb-1">
                  Working Shift Hours
                </label>
                <input
                  type="text"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  placeholder="e.g. 09:00 - 17:00"
                  className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-[#5B1D2E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#151C24] mb-1">
                  Assigned Skill Services
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                  {services.map((srv) => (
                    <label
                      key={srv.id}
                      className="flex items-center space-x-2 text-xs cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(srv.id)}
                        onChange={() => handleToggleService(srv.id)}
                        className="rounded text-[#5B1D2E] focus:ring-[#5B1D2E]"
                      />
                      <span>{srv.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#5B1D2E] text-white rounded text-sm font-medium hover:bg-[#431621] disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Save Staff Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
