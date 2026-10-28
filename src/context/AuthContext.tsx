import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'provider' | 'admin';
  profileImage?: string;
  accountStatus: 'active' | 'suspended';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderProfile {
  _id: string;
  userId: string;
  businessName: string;
  description: string;
  skills: string[];
  experienceYears: number;
  serviceAreas: string[];
  verificationStatus: 'not_submitted' | 'pending' | 'approved' | 'rejected' | 'resubmission_required';
  verificationFeedback?: string;
  verificationSubmittedAt?: string;
  verificationReviewedAt?: string;
  approvedAt?: string;
  averageRating: number;
  reviewCount: number;
  active: boolean;
}

interface AuthContextType {
  user: User | null;
  providerProfile: ProviderProfile | null;
  token: string | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  quickLoginAs: (role: 'customer' | 'provider' | 'pending_provider' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('localconnect_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        setProviderProfile(res.providerProfile || null);
      } else {
        setUser(null);
        setProviderProfile(null);
      }
    } catch {
      setUser(null);
      setProviderProfile(null);
      localStorage.removeItem('localconnect_token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.login(credentials);
    if (res.success && res.token) {
      localStorage.setItem('localconnect_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setProviderProfile(res.providerProfile || null);
    }
  };

  const register = async (payload: any) => {
    const res = await api.register(payload);
    if (res.success && res.token) {
      localStorage.setItem('localconnect_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setProviderProfile(res.providerProfile || null);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('localconnect_token');
      setToken(null);
      setUser(null);
      setProviderProfile(null);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const quickLoginAs = async (role: 'customer' | 'provider' | 'pending_provider' | 'admin') => {
    let email = '';
    let password = '';

    if (role === 'customer') {
      email = 'customer@localconnect.com';
      password = 'Customer123!';
    } else if (role === 'provider') {
      email = 'electrician.arun@localconnect.com';
      password = 'Provider123!';
    } else if (role === 'pending_provider') {
      email = 'pending.provider@localconnect.com';
      password = 'Provider123!';
    } else if (role === 'admin') {
      email = 'admin@localconnect.com';
      password = 'AdminSecure2026!';
    }

    await login({ email, password });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        providerProfile,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        quickLoginAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
