import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi, type LoginResponse, type UserProfile } from '../services/apiService';

interface UserProfileLocal {
  id: number;
  username: string;
  email: string;
  real_name: string;
  role: string;
  is_superuser: boolean;
}

interface AuthContextType {
  user: UserProfileLocal | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUserInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfileLocal | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Check for stored session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('perfx_user');
    const storedToken = localStorage.getItem('perfx_token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        localStorage.removeItem('perfx_user');
        localStorage.removeItem('perfx_token');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response: LoginResponse = await authApi.login(username, password);

      const userData: UserProfileLocal = {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
        real_name: response.user.real_name || response.user.username,
        role: response.user.is_superuser ? 'Administrator' : 'User',
        is_superuser: response.user.is_superuser,
      };

      setUser(userData);
      setToken(response.access_token);

      localStorage.setItem('perfx_user', JSON.stringify(userData));
      localStorage.setItem('perfx_token', response.access_token);

      return true;
    } catch (error) {
      console.error("Login error:", error);

      // Fallback for development if backend isn't running
      if (username === 'admin' && password === 'admin') {
        console.warn("Backend unavailable, using dev fallback login");
        const devUser: UserProfileLocal = {
          id: 0,
          username: 'admin',
          email: 'admin@perfx.io',
          real_name: 'Administrator',
          role: 'Administrator',
          is_superuser: true
        };
        setUser(devUser);
        setToken('dev-token');
        localStorage.setItem('perfx_user', JSON.stringify(devUser));
        localStorage.setItem('perfx_token', 'dev-token');
        return true;
      }
      return false;
    }
  };

  const refreshUserInfo = async () => {
    try {
      const userInfo: UserProfile = await authApi.getCurrentUser();
      const userData: UserProfileLocal = {
        id: userInfo.id,
        username: userInfo.username,
        email: userInfo.email,
        real_name: userInfo.real_name || userInfo.username,
        role: userInfo.is_superuser ? 'Administrator' : 'User',
        is_superuser: userInfo.is_superuser,
      };
      setUser(userData);
      localStorage.setItem('perfx_user', JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to refresh user info:", error);
      // If refresh fails, logout
      logout();
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('perfx_user');
    localStorage.removeItem('perfx_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, logout, refreshUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
