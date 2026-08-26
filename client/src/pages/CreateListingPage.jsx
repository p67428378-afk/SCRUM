import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { listingsService, authService } from "../services/api";
import {
  PlusCircle,
  ArrowLeft,
  AlertCircle,
  Dog,
  Upload,
  Shield,
  CheckCircle,
} from "lucide-react";

export default function CreateListingPage() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [formData, setFormData] = useState({
    title: "",
    breed: "",
    age_months: "",
    price: "",
    location: "",
    description: "",
    health_records: "",
    photo_urls_str: "",
    status: "available",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!currentUser) {
      setError(
        "You must be logged in to publish a dog listing. Please log in first.",
      );
      return;
    }

    setLoading(true);

    try {
      // Parse photo_urls from comma or newline separated string
      const urls = formData.photo_urls_str
        ? formData.photo_urls_str
            .split(/[\n,]+/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const payload = {
        title: formData.title,
        breed: formData.breed,
        age_months: parseInt(formData.age_months, 10),
        price: parseFloat(formData.price),
        location: formData.location,
        description: formData.description,
        health_records: formData.health_records || null,
        photo_urls: urls.length > 0 ? urls : null,
        status: formData.status || "available",
      };

      const created = await listingsService.createListing(payload);
      navigate(`/listings/${created.id}`);
    } catch (err) {
      console.error("Error creating listing:", err);
      const msg =
        err.response?.data?.detail ||
        "Failed to create listing. Please check inputs.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-primary transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e3e8f0] shadow-sm space-y-6">
        <div className="border-b border-[#e3e8f0] pb-4">
          <h1 className="text-xl font-extrabold text-textPrimary flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-primary" />
            Create Dog Listing
          </h1>
          <p className="text-xs text-textMuted mt-1">
            Provide details about the dog you are selling. Clear photos and
            complete health records attract more verified buyers.
          </p>
        </div>

        {!currentUser && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold">Login Required</p>
              <p>
                You must be authenticated as a seller to create a listing.{" "}
                <Link
                  to="/login"
                  className="underline font-semibold text-primary"
                >
                  Click here to log in
                </Link>
                .
              </p>
            </div>
          </div>
        )}

        {error && (
          <div
            className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-textMuted mb-1">
              Listing Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Purebred 2-Year Golden Retriever Buddy"
              className="w-full px-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-textMuted mb-1">
                Breed *
              </label>
              <input
                type="text"
                name="breed"
                required
                value={formData.breed}
                onChange={handleChange}
                placeholder="e.g. Golden Retriever"
                className="w-full px-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMuted mb-1">
                Age in Months *
              </label>
              <input
                type="number"
                name="age_months"
                required
                min="1"
                value={formData.age_months}
                onChange={handleChange}
                placeholder="e.g. 24"
                className="w-full px-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-textMuted mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 1200"
                className="w-full px-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMuted mb-1">
                Location *
              </label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Austin, TX"
                className="w-full px-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMuted mb-1">
              Description *
            </label>
            <textarea
              name="description"
              required
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe temperament, personality, training history, and reason for rehoming/sale..."
              className="w-full px-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMuted mb-1">
              Health Records / Certificates
            </label>
            <input
              type="text"
              name="health_records"
              value={formData.health_records}
              onChange={handleChange}
              placeholder="e.g. Fully vaccinated, Microchipped, AKC Certified, OFA Hips Clear"
              className="w-full px-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMuted mb-1">
              Photo URLs (Separated by commas or newlines)
            </label>
            <textarea
              name="photo_urls_str"
              rows="2"
              value={formData.photo_urls_str}
              onChange={handleChange}
              placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
              className="w-full px-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none font-mono text-[11px]"
            />
          </div>

          <div className="pt-4 border-t border-[#e3e8f0] flex justify-end gap-3">
            <Link
              to="/"
              className="px-4 py-2 border border-[#e3e8f0] text-textMuted hover:bg-gray-50 rounded-lg text-xs font-semibold transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !currentUser}
              className="px-6 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md disabled:opacity-50"
            >
              {loading ? "Publishing..." : "Publish Dog Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
