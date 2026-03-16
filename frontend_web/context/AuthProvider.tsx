"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

type AuthContextType = {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await axios.get("/api/v1/auth/me", { withCredentials: true });
      setUser(res.data);
    } catch {
      setUser(null);
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    await axios.post(
      "/api/v1/auth/login",
      { email, password },
      { withCredentials: true },
    );

    await checkAuth();
  };

  const logout = async () => {
    await axios.post("/api/logout", {}, { withCredentials: true });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
