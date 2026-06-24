import React, { useState, useEffect } from "react";
import Header from "../components/layout/Header.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import KPIHeaderStrip from "../components/assortment/KPIHeaderStrip.jsx";
import SKUPerformanceTable from "../components/assortment/SKUPerformanceTable.jsx";
import ScenarioSelector from "../components/assortment/ScenarioSelector.jsx";
import ApprovalReviewPanel from "../components/assortment/ApprovalReviewPanel.jsx";
import SubmissionConfirmationModal from "../components/assortment/SubmissionConfirmationModal.jsx";
import { getDashboardData, submitAssortmentPlan } from "../services/api.js";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpiMetrics, setKpiMetrics] = useState({});
  const [skuPerformance, setSkuPerformance] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [skuActions, setSkuActions] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDashboardData();
        setKpiMetrics(data.kpi_metrics || {});
        setSkuPerformance(data.sku_performance || []);
        setScenarios(data.scenarios || []);

        // Default to Balanced scenario if available, otherwise first scenario
        const balanced =
          data.scenarios?.find((s) => s.name === "Balanced") ||
          data.scenarios?.[0];
        if (balanced) {
          setSelectedScenario(balanced);
          initializeSkuActions(data.sku_performance || [], balanced);
        }
        setError(null);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const initializeSkuActions = (performance, scenario) => {
    const actions = {};
    // Set default recommended actions
    performance.forEach((item) => {
      actions[item.sku] = item.recommended_action || "MAINTAIN";
    });
    // Override with scenario-specific actions
    scenario?.sku_actions?.forEach((actionItem) => {
      actions[actionItem.sku] = actionItem.action;
    });
    setSkuActions(actions);
  };

  const handleScenarioSelect = (scenario) => {
    setSelectedScenario(scenario);
    initializeSkuActions(skuPerformance, scenario);
  };

  const handleActionChange = (sku, newAction) => {
    setSkuActions((prev) => ({
      ...prev,
      [sku]: newAction,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedScenario) return;
    try {
      setIsSubmitting(true);
      // Format sku_actions as array of { sku, action }
      const formattedActions = Object.entries(skuActions).map(
        ([sku, action]) => ({
          sku,
          action,
        }),
      );

      const result = await submitAssortmentPlan(
        selectedScenario.name,
        formattedActions,
      );
      setSubmissionResult(result);
      setIsModalOpen(true);
    } catch (err) {
      alert("Failed to submit assortment plan. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div class="flex items-center justify-center min-h-screen bg-background">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p class="font-body-md text-body-md text-secondary">
            Loading Assortment Advisor...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div class="flex items-center justify-center min-h-screen bg-background">
        <div class="text-center max-w-md p-6 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm">
          <span class="material-symbols-outlined text-error text-5xl mb-4">
            error
          </span>
          <h3 class="font-headline-md text-headline-md font-bold text-on-surface mb-2">
            Error Loading Dashboard
          </h3>
          <p class="font-body-md text-body-md text-secondary mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            class="px-6 py-2 bg-primary-container text-[#0F172A] font-bold rounded hover:bg-primary-fixed transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div class="bg-background text-on-background min-h-screen flex">
      <Sidebar />
      <div class="ml-[260px] flex-1 flex flex-col min-h-screen">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main class="flex-1 mt-[64px] p-container-padding overflow-x-hidden">
          <KPIHeaderStrip kpiMetrics={kpiMetrics} />
          <div class="grid grid-cols-12 gap-gutter items-start">
            <SKUPerformanceTable
              skuPerformance={skuPerformance}
              skuActions={skuActions}
              onActionChange={handleActionChange}
              searchQuery={searchQuery}
            />
            <div class="col-span-12 xl:col-span-4 flex flex-col gap-6">
              <ScenarioSelector
                scenarios={scenarios}
                selectedScenario={selectedScenario}
                onScenarioSelect={handleScenarioSelect}
              />
              <ApprovalReviewPanel
                selectedScenario={selectedScenario}
                skuActions={skuActions}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </main>
      </div>

      <SubmissionConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        submissionResult={submissionResult}
        scenarioName={selectedScenario?.name}
      />
    </div>
  );
}
