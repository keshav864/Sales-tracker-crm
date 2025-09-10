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
  const user = users.find(u => 
    u.employeeId.toLowerCase() === employeeId.toLowerCase() && 
    u.isActive !== false
  );
  
  if (!user) {
    return null;
  }

  // Check if password is already hashed (for existing users)
  const isValidPassword = user.password.startsWith('btoa') 
    ? verifyPassword(password, user.password)
    : user.password === password; // Backward compatibility

  if (isValidPassword) {
    // Hash password if not already hashed
    if (!user.password.startsWith('btoa')) {
      user.password = hashPassword(password);
      const updatedUsers = users.map(u => u.id === user.id ? user : u);
      saveUsers(updatedUsers);
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    const updatedUsers = users.map(u => u.id === user.id ? user : u);
    saveUsers(updatedUsers);
    
    return user;
  }

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