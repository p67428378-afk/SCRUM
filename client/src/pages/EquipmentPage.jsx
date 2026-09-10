import React, { useState, useEffect } from "react";
import { equipmentApi } from "../services/api";
import EquipmentCard from "../components/equipment/EquipmentCard";
import MaintenanceModal from "../components/equipment/MaintenanceModal";
import AlertBanner from "../components/common/AlertBanner";
import { Wrench } from "lucide-react";

export default function EquipmentPage() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const data = await equipmentApi.getEquipment();
      setEquipmentList(data);
    } catch (err) {
      console.error("Failed to load equipment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (machine) => {
    setSelectedMachine(machine);
    setIsModalOpen(true);
  };

  const handleMaintenanceSubmit = async (logData) => {
    await equipmentApi.createMaintenanceLog(
      selectedMachine?.id || logData.equipment_id,
      logData,
    );
    setSuccessMessage(
      `Maintenance log saved successfully for ${selectedMachine?.name || "Equipment"}.`,
    );
    loadEquipment();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-800" />
            Equipment Maintenance & Asset Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Machine asset telemetry, operating hour threshold alerts,
            preventative maintenance scheduling, and repair logs.
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

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {equipmentList.map((item) => (
          <EquipmentCard
            key={item.id}
            equipment={item}
            onLogMaintenance={handleOpenModal}
          />
        ))}
      </div>

      {/* Maintenance Log Modal */}
      <MaintenanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        equipment={selectedMachine}
        onSubmit={handleMaintenanceSubmit}
      />
    </div>
  );
}
