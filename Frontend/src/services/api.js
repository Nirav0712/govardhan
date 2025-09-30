// src/services/api.js
import axios from "axios";

// Production API base URL
const API_BASE_URL = 'https://www.govardhanthal.com/api';

// Debug logging
console.log('🔧 API Configuration:', {
  envVar: import.meta.env.VITE_API_BASE_URL,
  finalURL: API_BASE_URL,
  allEnvVars: import.meta.env
});

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Set / Remove Authorization token
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    console.log("Auth token set for API calls");
  } else {
    delete api.defaults.headers.common.Authorization;
    console.log("Auth token removed from API calls");
  }
}

// Set / Remove Admin Authorization token
export function setAdminToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    console.log("Admin auth token set for API calls");
  } else {
    delete api.defaults.headers.common.Authorization;
    console.log("Admin auth token removed from API calls");
  }
}

// Initialize auth header from persisted user if available
try {
  // Check for regular user token first
  const token = localStorage.getItem("token");
  // Check for admin token
  const adminToken = localStorage.getItem("govardhanthal_admin_authenticated");
  
  if (adminToken) {
    setAdminToken(adminToken);
    console.log("API service initialized with admin token");
  } else if (token) {
    setAuthToken(token);
    console.log("API service initialized with user token");
  } else {
    console.log("No token found in localStorage");
  }
} catch (error) {
  console.error("Error initializing API service:", error);
}

// ---------- Auth ----------
export const authApi = {
  register: (name, email, password) =>
    api.post("/auth/register", { name, email, password }),
  login: (email, password) => api.post("/auth/login", { email, password }),

  registerWithPhone: (name, phone, password) =>
    api.post("/auth/register-phone", { name, phone, password }),
  loginWithPhone: (phone, password) =>
    api.post("/auth/login-phone", { phone, password }),
  verifyOtp: (phone, otp) => api.post("/auth/verify-otp", { phone, otp }),
  
  extendSession: () => api.post("/auth/extend-session"),
  logout: () => api.post("/auth/logout"),
};

// ---------- Menu ----------
export const menuApi = {
  list: () => api.get("/menu"),
  add: (data) => api.post("/menu", data), // admin only
};

// ---------- Reservations ----------
export const reservationApi = {
  create: (data) => api.post("/reservations/create", data),
  list: () => api.get("/reservations/admin/all"), // admin only
  verifyOtp: (reservationId, otp) =>
    api.post("/reservations/verify-otp", { reservationId, otp }),
  resendOtp: (reservationId) =>
    api.post("/reservations/resend-otp", { reservationId }),
  updateStatus: (reservationId, status) =>
    api.patch(`/reservations/${reservationId}`, { status }),
};

// ---------- Orders ----------
export const ordersApi = {
  create: (payload) => api.post("/orders", payload),
  getMyOrders: (params) => api.get("/orders/my-orders", { params }), // ✅ matches backend
  getAdminOrders: (params) => api.get("/orders/admin", { params }), // admin only
  getOrderById: (id) => api.get(`/orders/admin/${id}`), // admin only
  updateStatus: (id, status) =>
    api.patch(`/orders/admin/${id}/status`, { status }), // admin only
  deleteOrder: (id) => api.delete(`/orders/admin/${id}`), // admin only
};

// ---------- Admin ----------
export const adminApi = {
  login: (email, password) => api.post("/admin/login", { email, password }),
  dashboard: () => api.get("/admin/dashboard"),
  getStats: () => api.get("/admin/stats"),
};

// ---------- Contact ----------
export const contactApi = {
  submit: (data) => api.post("/contact", data),
  getInfo: () => api.get("/contact/info"),
};
