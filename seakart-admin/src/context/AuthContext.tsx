import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getApiBase } from '../config/api';

interface AuthContextType {
  user: any;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
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
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
