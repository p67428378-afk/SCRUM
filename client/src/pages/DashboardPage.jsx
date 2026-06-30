import React, { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import KpiHeaderStrip from "../components/dashboard/KpiHeaderStrip";
import SkuPerformanceTable from "../components/dashboard/SkuPerformanceTable";
import ScenarioSelector from "../components/dashboard/ScenarioSelector";
import ApprovalReviewPanel from "../components/dashboard/ApprovalReviewPanel";
import SuccessBanner from "../components/dashboard/SuccessBanner";
import { getKpis, getSkus, getScenario, submitApproval } from "../services/api";

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [kpisLoading, setKpisLoading] = useState(true);

  const [skus, setSkus] = useState([]);
  const [skusLoading, setSkusLoading] = useState(true);
  const [sortBy, setSortBy] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  const [selectedScenario, setSelectedScenario] = useState("Balanced");
  const [scenarioDetails, setScenarioDetails] = useState(null);
  const [scenarioLoading, setScenarioDetailsLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [auditId, setAuditId] = useState("");
  const [error, setError] = useState(null);

  // Fetch KPIs on mount
  useEffect(() => {
    async function fetchKpis() {
      try {
        setKpisLoading(true);
        const data = await getKpis();
        setKpis(data);
      } catch (err) {
        console.error("Error fetching KPIs:", err);
      } finally {
        setKpisLoading(false);
      }
    }
    fetchKpis();
  }, []);

  // Fetch SKUs when filters/sorting change
  useEffect(() => {
    async function fetchSkus() {
      try {
        setSkusLoading(true);
        const data = await getSkus(sortBy, statusFilter);
        setSkus(data);
      } catch (err) {
        console.error("Error fetching SKUs:", err);
      } finally {
        setSkusLoading(false);
      }
    }
    fetchSkus();
  }, [sortBy, statusFilter]);

  // Fetch scenario details when selected scenario changes
  useEffect(() => {
    async function fetchScenarioDetails() {
      try {
        setScenarioDetailsLoading(true);
        const data = await getScenario(selectedScenario);
        setScenarioDetails(data);
      } catch (err) {
        console.error("Error fetching scenario details:", err);
      } finally {
        setScenarioDetailsLoading(false);
      }
    }
    fetchScenarioDetails();
  }, [selectedScenario]);

  const handleSubmit = async () => {
    if (!scenarioDetails) return;

    try {
      setSubmitting(true);
      setError(null);

      // Map the scenario details to the expected API payload format
      const addSkus = (scenarioDetails.sku_actions?.add || []).map(
        (item) => item.sku,
      );
      const removeSkus = (scenarioDetails.sku_actions?.remove || []).map(
        (item) => item.sku,
      );
      const swapSkus = (scenarioDetails.sku_actions?.swap || []).map(
        (item) => ({
          add_sku: item.add_sku,
          remove_sku: item.remove_sku,
        }),
      );

      const decisionPayload = {
        projected_sales_impact: scenarioDetails.projected_sales_impact,
        projected_private_brand_impact:
          scenarioDetails.projected_private_brand_impact,
        sku_actions: {
          add: addSkus,
          remove: removeSkus,
          swap: swapSkus,
        },
      };

      const result = await submitApproval(selectedScenario, decisionPayload);
      setAuditId(result.audit_id);
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting approval:", err);
      setError(
        err.response?.data?.detail || "Failed to submit assortment scenario.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setAuditId("");
    setError(null);
  };

  return (
    <AppLayout>
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm mb-stack-lg">
        <span>Snacks Category</span>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-on-surface">Small Town Value Cluster</span>
      </div>

      {/* KPI Header Strip */}
      <KpiHeaderStrip kpis={kpis} loading={kpisLoading} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
        {/* Left Column: SKU Performance Table */}
        <div className="xl:col-span-8 flex flex-col gap-stack-md">
          <SkuPerformanceTable
            skus={skus}
            loading={skusLoading}
            sortBy={sortBy}
            setSortBy={setSortBy}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </div>

        {/* Right Column: Scenario Selector & Approval Review Panel */}
        <div className="xl:col-span-4 flex flex-col gap-stack-md">
          <ScenarioSelector
            selectedScenario={selectedScenario}
            onSelectScenario={(sc) => {
              setSelectedScenario(sc);
              handleReset(); // Reset submission state when switching scenarios
            }}
          />

          {error && (
            <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {submitted ? (
            <SuccessBanner
              scenarioName={selectedScenario}
              auditId={auditId}
              onReset={handleReset}
            />
          ) : (
            <ApprovalReviewPanel
              scenarioDetails={scenarioDetails}
              loading={scenarioLoading}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
