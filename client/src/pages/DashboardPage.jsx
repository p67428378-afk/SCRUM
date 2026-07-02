import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import KpiHeader from "../components/KpiHeader.jsx";
import SkuPerformanceTable from "../components/SkuPerformanceTable.jsx";
import ScenarioSelector from "../components/ScenarioSelector.jsx";
import ApprovalReviewPanel from "../components/ApprovalReviewPanel.jsx";
import ConfirmationBanner from "../components/ConfirmationBanner.jsx";
import {
  getDashboardData,
  applyScenario,
  submitAssortment,
} from "../services/api.js";
import { AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [skus, setSkus] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState("Balanced");
  const [scenarioData, setScenarioData] = useState(null);
  const [confirmationData, setConfirmationData] = useState(null);

  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingScenario, setLoadingScenario] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoadingDashboard(true);
        const data = await getDashboardData();
        setKpis(data.kpis);
        setSkus(data.skus);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          "Failed to load dashboard data. Please ensure the backend server is running.",
        );
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchDashboard();
  }, []);

  // Apply scenario when selectedScenario changes
  useEffect(() => {
    const fetchScenario = async () => {
      try {
        setLoadingScenario(true);
        const data = await applyScenario(selectedScenario);
        setScenarioData(data);
        setError(null);
      } catch (err) {
        console.error(`Error applying scenario ${selectedScenario}:`, err);
        setError(`Failed to apply ${selectedScenario} strategy.`);
      } finally {
        setLoadingScenario(false);
      }
    };

    fetchScenario();
  }, [selectedScenario]);

  const handleSelectScenario = (scenarioName) => {
    if (confirmationData) return; // Prevent changing scenario after submission
    setSelectedScenario(scenarioName);
  };

  const handleSubmit = async () => {
    if (!scenarioData) return;
    try {
      setSubmitting(true);
      const payload = {
        projected_private_brand_pct: scenarioData.projected_private_brand_pct,
        projected_sales_lift: scenarioData.projected_sales_lift,
        scenario_name: scenarioData.scenario_name,
        sku_actions: scenarioData.sku_actions.map((action) => ({
          action: action.action,
          sku_id: action.sku_id,
          replacement_sku_id: action.replacement_sku_id,
        })),
      };
      const result = await submitAssortment(payload);
      setConfirmationData(result);
      setError(null);
    } catch (err) {
      console.error("Error submitting assortment:", err);
      setError("Failed to submit assortment decision.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setConfirmationData(null);
    setSelectedScenario("Balanced");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <Header />

        {/* Dashboard Canvas */}
        <main className="flex-1 p-8 max-w-[1600px] w-full mx-auto space-y-8">
          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm text-red-800 shadow-sm">
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">System Error</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* KPI Header Strip */}
          <KpiHeader kpis={kpis} loading={loadingDashboard} />

          {/* SKU Performance Section */}
          <SkuPerformanceTable skus={skus} loading={loadingDashboard} />

          {/* Bottom Grid: Scenario Selector & Approval/Confirmation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2 Columns: Scenario Selector */}
            <div className="lg:col-span-2">
              <ScenarioSelector
                selectedScenario={selectedScenario}
                onSelectScenario={handleSelectScenario}
              />
            </div>

            {/* Right 1 Column: Approval Review Panel OR Confirmation Banner */}
            <div className="lg:col-span-1">
              {confirmationData ? (
                <ConfirmationBanner
                  confirmationData={confirmationData}
                  onReset={handleReset}
                />
              ) : (
                <ApprovalReviewPanel
                  scenarioData={scenarioData}
                  loading={loadingScenario}
                  onSubmit={handleSubmit}
                  submitting={submitting}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
