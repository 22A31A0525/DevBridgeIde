// src/utils/axios.js
import axios from "axios";

  import toast from "react-hot-toast";

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

    // Set a timeout to warn the user if the request is taking too long (cold start)
    config.metadata = { startTime: new Date() };
    config.timeoutId = setTimeout(() => {
        toast.loading(
            "The backend is waking up from its free-tier slumber. This may take up to a minute. Please wait...",
            { id: 'cold-start-toast', duration: 10000 }
        );
    }, 5000); // Trigger after 3 seconds

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to clear the timeout
api.interceptors.response.use(
    (response) => {
        if (response.config.timeoutId) {
            clearTimeout(response.config.timeoutId);
        }
        toast.dismiss('cold-start-toast'); // Dismiss the loading toast if it appeared
        return response;
    },
    (error) => {
        if (error.config && error.config.timeoutId) {
            clearTimeout(error.config.timeoutId);
        }
        toast.dismiss('cold-start-toast');
        return Promise.reject(error);
    }
);

export default api;
