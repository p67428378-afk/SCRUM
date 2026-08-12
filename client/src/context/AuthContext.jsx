import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, getCurrentUser } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Auth verification failed:", error);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const data = await loginUser({ email, password });
    const accessToken = data.access_token || data.token;
    localStorage.setItem("token", accessToken);
    setToken(accessToken);
    if (data.user) {
      setUser(data.user);
    } else {
      const profile = await getCurrentUser();
      setUser(profile);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  };

  const isLibrarian = user?.role === "Librarian" || user?.role === "admin";
  const isMember = user?.role === "Member" || user?.role === "user";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isLibrarian,
        isMember,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
