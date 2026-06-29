import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getKpis = async () => {
  const response = await api.get("/api/v1/kpis");
  return response.data;
};

export const getSkus = async (search = "", status = "") => {
  const params = {};
  if (search) params.search = search;
  if (status) params.status = status;
  const response = await api.get("/api/v1/skus", { params });
  return response.data;
};

export const getScenario = async (scenarioName) => {
  const response = await api.get(
    `/api/v1/scenarios/${scenarioName.toLowerCase()}`,
  );
  return response.data;
};

export const submitAssortmentReview = async (scenarioName, actions) => {
  const payload = {
    scenario_name: scenarioName,
    submission_data: {
      actions: actions.map((act) => ({
        action: act.action,
        sku_id: act.id || act.sku_id,
      })),
    },
  };
  const response = await api.post("/api/v1/assortment-reviews", payload);
  return response.data;
};

export default api;
