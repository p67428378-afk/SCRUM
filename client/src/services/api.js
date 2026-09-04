import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (email, password) => {
    const response = await api.post("/api/v1/auth/login", { email, password });
    if (response.data?.access_token) {
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("role", response.data.role || "user");
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  },
  getCurrentRole: () => {
    return localStorage.getItem("role") || "user";
  },
};

export const moviesApi = {
  getMovies: async (params = {}) => {
    const response = await api.get("/api/v1/movies", { params });
    return response.data;
  },
  getMovieById: async (id) => {
    const response = await api.get(`/api/v1/movies/${id}`);
    return response.data;
  },
  createMovie: async (movieData) => {
    const response = await api.post("/api/v1/movies", movieData);
    return response.data;
  },
  updateMovie: async (id, movieData) => {
    const response = await api.put(`/api/v1/movies/${id}`, movieData);
    return response.data;
  },
  deleteMovie: async (id) => {
    const response = await api.delete(`/api/v1/movies/${id}`);
    return response.data;
  },
};

export const seriesApi = {
  getSeries: async (params = {}) => {
    const response = await api.get("/api/v1/series", { params });
    return response.data;
  },
  getSeriesById: async (id) => {
    const response = await api.get(`/api/v1/series/${id}`);
    return response.data;
  },
  createSeries: async (seriesData) => {
    const response = await api.post("/api/v1/series", seriesData);
    return response.data;
  },
  addSeason: async (seriesId, seasonData) => {
    const response = await api.post(
      `/api/v1/series/${seriesId}/seasons`,
      seasonData,
    );
    return response.data;
  },
  addEpisode: async (seasonId, episodeData) => {
    const response = await api.post(
      `/api/v1/seasons/${seasonId}/episodes`,
      episodeData,
    );
    return response.data;
  },
};

export const genresApi = {
  getGenres: async () => {
    const response = await api.get("/api/v1/genres");
    return response.data;
  },
};

export default api;
