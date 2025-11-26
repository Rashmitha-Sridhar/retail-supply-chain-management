import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // adjust later for deployment
});

// Attach token to requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
