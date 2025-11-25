
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
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
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      const userData = {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        role: data.user.role
      };

      setUser(userData);
      setToken(data.access_token);
      
      localStorage.setItem('perfx_user', JSON.stringify(userData));
      localStorage.setItem('perfx_token', data.access_token);
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      
      // Fallback for development if backend isn't running
      if (username === 'admin' && password === 'admin') {
         console.warn("Backend unavailable, using dev fallback login");
         const devUser = { id: '0', username: 'admin', email: 'admin@perfx.io', role: 'Administrator' };
         setUser(devUser);
         setToken('dev-token');
         return true;
      }
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('perfx_user');
    localStorage.removeItem('perfx_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, logout }}>
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
