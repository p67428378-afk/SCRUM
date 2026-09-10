import React, { useState, useEffect, useCallback } from "react";
import HeaderBar from "../components/HeaderBar.jsx";
import KPIHeaderStrip from "../components/KPIHeaderStrip.jsx";
import SKUPerformanceTable from "../components/SKUPerformanceTable.jsx";
import ScenarioSelector from "../components/ScenarioSelector.jsx";
import ApprovalReviewPanel from "../components/ApprovalReviewPanel.jsx";
import InlineConfirmationModal from "../components/InlineConfirmationModal.jsx";
import { api } from "../services/api.js";
import {
  X,
  History,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function DashboardPage() {
  const [clusterName] = useState("Small Town Value Cluster");
  const [backendConnected, setBackendConnected] = useState(true);

  // KPIs State
  const [kpis, setKpis] = useState({
    sales_per_linear_ft: 1250,
    private_brand_pct: 28.0,
    in_stock_rate: 96.5,
    shelf_capacity_pct: 92.0,
    cluster_name: "Small Town Value Cluster",
  });
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiError, setKpiError] = useState(null);

  // SKUs State
  const [skus, setSkus] = useState([]);
  const [skuCounts, setSkuCounts] = useState({
    grow_count: 12,
    maintain_count: 18,
    swap_count: 4,
    reduce_count: 2,
    total: 36,
  });
  const [skuLoading, setSkuLoading] = useState(true);
  const [skuError, setSkuError] = useState(null);

  // Scenarios State (Default: Balanced)
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState("Balanced");
  const [scenarioEvaluation, setScenarioEvaluation] = useState(null);
  const [guardrailResults, setGuardrailResults] = useState(null);

  // Submission & Audit State
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditList, setAuditList] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Fetch KPI data
  const fetchKPIs = useCallback(async () => {
    setKpiLoading(true);
    setKpiError(null);
    try {
      const data = await api.getKPIs(clusterName);
      setKpis(data);
      setBackendConnected(true);
    } catch (err) {
      // Keep sensible defaults for demo if backend is offline, but set error
      setKpiError(err.message || "Failed to fetch KPI metrics");
    } finally {
      setKpiLoading(false);
    }
  }, [clusterName]);

  // Fetch SKUs
  const fetchSKUs = useCallback(async () => {
    setSkuLoading(true);
    setSkuError(null);
    try {
      const data = await api.getSKUs({ limit: 100 });
      if (data?.items) {
        setSkus(data.items);
        setSkuCounts({
          grow_count: data.grow_count ?? 12,
          maintain_count: data.maintain_count ?? 18,
          swap_count: data.swap_count ?? 4,
          reduce_count: data.reduce_count ?? 2,
          total: data.total ?? data.items.length,
        });
      }
      setBackendConnected(true);
    } catch (err) {
      setSkuError(err.message || "Failed to load SKU list");
    } finally {
      setSkuLoading(false);
    }
  }, []);

  // Fetch Scenarios
  const fetchScenarios = useCallback(async () => {
    try {
      const list = await api.getScenarios();
      if (Array.isArray(list) && list.length > 0) {
        setScenarios(list);
      }
    } catch (err) {
      // Fallback handled in ScenarioSelector
    }
  }, []);

  // Evaluate Selected Scenario & Guardrails
  const updateScenarioAndGuardrails = useCallback(
    async (scenarioKey) => {
      try {
        const [evalRes, guardRes] = await Promise.all([
          api.evaluateScenario(scenarioKey),
          api.checkGuardrails(scenarioKey, clusterName),
        ]);
        setScenarioEvaluation(evalRes);
        setGuardrailResults(guardRes);
      } catch (err) {
        // Fallbacks are rendered gracefully in panels
      }
    },
    [clusterName],
  );

  // Handle Scenario Change
  const handleSelectScenario = (key) => {
    setSelectedScenario(key);
    updateScenarioAndGuardrails(key);
  };

  // Fetch Audit Trail
  const fetchAuditTrail = async () => {
    setAuditLoading(true);
    try {
      const logs = await api.getAuditTrail(20);
      setAuditList(Array.isArray(logs) ? logs : []);
    } catch (err) {
      // Handle error
    } finally {
      setAuditLoading(false);
    }
  };

  const openAuditTrail = () => {
    setShowAuditModal(true);
    fetchAuditTrail();
  };

  // Submit Assortment Plan
  const handleSubmitApproval = async (payload) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await api.submitApproval({
        scenario: payload.scenario,
        cluster_name: payload.cluster_name,
        user_id: payload.user_id,
        notes: payload.notes,
      });

      // Show Inline Confirmation Modal with live audit record
      setSubmissionResult(result);
      // Refresh KPIs and SKUs
      fetchKPIs();
    } catch (err) {
      setSubmitError(
        err.response?.data?.detail ||
          err.message ||
          "Assortment plan submission failed.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Initial Data Load
  useEffect(() => {
    fetchKPIs();
    fetchSKUs();
    fetchScenarios();
    updateScenarioAndGuardrails("Balanced");
  }, [fetchKPIs, fetchSKUs, fetchScenarios, updateScenarioAndGuardrails]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-[#ECC000] selection:text-black">
      {/* Header Bar */}
      <HeaderBar
        clusterName={clusterName}
        onOpenAuditTrail={openAuditTrail}
        backendConnected={backendConnected}
      />

      {/* Main Consolidated Dashboard Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Info Banner */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-slate-900 font-extrabold text-lg flex-shrink-0">
              DG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Category Assortment Advisor &mdash; Small Town Value Cluster
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-300">
                  Active Reset
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Single-canvas decision cockpit to optimize Snacks category shelf
                allocations, protect private brand margins, and maintain store
                in-stock SLAs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto text-xs">
            <button
              onClick={() => {
                fetchKPIs();
                fetchSKUs();
                updateScenarioAndGuardrails(selectedScenario);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium border border-slate-300 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* 1. KPI Header Strip */}
        <KPIHeaderStrip kpis={kpis} loading={kpiLoading} error={kpiError} />

        {/* 2. Scenario Selector Cards */}
        <ScenarioSelector
          scenarios={scenarios}
          selectedScenario={selectedScenario}
          onSelectScenario={handleSelectScenario}
          loading={false}
        />

        {/* 3. Approval Review & Guardrail Panel */}
        <ApprovalReviewPanel
          selectedScenario={selectedScenario}
          scenarioEvaluation={scenarioEvaluation}
          guardrailResults={guardrailResults}
          clusterName={clusterName}
          onSubmit={handleSubmitApproval}
          submitting={submitting}
          submitError={submitError}
        />

        {/* 4. SKU Performance Table */}
        <SKUPerformanceTable
          skus={skus}
          counts={skuCounts}
          loading={skuLoading}
          error={skuError}
          onRefresh={fetchSKUs}
        />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-4 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Dollar General Merchandising Technology &copy;{" "}
            {new Date().getFullYear()} &bull; DG Cluster Assortment Advisor
          </span>
          <span className="text-slate-400 text-[11px]">
            Connected to PostgreSQL &bull; Single Consolidated Screen
          </span>
        </div>
      </footer>

      {/* Inline Confirmation Modal */}
      {submissionResult && (
        <InlineConfirmationModal
          auditData={submissionResult}
          onClose={() => setSubmissionResult(null)}
          onViewAuditTrail={openAuditTrail}
        />
      )}

      {/* Historical Audit Trail Modal Drawer */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#ECC000]" />
                <h3 className="font-bold text-base">
                  Historical Submission Audit Trail
                </h3>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {auditLoading ? (
                <div className="py-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                  <span>Loading audit log entries...</span>
                </div>
              ) : auditList.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p>No audit trail records found yet.</p>
                  <p className="text-slate-400 mt-1">
                    Submit an assortment scenario to generate your first audit
                    record.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditList.map((log) => (
                    <div
                      key={log.id || log.audit_id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {log.audit_id}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {log.status || "SUBMITTED"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 pt-1">
                        <div>
                          <span className="text-[10px] text-slate-400 block">
                            Scenario
                          </span>
                          <span className="font-semibold text-slate-800">
                            {log.scenario}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">
                            Modified SKUs
                          </span>
                          <span className="font-semibold text-slate-800">
                            {log.total_modified_skus} SKUs
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">
                            Guardrails
                          </span>
                          <span className="font-semibold text-emerald-700">
                            {log.guardrail_status}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">
                            Timestamp
                          </span>
                          <span className="font-mono text-[11px] text-slate-700">
                            {log.created_at
                              ? new Date(log.created_at).toLocaleTimeString()
                              : "Just now"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
