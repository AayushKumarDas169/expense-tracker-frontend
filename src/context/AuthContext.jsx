import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api"; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // 1. LOGIN PIPELINE
  const login = async (email, password) => {
    try {
      // 🚀 FIXED: Removed leading slash to prevent double-slash mismatch with your baseURL
      const response = await api.post('auth/login', { email, password });
      if (response.data && response.data.token) {
        setToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // 2. REGISTER PIPELINE WITH AUTO-LOGIN HOOK
  const register = async (email, password) => {
    try {
      // 🚀 FIXED: Removed leading slash here as well
      await api.post('auth/register', { email, password });
      
      // Step B: Auto-Login the user right away so navigate('/dashboard') works flawlessly!
      const loginData = await login(email, password);
      return loginData;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken("");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}