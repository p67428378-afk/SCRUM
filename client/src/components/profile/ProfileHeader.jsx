import React, { useState } from "react";
import { User, Mail, Phone, ShieldCheck, Edit2, Save } from "lucide-react";

export default function ProfileHeader({ user, onUpdateProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const handleSave = async () => {
    if (onUpdateProfile) {
      await onUpdateProfile({ full_name: fullName, phone });
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">
                {user?.full_name || "Customer Profile"}
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                <ShieldCheck className="w-3 h-3 text-amber-600" />
                {user?.role || "CUSTOMER"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 mt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                {user?.email || "email@example.com"}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {user?.phone || "+91 98200 12345"}
              </span>
            </div>
          </div>
        </div>

        <div>
          {isEditing ? (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" /> Save Profile
            </button>
          ) : (
            <button
              onClick={() => {
                setFullName(user?.full_name || "");
                setPhone(user?.phone || "");
                setIsEditing(true);
              }}
              className="px-4 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold hover:bg-amber-100 transition flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5 text-amber-600" /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
