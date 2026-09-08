import React, { useState } from "react";
import {
  Search,
  UserPlus,
  Filter,
  ShieldCheck,
  Mail,
  Phone,
  Home,
} from "lucide-react";

export default function ResidentDirectoryTable({
  residents = [],
  onSelectResident,
  onAddResident,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState(null);

  const filteredResidents = residents.filter((r) => {
    const matchesSearch =
      (r.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.household_address || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "ALL" ||
      (r.role || "").toUpperCase() === roleFilter.toUpperCase();
    return matchesSearch && matchesRole;
  });

  const handleRowClick = (resident) => {
    setSelectedId(resident.id);
    if (onSelectResident) {
      onSelectResident(resident);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch ((role || "").toUpperCase()) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "STAFF":
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      {/* Header controls */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-50/50">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search residents, emails, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <Filter className="w-3.5 h-3.5" />
            <span>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Roles</option>
              <option value="RESIDENT">Resident</option>
              <option value="ADMIN">Admin</option>
              <option value="STAFF">Staff</option>
            </select>
          </div>

          {onAddResident && (
            <button
              onClick={onAddResident}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-md font-medium transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Resident</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
            <tr>
              <th className="p-3.5">Full Name</th>
              <th className="p-3.5">Email</th>
              <th className="p-3.5">Phone</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Household Address</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {filteredResidents.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  No resident records found.
                </td>
              </tr>
            ) : (
              filteredResidents.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => handleRowClick(r)}
                  className={`cursor-pointer hover:bg-blue-50/50 transition-colors ${
                    selectedId === r.id
                      ? "bg-blue-50 border-l-4 border-l-blue-600"
                      : ""
                  }`}
                >
                  <td className="p-3.5 font-semibold text-slate-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                      {(r.full_name || "R").charAt(0).toUpperCase()}
                    </div>
                    <span>{r.full_name || "Unnamed Resident"}</span>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{r.email}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{r.phone || "N/A"}</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getRoleBadgeClass(r.role)}`}
                    >
                      {r.role || "Resident"}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <div className="flex items-center gap-1">
                      <Home className="w-3 h-3 text-slate-400" />
                      <span>{r.household_address || "Unassigned"}</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        r.is_active !== false
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {r.is_active !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
