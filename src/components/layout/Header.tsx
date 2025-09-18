import { User, AttendanceRecord, SalesRecord, SalesTarget, Product } from '../types';

const STORAGE_KEYS = {
  USERS: 'crm_users',
  ATTENDANCE: 'crm_attendance',
  SALES: 'crm_sales',
  TARGETS: 'crm_targets',
  CURRENT_USER: 'crm_current_user',
  PRODUCTS: 'crm_products',
};

// User Management
export const getUsers = (): User[] => {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : getDefaultUsers();
};

export const saveUsers = (users: User[]): void => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Password Reset
export const resetUserPassword = (employeeId: string, newPassword: string): boolean => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.employeeId === employeeId);
  
  if (userIndex !== -1) {
    users[userIndex].password = newPassword;
    saveUsers(users);
    return true;
  }
  return false;
};

// Update User Profile
export const updateUserProfile = (userId: string, updates: Partial<User>): boolean => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates };
    saveUsers(users);
    
    // Update current user if it's the same user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(users[userIndex]);
    }
    
    return true;
  }
  return false;
};

// Add New Employee (Admin only)
export const addNewEmployee = (userData: Omit<User, 'id'>): User => {
  const users = getUsers();
  const newUser: User = {
    ...userData,
    id: userData.employeeId,
  };
  
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

// Products Management
export const getProducts = (): Product[] => {
  const products = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return products ? JSON.parse(products) : getDefaultProducts();
};

export const saveProducts = (products: Product[]): void => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

// Attendance Management
export const getAttendanceRecords = (): AttendanceRecord[] => {
  const records = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
  return records ? JSON.parse(records) : [];
};

export const saveAttendanceRecords = (records: AttendanceRecord[]): void => {
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
};

// Sales Management
export const getSalesRecords = (): SalesRecord[] => {
  const records = localStorage.getItem(STORAGE_KEYS.SALES);
  return records ? JSON.parse(records) : [];
};

export const saveSalesRecords = (records: SalesRecord[]): void => {
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(records));
};

// Sales Targets
export const getSalesTargets = (): SalesTarget[] => {
  const targets = localStorage.getItem(STORAGE_KEYS.TARGETS);
  return targets ? JSON.parse(targets) : [];
};

export const saveSalesTargets = (targets: SalesTarget[]): void => {
  localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(targets));
};

// Default Products from the image
const getDefaultProducts = (): Product[] => [
  // Projector Products (from screenshot)
  { id: 'PROJ_GALAXY', name: 'Galaxy Projector', price: 11513, category: 'Projector', model: 'Galaxy' },
  { id: 'PROJ_PLAY', name: 'Play Projector', price: 10073, category: 'Projector', model: 'Play' },
  { id: 'PROJ_EPIC', name: 'Epic Projector', price: 6473, category: 'Projector', model: 'Epic' },
  { id: 'PROJ_JOY', name: 'Joy Projector', price: 5039, category: 'Projector', model: 'Joy' },
  { id: 'PROJ_PIXA', name: 'Pixa Projector', price: 7199, category: 'Projector', model: 'Pixa' },
  { id: 'PROJ_SCREEN_M65', name: 'Screen M65 Projector', price: 11513, category: 'Projector', model: 'M65' },
  
  // Mobile Products (existing)
  { id: 'GALAXY', name: 'Galaxy', price: 11513, category: 'Mobile', model: 'Galaxy' },
  { id: 'PLAY', name: 'Play', price: 10073, category: 'Mobile', model: 'Play' },
  { id: 'EPIC', name: 'Epic', price: 6473, category: 'Mobile', model: 'Epic' },
  { id: 'JOY', name: 'Joy', price: 5039, category: 'Mobile', model: 'Joy' },
  { id: 'PIXA', name: 'Pixa', price: 7199, category: 'Mobile', model: 'Pixa' },
  
  // Screen Products
  { id: 'SCREEN_M65', name: 'Screen M65', price: 11513, category: 'Screen', model: 'M65' },
  { id: 'SCREEN_M80', name: 'Screen M80', price: 12951, category: 'Screen', model: 'M80' },
  { id: 'SCREEN_M100', name: 'Screen M100', price: 14393, category: 'Screen', model: 'M100' },
  { id: 'SCREEN_FR140', name: 'Screen FR140', price: 40111, category: 'Screen', model: 'FR140' },
  { id: 'SCREEN_FR160', name: 'Screen FR160', price: 50291, category: 'Screen', model: 'FR160' },
  
  // Extension Board Products
  { id: 'EXT_BOARD_331', name: 'Extension Board 331', price: 791, category: 'Extension', model: '331' },
  { id: 'EXT_BOARD_411', name: 'Extension Board 411', price: 719, category: 'Extension', model: '411' },
  { id: 'EXT_BOARD_422', name: 'Extension Board 422', price: 863, category: 'Extension', model: '422' },
  { id: 'EXT_BOARD_524', name: 'Extension Board 524', price: 1079, category: 'Extension', model: '524' },
  { id: 'EXT_BOARD_522', name: 'Extension Board 522', price: 935, category: 'Extension', model: '522' },
  
  // SMPS Products
  { id: 'SMPS_450', name: 'SMPS 450', price: 633, category: 'SMPS', model: '450' },
  { id: 'SMPS_500', name: 'SMPS 500', price: 950, category: 'SMPS', model: '500' },
  { id: 'SMPS_550', name: 'SMPS 550', price: 1108, category: 'SMPS', model: '550' },
  { id: 'SMPS_650', name: 'SMPS 650', price: 1266, category: 'SMPS', model: '650' },
  { id: 'SMPS_700', name: 'SMPS 700', price: 1425, category: 'SMPS', model: '700' },
  { id: 'SMPS_750', name: 'SMPS 750', price: 1583, category: 'SMPS', model: '750' },
  { id: 'SMPS_800', name: 'SMPS 800', price: 1900, category: 'SMPS', model: '800' },
  { id: 'SMPS_850', name: 'SMPS 850', price: 1900, category: 'SMPS', model: '850' },
  { id: 'SMPS_1000', name: 'SMPS 1000', price: 2374, category: 'SMPS', model: '1000' },
  
  // AI Products
  { id: 'AI_MODEL', name: 'AI Model', price: 2771, category: 'AI', model: 'Standard' },
];

// Complete employee list with exact credentials
const getDefaultUsers = (): User[] => [
  // Admin
  {
    id: 'ADMIN001',
    employeeId: 'ADMIN001',
    name: 'Manoj Kumar',
    username: 'manoj.kumar',
    role: 'admin',
    department: 'Management',
    joinDate: '2024-01-01',
    password: 'admin@123',
    profilePicture: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543210',
    designation: 'Sales Director',
    target: 500000,
    manager: null,
    territory: 'All India',
    isActive: true,
    lastLogin: new Date().toISOString(),
  },
  
  // Reporting Managers
  {
    id: 'BM001',
    employeeId: 'BM001',
    name: 'Salim Javed',
    username: 'salim.javed',
    role: 'manager',
    department: 'Sales',
    joinDate: '2024-01-15',
    password: 'salim@2024',
    profilePicture: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 7870660333',
    designation: 'District General Manager (DGM)',
    target: 300000,
    manager: 'ADMIN001',
    territory: 'Bihar/Delhi & West Bengal/Odisha',
    isActive: true,
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 'BM002',
    employeeId: 'BM002',
    name: 'Sandeep Bediawala',
    username: 'sandeep.bediawala',
    role: 'manager',
    department: 'Sales',
    joinDate: '2024-01-20',
    password: 'sandeep@2024',
    profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543214',
    designation: 'Regional Manager (Gujarat)',
    target: 280000,
    manager: 'ADMIN001',
    territory: 'Gujarat & Chhattisgarh',
    isActive: true,
    lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
  },
  {
    id: 'BM003',
    employeeId: 'BM003',
    name: 'Pawan Khanna',
    username: 'pawan.khanna',
    role: 'manager',
    department: 'Sales',
    joinDate: '2024-02-01',
    password: 'pawan@2024',
    profilePicture: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9174995813',
    designation: 'Sales Manager',
    target: 250000,
    manager: 'ADMIN001',
    territory: 'MP & Rajasthan',
    isActive: true,
    lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  {
    id: 'BM004',
    employeeId: 'BM004',
    name: 'Dhiraj Prakash',
    username: 'dhiraj.prakash',
    role: 'manager',
    department: 'Sales',
    joinDate: '2024-02-05',
    password: 'dhiraj@2024',
    profilePicture: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9174995813',
    designation: 'Sales Manager',
    target: 250000,
    manager: 'ADMIN001',
    territory: 'MP & Rajasthan',
    isActive: true,
    lastLogin: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
  },
];

// Export Functions
export const exportToCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Initialize default data if not exists
export const initializeDefaultData = (): void => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    saveUsers(getDefaultUsers());
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    saveProducts(getDefaultProducts());
                      <LogOut className="w-5 h-5" />
  };
}