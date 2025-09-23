import { User } from '../types';
import { getUsers, saveUsers, getCurrentUser, setCurrentUser } from './storage';

// Enhanced authentication with better error handling
export const authenticateUser = (employeeId: string, password: string): User | null => {
  try {
    const users = getUsers();
    console.log('🔍 Authenticating user:', employeeId);
    console.log('🔍 Available users:', users.map(u => ({ 
      employeeId: u.employeeId, 
      name: u.name, 
      role: u.role,
      isActive: u.isActive 
    })));
    
    // Validate input
    if (!employeeId || !password) {
      console.log('❌ Missing credentials');
      return null;
    }
    
    // Find user by employee ID (case insensitive)
    const user = users.find(u => 
      u.employeeId.toLowerCase() === employeeId.toLowerCase() && 
      u.isActive !== false
    );
    
    if (!user) {
      console.log('❌ User not found for employeeId:', employeeId);
      return null;
    }

    console.log('✅ Found user:', user.name);
    console.log('🔑 Checking password:', password, 'against stored:', user.password);
    
    // Direct password comparison (in production, use proper hashing)
    if (user.password === password) {
      console.log('✅ Password match - Authentication successful');
      
      // Update last login
      user.lastLogin = new Date().toISOString();
      const updatedUsers = users.map(u => u.id === user.id ? user : u);
      saveUsers(updatedUsers);
      
      return user;
    }

    console.log('❌ Password mismatch - Authentication failed');
    return null;
  } catch (error) {
    console.error('🚨 Authentication error:', error);
    return null;
  }
};

// Password hashing utility (simple implementation for demo)
export const hashPassword = (password: string): string => {
  // In production, use bcrypt or similar
  return btoa(password + 'salt_key_2024');
};

export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  return hashPassword(password) === hashedPassword;
};

// Change password functionality with validation
export const changePassword = (userId: string, currentPassword: string, newPassword: string): boolean => {
  try {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      console.log('❌ User not found for password change');
      return false;
    }
    
    const user = users[userIndex];
    
    // Verify current password (direct comparison for demo)
    if (user.password !== currentPassword) {
      console.log('❌ Current password incorrect');
      return false;
    }
    
    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      console.log('❌ New password too short');
      return false;
    }
    
    // Update with new password
    users[userIndex].password = newPassword;
    saveUsers(users);
    
    // Update current user session if it's the same user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(users[userIndex]);
    }
    
    console.log('✅ Password changed successfully');
    return true;
  } catch (error) {
    console.error('🚨 Password change error:', error);
    return false;
  }
};

// Session management with validation
export const isSessionValid = (): boolean => {
  try {
    const user = getCurrentUser();
    if (!user) return false;
    
    // Check if user still exists and is active
    const users = getUsers();
    const currentUser = users.find(u => u.id === user.id);
    
    return currentUser && currentUser.isActive !== false;
  } catch (error) {
    console.error('🚨 Session validation error:', error);
    return false;
  }
};

export const refreshUserSession = (userId: string): void => {
  try {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (user && user.isActive !== false) {
      setCurrentUser(user);
    } else {
      // User no longer exists or is inactive, clear session
      setCurrentUser(null);
    }
  } catch (error) {
    console.error('🚨 Session refresh error:', error);
    setCurrentUser(null);
  }
};

// Enhanced logout with cleanup
export const logout = (): void => {
  try {
    setCurrentUser(null);
    console.log('✅ User logged out successfully');
  } catch (error) {
    console.error('🚨 Logout error:', error);
  }
};

// Account lockout functionality (for security)
export const isAccountLocked = (employeeId: string): boolean => {
  try {
    const lockoutData = localStorage.getItem('crm_lockout_data');
    if (!lockoutData) return false;
    
    const lockouts = JSON.parse(lockoutData);
    const userLockout = lockouts[employeeId];
    
    if (!userLockout) return false;
    
    // Check if lockout has expired (30 minutes)
    const lockoutExpiry = new Date(userLockout.lockedUntil);
    const now = new Date();
    
    if (now > lockoutExpiry) {
      // Remove expired lockout
      delete lockouts[employeeId];
      localStorage.setItem('crm_lockout_data', JSON.stringify(lockouts));
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('🚨 Account lockout check error:', error);
    return false;
  }
};

// Track failed login attempts
export const trackFailedLogin = (employeeId: string): void => {
  try {
    const lockoutData = localStorage.getItem('crm_lockout_data') || '{}';
    const lockouts = JSON.parse(lockoutData);
    
    if (!lockouts[employeeId]) {
      lockouts[employeeId] = { attempts: 0, firstAttempt: new Date().toISOString() };
    }
    
    lockouts[employeeId].attempts += 1;
    lockouts[employeeId].lastAttempt = new Date().toISOString();
    
    // Lock account after 5 failed attempts
    if (lockouts[employeeId].attempts >= 5) {
      const lockoutTime = new Date();
      lockoutTime.setMinutes(lockoutTime.getMinutes() + 30); // 30 minute lockout
      lockouts[employeeId].lockedUntil = lockoutTime.toISOString();
    }
    
    localStorage.setItem('crm_lockout_data', JSON.stringify(lockouts));
  } catch (error) {
    console.error('🚨 Failed login tracking error:', error);
  }
};

// Clear failed login attempts on successful login
export const clearFailedLogins = (employeeId: string): void => {
  try {
    const lockoutData = localStorage.getItem('crm_lockout_data');
    if (!lockoutData) return;
    
    const lockouts = JSON.parse(lockoutData);
    delete lockouts[employeeId];
    localStorage.setItem('crm_lockout_data', JSON.stringify(lockouts));
  } catch (error) {
    console.error('🚨 Clear failed logins error:', error);
  }
};