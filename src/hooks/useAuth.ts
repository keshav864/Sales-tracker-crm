import { useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { getCurrentUser, setCurrentUser, getUsers } from '../utils/storage';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setAuthState({
        user,
        isAuthenticated: true,
      });
    }
  }, []);

  const login = (employeeId: string, password: string): boolean => {
    const users = getUsers();
    const user = users.find(u => 
      u.employeeId.toLowerCase() === employeeId.toLowerCase() && 
      u.password === password
    );
    
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
  };
};