import React, { useState } from "react";
import { Search, Filter, X, Plus, RotateCcw } from "lucide-react";

export default function PatientSearchFilterBar({
  searchQuery,
  onSearchChange,
  genderFilter,
  onGenderChange,
  onOpenRegisterModal,
  onReset,
}) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input Bar */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search patients by Name, Patient Code (PAT-1001), Phone Number, or DOB..."
            className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500 hidden sm:inline" />
            <select
              value={genderFilter}
              onChange={(e) => onGenderChange(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {(searchQuery || genderFilter) && (
            <button
              onClick={onReset}
              className="inline-flex items-center text-xs text-slate-500 hover:text-slate-800 bg-slate-100 px-2.5 py-2 rounded-lg transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset
            </button>
          )}

          {/* Primary Action */}
          <button
            onClick={onOpenRegisterModal}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Register Patient
          </button>
        </div>
      </div>
    </div>
  );
}
