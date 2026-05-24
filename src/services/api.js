import axios from "axios";

// 🚀 FIXED: Added https:// to make it a true, absolute cloud network address
const BACKEND_URL = process.env.NODE_ENV === "production" 
  ? "https://expense-tracker-backend-new-phi.vercel.app/api"  
  : "http://localhost:5000/api";

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;