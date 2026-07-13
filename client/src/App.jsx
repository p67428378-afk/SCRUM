import React, { useState, useEffect } from "react";
import Header from "./components/layout/Header.jsx";
import KPICard from "./components/common/KPICard.jsx";
import SKUPerformanceTable from "./components/assortment/SKUPerformanceTable.jsx";
import ScenarioSelector from "./components/assortment/ScenarioSelector.jsx";
import ApprovalReviewPanel from "./components/assortment/ApprovalReviewPanel.jsx";
import InlineConfirmationBanner from "./components/assortment/InlineConfirmationBanner.jsx";
import {
  getKPIs,
  getSKUs,
  getScenario,
  submitApproval,
} from "./services/api.js";

export default function App() {
  const [kpis, setKpis] = useState(null);
  const [skus, setSkus] = useState([]);
  const [totalSKUs, setTotalSKUs] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedScenario, setSelectedScenario] = useState("balanced");
  const [scenarioData, setScenarioData] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const kpiRes = await getKPIs();
        setKpis(kpiRes);
      } catch (err) {
        console.error("Error fetching KPIs:", err);
      }

      try {
        const skuRes = await getSKUs(page, 5);
        if (skuRes) {
          setSkus(skuRes.items || []);
          setTotalSKUs(skuRes.total || 0);
        }
      } catch (err) {
        console.error("Error fetching SKUs:", err);
      }
    };
    fetchInitialData();
  }, [page]);

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await submitApproval(selectedScenario);
      setSubmission(res);
    } catch (err) {
      console.error("Error submitting approval:", err);
      setError("Failed to submit assortment plan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-body-md text-body-md antialiased min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mt-[64px] p-container-padding space-y-lg overflow-y-auto">
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg mx-container-padding">
            {error}
          </div>
        )}

        {/* KPI Header Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-md">
          <KPICard
            title="Sales per Linear Ft"
            value={
              kpis?.sales_per_linear_ft !== undefined
                ? `$${kpis.sales_per_linear_ft.toFixed(2)}`
                : "$0.00"
            }
            subtext="+12.4% vs Last Year"
            icon="$"
            gradientClass="from-emerald-500/5 to-transparent"
            subtextColor="text-emerald-400"
          />
          <KPICard
            title="Private Brand Share"
            value={
              kpis?.private_brand_share !== undefined
                ? `${kpis.private_brand_share.toFixed(1)}%`
                : "0.0%"
            }
            subtext="+3.1% vs Target (Goal: 30.0%)"
            icon="⊞"
            gradientClass="from-amber-500/5 to-transparent"
            subtextColor="text-amber-500"
          />
          <KPICard
            title="In-Stock Rate"
            value={
              kpis?.in_stock_rate !== undefined
                ? `${kpis.in_stock_rate.toFixed(1)}%`
                : "0.0%"
            }
            subtext="On Target"
            icon="✓"
            gradientClass="from-emerald-500/5 to-transparent"
            subtextColor="text-emerald-400"
          />
          <KPICard
            title="Shelf Capacity Utilization"
            value={
              kpis?.shelf_capacity_utilization !== undefined
                ? `${kpis.shelf_capacity_utilization.toFixed(1)}%`
                : "0.0%"
            }
            subtext="Optimal (11.8% Buffer)"
            icon="▤"
            gradientClass="from-slate-500/5 to-transparent"
            subtextColor="text-slate-400"
          />
        </div>

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          <SKUPerformanceTable
            skus={skus}
            total={totalSKUs}
            page={page}
            limit={5}
            onPageChange={setPage}
          />
          <div className="flex flex-col space-y-lg">
            <ScenarioSelector
              selectedScenario={selectedScenario}
              onSelectScenario={setSelectedScenario}
            />
            <ApprovalReviewPanel
              scenarioData={scenarioData}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </main>

      {/* Success Banner */}
      {submission && <InlineConfirmationBanner submission={submission} />}
    </div>
  );
}
