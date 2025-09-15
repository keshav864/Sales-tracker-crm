import { User } from '../types';
import { getUsers, saveUsers, getCurrentUser, setCurrentUser } from './storage';

// Simple password verification for demo purposes
export const verifyPassword = (inputPassword: string, storedPassword: string): boolean => {
  // Direct comparison for demo - in production, use proper hashing
  return inputPassword === storedPassword;
};

// Secure login with proper validation
export const authenticateUser = (employeeId: string, password: string): User | null => {
  console.log('Attempting login for:', employeeId);
  
  const users = getUsers();
  console.log('Available users:', users.map(u => ({ id: u.employeeId, active: u.isActive })));
  
  const user = users.find(u => 
    u.employeeId.toLowerCase() === employeeId.toLowerCase() && 
    u.isActive !== false
  );
  
  console.log('Found user:', user ? { id: user.employeeId, name: user.name } : 'Not found');
  
  if (!user) {
    console.log('User not found or inactive');
    return null;
  }

  // Simple password check for demo
  const isValidPassword = user.password === password;
  console.log('Password valid:', isValidPassword);
  
  if (isValidPassword) {
    // Update last login
    user.lastLogin = new Date().toISOString();
    const updatedUsers = users.map(u => u.id === user.id ? user : u);
    saveUsers(updatedUsers);
    
    console.log('Login successful for:', user.name);
    return user;
  }

  console.log('Invalid password');
  return null;
};

// Change password functionality
export const changePassword = (userId: string, currentPassword: string, newPassword: string): boolean => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) return false;
  
  const user = users[userIndex];
  
  // Verify current password
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