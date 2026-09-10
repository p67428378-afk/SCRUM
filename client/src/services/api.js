import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token if stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock Initial Data for smooth fallback when backend is unavailable
const MOCK_DATA = {
  summary: {
    active_crop_cycles: 4,
    livestock_headcount: 142,
    equipment_operating: 8,
    low_inventory_count: 2,
    alerts: [
      {
        id: "1",
        alert_type: "maintenance",
        severity: "warning",
        message:
          "John Deere 8R Tractor reached 1250 operating hours (due for 1200h service)",
        is_resolved: false,
      },
      {
        id: "2",
        alert_type: "inventory",
        severity: "critical",
        message:
          "NPK 15-15-15 Fertilizer stock (150 kg) below reorder threshold (200 kg)",
        is_resolved: false,
      },
      {
        id: "3",
        alert_type: "crop",
        severity: "info",
        message:
          "Corn Crop Cycle on Field A1 entering harvest window in 5 days",
        is_resolved: false,
      },
    ],
  },
  fields: [
    {
      id: "f-101",
      name: "Field A1 - North Parcel",
      acreage: 120,
      location_gis: "41.40338, -2.17403",
      soil_type: "Loam",
      current_crop: "Corn",
      status: "Active",
    },
    {
      id: "f-102",
      name: "Field B2 - River Basin",
      acreage: 85,
      location_gis: "41.40552, -2.17881",
      soil_type: "Silt Clay",
      current_crop: "Soybeans",
      status: "Active",
    },
    {
      id: "f-103",
      name: "Field C3 - East Meadow",
      acreage: 150,
      location_gis: "41.40120, -2.17011",
      soil_type: "Sandy Loam",
      current_crop: "Winter Wheat",
      status: "Active",
    },
    {
      id: "f-104",
      name: "Field D4 - Hillside South",
      acreage: 95,
      location_gis: "41.39891, -2.17332",
      soil_type: "Clay Loam",
      current_crop: "Fallow / Cover Crop",
      status: "Idle",
    },
  ],
  livestock: [
    {
      id: "ls-001",
      tag_number: "TAG-8041",
      species: "Cattle",
      breed: "Angus",
      birth_date: "2023-03-15",
      status: "Healthy",
      health_records_count: 3,
    },
    {
      id: "ls-002",
      tag_number: "TAG-8042",
      species: "Cattle",
      breed: "Hereford",
      birth_date: "2023-04-10",
      status: "Healthy",
      health_records_count: 2,
    },
    {
      id: "ls-003",
      tag_number: "TAG-9105",
      species: "Sheep",
      breed: "Dorper",
      birth_date: "2024-01-20",
      status: "Quarantine",
      health_records_count: 4,
    },
    {
      id: "ls-004",
      tag_number: "TAG-9106",
      species: "Sheep",
      breed: "Suffolk",
      birth_date: "2024-02-05",
      status: "Healthy",
      health_records_count: 1,
    },
  ],
  equipment: [
    {
      id: "eq-201",
      name: "John Deere 8R 370 Tractor",
      serial_number: "SN-JD8R-9921",
      operating_hours: 1250,
      status: "Maintenance Due",
      last_service_date: "2025-11-15",
    },
    {
      id: "eq-202",
      name: "Case IH Axial-Flow Combine",
      serial_number: "SN-CIH-4410",
      operating_hours: 820,
      status: "Operational",
      last_service_date: "2026-01-10",
    },
    {
      id: "eq-203",
      name: "Mahindra 7520 Utility Tractor",
      serial_number: "SN-MAH-1102",
      operating_hours: 450,
      status: "Operational",
      last_service_date: "2026-02-01",
    },
    {
      id: "eq-204",
      name: "Kubota M7-172 Harvester",
      serial_number: "SN-KUB-8832",
      operating_hours: 2100,
      status: "In Repair",
      last_service_date: "2026-03-01",
    },
  ],
  inventory: [
    {
      id: "inv-301",
      item_name: "NPK 15-15-15 Fertilizer",
      category: "Fertilizer",
      quantity: 150,
      unit: "kg",
      reorder_threshold: 200,
    },
    {
      id: "inv-302",
      item_name: "Hybrid Corn Seed (Pioneer 1197)",
      category: "Seeds",
      quantity: 450,
      unit: "bags",
      reorder_threshold: 100,
    },
    {
      id: "inv-303",
      item_name: "Glyphosate Herbicide",
      category: "Pesticides",
      quantity: 80,
      unit: "liters",
      reorder_threshold: 100,
    },
    {
      id: "inv-304",
      item_name: "Ultra-Low Sulfur Diesel",
      category: "Fuel",
      quantity: 2400,
      unit: "liters",
      reorder_threshold: 1000,
    },
  ],
};

export const authApi = {
  login: async (email, password) => {
    try {
      const response = await api.post("/api/v1/auth/login", {
        email,
        password,
      });
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
      }
      return response.data;
    } catch (err) {
      // Fallback token for local standalone test UI if backend is offline
      if (email === "test@example.com" && password === "testpassword") {
        const mockToken = "mock-jwt-token-farm-manager";
        localStorage.setItem("token", mockToken);
        return {
          access_token: mockToken,
          token_type: "bearer",
          user: { email, full_name: "Farm Manager", role: "admin" },
        };
      }
      throw err;
    }
  },
};

export const dashboardApi = {
  getSummary: async () => {
    try {
      const response = await api.get("/api/v1/dashboard/summary");
      return response.data;
    } catch (err) {
      console.warn(
        "Backend unavailable, using local mock for dashboard summary",
      );
      return MOCK_DATA.summary;
    }
  },
};

export const fieldsApi = {
  getFields: async () => {
    try {
      const response = await api.get("/api/v1/fields");
      return response.data;
    } catch (err) {
      console.warn("Backend unavailable, using local mock for fields");
      return MOCK_DATA.fields;
    }
  },
  createCropCycle: async (cropCycleData) => {
    const response = await api.post("/api/v1/crop-cycles", cropCycleData);
    return response.data;
  },
};

export const livestockApi = {
  getLivestock: async () => {
    try {
      const response = await api.get("/api/v1/livestock");
      return response.data;
    } catch (err) {
      console.warn("Backend unavailable, using local mock for livestock");
      return MOCK_DATA.livestock;
    }
  },
  createHealthRecord: async (livestockId, healthData) => {
    const response = await api.post(
      `/api/v1/livestock/${livestockId}/health-records`,
      healthData,
    );
    return response.data;
  },
};

export const equipmentApi = {
  getEquipment: async () => {
    try {
      const response = await api.get("/api/v1/equipment");
      return response.data;
    } catch (err) {
      console.warn("Backend unavailable, using local mock for equipment");
      return MOCK_DATA.equipment;
    }
  },
  createMaintenanceLog: async (equipmentId, maintenanceData) => {
    const response = await api.post(
      `/api/v1/equipment/${equipmentId}/maintenance`,
      maintenanceData,
    );
    return response.data;
  },
};

export const inventoryApi = {
  getInventory: async () => {
    try {
      const response = await api.get("/api/v1/inventory");
      return response.data;
    } catch (err) {
      console.warn("Backend unavailable, using local mock for inventory");
      return MOCK_DATA.inventory;
    }
  },
  adjustStock: async (itemId, adjustmentData) => {
    const response = await api.patch(
      `/api/v1/inventory/${itemId}/adjust`,
      adjustmentData,
    );
    return response.data;
  },
};

export default api;
