import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api"; // Ensure this matches your Axios configuration file path

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

  // 🚀 FIXED: Rewritten as an async pipeline to return backend data cleanly
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data && response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
  };

  // 🚀 FIXED: Links your frontend registration actions to your backend routes
  const register = async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    if (response.data && response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
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