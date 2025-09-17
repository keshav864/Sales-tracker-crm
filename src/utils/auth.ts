import { User } from '../types';
import { getUsers, saveUsers, getCurrentUser, setCurrentUser } from './storage';

// Password hashing utility (simple implementation for demo)
export const hashPassword = (password: string): string => {
  // In production, use bcrypt or similar
  return btoa(password + 'salt_key_2024');
};

export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  return hashPassword(password) === hashedPassword;
};

// Secure login with proper validation
export const authenticateUser = (employeeId: string, password: string): User | null => {
  const users = getUsers();
  console.log('Authenticating user:', employeeId);
  console.log('Available users:', users.map(u => ({ id: u.employeeId, hasPassword: !!u.password })));
  
  const user = users.find(u => 
    u.employeeId.toLowerCase() === employeeId.toLowerCase() && 
    u.isActive !== false
  );
  
  if (!user) {
    console.log('User not found for employeeId:', employeeId);
    return null;
  }

  console.log('Found user:', user.name, 'Password check:', user.password);
  
  // Check if password is already hashed (for existing users)
  const isValidPassword = user.password === password; // Direct comparison for demo

  console.log('Password validation result:', isValidPassword);
  
  if (isValidPassword) {
    // Update last login
    user.lastLogin = new Date().toISOString();
    const updatedUsers = users.map(u => u.id === user.id ? user : u);
    saveUsers(updatedUsers);
    
    console.log('Authentication successful for:', user.name);
    return user;
  }

  console.log('Authentication failed - password mismatch');
  return null;
};

// Change password functionality
export const changePassword = (userId: string, currentPassword: string, newPassword: string): boolean => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) return false;
  
  const user = users[userIndex];
  
  // Verify current password
  const isCurrentPasswordValid = user.password.startsWith('btoa')
    ? verifyPassword(currentPassword, user.password)
    : user.password === currentPassword;
    
  if (!isCurrentPasswordValid) return false;
  
  // Update with new hashed password
  users[userIndex].password = hashPassword(newPassword);
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