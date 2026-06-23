import React, { useState, useEffect } from "react";
import { profileService } from "../services/api";

export default function ProfileSettingsPage({ onProfileUpdate }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form fields
  const [preferredName, setPreferredName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setProfile(data);
        setPreferredName(data.preferred_name || "");
        setPhoneNumber(data.phone_number || "");
        setProfilePictureUrl(data.profile_picture_url || "");
      } catch (err) {
        setError("Failed to load profile settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const updated = await profileService.updateProfile({
        preferred_name: preferredName || null,
        phone_number: phoneNumber || null,
        profile_picture_url: profilePictureUrl || null,
      });
      setProfile(updated);
      setSuccess("Profile updated successfully!");
      if (onProfileUpdate) {
        onProfileUpdate(updated);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setPreferredName(profile.preferred_name || "");
      setPhoneNumber(profile.phone_number || "");
      setProfilePictureUrl(profile.profile_picture_url || "");
    }
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const defaultAvatar =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAlPRBgd6WbiOysEN0is5RUE0iUuN_a9j9pZlo2GsDokBpKJZTANTeNq9R_Xrm2Mchqwr9LsRagr1RskEDn0LeylHTM3Kryk4l268nUdb_uTSmDyl1_9ZimvQZaLUi3aAuk04HVnNzOL0uX8Z0b_t-2CWrbD6RW6_15CrVxO845g3546GlvAbkB02M5QCoxmRb2zgrN8POq4JAeFddgZhsjFljAwFHpifUi9khSo87VQnzl__KM6Px1fX09XqfW8kFyOGgtHmP770vJ";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-container_gap">
      {/* Left Card: Profile Picture & ID */}
      <div className="lg:col-span-4 bg-surface-container-high border border-outline-variant rounded-lg p-card_padding flex flex-col items-center text-center">
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6 self-start">
          Profile Picture
        </h3>
        <div className="relative group mb-4">
          <img
            className="w-32 h-32 rounded-full object-cover border-2 border-primary shadow-lg"
            src={profilePictureUrl || defaultAvatar}
            alt="Profile Preview"
          />
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <span className="material-symbols-outlined text-white text-2xl">
              photo_camera
            </span>
          </div>
        </div>
        <h4 className="font-headline-sm text-headline-sm text-on-surface">
          {profile?.first_name} {profile?.last_name}
        </h4>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">
          {profile?.email}
        </p>
        <div className="w-full border-t border-outline-variant pt-6 flex flex-col gap-3 text-left">
          <div className="flex justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant">
              Student ID
            </span>
            <span className="font-code-sm text-code-sm text-on-surface truncate max-w-[180px]">
              {profile?.student_id}
            </span>
          </div>
        </div>
      </div>

      {/* Right Card: Personal Information Form */}
      <div className="lg:col-span-8 bg-surface-container-high border border-outline-variant rounded-lg p-card_padding">
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">
          Personal Information
        </h3>

        {error && (
          <div
            className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-lg text-body-md flex items-center gap-2"
            role="alert"
          >
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            className="mb-6 p-4 bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] rounded-lg text-body-md flex items-center gap-2"
            role="alert"
          >
            <span className="material-symbols-outlined text-[20px]">
              check_circle
            </span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                First Name
              </label>
              <input
                type="text"
                disabled
                value={profile?.first_name || ""}
                className="w-full bg-surface-container/50 border border-outline-variant/50 text-on-surface-variant font-body-md rounded-lg py-2.5 px-4 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                Last Name
              </label>
              <input
                type="text"
                disabled
                value={profile?.last_name || ""}
                className="w-full bg-surface-container/50 border border-outline-variant/50 text-on-surface-variant font-body-md rounded-lg py-2.5 px-4 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label
              className="block font-label-md text-label-md text-on-surface-variant mb-2"
              htmlFor="preferredName"
            >
              Preferred Name
            </label>
            <input
              id="preferredName"
              type="text"
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant text-on-surface font-body-md rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant/30"
              placeholder="e.g. Alex"
            />
          </div>

          <div>
            <label
              className="block font-label-md text-label-md text-on-surface-variant mb-2"
              htmlFor="phoneNumber"
            >
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant text-on-surface font-body-md rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant/30"
              placeholder="e.g. +1 (555) 019-2834"
            />
          </div>

          <div>
            <label
              className="block font-label-md text-label-md text-on-surface-variant mb-2"
              htmlFor="profilePictureUrl"
            >
              Profile Picture URL
            </label>
            <input
              id="profilePictureUrl"
              type="url"
              value={profilePictureUrl}
              onChange={(e) => setProfilePictureUrl(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant text-on-surface font-body-md rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant/30"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="flex justify-end gap-4 mt-4 border-t border-outline-variant pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 border border-outline-variant rounded-lg text-on-surface font-label-md text-label-md hover:bg-surface-container-highest transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-primary text-on-primary font-label-md text-label-md font-bold rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
