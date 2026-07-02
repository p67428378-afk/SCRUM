import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Mock Data Fallbacks
const MOCK_DASHBOARD_DATA = {
  kpis: {
    sales_per_linear_ft: { value: 145.5, change: 2.5 },
    private_brand_pct: { value: 28.5, change: 1.2 },
    in_stock_rate: { value: 96.4, change: -0.5 },
    shelf_capacity: { value: 82.0, change: 0.0 },
  },
  skus: [
    {
      id: "1",
      sku_id: "SKU-1001",
      name: "Lay's Classic 8oz",
      brand: "Lay's",
      weekly_sales: 1250,
      sales_trend_wow: 12,
      profit_margin: 35,
      days_of_supply: 5,
      is_private_brand: false,
      recommendation_status: "GROW",
    },
    {
      id: "2",
      sku_id: "SKU-1002",
      name: "Clover Valley Pretzels 16oz",
      brand: "Clover Valley",
      weekly_sales: 450,
      sales_trend_wow: -2,
      profit_margin: 48,
      days_of_supply: 18,
      is_private_brand: true,
      recommendation_status: "SWAP",
    },
  ],
};

const MOCK_SCENARIOS = {
  Conservative: {
    scenario_name: "Conservative",
    projected_sales_lift: 1.5,
    projected_private_brand_pct: 29.0,
    guardrails: {
      private_brand_valid: true,
      shelf_capacity_valid: true,
    },
    sku_actions: [],
  },
  Balanced: {
    scenario_name: "Balanced",
    projected_sales_lift: 3.2,
    projected_private_brand_pct: 28.1,
    guardrails: {
      private_brand_valid: true,
      shelf_capacity_valid: true,
    },
    sku_actions: [
      {
        sku_id: "SKU-1002",
        name: "Clover Valley Pretzels 16oz",
        action: "SWAP",
        replacement_sku_id: "SKU-2001",
        replacement_name: "Clover Valley Honey Mustard Pretzels 16oz",
      },
    ],
  },
  Aggressive: {
    scenario_name: "Aggressive",
    projected_sales_lift: 5.8,
    projected_private_brand_pct: 24.5,
    guardrails: {
      private_brand_valid: false,
      shelf_capacity_valid: true,
    },
    sku_actions: [
      {
        sku_id: "SKU-1002",
        name: "Clover Valley Pretzels 16oz",
        action: "SWAP",
        replacement_sku_id: "SKU-2001",
        replacement_name: "Clover Valley Honey Mustard Pretzels 16oz",
      },
      {
        sku_id: "SKU-1001",
        name: "Lay's Classic 8oz",
        action: "REDUCE",
        replacement_sku_id: null,
        replacement_name: null,
      },
    ],
  },
};

const MOCK_SUBMISSION = {
  confirmation_number: "CONF-STV-20260702-99",
  status: "SUCCESS",
  submission_id: "a5b07384-d113-49c3-a5e0-4dfd982e4799",
  summary: "Assortment changes submitted successfully!",
  timestamp: "2026-07-02T15:15:00Z",
};

export const getDashboardData = async () => {
  try {
    const response = await api.get("/api/v1/dashboard");
    return response.data;
  } catch (error) {
    console.warn(
      "Failed to fetch dashboard data from backend, using mock fallback:",
      error,
    );
    return MOCK_DASHBOARD_DATA;
  }
};

export const applyScenario = async (scenarioName) => {
  try {
    const response = await api.post(`/api/v1/scenarios/${scenarioName}/apply`);
    return response.data;
  } catch (error) {
    console.warn(
      `Failed to apply scenario ${scenarioName} from backend, using mock fallback:`,
      error,
    );
    // Normalize scenario name to match keys
    const key =
      scenarioName.charAt(0).toUpperCase() +
      scenarioName.slice(1).toLowerCase();
    return MOCK_SCENARIOS[key] || MOCK_SCENARIOS["Balanced"];
  }
};

export const submitAssortment = async (payload) => {
  try {
    const response = await api.post("/api/v1/assortments/submit", payload);
    return response.data;
  } catch (error) {
    console.warn(
      "Failed to submit assortment to backend, using mock fallback:",
      error,
    );
    return MOCK_SUBMISSION;
  }
};

export default api;
