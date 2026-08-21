import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { catService, inquiryService, authService } from "../services/api";
import Modal from "../components/Modal";

export default function DetailPage() {
  const { id } = useParams();
  const [cat, setCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inquiry Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Validation states
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCat = async () => {
      try {
        const data = await catService.get(id);
        setCat(data);
      } catch (err) {
        console.error("Error fetching cat:", err);
        setError("Cat not found");
      } finally {
        setLoading(false);
      }
    };
    fetchCat();
  }, [id]);

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (isModalOpen) {
      const user = authService.getCurrentUser();
      if (user) {
        setBuyerName(user.full_name || "");
        setBuyerEmail(user.email || "");
      }
      // Reset success/error states
      setFormSuccess(null);
      setFormError(null);
      setErrors({});
    }
  }, [isModalOpen]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#eb590d]"></div>
      </div>
    );
  }

  if (error || !cat) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold text-red-600">404 - Cat Not Found</h2>
        <p className="text-[#7a7066]">
          The cat profile you are looking for does not exist or has been
          removed.
        </p>
        <Link
          to="/"
          className="bg-[#eb590d] text-white px-6 py-3 rounded-[10px] hover:bg-[#d44f0b] transition-colors font-medium"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const formatAge = (months) => {
    if (months < 1) return "Less than a month";
    if (months === 1) return "1 month";
    if (months < 12) return `${months} months`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return years === 1 ? "1 year" : `${years} years`;
    }
    return `${years} yr ${remainingMonths} mo`;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!buyerName.trim()) {
      newErrors.buyerName = "This field is required.";
    }
    if (!buyerEmail.trim()) {
      newErrors.buyerEmail = "This field is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(buyerEmail)) {
        newErrors.buyerEmail = "Please enter a valid email address.";
      }
    }
    if (!message.trim()) {
      newErrors.message = "This field is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_phone: buyerPhone || null,
        message: message,
      };
      await inquiryService.create(cat.id, payload);
      setFormSuccess("Thank you! Your inquiry has been sent to the seller.");
      // Clear form inputs on success
      setBuyerName("");
      setBuyerEmail("");
      setBuyerPhone("");
      setMessage("");
    } catch (err) {
      console.error("Error submitting inquiry:", err);
      const errMsg =
        err.response?.data?.detail ||
        "Failed to submit inquiry. Please try again.";
      setFormError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 items-start p-6 w-full max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-[#7a7066] text-xs font-medium">
        <Link to="/" className="hover:text-[#eb590d] transition-colors">
          Home
        </Link>{" "}
        &rsaquo;{" "}
        <Link to="/" className="hover:text-[#eb590d] transition-colors">
          Browse Cats
        </Link>{" "}
        &rsaquo; <span className="text-[#1f1712]">{cat.name}</span>
      </div>

      {/* Split Layout */}
      <div className="flex flex-col md:flex-row gap-8 w-full items-start">
        {/* Main Column (Image & Health) */}
        <div className="flex flex-col gap-6 flex-1 w-full">
          <div className="bg-[#f5f2ed] flex items-center justify-center overflow-hidden rounded-[14px] w-full h-[360px] relative border border-[#e5e0d9]">
            {cat.image_url ? (
              <img
                src={cat.image_url}
                alt={cat.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-6xl">🐱</div>
            )}
          </div>

          {/* Health Card */}
          <div className="bg-white border border-[#e5e0d9] border-solid flex flex-col gap-4 p-6 rounded-[14px] shadow-sm w-full">
            <h3 className="font-bold text-[#1f1712] text-lg">
              Health & Medical Status
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex gap-2 items-center">
                <span className="text-[#17a34a] font-bold">✓</span>
                <span className="text-[#1f1712]">Fully Vaccinated</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-[#17a34a] font-bold">✓</span>
                <span className="text-[#1f1712]">Dewormed</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-[#17a34a] font-bold">✓</span>
                <span className="text-[#1f1712]">Microchipped</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-[#17a34a] font-bold">✓</span>
                <span className="text-[#1f1712]">Vet Checked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side Column (Profile & Actions) */}
        <div className="flex flex-col gap-6 w-full md:w-[380px]">
          <div className="bg-white border border-[#e5e0d9] border-solid flex flex-col gap-4 p-6 rounded-[14px] shadow-sm w-full">
            <div className="flex items-center justify-between w-full">
              <h2 className="font-bold text-[#1f1712] text-2xl truncate max-w-[200px]">
                {cat.name}
              </h2>
              <span
                className={`px-2 py-1 rounded-full text-[10px] text-white font-medium ${
                  cat.status === "Sold" ? "bg-[#db2626]" : "bg-[#17a34a]"
                }`}
              >
                {cat.status}
              </span>
            </div>

            <p className="font-bold text-[#eb590d] text-3xl">
              ${Number(cat.price).toFixed(2)}
            </p>

            <hr className="border-[#e5e0d9]" />

            <p className="text-[#1f1712] text-sm leading-relaxed">
              {cat.description}
            </p>

            <hr className="border-[#e5e0d9]" />

            {/* Meta Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#7a7066] text-xs font-medium">Breed</p>
                <p className="text-[#1f1712] font-semibold">{cat.breed}</p>
              </div>
              <div>
                <p className="text-[#7a7066] text-xs font-medium">Gender</p>
                <p className="text-[#1f1712] font-semibold">{cat.gender}</p>
              </div>
              <div>
                <p className="text-[#7a7066] text-xs font-medium">Age</p>
                <p className="text-[#1f1712] font-semibold">
                  {formatAge(cat.age_months)}
                </p>
              </div>
            </div>

            <hr className="border-[#e5e0d9]" />

            {/* Seller Info */}
            {cat.seller && (
              <div className="flex flex-col gap-2">
                <p className="text-[#7a7066] text-xs font-medium">
                  Seller Information
                </p>
                <div className="flex gap-3 items-center">
                  <div className="bg-[#eb590d] flex items-center justify-center rounded-full w-10 h-10 text-white font-bold text-sm">
                    {cat.seller.full_name
                      ? cat.seller.full_name[0].toUpperCase()
                      : "S"}
                  </div>
                  <div>
                    <p className="font-bold text-[#1f1712] text-sm">
                      {cat.seller.full_name}
                    </p>
                    <p className="text-[#7a7066] text-xs">{cat.seller.email}</p>
                  </div>
                </div>
              </div>
            )}

            <hr className="border-[#e5e0d9]" />

            {/* Actions */}
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={cat.status === "Sold"}
                className="bg-[#eb590d] text-white text-sm px-6 py-3 rounded-[10px] hover:bg-[#d44f0b] transition-colors font-medium flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cat.status === "Sold" ? "Sold" : "Contact Seller"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Inquiry for ${cat.name}`}
      >
        <form
          onSubmit={handleInquirySubmit}
          className="flex flex-col gap-4 w-full"
        >
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">
              {formSuccess}
            </div>
          )}

          {/* Name Field */}
          <div className="flex flex-col gap-1 w-full">
            <label className="font-medium text-[#7a7066] text-xs">
              Your Name *
            </label>
            <input
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="John Doe"
              className={`bg-[#f5f2ed] border ${
                errors.buyerName ? "border-red-500" : "border-[#e5e0d9]"
              } border-solid p-3 rounded-[10px] text-[#1f1712] text-sm w-full outline-none`}
            />
            {errors.buyerName && (
              <p className="text-red-500 text-xs mt-1">{errors.buyerName}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="flex flex-col gap-1 w-full">
            <label className="font-medium text-[#7a7066] text-xs">
              Email Address *
            </label>
            <input
              type="text"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              placeholder="john@example.com"
              className={`bg-[#f5f2ed] border ${
                errors.buyerEmail ? "border-red-500" : "border-[#e5e0d9]"
              } border-solid p-3 rounded-[10px] text-[#1f1712] text-sm w-full outline-none`}
            />
            {errors.buyerEmail && (
              <p className="text-red-500 text-xs mt-1">{errors.buyerEmail}</p>
            )}
          </div>

          {/* Phone Field */}
          <div className="flex flex-col gap-1 w-full">
            <label className="font-medium text-[#7a7066] text-xs">
              Phone Number (Optional)
            </label>
            <input
              type="text"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              placeholder="123-456-7890"
              className="bg-[#f5f2ed] border border-[#e5e0d9] border-solid p-3 rounded-[10px] text-[#1f1712] text-sm w-full outline-none"
            />
          </div>

          {/* Message Field */}
          <div className="flex flex-col gap-1 w-full">
            <label className="font-medium text-[#7a7066] text-xs">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="I am very interested in adopting Luna. Is she available for a visit this weekend?"
              rows="4"
              className={`bg-[#f5f2ed] border ${
                errors.message ? "border-red-500" : "border-[#e5e0d9]"
              } border-solid p-3 rounded-[10px] text-[#1f1712] text-sm w-full outline-none resize-none`}
            />
            {errors.message && (
              <p className="text-red-500 text-xs mt-1">{errors.message}</p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 justify-end mt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="bg-white border border-[#e5e0d9] text-[#1f1712] text-sm px-4 py-2 rounded-[10px] hover:bg-[#faf7f2] transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#eb590d] text-white text-sm px-4 py-2 rounded-[10px] hover:bg-[#d44f0b] transition-colors font-medium disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Inquiry"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
