"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { api } from "@/lib/api";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'COORDINATOR' | 'STAFF' | string;
  sessionStaff?: Array<{
    function: string;
    [key: string]: any;
  }>;
}

export type AuthContextType = {
  user: User | null;
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
      const res = await api.get("/api/v1/auth/me", { withCredentials: true });
      setUser(res.data.data);
    } catch {
      setUser(null);
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    await api.post(
      "/api/v1/auth/login",
      { email, password },
      { withCredentials: true },
    );

    await checkAuth();
  };

  const logout = async () => {
    await api.post("/api/v1/auth/logout", {}, { withCredentials: true });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
