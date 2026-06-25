import React, { useState, useEffect } from "react";
import { getKPIs, getSKUs, getScenario, submitReview } from "../services/api";
import KPIHeaderStrip from "../components/assortment/KPIHeaderStrip";
import SKUPerformanceSection from "../components/assortment/SKUPerformanceSection";
import ScenarioSelectorSection from "../components/assortment/ScenarioSelectorSection";
import ApprovalReviewPanel from "../components/assortment/ApprovalReviewPanel";
import SuccessBanner from "../components/common/SuccessBanner";

export default function DashboardPage() {
  const [kpis, setKPIs] = useState(null);
  const [skus, setSKUs] = useState([]);
  const [selectedScenarioName, setSelectedScenarioName] = useState("balanced");
  const [scenarioDetails, setScenarioDetails] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [kpiData, skusData, scenarioData] = await Promise.all([
          getKPIs(),
          getSKUs(),
          getScenario("balanced"),
        ]);
        setKPIs(kpiData);
        setSKUs(skusData);
        setScenarioDetails(scenarioData);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          "Failed to load dashboard data. Please ensure the backend server is running.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectScenario = async (scenarioName) => {
    try {
      setSelectedScenarioName(scenarioName);
      const data = await getScenario(scenarioName);
      setScenarioDetails(data);
    } catch (err) {
      console.error(`Error fetching scenario ${scenarioName}:`, err);
      setError(`Failed to load scenario details for ${scenarioName}.`);
    }
  };

  const handleSubmit = async () => {
    if (!scenarioDetails) return;
    try {
      setIsSubmitting(true);
      const result = await submitReview(
        scenarioDetails.scenario_name,
        scenarioDetails.sku_actions,
      );
      setSuccessData(result);
      setError(null);
      // Scroll to top to show success banner
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Failed to submit assortment decisions. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-[48px] text-primary">
            progress_activity
          </span>
          <p className="text-body-md text-secondary font-medium">
            Loading Assortment Advisor Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {successData && (
        <SuccessBanner
          message={successData.message}
          transactionId={successData.transaction_id}
          onClose={() => setSuccessData(null)}
        />
      )}

      {error && (
        <div className="bg-error-container border-b border-error/20 text-on-error-container px-container-padding py-3 flex items-center justify-between text-body-sm z-40 relative">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            <p>{error}</p>
          </div>
          <button
            className="hover:bg-error/10 rounded-full p-1 transition-colors"
            onClick={() => setError(null)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      <main className="flex-1 px-container-padding py-section-gap max-w-[1600px] mx-auto w-full flex flex-col gap-gutter">
        {/* Row 1: KPI Cards */}
        <KPIHeaderStrip kpis={kpis} />

        {/* Row 2: Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Left Column: Data Table (8 cols) */}
          <SKUPerformanceSection skus={skus} />

          {/* Right Column: Scenarios & Actions (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <ScenarioSelectorSection
              selectedScenario={selectedScenarioName}
              onSelectScenario={handleSelectScenario}
            />
            <ApprovalReviewPanel
              scenario={scenarioDetails}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
