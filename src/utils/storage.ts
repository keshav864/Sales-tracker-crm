import { User, AttendanceRecord, SalesRecord, SalesTarget } from '../types';

const STORAGE_KEYS = {
  USERS: 'crm_users',
  ATTENDANCE: 'crm_attendance',
  SALES: 'crm_sales',
  TARGETS: 'crm_targets',
  CURRENT_USER: 'crm_current_user',
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

// Default Data - Sales Team with Employee IDs
const getDefaultUsers = (): User[] => [
  {
    id: 'ADMIN001',
    employeeId: 'ADMIN001',
    name: 'Manoj Kumar',
    email: 'manoj.kumar@company.com',
    role: 'admin',
    department: 'Management',
    joinDate: '2024-01-01',
    password: 'admin@123',
    profilePicture: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543210',
    designation: 'Sales Director',
    target: 500000,
  },
  {
    id: 'BM178',
    employeeId: 'BM178',
    name: 'Manoj Kumar Singh',
    email: 'manoj.singh@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-01-15',
    password: 'bm178@123',
    profilePicture: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543211',
    designation: 'Senior Sales Executive',
    target: 150000,
  },
  {
    id: 'BM200',
    employeeId: 'BM200',
    name: 'Dheeraj Prakash',
    email: 'dheeraj.prakash@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-02-01',
    password: 'bm200@123',
    profilePicture: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543212',
    designation: 'Sales Executive',
    target: 120000,
  },
  {
    id: 'BM214',
    employeeId: 'BM214',
    name: 'Pramod Nair',
    email: 'pramod.nair@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-02-15',
    password: 'bm214@123',
    profilePicture: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543213',
    designation: 'Sales Executive',
    target: 120000,
  },
  {
    id: 'BM212',
    employeeId: 'BM212',
    name: 'Sandeep Bediawala',
    email: 'sandeep.bediawala@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-03-01',
    password: 'bm212@123',
    profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543214',
    designation: 'Sales Executive',
    target: 120000,
  },
  {
    id: 'BM220',
    employeeId: 'BM220',
    name: 'Salim Javed',
    email: 'salim.javed@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-03-15',
    password: 'bm220@123',
    profilePicture: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543215',
    designation: 'Sales Executive',
    target: 120000,
  },
  {
    id: 'BM227',
    employeeId: 'BM227',
    name: 'Pawan Khanna',
    email: 'pawan.khanna@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-04-01',
    password: 'bm227@123',
    profilePicture: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543216',
    designation: 'Sales Executive',
    target: 120000,
  },
  {
    id: 'BM222',
    employeeId: 'BM222',
    name: 'Sonu Mehta',
    email: 'sonu.mehta@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-04-15',
    password: 'bm222@123',
    profilePicture: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543217',
    designation: 'Sales Executive',
    target: 120000,
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
};