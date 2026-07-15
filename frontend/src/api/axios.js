import axios from "axios";

function normalizeApiBaseUrl(url) {
  const fallback = "http://localhost:5000/api";
  if (!url) return fallback;

  const trimmed = url.trim().replace(/\/+$/, "");
  const withoutTrailingApi = trimmed.replace(/(\/api)+$/, "");

  return `${withoutTrailingApi}/api`;
}

const api = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_URL),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("roomatch_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("roomatch_token");
      localStorage.removeItem("roomatch_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
