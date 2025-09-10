// Real-time data capture and synchronization utilities
import { User, SalesRecord, AttendanceRecord } from '../types';
import { 
  getUsers, 
  getSalesRecords, 
  getAttendanceRecords,
  saveUsers,
  saveSalesRecords,
  saveAttendanceRecords
} from './storage';

// Real-time data synchronization
export class RealTimeDataManager {
  private static instance: RealTimeDataManager;
  private listeners: Map<string, Function[]> = new Map();
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startRealTimeSync();
  }

  public static getInstance(): RealTimeDataManager {
    if (!RealTimeDataManager.instance) {
      RealTimeDataManager.instance = new RealTimeDataManager();
    }
    return RealTimeDataManager.instance;
  }

  // Start real-time synchronization
  private startRealTimeSync() {
    // Sync data every 30 seconds
    this.syncInterval = setInterval(() => {
      this.syncData();
    }, 30000);

    // Also sync on visibility change (when user returns to tab)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.syncData();
      }
    });

    // Sync on storage events (when data changes in another tab)
    window.addEventListener('storage', (e) => {
      if (e.key?.startsWith('crm_')) {
        this.syncData();
      }
    });
  }

  // Add listener for data changes
  public addListener(dataType: string, callback: Function) {
    if (!this.listeners.has(dataType)) {
      this.listeners.set(dataType, []);
    }
    this.listeners.get(dataType)?.push(callback);
  }

  // Remove listener
  public removeListener(dataType: string, callback: Function) {
    const callbacks = this.listeners.get(dataType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notify listeners of data changes
  private notifyListeners(dataType: string, data: any) {
    const callbacks = this.listeners.get(dataType);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Sync all data
  private syncData() {
    try {
      const users = getUsers();
      const sales = getSalesRecords();
      const attendance = getAttendanceRecords();

      this.notifyListeners('users', users);
      this.notifyListeners('sales', sales);
      this.notifyListeners('attendance', attendance);
    } catch (error) {
      console.error('Error syncing data:', error);
    }
  }

  // Force sync data immediately
  public forcSync() {
    this.syncData();
  }

  // Update user data with real-time sync
  public updateUsers(users: User[]) {
    saveUsers(users);
    this.notifyListeners('users', users);
    this.logDataChange('users', users.length);
  }

  // Update sales data with real-time sync
  public updateSales(sales: SalesRecord[]) {
    saveSalesRecords(sales);
    this.notifyListeners('sales', sales);
    this.logDataChange('sales', sales.length);
  }

  // Update attendance data with real-time sync
  public updateAttendance(attendance: AttendanceRecord[]) {
    saveAttendanceRecords(attendance);
    this.notifyListeners('attendance', attendance);
    this.logDataChange('attendance', attendance.length);
  }

  // Log data changes for debugging
  private logDataChange(dataType: string, count: number) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Real-time sync: ${dataType} updated (${count} records)`);
    
    // Store sync log in localStorage for debugging
    const syncLog = JSON.parse(localStorage.getItem('crm_sync_log') || '[]');
    syncLog.push({
      timestamp,
      dataType,
      count,
      action: 'update'
    });
    
    // Keep only last 100 log entries
    if (syncLog.length > 100) {
      syncLog.splice(0, syncLog.length - 100);
    }
    
    localStorage.setItem('crm_sync_log', JSON.stringify(syncLog));
  }

  // Get sync statistics
  public getSyncStats() {
    const syncLog = JSON.parse(localStorage.getItem('crm_sync_log') || '[]');
    const now = new Date();
    const last24Hours = syncLog.filter((log: any) => {
      const logTime = new Date(log.timestamp);
      return (now.getTime() - logTime.getTime()) < 24 * 60 * 60 * 1000;
    });

    return {
      totalSyncs: syncLog.length,
      last24Hours: last24Hours.length,
      lastSync: syncLog.length > 0 ? syncLog[syncLog.length - 1].timestamp : null,
      dataTypes: {
        users: syncLog.filter((log: any) => log.dataType === 'users').length,
        sales: syncLog.filter((log: any) => log.dataType === 'sales').length,
        attendance: syncLog.filter((log: any) => log.dataType === 'attendance').length,
      }
    };
  }

  // Clean up
  public destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.listeners.clear();
  }
}

// Export singleton instance
export const realTimeDataManager = RealTimeDataManager.getInstance();

// Utility functions for real-time data operations
export const captureRealTimeData = {
  // Capture user login
  userLogin: (user: User) => {
    const users = getUsers();
    const updatedUsers = users.map(u => 
      u.id === user.id 
        ? { ...u, lastLogin: new Date().toISOString() }
        : u
    );
    realTimeDataManager.updateUsers(updatedUsers);
  },

  // Capture sales entry
  salesEntry: (sale: SalesRecord) => {
    const sales = getSalesRecords();
    const updatedSales = [...sales, { ...sale, submittedAt: new Date().toISOString() }];
    realTimeDataManager.updateSales(updatedSales);
  },

  // Capture attendance
  attendance: (attendance: AttendanceRecord) => {
    const attendanceRecords = getAttendanceRecords();
    const updatedAttendance = [...attendanceRecords, attendance];
    realTimeDataManager.updateAttendance(updatedAttendance);
  },

  // Capture user profile update
  profileUpdate: (userId: string, updates: Partial<User>) => {
    const users = getUsers();
    const updatedUsers = users.map(u => 
      u.id === userId 
        ? { ...u, ...updates, lastUpdated: new Date().toISOString() }
        : u
    );
    realTimeDataManager.updateUsers(updatedUsers);
  },

  // Capture data export
  dataExport: (exportType: string, recordCount: number) => {
    const exportLog = JSON.parse(localStorage.getItem('crm_export_log') || '[]');
    exportLog.push({
      timestamp: new Date().toISOString(),
      exportType,
      recordCount,
      userId: JSON.parse(localStorage.getItem('crm_current_user') || '{}').id
    });
    localStorage.setItem('crm_export_log', JSON.stringify(exportLog));
  }
};

// Real-time validation
export const validateRealTimeData = {
  // Validate before saving
  beforeSave: (dataType: string, data: any): boolean => {
    try {
      switch (dataType) {
        case 'users':
          return Array.isArray(data) && data.every(user => user.id && user.employeeId);
        case 'sales':
          return Array.isArray(data) && data.every(sale => sale.id && sale.userId && sale.totalAmount > 0);
        case 'attendance':
          return Array.isArray(data) && data.every(att => att.id && att.userId && att.date);
        default:
          return false;
      }
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  },

  // Check data integrity
  checkIntegrity: (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    try {
      const users = getUsers();
      const sales = getSalesRecords();
      const attendance = getAttendanceRecords();

      // Check user references in sales
      const userIds = new Set(users.map(u => u.id));
      sales.forEach(sale => {
        if (!userIds.has(sale.userId)) {
          errors.push(`Sales record ${sale.id} references non-existent user ${sale.userId}`);
        }
      });

      // Check user references in attendance
      attendance.forEach(att => {
        if (!userIds.has(att.userId)) {
          errors.push(`Attendance record ${att.id} references non-existent user ${att.userId}`);
        }
      });

      return { isValid: errors.length === 0, errors };
    } catch (error) {
      return { isValid: false, errors: ['Data integrity check failed'] };
    }
  }
};