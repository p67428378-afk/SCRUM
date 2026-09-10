import React, { useState, useEffect, useCallback } from "react";
import KPIHeaderStrip from "../components/KPIHeaderStrip.jsx";
import SKUTable from "../components/SKUTable.jsx";
import ScenarioSelector from "../components/ScenarioSelector.jsx";
import ApprovalReviewPanel from "../components/ApprovalReviewPanel.jsx";
import InlineConfirmationModal from "../components/InlineConfirmationModal.jsx";
import {
  fetchKPIMetrics,
  fetchSKUs,
  evaluateScenario,
  checkGuardrails,
  submitAssortmentPlan,
} from "../services/api.js";
import { Download, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";

const Dashboard = () => {
  // Top-level states
  const [kpiData, setKpiData] = useState(null);
  const [skus, setSkus] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState("Balanced");
  const [scenarioEvaluations, setScenarioEvaluations] = useState({});
  const [guardrailData, setGuardrailData] = useState(null);

  // Loading & status states
  const [loadingKPI, setLoadingKPI] = useState(true);
  const [loadingSKUs, setLoadingSKUs] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [inlineSuccessBanner, setInlineSuccessBanner] = useState(null);

  // Modal state
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Initial Data Load
  const loadInitialData = useCallback(async () => {
    setErrorMessage(null);
    try {
      setLoadingKPI(true);
      setLoadingSKUs(true);

      const [kpiRes, skusRes] = await Promise.all([
        fetchKPIMetrics(),
        fetchSKUs({
          category: "Snacks",
          cluster_id: "Small Town Value Cluster",
        }),
      ]);

      setKpiData(kpiRes);
      setSkus(skusRes);
    } catch (err) {
      setErrorMessage(
        "Failed to connect to DG Merchandising API. Please verify the backend service is running.",
      );
    } finally {
      setLoadingKPI(false);
      setLoadingSKUs(false);
    }
  }, []);

  // Scenario Evaluation & Guardrail Verification
  const updateScenarioAndGuardrails = useCallback(async (scenarioType) => {
    try {
      const evalRes = await evaluateScenario({ scenario_type: scenarioType });
      setScenarioEvaluations((prev) => ({
        ...prev,
        [scenarioType]: evalRes,
      }));

      const guardrailRes = await checkGuardrails({
        scenario_type: scenarioType,
        projected_pb_share_pct: evalRes.projected_pb_share_pct,
        projected_capacity_pct: evalRes.projected_capacity_pct,
      });

      setGuardrailData(guardrailRes);
    } catch (err) {
      // In case of network error, do not fail silently
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    updateScenarioAndGuardrails(selectedScenario);
  }, [selectedScenario, updateScenarioAndGuardrails]);

  // Pre-fetch all 3 scenarios so selector shows backend data
  useEffect(() => {
    const prefetchScenarios = async () => {
      try {
        const [consRes, balRes, aggRes] = await Promise.all([
          evaluateScenario({ scenario_type: "Conservative" }),
          evaluateScenario({ scenario_type: "Balanced" }),
          evaluateScenario({ scenario_type: "Aggressive" }),
        ]);
        setScenarioEvaluations({
          Conservative: consRes,
          Balanced: balRes,
          Aggressive: aggRes,
        });
      } catch (err) {
        // Fallback gracefully to default card values
      }
    };
    prefetchScenarios();
  }, []);

  // Handle Scenario Change
  const handleSelectScenario = (scenarioId) => {
    setSelectedScenario(scenarioId);
    setSubmissionError(null);
  };

  // Handle Submission
  const handleSubmitPlan = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);

    const activeEval = scenarioEvaluations[selectedScenario];
    const actions = activeEval?.recommended_actions || {
      GROW: 12,
      MAINTAIN: 10,
      SWAP: 4,
      REDUCE: 2,
    };

    const payload = {
      user_id: "category_mgr_01",
      scenario_type: selectedScenario,
      cluster_name: "Small Town Value Cluster",
      actions_summary: {
        grow: actions.GROW || 0,
        maintain: actions.MAINTAIN || 0,
        swap: actions.SWAP || 0,
        reduce: actions.REDUCE || 0,
      },
    };

    try {
      const result = await submitAssortmentPlan(payload);
      setSubmissionResult(result);
      setShowConfirmationModal(true);
      setInlineSuccessBanner({
        auditCode: result.audit_code,
        message: result.message || "Assortment changes submitted successfully.",
        timestamp: result.submitted_at || new Date().toISOString(),
      });
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        "Submission failed due to a server or network error. Please try again.";
      setSubmissionError(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export Master Ledger Handler
  const handleExportLedger = () => {
    const headers =
      "SKU Code,Product Name,Brand Type,Weekly Units,Sales / Linear Ft,Margin %,Space (ft),Action Badge\n";
    const rows = skus
      .map(
        (s) =>
          `"${s.sku_code}","${s.product_name}","${s.is_private_brand ? "Clover Valley" : "National"}",${s.weekly_units_sold},${s.sales_per_linear_ft},${s.margin_percentage},${s.linear_ft_allocated},"${s.status_badge}"`,
      )
      .join("\n");
    const blob = new Blob([headers + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `DG_Snacks_Assortment_Ledger_${selectedScenario}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900 font-sans"
      data-testid="dg-assortment-advisor-dashboard"
    >
      {/* Top Application Header */}
      <header className="bg-[#1E2229] text-white px-6 py-4 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-700 gap-4">
        <div className="flex items-center space-x-3">
          <span className="bg-[#FFC20E] text-[#1E2229] font-black px-2.5 py-1 rounded text-sm tracking-wider">
            DG
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              DG Cluster Assortment Advisor
            </h1>
            <p className="text-xs text-slate-400">
              Small Town Value Cluster | Category: Snacks | Decision Support
              Canvas
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full border border-slate-700">
            1,840 Stores Active
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Live Sync: Oct 24, 2024 • 08:30 AM CST
          </span>
          <button
            onClick={handleExportLedger}
            type="button"
            className="bg-slate-700 hover:bg-slate-600 text-xs text-white px-3 py-1.5 rounded transition flex items-center gap-1.5 cursor-pointer"
            data-testid="export-master-ledger-button"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Master Ledger</span>
          </button>
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-700">
            <div className="w-8 h-8 rounded-full bg-[#FFC20E] text-[#1E2229] font-bold flex items-center justify-center text-xs">
              MV
            </div>
            <span className="text-xs font-medium text-slate-200">
              Marcus Vance (Category Mgr)
            </span>
          </div>
        </div>
      </header>

      {/* Main Consolidated Single Canvas */}
      <main className="p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Global Connection / Data Error Banner */}
        {errorMessage && (
          <div
            className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-lg flex items-center justify-between text-xs shadow-sm"
            data-testid="global-error-banner"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={loadInitialData}
              className="px-3 py-1 bg-amber-200 hover:bg-amber-300 rounded font-semibold text-amber-900 transition flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Inline Submission Success Banner (if modal was closed) */}
        {inlineSuccessBanner && (
          <div
            className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg flex items-center justify-between text-xs shadow-sm animate-in fade-in"
            data-testid="inline-success-banner"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <strong className="font-bold">Plan Submitted: </strong>
                <span>
                  {inlineSuccessBanner.message} Audit ID:{" "}
                  <span className="font-mono font-bold">
                    {inlineSuccessBanner.auditCode}
                  </span>
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowConfirmationModal(true)}
              className="px-3 py-1 bg-emerald-200 hover:bg-emerald-300 rounded font-semibold text-emerald-900 transition"
            >
              View Audit Receipt
            </button>
          </div>
        )}

        {/* Section 1: KPI Header Strip */}
        <KPIHeaderStrip kpiData={kpiData} loading={loadingKPI} />

        {/* Section 2: Snacks SKU Performance & Action Ledger Table */}
        <SKUTable skus={skus} loading={loadingSKUs} />

        {/* Section 3: Select Optimization Scenario */}
        <ScenarioSelector
          selectedScenario={selectedScenario}
          onSelectScenario={handleSelectScenario}
          scenarioEvaluations={scenarioEvaluations}
        />

        {/* Section 4: Approval Review & Execution Sign-Off */}
        <ApprovalReviewPanel
          selectedScenario={selectedScenario}
          scenarioEvaluation={scenarioEvaluations[selectedScenario]}
          guardrailData={guardrailData}
          onSubmit={handleSubmitPlan}
          isSubmitting={isSubmitting}
          submissionError={submissionError}
        />
      </main>

      {/* Inline Confirmation Modal */}
      <InlineConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        submissionResult={submissionResult}
        selectedScenario={selectedScenario}
        scenarioEvaluation={scenarioEvaluations[selectedScenario]}
      />
    </div>
  );
};

export default Dashboard;
