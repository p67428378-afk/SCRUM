import React, { useState } from "react";
import { listingsService } from "../services/api";
import { X, Send, AlertCircle, CheckCircle2 } from "lucide-react";

export default function InquiryModal({
  listing,
  isOpen,
  onClose,
  currentUser,
}) {
  const [formData, setFormData] = useState({
    buyer_name: currentUser?.full_name || "",
    buyer_email: currentUser?.email || "",
    buyer_phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !listing) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await listingsService.submitInquiry(listing.id, formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Failed to submit inquiry:", err);
      const msg =
        err.response?.data?.detail ||
        "Failed to send inquiry. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-[#e3e8f0] relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-textPrimary mb-1">
          Inquire About {listing.title}
        </h2>
        <p className="text-xs text-textMuted mb-4">
          Contact seller regarding this {listing.breed} (
          {listing.location || "Location N/A"})
        </p>

        {error && (
          <div
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-secondary mx-auto" />
            <p className="text-base font-bold text-textPrimary">
              Inquiry Sent Successfully!
            </p>
            <p className="text-xs text-textMuted">
              The seller has been notified and will contact you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-textMuted mb-1">
                Your Name *
              </label>
              <input
                type="text"
                name="buyer_name"
                required
                value={formData.buyer_name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMuted mb-1">
                Your Email *
              </label>
              <input
                type="email"
                name="buyer_email"
                required
                value={formData.buyer_email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full px-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMuted mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                name="buyer_phone"
                value={formData.buyer_phone}
                onChange={handleChange}
                placeholder="(555) 000-0000"
                className="w-full px-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMuted mb-1">
                Message *
              </label>
              <textarea
                name="message"
                required
                rows="4"
                value={formData.message}
                onChange={handleChange}
                placeholder="Hello, I am interested in Buddy! Is he still available and up to date on vaccinations?"
                className="w-full px-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#e3e8f0] text-textMuted hover:bg-gray-50 rounded-lg text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition shadow-sm disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
