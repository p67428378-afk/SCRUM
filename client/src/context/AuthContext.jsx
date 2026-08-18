import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getUserProfile,
  loginUser as apiLogin,
  registerUser as apiRegister,
  logoutUser as apiLogout,
} from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const profile = await getUserProfile();
          setUser(profile);
        } catch (err) {
          console.error("Failed to load user profile", err);
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (credentials) => {
    setError(null);
    try {
      await apiLogin(credentials);
      const profile = await getUserProfile();
      setUser(profile);
      return profile;
    } catch (err) {
      const message = err.response?.data?.detail || "Login failed";
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      await apiRegister(userData);
      return await login({
        email: userData.email,
        password: userData.password,
      });
    } catch (err) {
      const message = err.response?.data?.detail || "Registration failed";
      setError(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
