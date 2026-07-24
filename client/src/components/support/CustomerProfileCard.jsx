import React from "react";

export const CustomerProfileCard = ({ customer }) => {
  if (!customer) {
    return (
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg text-slate-400 text-center">
        No customer profile loaded. Search for a customer to begin.
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
          {customer.username.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{customer.username}</h2>
          <span className="text-xs text-slate-400 capitalize">
            Role: {customer.role}
          </span>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between py-2 border-b border-slate-700">
          <span className="text-slate-400">Email</span>
          <span className="text-white">{customer.email}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-slate-700">
          <span className="text-slate-400">Phone</span>
          <span className="text-white">{customer.phone_number || "N/A"}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-slate-700">
          <span className="text-slate-400">User ID</span>
          <span className="text-white font-mono text-xs">{customer.id}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-slate-400">Status</span>
          <span
            className={`font-semibold ${customer.is_locked ? "text-red-400" : "text-emerald-400"}`}
          >
            {customer.is_locked ? "Locked" : "Active"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfileCard;
