import React, { useState, useEffect } from "react";
import { Bell, Settings } from "lucide-react";
import {
  getKPIs,
  getSKUs,
  selectScenario,
  submitReview,
} from "../services/api";
import KPIHeaderStrip from "../components/dashboard/KPIHeaderStrip";
import SKUPerformanceSection from "../components/dashboard/SKUPerformanceSection";
import ScenarioSelector from "../components/dashboard/ScenarioSelector";
import ApprovalReviewPanel from "../components/dashboard/ApprovalReviewPanel";
import Modal from "../components/common/Modal";

export default function DashboardPage() {
  const [kpis, setKPIs] = useState(null);
  const [skus, setSKUs] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState("Balanced");
  const [scenarioData, setScenarioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const [kpiRes, skuRes, scenarioRes] = await Promise.all([
          getKPIs(),
          getSKUs(),
          selectScenario("Balanced"),
        ]);
        setKPIs(kpiRes);
        setSKUs(skuRes);
        setScenarioData(scenarioRes);
        setError(null);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError(
          "Failed to load dashboard data. Please ensure the backend is running.",
        );
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const handleSelectScenario = async (scenarioName) => {
    try {
      setSelectedScenario(scenarioName);
      const data = await selectScenario(scenarioName);
      setScenarioData(data);
    } catch (err) {
      console.error("Error selecting scenario:", err);
    }
  };

  const handleSubmitScenario = async () => {
    try {
      const result = await submitReview(selectedScenario);
      if (result.success) {
        setModalContent(result);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error("Error submitting scenario:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-[#dae2fd] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="font-body-md">Loading Assortment Advisor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-[#dae2fd] flex items-center justify-center p-4">
        <div className="bg-surface-container border border-red-500/30 p-lg rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">
            Initialization Error
          </h2>
          <p className="text-on-surface-variant mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-on-primary-container px-4 py-2 rounded font-semibold hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      {/* TopNavBar */}
      <nav className="bg-surface dark:bg-surface w-full top-0 sticky border-b border-surface-bright dark:border-surface-bright flat no shadows flex justify-between items-center px-lg py-md w-full max-w-container-max mx-auto z-50">
        <div className="flex items-center gap-lg">
          <span className="text-headline-md font-headline-md font-bold text-primary dark:text-primary">
            Assortment Advisor
          </span>
          <div className="hidden md:flex gap-md ml-xl">
            <a
              className="text-on-surface-variant dark:text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors active:opacity-80 transition-all"
              href="#"
            >
              Dashboard
            </a>
            <a
              className="text-primary font-bold border-b-2 border-primary pb-1 font-body-md text-body-md hover:text-primary transition-colors active:opacity-80 transition-all"
              href="#"
            >
              Scenarios
            </a>
            <a
              className="text-on-surface-variant dark:text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors active:opacity-80 transition-all"
              href="#"
            >
              Inventory
            </a>
            <a
              className="text-on-surface-variant dark:text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors active:opacity-80 transition-all"
              href="#"
            >
              Analytics
            </a>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <button
            onClick={handleSubmitScenario}
            className="bg-primary text-on-primary-container px-4 py-2 rounded font-body-md font-semibold hover:opacity-90 transition-opacity"
          >
            Submit Review
          </button>
          <button className="text-on-surface hover:text-primary transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="text-on-surface hover:text-primary transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <img
            alt="Category Manager Profile"
            className="w-8 h-8 rounded-full border border-surface-bright object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB80SDDZifIiOCJ6nOmltEawbFuPZZge1iso2n5XZd3JPpEpl5XbMb_tPYya9URI-zb4ANMOS9hP6cxac3kaNwjifSbcZ5ILPCVvlThnvKi7neyl0jkQkqQt2JVXZ6q_kcS5V8xeYLBVywkdodA2yKYjg_cLPSHyRzP6e8DmwOztqx_TYa-qPHN6s5U-8c0JrCX9DK0Fs5Cf0XmZ6MOuiyoLYZCbKKIlnJEcxWfQbFTtHYS8f8NPcP2i9cHjwT1C5P7YQf6jEqBhr8"
          />
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden w-full max-w-container-max mx-auto">
        {/* SideNavBar */}
        <aside className="bg-surface-container dark:bg-surface-container h-[calc(100vh-73px)] w-64 sticky left-0 border-r border-surface-bright dark:border-surface-bright flat no shadows flex flex-col p-md hidden lg:flex flex-shrink-0 z-40">
          <div className="mb-lg">
            <div className="flex items-center gap-sm mb-sm">
              <img
                alt="Organization Logo"
                className="w-10 h-10 rounded bg-surface object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQeO2npCs6YNnnphIsCYx1jeIhJOb0CLUCotRSKjYek2D7aEKXiv7ZfzCipFscRC4Pa7qtTFHaWIFlH_66ZhXsio26-4csiwKxVBYpmEx2ofqBXrpHTxKSSjQRqrf5IOm4IBw7iYfss2e24YQ8OSNEKOCN4m-BgZrCNZv6c4RJppZ0uqj2P9JEFxah6RadAqDVuk9pB1Udi1PTYgnp3XrAXlXBhgFTTEXN6NFkqK_StSUdE7cnsKhxPz5bY3KOhHTzOFqfIjiFX-Q"
              />
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface text-sm leading-tight">
                  Category Management
                </h2>
                <p class="text-on-surface-variant text-xs">Q4 Planning Cycle</p>
              </div>
            </div>
            <button className="w-full bg-surface-bright border border-surface-bright text-on-surface py-2 rounded mt-sm hover:border-primary transition-colors font-body-md">
              New Scenario
            </button>
          </div>
          <nav className="flex-1 flex flex-col gap-sm overflow-y-auto">
            <a
              className="flex items-center gap-md p-sm text-on-surface-variant hover:bg-surface-bright font-label-caps text-label-caps hover:bg-surface-container-high transition-colors active:scale-95 transition-transform rounded"
              href="#"
            >
              Overview
            </a>
            <a
              className="flex items-center gap-md p-sm bg-secondary-container text-on-secondary-container rounded-lg font-bold font-label-caps text-label-caps hover:bg-surface-container-high transition-colors active:scale-95 transition-transform"
              href="#"
            >
              Assortment Plan
            </a>
            <a
              className="flex items-center gap-md p-sm text-on-surface-variant hover:bg-surface-bright font-label-caps text-label-caps hover:bg-surface-container-high transition-colors active:scale-95 transition-transform rounded"
              href="#"
            >
              Space Optimization
            </a>
            <a
              className="flex items-center gap-md p-sm text-on-surface-variant hover:bg-surface-bright font-label-caps text-label-caps hover:bg-surface-container-high transition-colors active:scale-95 transition-transform rounded"
              href="#"
            >
              Financial Impact
            </a>
            <a
              className="flex items-center gap-md p-sm text-on-surface-variant hover:bg-surface-bright font-label-caps text-label-caps hover:bg-surface-container-high transition-colors active:scale-95 transition-transform rounded"
              href="#"
            >
              Approval Status
            </a>
          </nav>
          <div className="mt-auto border-t border-surface-bright pt-sm flex flex-col gap-sm">
            <a
              className="flex items-center gap-md p-sm text-on-surface-variant hover:bg-surface-bright font-label-caps text-label-caps hover:bg-surface-container-high transition-colors active:scale-95 transition-transform rounded"
              href="#"
            >
              Help Center
            </a>
            <a
              className="flex items-center gap-md p-sm text-on-surface-variant hover:bg-surface-bright font-label-caps text-label-caps hover:bg-surface-container-high transition-colors active:scale-95 transition-transform rounded"
              href="#"
            >
              Support
            </a>
          </div>
        </aside>

        {/* Main Content Canvas */}
        <main className="flex-1 overflow-y-auto p-md lg:p-lg">
          {/* Header */}
          <header className="mb-lg">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-xs">
              DG Cluster Assortment Advisor
            </h1>
            <div className="flex items-center gap-md text-on-surface-variant">
              <span className="font-body-md text-body-md">
                Small Town Value Cluster Stores
              </span>
              <span className="w-1 h-1 rounded-full bg-surface-bright"></span>
              <span className="font-body-md text-body-md">
                Active Assortment Cycle: Q3 2026
              </span>
            </div>
          </header>

          {/* KPI Row */}
          <KPIHeaderStrip kpis={kpis} />

          {/* Asymmetric Grid */}
          <div className="grid grid-cols-12 gap-md">
            {/* Left/Main Area: SKU Table */}
            <div className="col-span-12 xl:col-span-8 flex flex-col gap-md">
              <SKUPerformanceSection skus={skus} />
            </div>

            {/* Right Panel */}
            <div className="col-span-12 xl:col-span-4 flex flex-col gap-md">
              <ScenarioSelector
                selectedScenario={selectedScenario}
                onSelectScenario={handleSelectScenario}
              />
              <ApprovalReviewPanel
                scenarioData={scenarioData}
                onSubmit={handleSubmitScenario}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Scenario Submitted Successfully"
      >
        {modalContent && (
          <div className="space-y-4">
            <div className="p-sm bg-emerald-950/30 border border-emerald-500/30 rounded text-emerald-400 font-semibold flex items-center gap-2">
              <span>✓</span> Approved Scenario: {modalContent.approved_scenario}
            </div>
            <div>
              <span className="font-label-caps text-xs text-on-surface-variant block mb-1">
                AUDIT TRAIL
              </span>
              <p className="font-data-mono text-xs bg-surface-container-low p-sm rounded border border-surface-bright leading-relaxed">
                {modalContent.audit_trail}
              </p>
            </div>
            <div className="text-xs text-on-surface-variant font-data-mono">
              Timestamp: {new Date(modalContent.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
