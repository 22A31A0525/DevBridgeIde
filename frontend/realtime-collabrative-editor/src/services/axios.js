// src/utils/axios.js
import axios from "axios";

  const backend_url = import.meta.env.VITE_APP_BACKEND_URL;
// Create an axios instance
const api = axios.create({
  baseURL: backend_url, 
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
