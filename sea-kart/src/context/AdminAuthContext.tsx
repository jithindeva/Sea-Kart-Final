import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const getApiBase = (): string => {
  const envUrl = (import.meta.env as any).VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') return envUrl.trim().replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://sea-kart-final.onrender.com';
  }
  return 'http://localhost:5000';
};

interface AdminAuthContextType {
  user: any;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('admin_user');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_token');
        setToken(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const apiBase = getApiBase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();
    const res = await axios.post(`${apiBase}/api/admin/login`, { email: cleanEmail, password: cleanPass });
    const { token, user } = res.data;
    
    if (!user.isAdmin) {
      throw new Error("Access Denied: You are not an admin.");
    }

    setToken(token);
    setUser(user);
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  return (
    <AdminAuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return context;
};
