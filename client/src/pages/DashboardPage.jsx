import React, { useState, useEffect } from "react";
import Header from "../components/layout/Header.jsx";
import KPIHeaderStrip from "../components/assortment/KPIHeaderStrip.jsx";
import SKUPerformanceTable from "../components/assortment/SKUPerformanceTable.jsx";
import ScenarioSelector from "../components/assortment/ScenarioSelector.jsx";
import ApprovalReviewPanel from "../components/assortment/ApprovalReviewPanel.jsx";
import Banner from "../components/common/Banner.jsx";
import { getDashboardData, submitAssortment } from "../services/api.js";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState("balanced");
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await getDashboardData();
      setData(dashboardData);
    } catch (err) {
      setError(err.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!data) return;

    const scenario = data.scenarios[selectedScenario];
    if (!scenario) return;

    try {
      setSubmitting(true);
      setSubmitError(null);
      setSubmitResult(null);

      const payload = {
        scenario_name: scenario.name,
        sku_actions: scenario.sku_actions,
        submitted_by: "Category Manager",
      };

      const result = await submitAssortment(payload);
      setSubmitResult(result);
    } catch (err) {
      const errMsg =
        err.response?.data?.detail || err.message || "Submission failed";
      setSubmitError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Header />

      <main className="flex-1 w-full max-w-[1440px] mx-auto p-margin-mobile md:p-margin-desktop flex flex-col gap-gutter">
        {error && (
          <Banner
            type="error"
            message={`Error loading dashboard: ${error}`}
            onClose={() => setError(null)}
          />
        )}

        {submitError && (
          <Banner
            type="error"
            message={`Submission failed: ${submitError}`}
            onClose={() => setSubmitError(null)}
          />
        )}

        {submitResult && (
          <div className="bg-[#E6F4EA] border border-[#1E8E3E] rounded-DEFAULT p-lg shadow-ambient flex flex-col gap-md">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#1E8E3E] text-xl shrink-0">
                check_circle
              </span>
              <div className="flex-1">
                <h4 className="font-headline-sm text-[#13522B] mb-1">
                  Assortment Changes Submitted Successfully!
                </h4>
                <p className="font-body-md text-[#13522B]/90 mb-4">
                  The assortment plan has been logged and sent for execution.
                </p>

                <div className="bg-white/60 rounded-DEFAULT p-md border border-[#1E8E3E]/20 flex flex-col gap-2 text-body-sm text-[#13522B]">
                  <p className="font-label-md uppercase tracking-wider text-[#13522B]/70">
                    Audit Trail Summary
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <strong>Submission ID:</strong> {submitResult.id}
                    </div>
                    <div>
                      <strong>Scenario:</strong> {submitResult.scenario_name}
                    </div>
                    <div>
                      <strong>Submitted By:</strong> {submitResult.submitted_by}
                    </div>
                    <div>
                      <strong>Timestamp:</strong>{" "}
                      {new Date(
                        submitResult.submission_timestamp,
                      ).toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-2">
                    <strong>SKU Actions Logged:</strong>
                    <ul className="list-disc list-inside mt-1 pl-2">
                      {submitResult.sku_actions.map((action, idx) => (
                        <li key={idx}>
                          {action.sku}:{" "}
                          <span className="font-semibold">{action.action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSubmitResult(null)}
                className="text-[#13522B] hover:opacity-70 focus:outline-none"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          </div>
        )}

        <KPIHeaderStrip kpis={data?.kpis} loading={loading} />

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter w-full items-start">
          <div className="lg:col-span-8">
            <SKUPerformanceTable skus={data?.skus} loading={loading} />
          </div>

          <div className="lg:col-span-4 flex flex-col gap-gutter w-full">
            <ScenarioSelector
              scenarios={data?.scenarios}
              selectedScenario={selectedScenario}
              onSelectScenario={setSelectedScenario}
              loading={loading}
            />

            <ApprovalReviewPanel
              scenario={data?.scenarios?.[selectedScenario]}
              onSubmit={handleSubmit}
              submitting={submitting}
              loading={loading}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
