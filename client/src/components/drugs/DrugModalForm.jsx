import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";

export const DrugModalForm = ({
  isOpen = false,
  onClose = () => {},
  onSubmit = () => {},
  drug = null,
  isSubmitting = false,
  categories = [
    "Antibiotics",
    "Analgesics",
    "Antipyretics",
    "Cardiovascular",
    "Diabetic",
    "Vitamins",
    "General",
  ],
}) => {
  const isEditing = Boolean(drug && drug.id);

  const [formData, setFormData] = useState({
    name: "",
    generic_name: "",
    dosage: "",
    manufacturer: "",
    batch_number: "",
    stock_quantity: 100,
    expiration_date: "",
    category: "General",
    unit_price: 10.0,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (drug) {
      setFormData({
        name: drug.name || "",
        generic_name: drug.generic_name || "",
        dosage: drug.dosage || "",
        manufacturer: drug.manufacturer || "",
        batch_number: drug.batch_number || "",
        stock_quantity: drug.stock_quantity ?? 100,
        expiration_date: drug.expiration_date || "",
        category: drug.category || "General",
        unit_price: drug.unit_price ?? 10.0,
      });
    } else {
      // Default future expiry date (1 year from now)
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const defaultExpiry = futureDate.toISOString().split("T")[0];

      setFormData({
        name: "",
        generic_name: "",
        dosage: "",
        manufacturer: "",
        batch_number: "",
        stock_quantity: 100,
        expiration_date: defaultExpiry,
        category: "General",
        unit_price: 15.0,
      });
    }
    setErrors({});
  }, [drug, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Drug name is required";
    }
    if (!formData.dosage.trim()) {
      newErrors.dosage = "Dosage is required (e.g. 500mg)";
    }
    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = "Manufacturer is required";
    }
    if (!formData.batch_number.trim()) {
      newErrors.batch_number = "Batch number is required";
    }
    if (formData.stock_quantity === "" || Number(formData.stock_quantity) < 0) {
      newErrors.stock_quantity = "Stock quantity must be non-negative";
    }
    if (!formData.expiration_date) {
      newErrors.expiration_date = "Expiration date is required";
    }
    if (formData.unit_price === "" || Number(formData.unit_price) <= 0) {
      newErrors.unit_price = "Unit price must be positive";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      stock_quantity: parseInt(formData.stock_quantity, 10),
      unit_price: parseFloat(formData.unit_price),
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isEditing ? "Edit Drug Record" : "Add New Drug Record"}
            </h3>
            <p className="text-xs text-slate-500">
              {isEditing
                ? "Update medication details and stock levels"
                : "Enter inventory parameters for the new drug"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Drug Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Drug Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Amoxicillin 500mg"
                className={`w-full px-3.5 py-2 bg-slate-50 border ${
                  errors.name ? "border-red-500" : "border-slate-200"
                } rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Generic Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Generic Name
              </label>
              <input
                type="text"
                value={formData.generic_name}
                onChange={(e) =>
                  setFormData({ ...formData, generic_name: e.target.value })
                }
                placeholder="e.g. Amoxicillin Trihydrate"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Dosage */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Dosage Form & Strength *
              </label>
              <input
                type="text"
                value={formData.dosage}
                onChange={(e) =>
                  setFormData({ ...formData, dosage: e.target.value })
                }
                placeholder="e.g. 500mg Capsule"
                className={`w-full px-3.5 py-2 bg-slate-50 border ${
                  errors.dosage ? "border-red-500" : "border-slate-200"
                } rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.dosage && (
                <p className="text-xs text-red-500 mt-1">{errors.dosage}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Manufacturer */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Manufacturer *
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) =>
                  setFormData({ ...formData, manufacturer: e.target.value })
                }
                placeholder="e.g. Pfizer Inc."
                className={`w-full px-3.5 py-2 bg-slate-50 border ${
                  errors.manufacturer ? "border-red-500" : "border-slate-200"
                } rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.manufacturer && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.manufacturer}
                </p>
              )}
            </div>

            {/* Batch Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Batch Number *
              </label>
              <input
                type="text"
                value={formData.batch_number}
                onChange={(e) =>
                  setFormData({ ...formData, batch_number: e.target.value })
                }
                placeholder="e.g. BATCH-2026-A"
                className={`w-full px-3.5 py-2 bg-slate-50 border ${
                  errors.batch_number ? "border-red-500" : "border-slate-200"
                } rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.batch_number && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.batch_number}
                </p>
              )}
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Stock Quantity (Units) *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) =>
                  setFormData({ ...formData, stock_quantity: e.target.value })
                }
                className={`w-full px-3.5 py-2 bg-slate-50 border ${
                  errors.stock_quantity ? "border-red-500" : "border-slate-200"
                } rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.stock_quantity && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.stock_quantity}
                </p>
              )}
            </div>

            {/* Unit Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Unit Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.unit_price}
                onChange={(e) =>
                  setFormData({ ...formData, unit_price: e.target.value })
                }
                className={`w-full px-3.5 py-2 bg-slate-50 border ${
                  errors.unit_price ? "border-red-500" : "border-slate-200"
                } rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.unit_price && (
                <p className="text-xs text-red-500 mt-1">{errors.unit_price}</p>
              )}
            </div>

            {/* Expiration Date */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Expiration Date *
              </label>
              <input
                type="date"
                value={formData.expiration_date}
                onChange={(e) =>
                  setFormData({ ...formData, expiration_date: e.target.value })
                }
                className={`w-full px-3.5 py-2 bg-slate-50 border ${
                  errors.expiration_date ? "border-red-500" : "border-slate-200"
                } rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.expiration_date && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.expiration_date}
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                    ? "Update Record"
                    : "Save Record"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DrugModalForm;
