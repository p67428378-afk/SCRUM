import React from "react";
import { Home, Users, Car, PhoneCall, Shield, AlertCircle } from "lucide-react";

export default function HouseholdOverviewPanel({ selectedResident }) {
  if (!selectedResident) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm text-center">
        <Home className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-700">Household Overview</h3>
        <p className="text-xs text-slate-500 mt-1">
          Select a resident from the directory to inspect household details,
          vehicles, and emergency contacts.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-900 text-white p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
          <Home className="w-4 h-4" />
          <span>Household Directory Profile</span>
        </div>
        <h2 className="text-lg font-bold text-white mt-1">
          {selectedResident.household_address || "House #12 - Elm Street"}
        </h2>
        <p className="text-xs text-slate-300">
          Head of Household: {selectedResident.full_name}
        </p>
      </div>

      <div className="p-4 space-y-4 text-xs">
        {/* Resident Summary */}
        <div className="bg-slate-50 rounded-md p-3 border border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-600" /> Household
              Occupants (3)
            </span>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold">
              Verified
            </span>
          </div>
          <ul className="space-y-1.5 text-slate-600">
            <li className="flex justify-between">
              <span className="font-medium text-slate-800">
                {selectedResident.full_name}
              </span>
              <span className="text-slate-400">
                Primary ({selectedResident.role || "Resident"})
              </span>
            </li>
            <li className="flex justify-between">
              <span>Sarah Doe</span>
              <span className="text-slate-400">Spouse</span>
            </li>
            <li className="flex justify-between">
              <span>Tommy Doe</span>
              <span className="text-slate-400">Dependent</span>
            </li>
          </ul>
        </div>

        {/* Registered Vehicles */}
        <div className="border border-slate-200 rounded-md p-3">
          <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-2">
            <Car className="w-3.5 h-3.5 text-slate-600" /> Registered Vehicles
          </div>
          <div className="space-y-1 text-slate-600">
            <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
              <div>
                <div className="font-semibold text-slate-800">
                  Toyota RAV4 (Silver)
                </div>
                <div className="text-[10px] text-slate-400">
                  Permit #VIL-8842
                </div>
              </div>
              <span className="bg-slate-200 text-slate-800 font-mono text-[10px] px-1.5 py-0.5 rounded">
                ABC-1234
              </span>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="border border-red-200 bg-red-50/50 rounded-md p-3">
          <div className="font-bold text-red-800 flex items-center gap-1.5 mb-1">
            <PhoneCall className="w-3.5 h-3.5 text-red-600" /> Emergency Contact
          </div>
          <div className="text-slate-700">
            <div className="font-medium">Jane Smith (Sister)</div>
            <div className="text-slate-500 text-[11px]">+1 (555) 019-2834</div>
          </div>
        </div>
      </div>
    </div>
  );
}
