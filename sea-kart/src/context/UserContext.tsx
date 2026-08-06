"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from "sonner";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  wishlist: string[];
  isAdmin: boolean;
}

interface UserContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (email: string, pass: string, phone?: string) => Promise<void>;
  register: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  googleLogin: (email: string, phone: string) => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => void;
  token: string | null;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('sk_user_profile');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('sk_token');
  });
  
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('sk_token');
  });

  useEffect(() => {
    // Optional: Refresh user data from server here if needed
  }, []);

  const saveAuth = (tokenStr: string, userData: UserProfile) => {
    setToken(tokenStr);
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('sk_token', tokenStr);
    localStorage.setItem('sk_user_profile', JSON.stringify(userData));
  };

  const getApiBase = () => {
    const envUrl = (import.meta.env as any).VITE_API_URL;
    if (envUrl && envUrl.trim() !== '') return envUrl.trim().replace(/\/$/, '');
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return 'https://sea-kart-final.onrender.com';
    }
    return '';
  };

  const parseJsonResponse = async (res: Response) => {
    const text = await res.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      if (!res.ok) {
        throw new Error(`Server returned error (${res.status}). Render backend may be starting up, please try again in a moment.`);
      }
      throw new Error('Invalid JSON response from server.');
    }
    return data;
  };

  const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 12000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return res;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error("Cloud backend server is waking up. Please click again in a few seconds!");
      }
      throw err;
    }
  };

  const login = async (email: string, pass: string, phone: string = '') => {
    const cleanEmail = email.trim().toLowerCase();
    const res = await fetchWithTimeout(`${getApiBase()}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: pass.trim(), phone })
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) throw new Error(data.error || 'Login failed');
    saveAuth(data.token, data.user);
    toast.success("Logged in successfully!");
  };

  const register = async (name: string, email: string, pass: string, phone: string = '') => {
    const cleanEmail = email.trim().toLowerCase();
    const res = await fetchWithTimeout(`${getApiBase()}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), email: cleanEmail, password: pass.trim(), phone })
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    saveAuth(data.token, data.user);
    toast.success("Account created successfully!");
  };

  const googleLogin = async (email: string, phone: string = '') => {
    const cleanEmail = email.trim().toLowerCase();
    const res = await fetchWithTimeout(`${getApiBase()}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, phone })
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) throw new Error(data.error || 'Google login failed');
    saveAuth(data.token, data.user);
    toast.success("Logged in with Google!");
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!token) return;
    const res = await fetchWithTimeout(`${getApiBase()}/api/auth/update`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) {
      toast.error(data.error || 'Update failed');
      return;
    }
    setUser(data.user);
    localStorage.setItem('sk_user_profile', JSON.stringify(data.user));
    toast.success("Profile updated successfully!");
  };

  const forgotPassword = async (email: string) => {
    const res = await fetchWithTimeout(`${getApiBase()}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) throw new Error(data.error || 'Password reset request failed');
    toast.success(data.message || "Reset link sent!");
    return data.mockToken;
  };

  const resetPassword = async (token: string, newPassword: string) => {
    const res = await fetchWithTimeout(`${getApiBase()}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) throw new Error(data.error || 'Password reset failed');
    toast.success("Password reset successfully!");
  };

  const logout = () => {
    localStorage.removeItem('sk_user_profile');
    localStorage.removeItem('sk_token');
    localStorage.removeItem('sk_orders');
    localStorage.removeItem('sk_wishlist');
    
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    toast.info("Logged out successfully");
  };

  return (
    <UserContext.Provider value={{ user, isLoggedIn, login, register, googleLogin, updateUser, logout, token, forgotPassword, resetPassword }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
