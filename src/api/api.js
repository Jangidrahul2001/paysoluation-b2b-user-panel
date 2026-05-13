import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers["Idempotency-Key"] = uuidv4();

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response.data,

  (error) => {
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message;
    const errors = error?.response?.data?.errors;
    const code = error?.response?.data?.code;

    if (error.code === "ERR_NETWORK") {
      return Promise.reject({
        success: false,
        status: 0,
        message:
          message || "Server not reachable — Please check your connection",
      });
    }

    if (status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
      
      if (window.location.pathname !== `/login` && window.location.pathname !== `/signup`) {
        window.location.href = `/login`;
      }    

      return Promise.reject({
        success: false,
        status: 401,
        code: code || "UNAUTHORIZED",
        message: message || "Session expired — Please login again",
      });
    }
    if (status === 403) {
      return Promise.reject({
        success: false,
        status: 403,
        code: code || "ACCESS_DENIED",
        message: message || "Access Denied — You don't have permission",
      });
    }

    if (status === 500) {
      return Promise.reject({
        success: false,
        status: 500,
        code: code || "SERVER_ERROR",
        message:
          message || "Server error — Something went wrong on the backend",
        errors: errors || [],
      });
    }

    return Promise.reject({
      success: false,
      status,
      code: code || "UNEXPECTED_ERROR",
      message: message || "Unexpected error",
      errors: errors || [],
    });
  },
);

export default api;
