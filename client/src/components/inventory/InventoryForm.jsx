import React, { useEffect, useState } from "react";
import { getAttributes } from "../../services/api";

export default function InventoryForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    material: "",
    gemstone_type: "None",
    carat_weight: "",
    price: "",
    stock_quantity: "",
    low_stock_threshold: "5",
  });

  const [attributes, setAttributes] = useState({
    categories: [],
    materials: [],
    gemstones: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchAttrs = async () => {
      try {
        const data = await getAttributes();
        setAttributes(data);
        // Set default values if not editing
        if (!initialData) {
          setFormData((prev) => ({
            ...prev,
            category: data.categories[0] || "",
            material: data.materials[0] || "",
            gemstone_type: data.gemstones[0] || "None",
          }));
        }
      } catch (err) {
        console.error("Failed to fetch attributes", err);
      }
    };
    fetchAttrs();
  }, [initialData]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        category: initialData.category || "",
        material: initialData.material || "",
        gemstone_type: initialData.gemstone_type || "None",
        carat_weight:
          initialData.carat_weight !== null
            ? initialData.carat_weight.toString()
            : "",
        price: initialData.price !== null ? initialData.price.toString() : "",
        stock_quantity:
          initialData.stock_quantity !== null
            ? initialData.stock_quantity.toString()
            : "",
        low_stock_threshold:
          initialData.low_stock_threshold !== null
            ? initialData.low_stock_threshold.toString()
            : "5",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.material) newErrors.material = "Material is required";

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      newErrors.price = "Price must be a positive number";
    }

    const stockNum = parseInt(formData.stock_quantity, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      newErrors.stock_quantity =
        "Stock quantity must be a non-negative integer";
    }

    const thresholdNum = parseInt(formData.low_stock_threshold, 10);
    if (isNaN(thresholdNum) || thresholdNum < 0) {
      newErrors.low_stock_threshold =
        "Threshold must be a non-negative integer";
    }

    if (formData.carat_weight) {
      const caratNum = parseFloat(formData.carat_weight);
      if (isNaN(caratNum) || caratNum < 0) {
        newErrors.carat_weight = "Carat weight must be a positive number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: formData.name,
      category: formData.category,
      material: formData.material,
      gemstone_type:
        formData.gemstone_type === "None" ? null : formData.gemstone_type,
      carat_weight: formData.carat_weight
        ? parseFloat(formData.carat_weight)
        : null,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity, 10),
      low_stock_threshold: parseInt(formData.low_stock_threshold, 10),
    };

    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-outline-variant rounded-xl p-6 space-y-6 max-w-2xl mx-auto"
    >
      <h3 className="font-headline-sm text-headline-sm text-on-surface border-b border-outline-variant pb-4">
        {initialData ? "Edit Inventory Item" : "Create New Inventory Item"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
            Item Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Diamond Solitaire Ring"
            className={`bg-surface-container-low border rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-body-md ${
              errors.name ? "border-error" : "border-outline-variant"
            }`}
          />
          {errors.name && (
            <span className="text-error text-label-sm">{errors.name}</span>
          )}
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-body-md"
          >
            {attributes.categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Material */}
        <div className="flex flex-col gap-1">
          <label className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
            Material *
          </label>
          <select
            name="material"
            value={formData.material}
            onChange={handleChange}
            className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-body-md"
          >
            {attributes.materials.map((mat) => (
              <option key={mat} value={mat}>
                {mat}
              </option>
            ))}
          </select>
        </div>

        {/* Gemstone Type */}
        <div className="flex flex-col gap-1">
          <label className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
            Gemstone Type
          </label>
          <select
            name="gemstone_type"
            value={formData.gemstone_type}
            onChange={handleChange}
            className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-body-md"
          >
            {attributes.gemstones.map((gem) => (
              <option key={gem} value={gem}>
                {gem}
              </option>
            ))}
          </select>
        </div>

        {/* Carat Weight */}
        <div className="flex flex-col gap-1">
          <label className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
            Carat Weight (ct)
          </label>
          <input
            type="number"
            step="0.01"
            name="carat_weight"
            value={formData.carat_weight}
            onChange={handleChange}
            placeholder="e.g. 1.5"
            className={`bg-surface-container-low border rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-body-md ${
              errors.carat_weight ? "border-error" : "border-outline-variant"
            }`}
          />
          {errors.carat_weight && (
            <span className="text-error text-label-sm">
              {errors.carat_weight}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex flex-col gap-1">
          <label className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
            Price ($) *
          </label>
          <input
            type="number"
            step="0.01"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g. 5000"
            className={`bg-surface-container-low border rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-body-md ${
              errors.price ? "border-error" : "border-outline-variant"
            }`}
          />
          {errors.price && (
            <span className="text-error text-label-sm">{errors.price}</span>
          )}
        </div>

        {/* Stock Quantity */}
        <div className="flex flex-col gap-1">
          <label className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
            Stock Quantity *
          </label>
          <input
            type="number"
            name="stock_quantity"
            value={formData.stock_quantity}
            onChange={handleChange}
            placeholder="e.g. 10"
            className={`bg-surface-container-low border rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-body-md ${
              errors.stock_quantity ? "border-error" : "border-outline-variant"
            }`}
          />
          {errors.stock_quantity && (
            <span className="text-error text-label-sm">
              {errors.stock_quantity}
            </span>
          )}
        </div>

        {/* Low Stock Threshold */}
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
            Low Stock Threshold *
          </label>
          <input
            type="number"
            name="low_stock_threshold"
            value={formData.low_stock_threshold}
            onChange={handleChange}
            placeholder="e.g. 5"
            className={`bg-surface-container-low border rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-body-md ${
              errors.low_stock_threshold
                ? "border-error"
                : "border-outline-variant"
            }`}
          />
          {errors.low_stock_threshold && (
            <span className="text-error text-label-sm">
              {errors.low_stock_threshold}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-outline-variant pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity font-label-md text-label-md shadow-[0_0_15px_rgba(192,193,255,0.2)]"
        >
          {initialData ? "Save Changes" : "Create Item"}
        </button>
      </div>
    </form>
  );
}
