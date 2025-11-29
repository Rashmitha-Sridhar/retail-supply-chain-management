import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

// Inject token into every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // api.interceptors.request.use((config) => {
  //   console.log("REQUEST →", config.method, config.url);
  //   console.log("TOKEN →", config.headers.Authorization);
  //   return config;
  // });

  return config;
});

export default api;