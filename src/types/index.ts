export interface User {
  id: string;
  employeeId: string;
  name: string;
  username: string;
  role: 'admin' | 'manager' | 'employee';
  department: string;
  profilePicture?: string;
  joinDate: string;
  password: string;
  phone?: string;
  designation?: string;
  target?: number;
  manager?: string | null;
  territory?: string;
  isActive?: boolean;
  lastLogin?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  model: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late';
  breakTime?: number; // in minutes
  totalHours?: number;
  location?: string;
  notes?: string;
}

export interface SalesRecord {
  id: string;
  userId: string;
  date: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customer: string;
  category: string;
  // Extended CRM properties
  customerEmail?: string;
  customerPhone?: string;
  customerCompany?: string;
  customerAddress?: string;
  productCode?: string;
  discount?: number;
  paymentMethod?: string;
  paymentStatus?: 'paid' | 'pending' | 'partial' | 'overdue';
  notes?: string;
  leadSource?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  submittedAt?: string;
  dealStage?: 'prospect' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  commission?: number;
  territory?: string;
}

export interface SalesTarget {
  id: string;
  userId: string;
  month: string;
  target: number;
  achieved: number;
  commission: number;
}

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  totalSalesToday: number;
  totalSalesThisMonth: number;
  topPerformer: string;
  averagePerformance: number;
  totalRevenue: number;
  conversionRate: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}