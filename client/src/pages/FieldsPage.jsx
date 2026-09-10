import React, { useState, useEffect } from "react";
import { fieldsApi } from "../services/api";
import FieldCard from "../components/fields/FieldCard";
import CropCycleModal from "../components/fields/CropCycleModal";
import AlertBanner from "../components/common/AlertBanner";
import { MapPin, Sprout, Plus } from "lucide-react";

export default function FieldsPage() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    setLoading(true);
    try {
      const data = await fieldsApi.getFields();
      setFields(data);
    } catch (err) {
      console.error("Failed to load fields:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (field) => {
    setSelectedField(field);
    setIsModalOpen(true);
  };

  const handleCropCycleSubmit = async (cropCycleData) => {
    await fieldsApi.createCropCycle(cropCycleData);
    setSuccessMessage(
      `Successfully scheduled ${cropCycleData.crop_type} crop cycle for ${selectedField?.name || "Field"}.`,
    );
    loadFields();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-800" />
            Field & Crop Cycle Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Map parcels, assign crop rotations, track planting/harvest windows,
            and record soil metrics.
          </p>
        </div>
      </div>

      {successMessage && (
        <AlertBanner
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}

      {/* Grid of Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {fields.map((field) => (
          <FieldCard
            key={field.id}
            field={field}
            onScheduleCropCycle={handleOpenModal}
          />
        ))}
      </div>

      {/* Schedule Crop Cycle Modal */}
      <CropCycleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        field={selectedField}
        onSubmit={handleCropCycleSubmit}
      />
    </div>
  );
}
