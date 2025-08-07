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
  { id: 'GALAXY', name: 'Galaxy', price: 11513, category: 'Mobile', model: 'Galaxy' },
  { id: 'PLAY', name: 'Play', price: 10073, category: 'Mobile', model: 'Play' },
  { id: 'EPIC', name: 'Epic', price: 6473, category: 'Mobile', model: 'Epic' },
  { id: 'JOY', name: 'Joy', price: 5039, category: 'Mobile', model: 'Joy' },
  { id: 'PIXA', name: 'Pixa', price: 7199, category: 'Mobile', model: 'Pixa' },
  { id: 'SCREEN_M65', name: 'Screen M65', price: 11513, category: 'Screen', model: 'M65' },
  { id: 'SCREEN_M80', name: 'Screen M80', price: 12951, category: 'Screen', model: 'M80' },
  { id: 'SCREEN_M100', name: 'Screen M100', price: 14393, category: 'Screen', model: 'M100' },
  { id: 'SCREEN_FR140', name: 'Screen FR140', price: 40111, category: 'Screen', model: 'FR140' },
  { id: 'SCREEN_FR160', name: 'Screen FR160', price: 50291, category: 'Screen', model: 'FR160' },
  { id: 'EXT_BOARD_331', name: 'Extension Board 331', price: 791, category: 'Extension', model: '331' },
  { id: 'EXT_BOARD_411', name: 'Extension Board 411', price: 719, category: 'Extension', model: '411' },
  { id: 'EXT_BOARD_422', name: 'Extension Board 422', price: 863, category: 'Extension', model: '422' },
  { id: 'EXT_BOARD_524', name: 'Extension Board 524', price: 1079, category: 'Extension', model: '524' },
  { id: 'EXT_BOARD_522', name: 'Extension Board 522', price: 935, category: 'Extension', model: '522' },
  { id: 'SMPS_450', name: 'SMPS 450', price: 633, category: 'SMPS', model: '450' },
  { id: 'SMPS_500', name: 'SMPS 500', price: 950, category: 'SMPS', model: '500' },
  { id: 'SMPS_550', name: 'SMPS 550', price: 1108, category: 'SMPS', model: '550' },
  { id: 'SMPS_650', name: 'SMPS 650', price: 1266, category: 'SMPS', model: '650' },
  { id: 'SMPS_700', name: 'SMPS 700', price: 1425, category: 'SMPS', model: '700' },
  { id: 'SMPS_750', name: 'SMPS 750', price: 1583, category: 'SMPS', model: '750' },
  { id: 'SMPS_800', name: 'SMPS 800', price: 1900, category: 'SMPS', model: '800' },
  { id: 'SMPS_850', name: 'SMPS 850', price: 1900, category: 'SMPS', model: '850' },
  { id: 'SMPS_1000', name: 'SMPS 1000', price: 2374, category: 'SMPS', model: '1000' },
  { id: 'AI_MODEL', name: 'AI Model', price: 2771, category: 'AI', model: 'Standard' },
];

// Default Users based on the employee data from images
const getDefaultUsers = (): User[] => [
  // Admin
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
    manager: null,
    territory: 'All India',
  },
  
  // Managers
  {
    id: 'BM001',
    employeeId: 'BM001',
    name: 'Salim Javed',
    email: 'salim.javed@company.com',
    role: 'manager',
    department: 'Sales',
    joinDate: '2024-01-15',
    password: 'manager@123',
    profilePicture: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 7870660333',
    designation: 'District General Manager',
    target: 300000,
    manager: 'ADMIN001',
    territory: 'Bihar/Delhi',
  },
  {
    id: 'BM002',
    employeeId: 'BM002',
    name: 'Sandeep Bediawala',
    email: 'sandeep.bediawala@company.com',
    role: 'manager',
    department: 'Sales',
    joinDate: '2024-01-20',
    password: 'manager@123',
    profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543214',
    designation: 'Regional Manager',
    target: 280000,
    manager: 'ADMIN001',
    territory: 'Gujarat',
  },
  {
    id: 'BM003',
    employeeId: 'BM003',
    name: 'Pawan Khanna',
    email: 'pawan.khanna@company.com',
    role: 'manager',
    department: 'Sales',
    joinDate: '2024-02-01',
    password: 'manager@123',
    profilePicture: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9174995813',
    designation: 'Sales Manager',
    target: 250000,
    manager: 'ADMIN001',
    territory: 'MP & Rajasthan',
  },
  {
    id: 'BM004',
    employeeId: 'BM004',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@company.com',
    role: 'manager',
    department: 'Sales',
    joinDate: '2024-02-15',
    password: 'manager@123',
    profilePicture: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543215',
    designation: 'Regional Manager',
    target: 270000,
    manager: 'ADMIN001',
    territory: 'Maharashtra',
  },
  {
    id: 'BM005',
    employeeId: 'BM005',
    name: 'Vikram Singh',
    email: 'vikram.singh@company.com',
    role: 'manager',
    department: 'Sales',
    joinDate: '2024-03-01',
    password: 'manager@123',
    profilePicture: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543216',
    designation: 'Area Manager',
    target: 260000,
    manager: 'ADMIN001',
    territory: 'Punjab & Haryana',
  },

  // Sales Team - Bihar/Delhi Region
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
    phone: '+91 9507732111',
    designation: 'Area Sales Manager',
    target: 150000,
    manager: 'BM001',
    territory: 'Bihar',
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
    phone: '+91 9798537013',
    designation: 'Territory Sales Manager',
    target: 120000,
    manager: 'BM001',
    territory: 'Katihar',
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
    phone: '+91 9153900969',
    designation: 'Territory Sales Manager',
    target: 120000,
    manager: 'BM001',
    territory: 'Indraprastha',
  },
  {
    id: 'BM212',
    employeeId: 'BM212',
    name: 'Sonu Mehta',
    email: 'sonu.mehta@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-03-01',
    password: 'bm212@123',
    profilePicture: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 6205432592',
    designation: 'Area Sales Manager',
    target: 140000,
    manager: 'BM001',
    territory: 'Bihar',
  },

  // West Bengal, Odisha Region
  {
    id: 'BM220',
    employeeId: 'BM220',
    name: 'Sajib Bose',
    email: 'sajib.bose@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-03-15',
    password: 'bm220@123',
    profilePicture: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 7605823774',
    designation: 'Territory Sales Manager',
    target: 120000,
    manager: 'BM001',
    territory: 'Howrah and Hooghly, South 24 Parganas',
  },
  {
    id: 'BM227',
    employeeId: 'BM227',
    name: 'Asim Pal',
    email: 'asim.pal@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-04-01',
    password: 'bm227@123',
    profilePicture: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 8926813416',
    designation: 'Territory Sales Manager',
    target: 120000,
    manager: 'BM001',
    territory: 'Jhargram',
  },
  {
    id: 'BM222',
    employeeId: 'BM222',
    name: 'Amit Singh',
    email: 'amit.singh@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-04-15',
    password: 'bm222@123',
    profilePicture: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 7033545290',
    designation: 'Area Sales Manager',
    target: 130000,
    manager: 'BM001',
    territory: 'West Bengal',
  },

  // Additional Sales Team Members
  {
    id: 'BM223',
    employeeId: 'BM223',
    name: 'Sumir Ashokkbhai Yadav',
    email: 'sumir.yadav@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-05-01',
    password: 'bm223@123',
    profilePicture: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 7990143334',
    designation: 'Area Sales Manager',
    target: 125000,
    manager: 'BM002',
    territory: 'Ahmedabad',
  },
  {
    id: 'BM234',
    employeeId: 'BM234',
    name: 'Zameer Khan',
    email: 'zameer.khan@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-05-15',
    password: 'bm234@123',
    profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9827958772',
    designation: 'Area Sales Manager',
    target: 120000,
    manager: 'BM002',
    territory: 'Chhattisgarh Nagpur',
  },
  {
    id: 'BM235',
    employeeId: 'BM235',
    name: 'Hitesh Joshi',
    email: 'hitesh.joshi@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-06-01',
    password: 'bm235@123',
    profilePicture: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9414051300',
    designation: 'Territory Sales Manager',
    target: 115000,
    manager: 'BM003',
    territory: 'Rajasthan Kota',
  },
  {
    id: 'BM236',
    employeeId: 'BM236',
    name: 'Manish Kumar',
    email: 'manish.kumar@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-06-15',
    password: 'bm236@123',
    profilePicture: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9024652993',
    designation: 'Territory Sales Manager',
    target: 110000,
    manager: 'BM003',
    territory: 'Indore',
  },
  {
    id: 'BM240',
    employeeId: 'BM240',
    name: 'Nitin Mamtrao Ruikar',
    email: 'nitin.ruikar@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-07-01',
    password: 'bm240@123',
    profilePicture: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9244671164',
    designation: 'Area Sales Manager',
    target: 125000,
    manager: 'BM002',
    territory: 'Bhopal',
  },
  {
    id: 'BM241',
    employeeId: 'BM241',
    name: 'Sanjib Bose',
    email: 'sanjib.bose@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-07-15',
    password: 'bm241@123',
    profilePicture: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 7879547541',
    designation: 'Territory Sales Manager',
    target: 115000,
    manager: 'BM001',
    territory: 'West Bengal',
  },
  // Additional 18 employees to reach 30 total
  {
    id: 'BM250',
    employeeId: 'BM250',
    name: 'Ravi Patel',
    email: 'ravi.patel@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-08-01',
    password: 'bm250@123',
    profilePicture: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543217',
    designation: 'Sales Executive',
    target: 100000,
    manager: 'BM002',
    territory: 'Gujarat',
  },
  {
    id: 'BM251',
    employeeId: 'BM251',
    name: 'Deepak Verma',
    email: 'deepak.verma@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-08-05',
    password: 'bm251@123',
    profilePicture: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543218',
    designation: 'Sales Executive',
    target: 105000,
    manager: 'BM003',
    territory: 'Madhya Pradesh',
  },
  {
    id: 'BM252',
    employeeId: 'BM252',
    name: 'Suresh Kumar',
    email: 'suresh.kumar@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-08-10',
    password: 'bm252@123',
    profilePicture: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543219',
    designation: 'Territory Sales Executive',
    target: 95000,
    manager: 'BM004',
    territory: 'Mumbai',
  },
  {
    id: 'BM253',
    employeeId: 'BM253',
    name: 'Anil Gupta',
    email: 'anil.gupta@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-08-15',
    password: 'bm253@123',
    profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543220',
    designation: 'Sales Executive',
    target: 110000,
    manager: 'BM005',
    territory: 'Punjab',
  },
  {
    id: 'BM254',
    employeeId: 'BM254',
    name: 'Rohit Sharma',
    email: 'rohit.sharma@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-08-20',
    password: 'bm254@123',
    profilePicture: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543221',
    designation: 'Area Sales Executive',
    target: 108000,
    manager: 'BM001',
    territory: 'Delhi NCR',
  },
  {
    id: 'BM255',
    employeeId: 'BM255',
    name: 'Kiran Singh',
    email: 'kiran.singh@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-08-25',
    password: 'bm255@123',
    profilePicture: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543222',
    designation: 'Sales Executive',
    target: 102000,
    manager: 'BM002',
    territory: 'Surat',
  },
  {
    id: 'BM256',
    employeeId: 'BM256',
    name: 'Ajay Kumar',
    email: 'ajay.kumar@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-09-01',
    password: 'bm256@123',
    profilePicture: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543223',
    designation: 'Territory Sales Executive',
    target: 98000,
    manager: 'BM003',
    territory: 'Rajasthan',
  },
  {
    id: 'BM257',
    employeeId: 'BM257',
    name: 'Vinod Yadav',
    email: 'vinod.yadav@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-09-05',
    password: 'bm257@123',
    profilePicture: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543224',
    designation: 'Sales Executive',
    target: 112000,
    manager: 'BM004',
    territory: 'Pune',
  },
  {
    id: 'BM258',
    employeeId: 'BM258',
    name: 'Santosh Kumar',
    email: 'santosh.kumar@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-09-10',
    password: 'bm258@123',
    profilePicture: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543225',
    designation: 'Area Sales Executive',
    target: 106000,
    manager: 'BM005',
    territory: 'Chandigarh',
  },
  {
    id: 'BM259',
    employeeId: 'BM259',
    name: 'Mukesh Patel',
    email: 'mukesh.patel@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-09-15',
    password: 'bm259@123',
    profilePicture: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543226',
    designation: 'Sales Executive',
    target: 104000,
    manager: 'BM001',
    territory: 'Patna',
  },
  {
    id: 'BM260',
    employeeId: 'BM260',
    name: 'Ramesh Singh',
    email: 'ramesh.singh@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-09-20',
    password: 'bm260@123',
    profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543227',
    designation: 'Territory Sales Executive',
    target: 99000,
    manager: 'BM002',
    territory: 'Vadodara',
  },
  {
    id: 'BM261',
    employeeId: 'BM261',
    name: 'Prakash Jain',
    email: 'prakash.jain@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-09-25',
    password: 'bm261@123',
    profilePicture: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543228',
    designation: 'Sales Executive',
    target: 107000,
    manager: 'BM003',
    territory: 'Jaipur',
  },
  {
    id: 'BM262',
    employeeId: 'BM262',
    name: 'Naveen Kumar',
    email: 'naveen.kumar@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-10-01',
    password: 'bm262@123',
    profilePicture: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543229',
    designation: 'Area Sales Executive',
    target: 101000,
    manager: 'BM004',
    territory: 'Nashik',
  },
  {
    id: 'BM263',
    employeeId: 'BM263',
    name: 'Sanjay Gupta',
    email: 'sanjay.gupta@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-10-05',
    password: 'bm263@123',
    profilePicture: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543230',
    designation: 'Sales Executive',
    target: 103000,
    manager: 'BM005',
    territory: 'Ludhiana',
  },
  {
    id: 'BM264',
    employeeId: 'BM264',
    name: 'Ashok Sharma',
    email: 'ashok.sharma@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-10-10',
    password: 'bm264@123',
    profilePicture: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543231',
    designation: 'Territory Sales Executive',
    target: 96000,
    manager: 'BM001',
    territory: 'Gurgaon',
  },
  {
    id: 'BM265',
    employeeId: 'BM265',
    name: 'Dinesh Patel',
    email: 'dinesh.patel@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-10-15',
    password: 'bm265@123',
    profilePicture: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543232',
    designation: 'Sales Executive',
    target: 109000,
    manager: 'BM002',
    territory: 'Rajkot',
  },
  {
    id: 'BM266',
    employeeId: 'BM266',
    name: 'Mohan Singh',
    email: 'mohan.singh@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-10-20',
    password: 'bm266@123',
    profilePicture: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543233',
    designation: 'Area Sales Executive',
    target: 97000,
    manager: 'BM003',
    territory: 'Udaipur',
  },
  {
    id: 'BM267',
    employeeId: 'BM267',
    name: 'Gopal Kumar',
    email: 'gopal.kumar@company.com',
    role: 'employee',
    department: 'Sales',
    joinDate: '2024-10-25',
    password: 'bm267@123',
    profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+91 9876543234',
    designation: 'Sales Executive',
    target: 111000,
    manager: 'BM004',
    territory: 'Nagpur',
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
  }
};