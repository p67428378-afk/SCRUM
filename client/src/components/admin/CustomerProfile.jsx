import React from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Lock,
  Unlock,
  KeyRound,
} from "lucide-react";
import Button from "../common/Button";

export default function CustomerProfile({
  profile,
  onLockToggle,
  onForcePasswordReset,
}) {
  if (!profile) return null;

  return (
    <div className="glass-card rounded-xl p-6 space-y-6 flex flex-col justify-between">
      <div className="space-y-6">
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
              <span
                className={profile.is_active ? "text-emerald" : "text-error"}
              >
                {profile.is_active ? "Active" : "Locked"}
              </span>
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

      <div className="border-t border-slate-border pt-4 grid grid-cols-2 gap-2">
        <Button
          onClick={() => onLockToggle(profile.id, profile.is_active)}
          variant={profile.is_active ? "outline" : "primary"}
          className="flex items-center justify-center gap-2 text-xs py-2"
        >
          {profile.is_active ? (
            <>
              <Lock size={14} />
              Lock User
            </>
          ) : (
            <>
              <Unlock size={14} />
              Unlock User
            </>
          )}
        </Button>
        <Button
          onClick={() => onForcePasswordReset(profile.id)}
          variant="outline"
          className="flex items-center justify-center gap-2 text-xs py-2"
        >
          <KeyRound size={14} />
          Reset Password
        </Button>
      </div>
    </div>
  );
}
