import React, { useState, useEffect } from "react";
import Header from "../components/layout/Header.jsx";
import KpiStrip from "../components/assortment/KpiStrip.jsx";
import SkuPerformanceTable from "../components/assortment/SkuPerformanceTable.jsx";
import ScenarioSelector from "../components/assortment/ScenarioSelector.jsx";
import ApprovalReviewPanel from "../components/assortment/ApprovalReviewPanel.jsx";
import InlineConfirmationBanner from "../components/assortment/InlineConfirmationBanner.jsx";
import {
  getKpis,
  getSkus,
  getScenario,
  submitAssortmentReview,
} from "../services/api.js";

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [skus, setSkus] = useState([]);
  const [searchVal, setSearchVal] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedScenario, setSelectedScenario] = useState("balanced");
  const [scenarioData, setScenarioData] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const data = await getKpis();
        setKpis(data);
      } catch (err) {
        console.error("Error fetching KPIs:", err);
      }
    };
    fetchKpis();
  }, []);

  useEffect(() => {
    const fetchSkus = async () => {
      try {
        const data = await getSkus(searchVal, selectedStatus);
        setSkus(data);
      } catch (err) {
        console.error("Error fetching SKUs:", err);
      }
    };
    fetchSkus();
  }, [searchVal, selectedStatus]);

  useEffect(() => {
    const fetchScenario = async () => {
      try {
        const data = await getScenario(selectedScenario);
        setScenarioData(data);
      } catch (err) {
        console.error("Error fetching scenario:", err);
      }
    };
    fetchScenario();
  }, [selectedScenario]);

  const handleSubmitReview = async () => {
    if (!scenarioData) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await submitAssortmentReview(
        selectedScenario,
        scenarioData.skus_to_action || [],
      );
      setAuditData(result);
    } catch (err) {
      setError("Failed to submit assortment review. Please try again.");
      console.error("Error submitting review:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background font-body-md">
      <Header searchVal={searchVal} onSearchChange={setSearchVal} />

      <div className="flex-1 mt-[64px] flex relative">
        {/* Side Navigation Component */}
        <nav className="hidden md:flex flex-col py-md px-sm fixed left-0 top-[64px] bottom-0 w-[280px] bg-surface-container border-r border-outline-variant z-40 overflow-y-auto">
          <div className="mb-lg px-sm">
            <div className="flex items-center gap-sm mb-xs">
              <span className="material-symbols-outlined text-primary-fixed-dim text-3xl">
                storefront
              </span>
              <div>
                <div className="font-headline-md text-primary-fixed-dim leading-tight font-semibold">
                  Small Town Value
                </div>
                <div className="font-body-sm text-on-surface-variant leading-tight">
                  Cluster View
                </div>
              </div>
            </div>
          </div>
          <ul className="flex flex-col gap-xs flex-1">
            <li>
              <a
                className="flex items-center gap-sm px-sm py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all duration-200 ease-in-out font-label-md font-semibold"
                href="#"
              >
                <span className="material-symbols-outlined text-[20px]">
                  dashboard
                </span>
                Dashboard
              </a>
            </li>
            <li>
              <a
                className="flex items-center gap-sm px-sm py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all duration-200 ease-in-out font-label-md font-semibold"
                href="#"
              >
                <span className="material-symbols-outlined text-[20px]">
                  analytics
                </span>
                SKU Performance
              </a>
            </li>
            <li>
              <a
                className="flex items-center gap-sm px-sm py-2 rounded-lg bg-primary-container text-on-primary-container font-bold transition-all duration-200 ease-in-out font-label-md"
                href="#"
              >
                <span className="material-symbols-outlined text-[20px] fill">
                  query_stats
                </span>
                Scenario Planning
              </a>
            </li>
            <li>
              <a
                className="flex items-center gap-sm px-sm py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all duration-200 ease-in-out font-label-md font-semibold"
                href="#"
              >
                <span className="material-symbols-outlined text-[20px]">
                  hub
                </span>
                Cluster Insights
              </a>
            </li>
            <li>
              <a
                className="flex items-center gap-sm px-sm py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all duration-200 ease-in-out font-label-md font-semibold"
                href="#"
              >
                <span className="material-symbols-outlined text-[20px]">
                  settings
                </span>
                Settings
              </a>
            </li>
          </ul>
          <div className="mt-auto pt-md px-sm">
            <button className="w-full bg-primary-container text-on-primary-container font-label-md py-2 rounded-lg font-bold hover:brightness-110 transition-all shadow-sm">
              Approve Scenarios
            </button>
          </div>
        </nav>

        {/* Main Canvas */}
        <main className="flex-1 md:ml-[280px] p-md lg:p-lg max-w-container-max mx-auto w-full overflow-x-hidden">
          {auditData && (
            <InlineConfirmationBanner
              auditData={auditData}
              onClose={() => setAuditData(null)}
            />
          )}

          {error && (
            <div className="mb-lg bg-error-container border border-error rounded-lg p-sm flex items-start gap-sm shadow-sm text-on-error-container">
              <span className="material-symbols-outlined text-error fill mt-0.5">
                error
              </span>
              <div className="flex-1">
                <p className="font-body-md">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-error hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          )}

          <KpiStrip kpis={kpis} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
            {/* Left Column: SKU Performance */}
            <div className="lg:col-span-8 flex flex-col gap-md">
              <SkuPerformanceTable
                skus={skus}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
              />
            </div>

            {/* Right Column: Scenarios & Review */}
            <div className="lg:col-span-4 flex flex-col gap-md">
              <ScenarioSelector
                selectedScenario={selectedScenario}
                onScenarioChange={setSelectedScenario}
              />
              <ApprovalReviewPanel
                scenarioData={scenarioData}
                onSubmit={handleSubmitReview}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
