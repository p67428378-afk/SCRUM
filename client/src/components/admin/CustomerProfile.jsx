import React from "react";
import { User, Mail, Phone, MapPin, Shield } from "lucide-react";

export default function CustomerProfile({ profile }) {
  if (!profile) return null;

  return (
    <div className="glass-card rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-border pb-4">
        <div className="w-10 h-10 rounded-full bg-brand-indigo/10 flex items-center justify-center text-brand-indigo">
          <User size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-on-surface">
            {profile.profile?.full_name || "Customer Profile"}
          </h3>
          <p className="text-xs text-on-surface-variant">
            Role: {profile.role} • Status:{" "}
            {profile.is_active ? "Active" : "Inactive"}
          </p>
        </div>
      </div>

      <div className="space-y-4 text-sm">
        <div className="flex items-center gap-3">
          <Mail className="text-outline" size={18} />
          <div>
            <p className="text-xs text-on-surface-variant">Email Address</p>
            <p className="font-semibold text-on-surface">{profile.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="text-outline" size={18} />
          <div>
            <p className="text-xs text-on-surface-variant">Phone Number</p>
            <p className="font-semibold text-on-surface">
              {profile.phone_number}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <MapPin className="text-outline" size={18} />
          <div>
            <p className="text-xs text-on-surface-variant">Address</p>
            <p className="font-semibold text-on-surface">
              {profile.profile?.address}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Shield className="text-outline" size={18} />
          <div>
            <p className="text-xs text-on-surface-variant">User ID</p>
            <p className="font-mono text-xs text-outline">{profile.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
