import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        // Set authorization header
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        // Trust the token exists - will be validated on first API call
        setUser({ authenticated: true });
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await api.post("/token/", { username, password });
      const { access, refresh } = response.data;
      
      localStorage.setItem("adminToken", access);
      localStorage.setItem("refreshToken", refresh);
      setToken(access);
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      setUser({ authenticated: true });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || "Login failed" 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("refreshToken");
    delete api.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
