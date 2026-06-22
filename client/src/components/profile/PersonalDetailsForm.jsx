import React, { useState, useEffect } from "react";
import Button from "../common/Button.jsx";

export default function PersonalDetailsForm({ resident, onSave }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [apartmentNumber, setApartmentNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (resident) {
      setName(resident.name || "");
      setEmail(resident.email || "");
      setPhoneNumber(resident.phone_number || "");
      setApartmentNumber(resident.apartment_number || "");
    }
  }, [resident]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    try {
      await onSave({ name, email, phone_number: phoneNumber });
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to update profile.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card-surface p-6 flex flex-col gap-4"
    >
      <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-2">
        Personal Details
      </h3>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-400 uppercase">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-[#6366F1]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-400 uppercase">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-[#6366F1]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-400 uppercase">
            Phone Number
          </label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-[#6366F1]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-400 uppercase">
            Apartment Number
          </label>
          <input
            type="text"
            value={apartmentNumber}
            disabled
            className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
