import { User } from '../types';
import { getUsers, saveUsers, getCurrentUser, setCurrentUser } from './storage';

// Simple authentication without complex hashing for demo
export const authenticateUser = (employeeId: string, password: string): User | null => {
  const users = getUsers();
  console.log('🔍 Authenticating user:', employeeId);
  console.log('🔍 Available users:', users.map(u => ({ 
    employeeId: u.employeeId, 
    name: u.name, 
    password: u.password,
    role: u.role 
  })));
  
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
  
  // Direct password comparison
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
};

// Password hashing utility (simple implementation for demo)
export const hashPassword = (password: string): string => {
  // In production, use bcrypt or similar
  return btoa(password + 'salt_key_2024');
};

export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  return hashPassword(password) === hashedPassword;
};

// Change password functionality
export const changePassword = (userId: string, currentPassword: string, newPassword: string): boolean => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) return false;
  
  const user = users[userIndex];
  
  // Verify current password (direct comparison for demo)
  if (user.password !== currentPassword) return false;
  
  // Update with new password
  users[userIndex].password = newPassword;
  saveUsers(users);
  
  // Update current user session if it's the same user
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    setCurrentUser(users[userIndex]);
  }
  
  return true;
};

// Session management
export const isSessionValid = (): boolean => {
  const user = getCurrentUser();
  return user !== null;
};

export const refreshUserSession = (userId: string): void => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    setCurrentUser(user);
  }
};