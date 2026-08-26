import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() =>
    localStorage.getItem("furnicraft_token"),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);

  const fetchProfile = useCallback(async () => {
    const storedToken = localStorage.getItem("furnicraft_token");
    if (!storedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await authApi.getMe();
      setUser(res.data);
      if (res.data.addresses) {
        setAddresses(res.data.addresses);
      }
    } catch {
      localStorage.removeItem("furnicraft_token");
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAddresses = useCallback(async () => {
    if (!localStorage.getItem("furnicraft_token")) return;
    try {
      const res = await authApi.getAddresses();
      setAddresses(res.data || []);
    } catch {
      // Ignored if user unauthenticated
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const accessToken = res.data.access_token;
    localStorage.setItem("furnicraft_token", accessToken);
    setToken(accessToken);
    if (res.data.user) {
      setUser(res.data.user);
      if (res.data.user.addresses) {
        setAddresses(res.data.user.addresses);
      }
    } else {
      await fetchProfile();
    }
    return res.data;
  };

  const register = async (email, password, fullName) => {
    const res = await authApi.register({
      email,
      password,
      full_name: fullName,
    });
    const accessToken = res.data.access_token;
    localStorage.setItem("furnicraft_token", accessToken);
    setToken(accessToken);
    if (res.data.user) {
      setUser(res.data.user);
    } else {
      await fetchProfile();
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("furnicraft_token");
    setToken(null);
    setUser(null);
    setAddresses([]);
  };

  const addAddress = async (addressData) => {
    const res = await authApi.createAddress(addressData);
    setAddresses((prev) => [...prev, res.data]);
    return res.data;
  };

  const deleteAddress = async (addressId) => {
    await authApi.deleteAddress(addressId);
    setAddresses((prev) => prev.filter((a) => a.id !== addressId));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser: fetchProfile,
        addresses,
        fetchAddresses,
        addAddress,
        deleteAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
