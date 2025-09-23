import { useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { getCurrentUser, setCurrentUser } from '../utils/storage';
import { 
  authenticateUser, 
  isSessionValid, 
  refreshUserSession, 
  logout as authLogout,
  isAccountLocked,
  trackFailedLogin,
  clearFailedLogins
} from '../utils/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (isSessionValid()) {
          const user = getCurrentUser();
          if (user) {
            setAuthState({
              user,
              isAuthenticated: true,
            });
          }
        }
      } catch (error) {
        console.error('🚨 Auth initialization error:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (employeeId: string, password: string): boolean => {
    try {
      console.log('🎯 useAuth login called with:', employeeId);
      
      // Check if account is locked
      if (isAccountLocked(employeeId)) {
        console.log('🔒 Account is locked');
        return false;
      }
      
      const user = authenticateUser(employeeId, password);
      
      if (user) {
        console.log('🎯 Setting authenticated user:', user.name);
        setCurrentUser(user);
        setAuthState({
          user,
          isAuthenticated: true,
        });
        
        // Clear any failed login attempts
        clearFailedLogins(employeeId);
        
        return true;
      } else {
        console.log('🎯 Authentication failed in useAuth');
        
        // Track failed login attempt
        trackFailedLogin(employeeId);
        
        return false;
      }
    } catch (error) {
      console.error('🚨 Login error:', error);
      return false;
    }
  };

  const updateUser = (updatedUser: User) => {
    try {
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
      refreshUserSession(updatedUser.id);
    } catch (error) {
      console.error('🚨 Update user error:', error);
    }
  };

  const logout = () => {
    try {
      authLogout();
      setAuthState({
        user: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('🚨 Logout error:', error);
    }
  };

  // Check session validity periodically
  useEffect(() => {
    const checkSession = () => {
      if (authState.isAuthenticated && !isSessionValid()) {
        console.log('🚨 Session expired, logging out');
        logout();
      }
    };

    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [authState.isAuthenticated]);

  return {
    ...authState,
    login,
    logout,
    updateUser,
    isLoading,
  };
};