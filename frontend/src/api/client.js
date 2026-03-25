import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
});

// Token refresh logic
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        // No refresh token, redirect to login
        localStorage.removeItem("adminToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/dashboard/login";
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"}/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem("adminToken", access);
        api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
        originalRequest.headers["Authorization"] = `Bearer ${access}`;

        processQueue(null, access);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem("adminToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/dashboard/login";
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const fetchList = async (path) => {
  const { data } = await api.get(path);
  return data.results ?? data;
};

export const fetchProjects = async () => {
  const { data } = await api.get("/projects/");
  return data.results ?? data;
};

export default api;
