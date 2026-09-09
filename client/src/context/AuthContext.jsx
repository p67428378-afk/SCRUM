import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      if (!saved || saved === "undefined" || saved === "null") return null;
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      const saved = localStorage.getItem("token");
      if (!saved || saved === "undefined" || saved === "null") return null;
      return saved;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      if (token) {
        try {
          const freshUser = await authApi.getMe();
          if (isMounted && freshUser) {
            setUser(freshUser);
            localStorage.setItem("user", JSON.stringify(freshUser));
          }
        } catch {
          if (isMounted) {
            logout();
          }
        }
      }
    };

    initAuth();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    const userObj = data.user || data;
    const tokenStr = data.access_token || data.token;
    setToken(tokenStr);
    setUser(userObj);
    if (tokenStr) localStorage.setItem("token", tokenStr);
    if (userObj) localStorage.setItem("user", JSON.stringify(userObj));
    return userObj;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    const userObj = data.user || data;
    const tokenStr = data.access_token || data.token;
    setToken(tokenStr);
    setUser(userObj);
    if (tokenStr) localStorage.setItem("token", tokenStr);
    if (userObj) localStorage.setItem("user", JSON.stringify(userObj));
    return userObj;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {
      // ignore
    }
  };

  const refreshProfile = async () => {
    if (token) {
      try {
        const freshUser = await authApi.getMe();
        if (freshUser) {
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
          return freshUser;
        }
      } catch {
        // ignore
      }
    }
    return null;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
