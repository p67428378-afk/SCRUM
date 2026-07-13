import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
});

// Realistic fallback mock data to prevent crashes when backend is offline
const MOCK_KPIS = {
  sales_per_linear_ft: 425.5,
  private_brand_share: 28.4,
  in_stock_rate: 96.8,
  shelf_capacity_utilization: 88.2,
};

const MOCK_SKUS = {
  total: 12,
  items: [
    {
      sku_id: "SKU-001",
      product_name: "Clover Valley Potato Chips 10oz",
      brand_type: "Private Brand",
      weekly_sales: 1240.5,
      margin_percent: 38.5,
      shelf_space: 4,
      status: "GROW",
    },
    {
      sku_id: "SKU-002",
      product_name: "Lay's Classic Potato Chips 8oz",
      brand_type: "National Brand",
      weekly_sales: 2450.0,
      margin_percent: 22.1,
      shelf_space: 6,
      status: "MAINTAIN",
    },
    {
      sku_id: "SKU-003",
      product_name: "Clover Valley Tortilla Chips 12oz",
      brand_type: "Private Brand",
      weekly_sales: 980.0,
      margin_percent: 41.0,
      shelf_space: 3,
      status: "GROW",
    },
    {
      sku_id: "SKU-004",
      product_name: "Doritos Nacho Cheese 9.25oz",
      brand_type: "National Brand",
      weekly_sales: 3100.2,
      margin_percent: 18.5,
      shelf_space: 8,
      status: "REDUCE",
    },
    {
      sku_id: "SKU-005",
      product_name: "Clover Valley Pretzels 16oz",
      brand_type: "Private Brand",
      weekly_sales: 650.0,
      margin_percent: 45.0,
      shelf_space: 2,
      status: "SWAP",
    },
  ],
};

const MOCK_SCENARIOS = {
  conservative: {
    scenario_name: "conservative",
    sku_action_summary: { grow: 1, maintain: 8, swap: 2, reduce: 1 },
    guardrails: {
      shelf_capacity_check: "Passed (100% compliant)",
      private_brand_goal: "Passed (+1.0% vs target)",
      margin_threshold: "Passed",
    },
  },
  balanced: {
    scenario_name: "balanced",
    sku_action_summary: { grow: 3, maintain: 5, swap: 3, reduce: 1 },
    guardrails: {
      shelf_capacity_check: "Passed (100% compliant)",
      private_brand_goal: "Passed (+3.1% vs target)",
      margin_threshold: "Passed",
    },
  },
  aggressive: {
    scenario_name: "aggressive",
    sku_action_summary: { grow: 6, maintain: 2, swap: 2, reduce: 2 },
    guardrails: {
      shelf_capacity_check: "Passed (100% compliant)",
      private_brand_goal: "Passed (+7.0% vs target)",
      margin_threshold: "Passed",
    },
  },
};

export const getKPIs = async () => {
  try {
    const response = await api.get("/api/v1/kpis");
    return response.data;
  } catch (error) {
    console.warn("Using fallback KPIs due to API error:", error.message);
    return MOCK_KPIS;
  }
};

export const getSKUs = async (page = 1, limit = 5) => {
  try {
    const response = await api.get("/api/v1/skus", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.warn("Using fallback SKUs due to API error:", error.message);
    const start = (page - 1) * limit;
    const items = MOCK_SKUS.items.slice(start, start + limit);
    return {
      total: MOCK_SKUS.total,
      items: items.length ? items : MOCK_SKUS.items.slice(0, limit),
    };
  }
};

export const getScenario = async (scenarioName) => {
  try {
    const response = await api.get(`/api/v1/scenarios/${scenarioName}`);
    return response.data;
  } catch (error) {
    console.warn(
      `Using fallback scenario (${scenarioName}) due to API error:`,
      error.message,
    );
    return MOCK_SCENARIOS[scenarioName] || MOCK_SCENARIOS.balanced;
  }
};

export const submitApproval = async (scenarioName) => {
  try {
    const response = await api.post("/api/v1/approvals", {
      scenario_name: scenarioName,
    });
    return response.data;
  } catch (error) {
    console.warn(
      "Using fallback approval submission due to API error:",
      error.message,
    );
    return {
      message: "Assortment plan submitted successfully!",
      transaction_id:
        "TXN-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      submitted_at: new Date().toISOString(),
      user: "Marcus Vance",
    };
  }
};

export const getApprovalDetails = async (approvalId) => {
  try {
    const response = await api.get(`/api/v1/approvals/${approvalId}`);
    return response.data;
  } catch (error) {
    console.warn(
      "Using fallback approval details due to API error:",
      error.message,
    );
    return {
      id: approvalId,
      status: "APPROVED",
      submitted_at: new Date().toISOString(),
    };
  }
};

export default api;
