import React, { useState, useEffect } from "react";
import KPIHeaderStrip from "../components/assortment/KPIHeaderStrip";
import SKUPerformanceTable from "../components/assortment/SKUPerformanceTable";
import ScenarioSelector from "../components/assortment/ScenarioSelector";
import ApprovalReviewPanel from "../components/assortment/ApprovalReviewPanel";
import Modal from "../components/common/Modal";
import {
  getKPIs,
  getSKUs,
  getScenarios,
  submitAssortment,
} from "../services/api";

export default function DashboardPage() {
  const [kpis, setKPIs] = useState(null);
  const [skus, setSKUs] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [loading, setLoading] = useState({
    kpis: true,
    skus: true,
    scenarios: true,
  });
  const [error, setError] = useState({
    kpis: null,
    skus: null,
    scenarios: null,
    submit: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const data = await getKPIs();
        setKPIs(data);
        setLoading((prev) => ({ ...prev, kpis: false }));
      } catch (err) {
        setError((prev) => ({ ...prev, kpis: err.message }));
        setLoading((prev) => ({ ...prev, kpis: false }));
      }
    };

    const fetchSKUs = async () => {
      try {
        const data = await getSKUs();
        setSKUs(data);
        setLoading((prev) => ({ ...prev, skus: false }));
      } catch (err) {
        setError((prev) => ({ ...prev, skus: err.message }));
        setLoading((prev) => ({ ...prev, skus: false }));
      }
    };

    const fetchScenarios = async () => {
      try {
        const data = await getScenarios();
        setScenarios(data);
        // Pre-select Balanced scenario
        const balanced = data.find((s) => s.name === "Balanced") || data[0];
        setSelectedScenario(balanced);
        setLoading((prev) => ({ ...prev, scenarios: false }));
      } catch (err) {
        setError((prev) => ({ ...prev, scenarios: err.message }));
        setLoading((prev) => ({ ...prev, scenarios: false }));
      }
    };

    fetchKPIs();
    fetchSKUs();
    fetchScenarios();
  }, []);

  const handleSubmit = async () => {
    if (!selectedScenario) return;
    setSubmitting(true);
    setError((prev) => ({ ...prev, submit: null }));
    try {
      const payload = {
        scenario_name: selectedScenario.name,
        submitted_by: "manager@example.com",
        actions: selectedScenario.actions.map((act) => ({
          sku_id: act.sku_id,
          action: act.action,
        })),
      };
      const result = await submitAssortment(payload);
      setSubmissionResult({
        submission_id: result.submission_id,
        status: result.status || "SUBMITTED & ARCHIVED",
        timestamp: result.timestamp
          ? new Date(result.timestamp).toLocaleString()
          : new Date().toLocaleString(),
        submitted_by: "manager@example.com",
      });
      setIsModalOpen(true);
    } catch (err) {
      setError((prev) => ({
        ...prev,
        submit: err.response?.data?.detail || err.message,
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 md:ml-[280px] mt-[64px] p-container-padding overflow-y-auto custom-scrollbar flex flex-col gap-card-gap">
      {/* Header Controls Context */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1">
            Small Town Value Cluster
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Assortment Review for 1,245 locations • Q3 2026 Strategy
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-surface-container border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface flex items-center gap-2 hover:border-primary hover:text-primary transition-all">
            <span className="material-symbols-outlined text-[18px]">
              calendar_today
            </span>
            Date Range
          </button>
          <button className="px-4 py-2 bg-surface-container border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface flex items-center gap-2 hover:border-primary hover:text-primary transition-all">
            <span className="material-symbols-outlined text-[18px]">
              filter_list
            </span>
            Filters
          </button>
        </div>
      </div>

      {/* Top Row KPIs */}
      <KPIHeaderStrip kpis={kpis} loading={loading.kpis} error={error.kpis} />

      {/* Error Banner for Submission */}
      {error.submit && (
        <div className="bg-error-container/20 border border-error text-error p-4 rounded-xl text-center font-bold">
          Submission Failed: {error.submit}
        </div>
      )}

      {/* Main Bento Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-card-gap flex-1 min-h-0">
        {/* Left Column (8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-card-gap min-h-0">
          {/* Table Section */}
          <SKUPerformanceTable
            skus={skus}
            loading={loading.skus}
            error={error.skus}
          />

          {/* Scenario Selection Section */}
          <ScenarioSelector
            scenarios={scenarios}
            selectedScenario={selectedScenario}
            onSelectScenario={setSelectedScenario}
            loading={loading.scenarios}
            error={error.scenarios}
          />
        </div>

        {/* Right Sidebar (4 cols) */}
        <ApprovalReviewPanel
          selectedScenario={selectedScenario}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </div>

      {/* Success Modal Overlay */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        submissionData={submissionResult}
      />
    </main>
  );
}
