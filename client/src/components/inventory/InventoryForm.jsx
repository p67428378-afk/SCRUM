import React, { useState, useEffect } from "react";
import Button from "../common/Button";

export default function InventoryForm({ initialData, onSubmit, onCancel }) {
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Produce");
  const [unitPrice, setUnitPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [unitOfMeasure, setUnitOfMeasure] = useState("kg");
  const [supplierName, setSupplierName] = useState("");
  const [initialStock, setInitialStock] = useState("0");
  const [reorderThreshold, setReorderThreshold] = useState("0");
  const [error, setError] = useState("");

  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setSku(initialData.sku || "");
      setName(initialData.name || "");
      setCategory(initialData.category || "Produce");
      setUnitPrice(initialData.unit_price || "");
      setCostPrice(initialData.cost_price || "");
      setUnitOfMeasure(initialData.unit_of_measure || "kg");
      setSupplierName(initialData.supplier_name || "");
      setReorderThreshold(initialData.inventory?.reorder_threshold || "0");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!sku.trim() || !name.trim() || !supplierName.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    const uPrice = parseFloat(unitPrice);
    const cPrice = parseFloat(costPrice);
    const iStock = parseFloat(initialStock);
    const rThreshold = parseFloat(reorderThreshold);

    if (isNaN(uPrice) || uPrice < 0 || isNaN(cPrice) || cPrice < 0) {
      setError("Prices must be non-negative numbers.");
      return;
    }

    if (!isEdit && (isNaN(iStock) || iStock < 0)) {
      setError("Initial stock must be a non-negative number.");
      return;
    }

    if (isNaN(rThreshold) || rThreshold < 0) {
      setError("Reorder threshold must be a non-negative number.");
      return;
    }

    const payload = {
      sku,
      name,
      category,
      unit_price: uPrice,
      cost_price: cPrice,
      unit_of_measure: unitOfMeasure,
      supplier_name: supplierName,
      reorder_threshold: rThreshold,
    };

    if (!isEdit) {
      payload.initial_stock = iStock;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
      {error && (
        <div className="bg-red-50 border border-red-200 text-[#db2626] p-[12px] rounded-[10px] text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-[4px]">
        <label className="text-[#707a8c] text-[12px] font-medium">
          SKU (Stock Keeping Unit) *
        </label>
        <input
          type="text"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          disabled={isEdit}
          placeholder="e.g., PROD-MIL-002"
          className="bg-[#f2f5fa] border border-[#e3e8f0] p-[12px] rounded-[10px] text-[14px] outline-none disabled:opacity-60"
          required
        />
      </div>

      <div className="flex flex-col gap-[4px]">
        <label className="text-[#707a8c] text-[12px] font-medium">
          Product Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Organic Whole Milk"
          className="bg-[#f2f5fa] border border-[#e3e8f0] p-[12px] rounded-[10px] text-[14px] outline-none"
          required
        />
      </div>

      <div className="flex flex-col gap-[4px]">
        <label className="text-[#707a8c] text-[12px] font-medium">
          Category *
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-[#f2f5fa] border border-[#e3e8f0] p-[12px] rounded-[10px] text-[14px] outline-none"
        >
          <option value="Produce">Produce</option>
          <option value="Dairy">Dairy</option>
          <option value="Bakery">Bakery</option>
          <option value="Meat">Meat</option>
          <option value="Pantry">Pantry</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-[16px]">
        <div className="flex flex-col gap-[4px]">
          <label className="text-[#707a8c] text-[12px] font-medium">
            Unit Price ($) *
          </label>
          <input
            type="number"
            step="0.01"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            placeholder="4.50"
            className="bg-[#f2f5fa] border border-[#e3e8f0] p-[12px] rounded-[10px] text-[14px] outline-none"
            required
          />
        </div>

        <div className="flex flex-col gap-[4px]">
          <label className="text-[#707a8c] text-[12px] font-medium">
            Cost Price ($) *
          </label>
          <input
            type="number"
            step="0.01"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            placeholder="2.50"
            className="bg-[#f2f5fa] border border-[#e3e8f0] p-[12px] rounded-[10px] text-[14px] outline-none"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[16px]">
        <div className="flex flex-col gap-[4px]">
          <label className="text-[#707a8c] text-[12px] font-medium">
            Unit of Measure *
          </label>
          <select
            value={unitOfMeasure}
            onChange={(e) => setUnitOfMeasure(e.target.value)}
            className="bg-[#f2f5fa] border border-[#e3e8f0] p-[12px] rounded-[10px] text-[14px] outline-none"
          >
            <option value="kg">kg</option>
            <option value="pack">pack</option>
            <option value="piece">piece</option>
            <option value="litre">litre</option>
          </select>
        </div>

        <div className="flex flex-col gap-[4px]">
          <label className="text-[#707a8c] text-[12px] font-medium">
            Supplier Name *
          </label>
          <input
            type="text"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            placeholder="Valley Dairy"
            className="bg-[#f2f5fa] border border-[#e3e8f0] p-[12px] rounded-[10px] text-[14px] outline-none"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[16px]">
        {!isEdit && (
          <div className="flex flex-col gap-[4px]">
            <label className="text-[#707a8c] text-[12px] font-medium">
              Initial Stock Level *
            </label>
            <input
              type="number"
              step="0.001"
              value={initialStock}
              onChange={(e) => setInitialStock(e.target.value)}
              placeholder="50.000"
              className="bg-[#f2f5fa] border border-[#e3e8f0] p-[12px] rounded-[10px] text-[14px] outline-none"
              required
            />
          </div>
        )}

        <div className="flex flex-col gap-[4px]">
          <label className="text-[#707a8c] text-[12px] font-medium">
            Reorder Threshold *
          </label>
          <input
            type="number"
            step="0.001"
            value={reorderThreshold}
            onChange={(e) => setReorderThreshold(e.target.value)}
            placeholder="15.000"
            className="bg-[#f2f5fa] border border-[#e3e8f0] p-[12px] rounded-[10px] text-[14px] outline-none"
            required
          />
        </div>
      </div>

      <div className="flex gap-[12px] justify-end mt-[12px]">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {isEdit ? "Save Changes" : "Save Grocery Item"}
        </Button>
      </div>
    </form>
  );
}
