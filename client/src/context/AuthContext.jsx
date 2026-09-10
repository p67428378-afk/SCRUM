import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("auth_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(
    () => localStorage.getItem("auth_token") || null,
  );
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCurrentMember = useCallback(async (memberId) => {
    if (!memberId) return;
    try {
      const memberData = await api.getMemberById(memberId);
      setMember(memberData);
    } catch {
      // Ignore background member fetch error
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.login({ email, password });
      setToken(data.access_token);
      setUser(data);
      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("auth_user", JSON.stringify(data));
      if (data.member_id) {
        await fetchCurrentMember(data.member_id);
      }
      return data;
    } catch (err) {
      const errMsg =
        err.response?.data?.detail || err.message || "Login failed";
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setMember(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  };

  const refreshProfile = async () => {
    if (user?.member_id) {
      await fetchCurrentMember(user.member_id);
    }
  };

  useEffect(() => {
    if (user?.member_id) {
      fetchCurrentMember(user.member_id);
    }
  }, [user?.member_id, fetchCurrentMember]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        member,
        loading,
        error,
        login,
        logout,
        refreshProfile,
        isAuthenticated: !!token,
        isStaffOrAdmin: user?.role === "STAFF" || user?.role === "ADMIN",
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
