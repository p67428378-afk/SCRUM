import React from "react";
import { NavLink } from "react-router-dom";
import { Users, Calendar, Stethoscope, HeartPulse } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <NavLink
          to="/patients"
          className="flex items-center gap-2 text-xl font-bold text-blue-700"
        >
          <HeartPulse className="w-6 h-6 text-blue-700" />
          <span>CarePulse EHR</span>
        </NavLink>
        <div className="flex gap-6 text-sm font-medium text-slate-600">
          <NavLink
            to="/patients"
            className={({ isActive }) =>
              isActive
                ? "text-blue-700 font-semibold border-b-2 border-blue-700 pb-1 flex items-center gap-1.5"
                : "hover:text-blue-700 pb-1 flex items-center gap-1.5"
            }
          >
            <Users className="w-4 h-4" />
            <span>Patients</span>
          </NavLink>
          <NavLink
            to="/appointments"
            className={({ isActive }) =>
              isActive
                ? "text-blue-700 font-semibold border-b-2 border-blue-700 pb-1 flex items-center gap-1.5"
                : "hover:text-blue-700 pb-1 flex items-center gap-1.5"
            }
          >
            <Calendar className="w-4 h-4" />
            <span>Appointments</span>
          </NavLink>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          <span>System Online</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
          DR
        </div>
      </div>
    </nav>
  );
}
