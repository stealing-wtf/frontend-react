import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import CookieService from '../utils/cookieService';
import apiService, { type UserProfile } from '../utils/apiService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; requiresOTP?: boolean; userId?: string; error?: string }>;
  verifyOTP: (userId: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (user: UserProfile) => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = CookieService.getAuthToken();
      if (token && CookieService.isAuthenticated()) {
        setIsAuthenticated(true);
        
        try {
          const userResponse = await apiService.getUserProfile();
          if (userResponse.success && userResponse.data) {
            setUser(userResponse.data);
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      } else if (token) {
        try {
          const refreshToken = CookieService.getRefreshToken();
          if (refreshToken) {
            const refreshResponse = await apiService.refreshAuthToken(refreshToken);
            if (refreshResponse.success) {
              setIsAuthenticated(true);
              const userResponse = await apiService.getUserProfile();
              if (userResponse.success && userResponse.data) {
                setUser(userResponse.data);
              }
            }
          } else {
            CookieService.clearAuthData();
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          CookieService.clearAuthData();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ username: email, password });
      
      if (response.success && response.data) {
        // Handle nested response structure from backend
        const responseData = response.data.data || response.data;
        
        if (responseData.requiresOTP) {
          return {
            success: true,
            requiresOTP: true,
            userId: responseData.userId,
          };
        } else if (responseData.user || response.data.user) {
          const user = responseData.user || response.data.user;
          setUser(user);
          setIsAuthenticated(true); // Fix: Set authentication state
          return { success: true };
        }
      }
      
      return {
        success: false,
        error: response.error || 'Login failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  };

  const verifyOTP = async (userId: string, otp: string) => {
    try {
      console.log('DEBUG: AuthContext verifyOTP called with:', { userId, otp });
      const response = await apiService.verifyOTP({ userId, otp });
      console.log('DEBUG: AuthContext verifyOTP response:', response);
      
      if (response.success && response.data?.user) {
        console.log('DEBUG: AuthContext verifyOTP success, setting user:', response.data.user);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      
      console.log('DEBUG: AuthContext verifyOTP failed:', response.error);
      return {
        success: false,
        error: response.error || 'OTP verification failed',
      };
    } catch (error) {
      console.error('DEBUG: AuthContext verifyOTP exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OTP verification failed',
      };
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (userData: UserProfile) => {
    setUser(userData);
    CookieService.setUserData(userData);
  };

  const refreshUserData = async () => {
    try {
      const response = await apiService.getUserProfile();
      if (response.success && response.data) {
        setUser(response.data);
        CookieService.setUserData(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch user data');
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      CookieService.clearAuthData();
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    verifyOTP,
    logout,
    updateUser,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};