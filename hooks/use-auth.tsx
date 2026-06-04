"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi } from '../lib/api';

interface User {
  id: string;
  email: string;
  realName: string;
  nickname: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
  isEnrolledGeneral: boolean;
  totalPoints: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; password?: string; realName: string; nickname: string; avatarUrl?: string }) => Promise<void>;
  logout: () => void;
  updateProfileState: (updatedUser: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem('quiniela_token');
      if (savedToken) {
        setToken(savedToken);
        try {
          const userData = await authApi.getMe(savedToken);
          setUser({
            id: userData._id || userData.id,
            email: userData.email,
            realName: userData.realName,
            nickname: userData.nickname,
            avatarUrl: userData.avatarUrl,
            role: userData.role,
            isEnrolledGeneral: userData.isEnrolledGeneral,
            totalPoints: userData.totalPoints || 0,
          });
        } catch (err) {
          console.error('Failed to load user with token:', err);
          // Token expired or invalid
          localStorage.removeItem('quiniela_token');
          setToken(null);
          setUser(null);
          if (pathname !== '/login') {
            router.push('/login');
          }
        }
      } else {
        if (pathname !== '/login') {
          router.push('/login');
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [pathname, router]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      if (response.access_token) {
        localStorage.setItem('quiniela_token', response.access_token);
        setToken(response.access_token);
        
        const userData = response.user;
        setUser({
          id: userData.id || userData._id,
          email: userData.email,
          realName: userData.realName,
          nickname: userData.nickname,
          avatarUrl: userData.avatarUrl,
          role: userData.role,
          isEnrolledGeneral: userData.isEnrolledGeneral,
          totalPoints: userData.totalPoints || 0,
        });

        router.push('/');
      } else {
        throw new Error(response.message || 'Error al iniciar sesión');
      }
    } catch (err: any) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const response = await authApi.register(userData);
      if (response.access_token) {
        localStorage.setItem('quiniela_token', response.access_token);
        setToken(response.access_token);

        const u = response.user;
        setUser({
          id: u.id || u._id,
          email: u.email,
          realName: u.realName,
          nickname: u.nickname,
          avatarUrl: u.avatarUrl,
          role: u.role,
          isEnrolledGeneral: u.isEnrolledGeneral,
          totalPoints: u.totalPoints || 0,
        });

        router.push('/');
      } else {
        throw new Error(response.message || 'Error al registrarse');
      }
    } catch (err: any) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('quiniela_token');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const updateProfileState = (updatedUser: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, ...updatedUser };
    });
  };

  const refreshUser = async () => {
    const savedToken = token || localStorage.getItem('quiniela_token');
    if (savedToken) {
      try {
        const userData = await authApi.getMe(savedToken);
        setUser({
          id: userData._id || userData.id,
          email: userData.email,
          realName: userData.realName,
          nickname: userData.nickname,
          avatarUrl: userData.avatarUrl,
          role: userData.role,
          isEnrolledGeneral: userData.isEnrolledGeneral,
          totalPoints: userData.totalPoints || 0,
        });
      } catch (err) {
        console.error('Failed to refresh user:', err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfileState, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
