// src/api.js
import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1/",
  headers: { "Content-Type": "application/json" },
  timeout: 7000,
});

// don't attach Authorization header for the refresh endpoint (or login)
api.interceptors.request.use((config) => {
  try {
    const url = config.url || "";
    const skipAuth = url.includes("token/refresh") || url.includes("users/login");
    if (!skipAuth) {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.warn("api request interceptor error", e);
  }
  return config;
}, (err) => Promise.reject(err));

// response interceptor: single refresh flow with queueing
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeToken(cb) {
  refreshSubscribers.push(cb);
}
function onRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const originalRequest = error.config;

    // If no config, just reject
    if (!originalRequest) return Promise.reject(error);

    // If already retried, reject to avoid loops
    if (originalRequest._retry) return Promise.reject(error);

    const status = error.response?.status;

    // Only try refresh on 401
    if (status === 401) {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);
      if (!refreshToken) {
        // nothing to do
        localStorage.removeItem(ACCESS_TOKEN);
        return Promise.reject(error);
      }

      // If a refresh is already in flight, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeToken((newToken) => {
            if (!newToken) return reject(error);
            originalRequest._retry = true;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      // Make a single refresh request (use raw axios to avoid infinite loop)
      isRefreshing = true;
      try {
        const refreshUrl = (api.defaults.baseURL || "") + "users/token/refresh/";
        const resp = await axios.post(
          refreshUrl,
          { refresh: refreshToken },
          { headers: { "Content-Type": "application/json" }, timeout: 7000 }
        );

        const newAccess = resp.data?.access;
        if (!newAccess) throw new Error("No access token in refresh response");

        localStorage.setItem(ACCESS_TOKEN, newAccess);
        onRefreshed(newAccess);

        // retry original request with new token
        originalRequest._retry = true;
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshErr) {
        // Refresh failed — clear tokens and reject all queued requests
        console.error("Token refresh failed:", refreshErr);
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        onRefreshed(null); // notify subscribers with failure
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // other errors
    return Promise.reject(error);
  }
);

export const googleBooksApi = axios.create({
  baseURL: "https://www.googleapis.com/books/v1/",
  headers: { "Content-Type": "application/json" },
  timeout: 7000,
});

export const nytBooksApi = axios.create({
  baseURL: "https://api.nytimes.com/svc/books/v3/",
  headers: { "Content-Type": "application/json" },
  timeout: 7000,
});

export default api;
