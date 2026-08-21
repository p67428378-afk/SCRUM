import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { catService, inquiryService, authService } from "../services/api";
import StatCard from "../components/StatCard";
import Table from "../components/Table";
import Modal from "../components/Modal";

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  // Redirect if not logged in or not a seller
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role !== "seller") {
      navigate("/");
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState("listings"); // 'listings' or 'inquiries'
  const [listings, setListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isFormOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);

  // Form fields
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [ageMonths, setAgeMonths] = useState("");
  const [gender, setGender] = useState("Male");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("Available");

  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all cats and filter by seller_id
      const catsData = await catService.list({ limit: 100 });
      const sellerListings = catsData.items.filter(
        (c) => c.seller_id === user?.id,
      );
      setListings(sellerListings);

      // Fetch inquiries
      const inquiriesData = await inquiryService.list();
      setInquiries(inquiriesData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "seller") {
      fetchData();
    }
  }, [user]);

  const handleOpenAddModal = () => {
    setEditingCat(null);
    setName("");
    setBreed("");
    setAgeMonths("");
    setGender("Male");
    setPrice("");
    setDescription("");
    setImageUrl("");
    setStatus("Available");
    setFormError(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCat(cat);
    setName(cat.name);
    setBreed(cat.breed);
    setAgeMonths(cat.age_months.toString());
    setGender(cat.gender);
    setPrice(cat.price.toString());
    setDescription(cat.description);
    setImageUrl(cat.image_url || "");
    setStatus(cat.status);
    setFormError(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "This field is required.";
    if (!breed.trim()) newErrors.breed = "This field is required.";
    if (!ageMonths.trim() || isNaN(ageMonths) || Number(ageMonths) < 0) {
      newErrors.ageMonths = "Please enter a valid age in months.";
    }
    if (!price.trim() || isNaN(price) || Number(price) <= 0) {
      newErrors.price = "Please enter a valid price greater than 0.";
    }
    if (!description.trim()) newErrors.description = "This field is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        breed: breed.trim(),
        age_months: parseInt(ageMonths),
        gender,
        price: parseFloat(price),
        description: description.trim(),
        image_url: imageUrl.trim() || null,
      };

      if (editingCat) {
        payload.status = status;
        await catService.update(editingCat.id, payload);
      } else {
        await catService.create(payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error saving cat listing:", err);
      const errMsg =
        err.response?.data?.detail ||
        "Failed to save listing. Please try again.";
      setFormError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await catService.delete(id);
        fetchData();
      } catch (err) {
        console.error("Error deleting cat listing:", err);
        alert("Failed to delete listing. Please try again.");
      }
    }
  };

  if (!user || user.role !== "seller") {
    return null;
  }

  // Calculate metrics
  const activeListingsCount = listings.filter(
    (c) => c.status === "Available",
  ).length;
  const soldListingsCount = listings.filter((c) => c.status === "Sold").length;
  const totalInquiriesCount = inquiries.length;

  return (
    <div className="flex flex-col gap-6 items-start p-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <h1 className="font-bold text-[#1f1712] text-3xl">Seller Dashboard</h1>
        <button
          onClick={handleOpenAddModal}
          className="bg-[#eb590d] text-white text-sm px-4 py-3 rounded-[10px] hover:bg-[#d44f0b] transition-colors font-medium"
        >
          + Add New Cat
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <StatCard
          title="Active Listings"
          value={activeListingsCount}
          badgeText="Active"
        />
        <StatCard
          title="Total Inquiries"
          value={totalInquiriesCount}
          badgeText="Inquiries"
          badgeColor="bg-accent"
        />
        <StatCard
          title="Cats Sold"
          value={soldListingsCount}
          badgeText="Sold"
          badgeColor="bg-[#db2626]"
        />
      </div>

      {/* Tab Bar */}
      <div className="flex gap-6 border-b border-[#e5e0d9] w-full">
        <button
          onClick={() => setActiveTab("listings")}
          className={`pb-3 font-bold text-sm transition-colors relative ${
            activeTab === "listings"
              ? "text-[#eb590d]"
              : "text-[#7a7066] hover:text-[#eb590d]"
          }`}
        >
          My Listings
          {activeTab === "listings" && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#eb590d] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("inquiries")}
          className={`pb-3 font-bold text-sm transition-colors relative ${
            activeTab === "inquiries"
              ? "text-[#eb590d]"
              : "text-[#7a7066] hover:text-[#eb590d]"
          }`}
        >
          Inquiries Received
          {activeTab === "inquiries" && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#eb590d] rounded-full" />
          )}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg w-full text-center">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12 w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#eb590d]"></div>
        </div>
      ) : (
        <div className="w-full">
          {activeTab === "listings" ? (
            <Table
              listings={listings}
              onEdit={handleOpenEditModal}
              onDelete={handleDelete}
            />
          ) : (
            /* Inquiries List */
            <div
              className="flex flex-col gap-4 w-full"
              data-testid="inquiries-list"
            >
              {inquiries.length === 0 ? (
                <div className="bg-white border border-[#e5e0d9] p-12 rounded-[14px] text-center w-full shadow-sm text-[#7a7066]">
                  No inquiries received yet.
                </div>
              ) : (
                inquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="bg-white border border-[#e5e0d9] p-6 rounded-[14px] shadow-sm flex flex-col gap-3 w-full"
                  >
                    <div className="flex items-center justify-between w-full flex-wrap gap-2">
                      <div>
                        <h4 className="font-bold text-[#1f1712] text-base">
                          Inquiry for {inquiry.cat?.name || "Unknown Cat"}
                        </h4>
                        <p className="text-xs text-[#7a7066]">
                          Received on{" "}
                          {new Date(inquiry.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium">
                        {inquiry.cat?.breed || "Unknown Breed"}
                      </span>
                    </div>
                    <hr className="border-[#e5e0d9]" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                      <p>
                        <span className="text-[#7a7066] font-medium">
                          From:
                        </span>{" "}
                        <span className="font-semibold text-[#1f1712]">
                          {inquiry.buyer_name}
                        </span>
                      </p>
                      <p>
                        <span className="text-[#7a7066] font-medium">
                          Email:
                        </span>{" "}
                        <span className="font-semibold text-[#1f1712]">
                          {inquiry.buyer_email}
                        </span>
                      </p>
                      {inquiry.buyer_phone && (
                        <p>
                          <span className="text-[#7a7066] font-medium">
                            Phone:
                          </span>{" "}
                          <span className="font-semibold text-[#1f1712]">
                            {inquiry.buyer_phone}
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="bg-[#f5f2ed] p-3 rounded-[10px] text-sm text-[#1f1712] italic leading-relaxed">
                      "{inquiry.message}"
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Cat Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCat ? "Edit Cat Listing" : "Add New Cat Listing"}
      >
        <form
          onSubmit={handleFormSubmit}
          className="flex flex-col gap-4 w-full"
        >
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
              {formError}
            </div>
          )}

          {/* Name Field */}
          <div className="flex flex-col gap-1 w-full">
            <label className="font-medium text-[#7a7066] text-xs">
              Cat Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Luna"
              className={`bg-[#f5f2ed] border ${
                errors.name ? "border-red-500" : "border-[#e5e0d9]"
              } border-solid p-3 rounded-[10px] text-[#1f1712] text-sm w-full outline-none`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Breed Field */}
          <div className="flex flex-col gap-1 w-full">
            <label className="font-medium text-[#7a7066] text-xs">
              Breed *
            </label>
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Siamese"
              className={`bg-[#f5f2ed] border ${
                errors.breed ? "border-red-500" : "border-[#e5e0d9]"
              } border-solid p-3 rounded-[10px] text-[#1f1712] text-sm w-full outline-none`}
            />
            {errors.breed && (
              <p className="text-red-500 text-xs mt-1">{errors.breed}</p>
            )}
          </div>

          {/* Age & Gender Row */}
          <div className="flex gap-4 w-full flex-col sm:flex-row">
            <div className="flex flex-col gap-1 flex-1">
              <label className="font-medium text-[#7a7066] text-xs">
                Age (Months) *
              </label>
              <input
                type="number"
                value={ageMonths}
                onChange={(e) => setAgeMonths(e.target.value)}
                placeholder="4"
                min="0"
                className={`bg-[#f5f2ed] border ${
                  errors.ageMonths ? "border-red-500" : "border-[#e5e0d9]"
                } border-solid p-3 rounded-[10px] text-[#1f1712] text-sm w-full outline-none`}
              />
              {errors.ageMonths && (
                <p className="text-red-500 text-xs mt-1">{errors.ageMonths}</p>
              )}
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label className="font-medium text-[#7a7066] text-xs">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="bg-[#f5f2ed] border border-[#e5e0d9] border-solid p-3 rounded-[10px] text-[#1f1712] text-sm w-full outline-none cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Price & Status Row */}
          <div className="flex gap-4 w-full flex-col sm:flex-row">
            <div className="flex flex-col gap-1 flex-1">
              <label className="font-medium text-[#7a7066] text-xs">
                Price ($) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="350.00"
                step="0.01"
                min="0.01"
                className={`bg-[#f5f2ed] border ${
                  errors.price ? "border-red-500" : "border-[#e5e0d9]"
                } border-solid p-3 rounded-[10px] text-[#1f1712] text-sm w-full outline-none`}
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">{errors.price}</p>
              )}
            </div>

            {editingCat && (
              <div className="flex flex-col gap-1 flex-1">
                <label className="font-medium text-[#7a7066] text-xs">
                  Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="bg-[#f5f2ed] border border-[#e5e0d9] border-solid p-3 rounded-[10px] text-[#1f1712] text-sm w-full outline-none cursor-pointer"
                >
                  <option value="Available">Available</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>
            )}
          </div>

          {/* Image URL Field */}
          <div className="flex flex-col gap-1 w-full">
            <label className="font-medium text-[#7a7066] text-xs">
              Image URL (Optional)
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/cat.jpg"
              className="bg-[#f5f2ed] border border-[#e5e0d9] border-solid p-3 rounded-[10px] text-[#1f1712] text-sm w-full outline-none"
            />
          </div>

          {/* Description Field */}
          <div className="flex flex-col gap-1 w-full">
            <label className="font-medium text-[#7a7066] text-xs">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Luna is a playful and affectionate Siamese kitten..."
              rows="4"
              className={`bg-[#f5f2ed] border ${
                errors.description ? "border-red-500" : "border-[#e5e0d9]"
              } border-solid p-3 rounded-[10px] text-[#1f1712] text-sm w-full outline-none resize-none`}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
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
              {submitting ? "Saving..." : "Save Listing"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
