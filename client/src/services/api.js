import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getContinents = async () => {
  const response = await apiClient.get("/api/v1/continents");
  return response.data;
};

export const getContinentById = async (continentId) => {
  const response = await apiClient.get(`/api/v1/continents/${continentId}`);
  return response.data;
};

export const createContinent = async (continentData) => {
  const response = await apiClient.post("/api/v1/continents", continentData);
  return response.data;
};

export const getCountries = async (params = {}) => {
  const queryParams = {};
  if (params.search) queryParams.search = params.search;
  if (params.continent_id) queryParams.continent_id = params.continent_id;
  if (params.continent) queryParams.continent = params.continent;
  if (params.status) queryParams.status = params.status;
  if (params.skip !== undefined) queryParams.skip = params.skip;
  if (params.limit !== undefined) queryParams.limit = params.limit;

  const response = await apiClient.get("/api/v1/countries", {
    params: queryParams,
  });
  return response.data;
};

export const getCountryDetail = async (countryId) => {
  const response = await apiClient.get(`/api/v1/countries/${countryId}`);
  return response.data;
};

export const createCountry = async (countryData) => {
  const response = await apiClient.post("/api/v1/countries", countryData);
  return response.data;
};

export const addInvestment = async (countryId, investmentData) => {
  const response = await apiClient.post(
    `/api/v1/countries/${countryId}/investments`,
    investmentData,
  );
  return response.data;
};
