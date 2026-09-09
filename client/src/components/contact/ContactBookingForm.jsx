import React, { useState } from "react";
import { submitContactInquiry } from "../../services/api";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Building,
  Lock,
} from "lucide-react";

export default function ContactBookingForm() {
  const [formData, setFormData] = useState({
    sender_name: "Marcus Vance",
    sender_email: "test@example.com",
    project_type: "Television",
    budget: "$50,000 - $100,000",
    project_dates: "Q4 2024 / Q1 2025",
    message:
      "Requesting availability for a guest star role in an upcoming dramatic television pilot shooting in Los Angeles.",
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    setSuccess(false);

    // Basic frontend validation
    if (
      !formData.sender_name.trim() ||
      !formData.sender_email.trim() ||
      !formData.message.trim()
    ) {
      setErrorMessage(
        "Please fill out all required fields (Name, Email, and Message).",
      );
      setSubmitting(false);
      return;
    }

    try {
      await submitContactInquiry(formData);
      // Success is ONLY set if API returns 2xx response
      setSuccess(true);
      setFormData({
        sender_name: "",
        sender_email: "",
        project_type: "Film",
        budget: "",
        project_dates: "",
        message: "",
      });
    } catch (err) {
      console.error("Booking submission error:", err);
      const apiDetail =
        err.response?.data?.detail ||
        err.message ||
        "Submission failed. Please check network connection.";
      setErrorMessage(`Failed to submit inquiry: ${apiDetail}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#0F131C] p-6 sm:p-8 rounded-xl border border-white/10 flex flex-col gap-5 shadow-2xl shadow-black/50"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#F59E0B]">
            Submit Audition / Booking Inquiry
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Direct dispatch to CAA Talent Management & Elena Vance Press Office.
          </p>
        </div>
        <Sparkles className="w-6 h-6 text-[#F59E0B]" />
      </div>

      {/* Default / Test Credentials Information Banner */}
      <div className="bg-[#181B25] p-3 rounded-lg border border-[#F59E0B]/20 text-xs text-[#9CA3AF] flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>
            Test Account:{" "}
            <strong className="text-white">test@example.com</strong>
          </span>
        </span>
        <span className="text-[10px] bg-[#F59E0B]/10 text-[#F59E0B] px-2 py-0.5 rounded font-mono">
          Pre-filled for instant testing
        </span>
      </div>

      {/* Success Banner */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-lg flex items-start gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="font-bold text-sm block">
              Inquiry Submitted Successfully!
            </strong>
            A confirmation email has been dispatched to{" "}
            {formData.sender_email || "your email"}. CAA representatives will
            review project details within 24 hours.
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg flex items-start gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="font-bold text-sm block">
              Submission Error
            </strong>
            {errorMessage}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-300">
            Sender Full Name <span className="text-[#F59E0B]">*</span>
          </label>
          <input
            type="text"
            name="sender_name"
            required
            value={formData.sender_name}
            onChange={handleChange}
            placeholder="e.g. Sarah Jenkins (Casting Director)"
            className="bg-[#181B25] border border-white/10 p-3 rounded-lg text-sm text-white focus:outline-none focus:border-[#F59E0B]"
          />
        </div>

        {/* Email Address */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-300">
            Sender Email Address <span className="text-[#F59E0B]">*</span>
          </label>
          <input
            type="email"
            name="sender_email"
            required
            value={formData.sender_email}
            onChange={handleChange}
            placeholder="test@example.com"
            className="bg-[#181B25] border border-white/10 p-3 rounded-lg text-sm text-white focus:outline-none focus:border-[#F59E0B]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Project Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-300">
            Project Type <span className="text-[#F59E0B]">*</span>
          </label>
          <select
            name="project_type"
            value={formData.project_type}
            onChange={handleChange}
            className="bg-[#181B25] border border-white/10 p-3 rounded-lg text-sm text-white focus:outline-none focus:border-[#F59E0B]"
          >
            <option value="Television">Television</option>
            <option value="Film">Feature Film</option>
            <option value="Theater">Theater Production</option>
            <option value="Commercials">Commercial / Brand</option>
            <option value="Voiceover">Voiceover / Animation</option>
          </select>
        </div>

        {/* Estimated Budget */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-300">
            Estimated Budget Range
          </label>
          <input
            type="text"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="e.g. SAG Scale / $50k+"
            className="bg-[#181B25] border border-white/10 p-3 rounded-lg text-sm text-white focus:outline-none focus:border-[#F59E0B]"
          />
        </div>

        {/* Production Dates */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-300">
            Proposed Shooting Dates
          </label>
          <input
            type="text"
            name="project_dates"
            value={formData.project_dates}
            onChange={handleChange}
            placeholder="e.g. Nov 2024 - Jan 2025"
            className="bg-[#181B25] border border-white/10 p-3 rounded-lg text-sm text-white focus:outline-none focus:border-[#F59E0B]"
          />
        </div>
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-300">
          Message & Character Breakdown{" "}
          <span className="text-[#F59E0B]">*</span>
        </label>
        <textarea
          name="message"
          required
          rows={4}
          value={formData.message}
          onChange={handleChange}
          placeholder="Include logline, role details, audition sides download links, or specific production queries..."
          className="bg-[#181B25] border border-white/10 p-3 rounded-lg text-sm text-white focus:outline-none focus:border-[#F59E0B]"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#F59E0B] text-[#0A0E17] py-3.5 rounded-lg font-bold hover:bg-[#D97706] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F59E0B]/20 active:scale-98 disabled:opacity-50 mt-2"
      >
        {submitting ? (
          <div className="w-5 h-5 border-2 border-[#0A0E17] border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Submit Booking Inquiry</span>
          </>
        )}
      </button>
    </form>
  );
}
