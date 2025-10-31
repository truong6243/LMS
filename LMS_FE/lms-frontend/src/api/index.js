import axios from "axios";
import { API_BASE } from "../config.js";

// Khôi phục token từ localStorage
let accessToken = localStorage.getItem("lms_access_token");
let refreshToken = localStorage.getItem("lms_refresh_token");

export function setAccessToken(t) { 
  accessToken = t; 
  if (t) localStorage.setItem("lms_access_token", t);
  else localStorage.removeItem("lms_access_token");
}
export function getAccessToken() { return accessToken; }
export function setRefreshToken(t) { 
  refreshToken = t; 
  if (t) localStorage.setItem("lms_refresh_token", t);
  else localStorage.removeItem("lms_refresh_token");
}
export function getRefreshToken() { return refreshToken; }

const api = axios.create({
  baseURL: API_BASE + "/api"
});

let isRefreshing = false;
let queue = [];

function subscribe(cb) { queue.push(cb); }
function publish(token) { queue.forEach(fn => fn(token)); queue = []; }

api.interceptors.request.use((cfg) => {
  if (accessToken) {
    cfg.headers.Authorization = `Bearer ${accessToken}`;
  }
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response && err.response.status === 401 && !original._retry) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refresh = getRefreshToken();
          if (!refresh) {
            // No refresh token, clear session and redirect to login
            setAccessToken(null);
            localStorage.removeItem("lms_user");
            window.location.href = "/login";
            return Promise.reject(err);
          }
          const r = await axios.post(API_BASE + "/api/auth/refresh", { refreshToken: refresh });
          const newToken = r.data.accessToken;
          setAccessToken(newToken);
          if (r.data.refreshToken) setRefreshToken(r.data.refreshToken);
          isRefreshing = false;
          publish(newToken);
        } catch (refreshErr) {
          // Refresh failed, clear session and redirect to login
          isRefreshing = false;
          setAccessToken(null);
          setRefreshToken(null);
          localStorage.removeItem("lms_user");
          window.location.href = "/login";
          return Promise.reject(err);
        }
      }
      return new Promise((resolve) => {
        subscribe((token) => {
          original._retry = true;
          original.headers.Authorization = "Bearer " + token;
          resolve(api(original));
        });
      });
    }
    return Promise.reject(err);
  }
);

export default api;
