import React, { useState, useEffect } from "react";
import { livestockApi } from "../services/api";
import LivestockTable from "../components/livestock/LivestockTable";
import HealthRecordModal from "../components/livestock/HealthRecordModal";
import AlertBanner from "../components/common/AlertBanner";
import { HeartPulse } from "lucide-react";

export default function LivestockPage() {
  const [livestock, setLivestock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadLivestock();
  }, []);

  const loadLivestock = async () => {
    setLoading(true);
    try {
      const data = await livestockApi.getLivestock();
      setLivestock(data);
    } catch (err) {
      console.error("Failed to load livestock:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (animal) => {
    setSelectedAnimal(animal);
    setIsModalOpen(true);
  };

  const handleHealthRecordSubmit = async (recordData) => {
    await livestockApi.createHealthRecord(
      selectedAnimal?.id || recordData.livestock_id,
      recordData,
    );
    setSuccessMessage(
      `Health record logged successfully for animal ${selectedAnimal?.tag_number}.`,
    );
    loadLivestock();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-emerald-800" />
            Livestock Tracking & Health Records
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Herd animal registry, vaccination schedules, health inspections, and
            medical history logs.
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

      {/* Table */}
      <LivestockTable
        livestockData={livestock}
        onLogHealthEvent={handleOpenModal}
      />

      {/* Health Record Modal */}
      <HealthRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        animal={selectedAnimal}
        onSubmit={handleHealthRecordSubmit}
      />
    </div>
  );
}
