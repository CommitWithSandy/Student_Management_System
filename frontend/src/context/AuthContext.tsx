import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RoleType, AuthResponse } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: RoleType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<AuthResponse>;
  register: (data: any) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authService.getCurrentUser();
          if (res.success && res.data) {
            setUser(res.data);
            setToken(storedToken);
          } else {
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);
          }
        } catch {
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (usernameOrEmail: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.login(usernameOrEmail, password);
      if (res.success && res.data) {
        const authData = res.data;
        localStorage.setItem('token', authData.token);
        setToken(authData.token);

        const userData: User = {
          id: authData.id,
          username: authData.username,
          email: authData.email,
          role: authData.role,
          firstName: authData.firstName,
          lastName: authData.lastName,
          fullName: `${authData.firstName} ${authData.lastName}`,
          profileImage: authData.profileImage,
          status: 'ACTIVE',
          profileId: authData.profileId,
        };
        setUser(userData);
        return authData;
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      if (res.success && res.data) {
        const authData = res.data;
        localStorage.setItem('token', authData.token);
        setToken(authData.token);

        const userData: User = {
          id: authData.id,
          username: authData.username,
          email: authData.email,
          role: authData.role,
          firstName: authData.firstName,
          lastName: authData.lastName,
          fullName: `${authData.firstName} ${authData.lastName}`,
          profileImage: authData.profileImage,
          status: 'ACTIVE',
          profileId: authData.profileId,
        };
        setUser(userData);
        return authData;
      } else {
        throw new Error(res.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedUser: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUser } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
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
