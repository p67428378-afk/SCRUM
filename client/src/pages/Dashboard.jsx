import React, { useEffect, useState } from "react";
import KPIHeaderStrip from "../components/KPIHeaderStrip.jsx";
import SKUPerformanceTable from "../components/SKUPerformanceTable.jsx";
import ScenarioSelector from "../components/ScenarioSelector.jsx";
import ApprovalReviewPanel from "../components/ApprovalReviewPanel.jsx";
import InlineConfirmationBanner from "../components/InlineConfirmationBanner.jsx";
import {
  getKPIs,
  getSKUs,
  getScenario,
  submitAssortment,
} from "../services/api.js";

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [skus, setSkus] = useState([]);
  const [totalSKUs, setTotalSKUs] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(5);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const [selectedScenario, setSelectedScenario] = useState("Balanced");
  const [scenariosData, setScenariosData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [error, setError] = useState(null);

  // Fetch KPIs
  useEffect(() => {
    getKPIs()
      .then((data) => setKpis(data))
      .catch((err) => console.error("Error fetching KPIs:", err));
  }, []);

  // Fetch SKUs when page, search, or sorting changes
  useEffect(() => {
    getSKUs({
      page,
      per_page: perPage,
      search,
      sort_by: sortBy,
      sort_order: sortOrder,
    })
      .then((data) => {
        setSkus(data.items);
        setTotalSKUs(data.total);
      })
      .catch((err) => console.error("Error fetching SKUs:", err));
  }, [page, search, sortBy, sortOrder]);

  // Fetch Scenario Data for all three scenarios to populate the selector cards
  useEffect(() => {
    const scenarios = ["Conservative", "Balanced", "Aggressive"];
    scenarios.forEach((name) => {
      getScenario(name)
        .then((data) => {
          setScenariosData((prev) => ({ ...prev, [name]: data }));
        })
        .catch((err) => console.error(`Error fetching scenario ${name}:`, err));
    });
  }, []);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearch = (term) => {
    setSearch(term);
    setPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setError(null);
    submitAssortment(selectedScenario)
      .then((result) => {
        setSubmissionResult(result);
        // Refresh KPIs after submission
        getKPIs().then((data) => setKpis(data));
      })
      .catch((err) => {
        console.error("Error submitting assortment:", err);
        setError(
          err.response?.data?.detail || "Failed to submit assortment plan.",
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex antialiased">
      {/* Sidebar */}
      <aside className="w-sidebar_width h-screen sticky top-0 left-0 bg-inverse-surface border-r border-outline-variant flex flex-col h-full py-lg hidden md:flex z-20">
        <div className="px-md mb-xl flex items-center gap-sm">
          <span className="material-symbols-outlined text-title-lg font-title-lg text-primary-fixed">
            storefront
          </span>
          <div>
            <h1 className="font-title-md text-title-md text-surface-container-lowest">
              DG Cluster Advisor
            </h1>
            <p className="font-label-sm text-label-sm text-surface-variant">
              Retail Planning Tool
            </p>
          </div>
        </div>
        <div className="px-md mb-lg">
          <button className="w-full bg-primary-container text-on-primary-fixed font-title-md text-title-md py-sm px-md rounded flex items-center justify-center gap-sm hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined">add</span>
            New Scenario
          </button>
        </div>
        <nav className="flex-1 px-sm space-y-base">
          <a
            className="flex items-center gap-md px-md py-sm rounded cursor-pointer active:opacity-80 text-primary-fixed font-bold border-l-4 border-primary-fixed bg-on-surface-variant/10"
            href="#"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              dashboard
            </span>
            Dashboard
          </a>
          <a
            className="flex items-center gap-md px-md py-sm rounded cursor-pointer active:opacity-80 text-surface-variant hover:text-surface-bright hover:bg-on-surface-variant/5 transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined">category</span>
            Categories
          </a>
          <a
            className="flex items-center gap-md px-md py-sm rounded cursor-pointer active:opacity-80 text-surface-variant hover:text-surface-bright hover:bg-on-surface-variant/5 transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined">inventory_2</span>
            Inventory
          </a>
          <a
            className="flex items-center gap-md px-md py-sm rounded cursor-pointer active:opacity-80 text-surface-variant hover:text-surface-bright hover:bg-on-surface-variant/5 transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined">analytics</span>
            Reports
          </a>
          <a
            className="flex items-center gap-md px-md py-sm rounded cursor-pointer active:opacity-80 text-surface-variant hover:text-surface-bright hover:bg-on-surface-variant/5 transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined">settings</span>
            Settings
          </a>
        </nav>
        <div className="px-sm mt-auto space-y-base pt-md border-t border-surface-variant/20">
          <a
            className="flex items-center gap-md px-md py-sm rounded cursor-pointer active:opacity-80 text-surface-variant hover:text-surface-bright hover:bg-on-surface-variant/5 transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined">help</span>
            Help
          </a>
          <a
            className="flex items-center gap-md px-md py-sm rounded cursor-pointer active:opacity-80 text-surface-variant hover:text-surface-bright hover:bg-on-surface-variant/5 transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </a>
          <div className="px-md py-sm flex items-center gap-md mt-sm">
            <img
              className="w-8 h-8 rounded-full object-cover border border-surface-variant"
              alt="Planner Profile"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuiOS_fkIWobYeblImlYXINq10u1XTWFX0jW5Yprk3BhGQjoCRhXoFiDQWK57wVQ8E6XlkAWESLxcx84W_ufpfwpus0Yi17NWVxE7Y8TSx5uM4WiwhoszJw8LVrcHOJ6l61zxcOCkQn7QPCfIls8ZUXCXbDqUYnndLB9wI0LPFP70bpfgMneI7wJzXU0SRO3cqE9zYEFoMfnbBsQD8k5VJMrZCOVerGc1laM_G0vVFH_7cRMDlxUDxCS_kNJW4iwyWJjAXG6kVOdo"
            />
            <span className="text-surface-variant font-label-md text-label-md">
              Planner Profile
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* TopAppBar */}
        <header class="bg-surface-container-lowest border-b border-surface-container-highest flex justify-between items-center w-full px-lg py-md h-16 sticky top-0 z-10 transition-all duration-200">
          <div className="flex items-center gap-md">
            <button className="md:hidden text-on-surface-variant p-sm rounded hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="font-headline-md text-headline-md text-on-surface hidden sm:block">
              DG Cluster Assortment Advisor
            </h2>
          </div>
          <div className="flex-1 max-w-md mx-md hidden lg:block relative">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              className="w-full pl-xl pr-sm py-xs border border-surface-container-highest rounded bg-surface-bright text-body-md focus:border-primary-container focus:ring-0 transition-colors"
              placeholder="Search SKUs, Clusters..."
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-sm">
            <button className="p-sm text-on-surface-variant rounded hover:bg-surface-container-low transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-sm right-sm w-2 h-2 bg-error rounded-full"></span>
            </button>
            <button className="p-sm text-on-surface-variant rounded hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
          </div>
        </header>

        {/* Canvas */}
        <div className="p-md lg:p-margin flex-1 overflow-auto">
          {/* Error Banner */}
          {error && (
            <div className="mb-lg bg-red-50 border border-red-200 text-red-700 rounded p-md flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-red-600">
                  error
                </span>
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          )}

          {/* Success Banner */}
          <InlineConfirmationBanner
            submission={submissionResult}
            onClose={() => setSubmissionResult(null)}
          />

          {/* Header Section */}
          <div className="mb-lg flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
            <div>
              <h2 className="font-display-sm text-display-sm text-on-surface mb-xs">
                Small Town Value Cluster
              </h2>
              <div className="flex items-center gap-sm text-on-surface-variant font-body-md text-body-md">
                <span className="material-symbols-outlined text-[18px]">
                  category
                </span>
                <span>Snacks Category</span>
                <span className="text-surface-dim mx-xs">•</span>
                <span>Last Updated: Today, 08:30 AM</span>
              </div>
            </div>
            <div className="flex gap-sm">
              <button className="px-md py-sm border border-outline rounded text-on-surface font-title-md text-title-md hover:bg-surface-container-low transition-colors flex items-center gap-xs">
                <span className="material-symbols-outlined text-[18px]">
                  download
                </span>
                Export
              </button>
              <button className="px-md py-sm bg-primary-container text-on-primary-fixed font-title-md text-title-md rounded hover:opacity-90 transition-opacity">
                View Planogram
              </button>
            </div>
          </div>

          {/* KPI Strip */}
          <KPIHeaderStrip kpis={kpis} />

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-margin">
            {/* Left Column (60%) */}
            <div className="xl:col-span-7 flex flex-col gap-md">
              <SKUPerformanceTable
                skus={skus}
                total={totalSKUs}
                page={page}
                perPage={perPage}
                onPageChange={handlePageChange}
                onSearch={handleSearch}
                onSort={handleSort}
                sortBy={sortBy}
                sortOrder={sortOrder}
              />
            </div>

            {/* Right Column (40%) */}
            <div className="xl:col-span-5 flex flex-col gap-md">
              <ScenarioSelector
                selectedScenario={selectedScenario}
                onSelectScenario={setSelectedScenario}
                scenariosData={scenariosData}
              />

              <ApprovalReviewPanel
                selectedScenario={selectedScenario}
                scenarioData={scenariosData[selectedScenario]}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
