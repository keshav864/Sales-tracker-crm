import { useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { getCurrentUser, setCurrentUser } from '../utils/storage';
import { authenticateUser, isSessionValid, refreshUserSession } from '../utils/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    if (isSessionValid()) {
      const user = getCurrentUser();
      setAuthState({
        user,
        isAuthenticated: true,
      });
    }
  }, []);

  const login = (employeeId: string, password: string): boolean => {
    const user = authenticateUser(employeeId, password);
    
    if (user) {
      setCurrentUser(user);
      setAuthState({
        user,
        isAuthenticated: true,
      });
      return true;
    }
    return false;
  };

  const updateUser = (updatedUser: User) => {
    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }));
    refreshUserSession(updatedUser.id);
  };

  const logout = () => {
    setCurrentUser(null);
    setAuthState({
      user: null,
      isAuthenticated: false,
    });
  };

  return {
    ...authState,
    login,
    logout,
    updateUser,
  };
};