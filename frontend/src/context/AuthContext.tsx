'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export type UserRole = 'TEACHER' | 'GUARDIAN' | 'ADMIN';
export type AccountStatus = 'UNCLAIMED' | 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';

export const getDashboardPath = (roles?: UserRole[]): string => {
  if (roles?.includes('ADMIN')) return '/admin';
  if (roles?.includes('TEACHER')) return '/teacher';
  return '/guardian';
};

export interface IUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  roles: UserRole[];
  accountStatus: AccountStatus;
  isEmailVerified: boolean;
  avatarUrl?: string;
  teacherProfile?: {
    isPublic: boolean;
    verificationStatus?: string;
    institution?: string;
    department?: string;
    batchOrYear?: string;
    experienceYears?: number;
    bio?: string;
    subjectsOffered: string[];
    preferredAreas: string[];
    expectedRateRange?: string;
    isVerifiedTutor?: boolean;
    slug?: string;
  };
  guardianProfile?: {
    area?: string;
    city?: string;
  };
  createdAt: string;
}

interface AuthContextType {
  user: IUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: IUser) => void;
  logout: (redirectTo?: string) => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refetchUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    api
      .get('/auth/me')
      .then((res) => {
        if (isMounted) setUser(res.data.data.user);
      })
      .catch(() => {
        if (isMounted) setUser(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = (userData: IUser) => {
    setUser(userData);
    router.push(getDashboardPath(userData.roles));
  };

  const logout = async (redirectTo = '/login') => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      router.push(redirectTo);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refetchUser,
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
