// Data integrity and validation utilities
import { User, SalesRecord, AttendanceRecord } from '../types';

export interface DataValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Validate user data integrity
export const validateUserData = (users: User[]): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const employeeIds = new Set<string>();
  const usernames = new Set<string>();
  
  users.forEach((user, index) => {
    // Check for duplicate employee IDs
    if (employeeIds.has(user.employeeId)) {
      errors.push(`Duplicate employee ID found: ${user.employeeId}`);
    } else {
      employeeIds.add(user.employeeId);
    }
    
    // Check for duplicate usernames
    if (usernames.has(user.username)) {
      errors.push(`Duplicate username found: ${user.username}`);
    } else {
      usernames.add(user.username);
    }
    
    // Validate required fields
    if (!user.name || user.name.trim().length === 0) {
      errors.push(`User at index ${index} has empty name`);
    }
    
    if (!user.employeeId || user.employeeId.trim().length === 0) {
      errors.push(`User at index ${index} has empty employee ID`);
    }
    
    if (!user.username || user.username.trim().length === 0) {
      errors.push(`User at index ${index} has empty username`);
    }
    
    // Check for valid role
    if (!['admin', 'manager', 'employee'].includes(user.role)) {
      errors.push(`User ${user.employeeId} has invalid role: ${user.role}`);
    }
    
    // Warn about missing optional fields
    if (!user.phone) {
      warnings.push(`User ${user.employeeId} has no phone number`);
    }
    
    if (!user.designation) {
      warnings.push(`User ${user.employeeId} has no designation`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Validate sales data integrity
export const validateSalesData = (sales: SalesRecord[], users: User[]): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const userIds = new Set(users.map(u => u.id));
  
  sales.forEach((sale, index) => {
    // Check if user exists
    if (!userIds.has(sale.userId)) {
      errors.push(`Sales record ${sale.id} references non-existent user: ${sale.userId}`);
    }
    
    // Validate required fields
    if (!sale.productName || sale.productName.trim().length === 0) {
      errors.push(`Sales record ${sale.id} has empty product name`);
    }
    
    if (!sale.customer || sale.customer.trim().length === 0) {
      errors.push(`Sales record ${sale.id} has empty customer name`);
    }
    
    // Validate numeric fields
    if (sale.quantity <= 0) {
      errors.push(`Sales record ${sale.id} has invalid quantity: ${sale.quantity}`);
    }
    
    if (sale.unitPrice <= 0) {
      errors.push(`Sales record ${sale.id} has invalid unit price: ${sale.unitPrice}`);
    }
    
    if (sale.totalAmount <= 0) {
      errors.push(`Sales record ${sale.id} has invalid total amount: ${sale.totalAmount}`);
    }
    
    // Check calculation accuracy
    const expectedTotal = (sale.quantity * sale.unitPrice) - (sale.discount || 0);
    if (Math.abs(sale.totalAmount - expectedTotal) > 0.01) {
      errors.push(`Sales record ${sale.id} has incorrect total calculation`);
    }
    
    // Validate date format
    if (!sale.date || isNaN(Date.parse(sale.date))) {
      errors.push(`Sales record ${sale.id} has invalid date: ${sale.date}`);
    }
    
    // Warn about missing optional fields
    if (!sale.customerEmail && !sale.customerPhone) {
      warnings.push(`Sales record ${sale.id} has no customer contact information`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Validate attendance data integrity
export const validateAttendanceData = (attendance: AttendanceRecord[], users: User[]): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const userIds = new Set(users.map(u => u.id));
  
  attendance.forEach((record, index) => {
    // Check if user exists
    if (!userIds.has(record.userId)) {
      errors.push(`Attendance record ${record.id} references non-existent user: ${record.userId}`);
    }
    
    // Validate date format
    if (!record.date || isNaN(Date.parse(record.date))) {
      errors.push(`Attendance record ${record.id} has invalid date: ${record.date}`);
    }
    
    // Validate status
    if (!['present', 'absent', 'late'].includes(record.status)) {
      errors.push(`Attendance record ${record.id} has invalid status: ${record.status}`);
    }
    
    // Check time consistency
    if (record.checkIn && record.checkOut) {
      const checkInTime = new Date(record.checkIn).getTime();
      const checkOutTime = new Date(record.checkOut).getTime();
      
      if (checkOutTime <= checkInTime) {
        errors.push(`Attendance record ${record.id} has check-out time before check-in time`);
      }
      
      // Calculate total hours
      const totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
      if (totalHours > 24) {
        warnings.push(`Attendance record ${record.id} has unusually long work hours: ${totalHours.toFixed(2)} hours`);
      }
    }
    
    // Warn about incomplete records
    if (record.status === 'present' && !record.checkIn) {
      warnings.push(`Attendance record ${record.id} marked as present but no check-in time`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Comprehensive data validation
export const validateAllData = (
  users: User[],
  sales: SalesRecord[],
  attendance: AttendanceRecord[]
): DataValidationResult => {
  const userValidation = validateUserData(users);
  const salesValidation = validateSalesData(sales, users);
  const attendanceValidation = validateAttendanceData(attendance, users);
  
  return {
    isValid: userValidation.isValid && salesValidation.isValid && attendanceValidation.isValid,
    errors: [
      ...userValidation.errors,
      ...salesValidation.errors,
      ...attendanceValidation.errors,
    ],
    warnings: [
      ...userValidation.warnings,
      ...salesValidation.warnings,
      ...attendanceValidation.warnings,
    ],
  };
};

// Fix common data issues
export const fixDataIssues = (
  users: User[],
  sales: SalesRecord[],
  attendance: AttendanceRecord[]
): {
  users: User[];
  sales: SalesRecord[];
  attendance: AttendanceRecord[];
  fixesApplied: string[];
} => {
  const fixesApplied: string[] = [];
  
  // Fix user data
  const fixedUsers = users.map(user => {
    const fixed = { ...user };
    
    // Ensure username is lowercase with dots
    if (fixed.username !== fixed.username.toLowerCase().replace(/\s+/g, '.')) {
      fixed.username = fixed.username.toLowerCase().replace(/\s+/g, '.');
      fixesApplied.push(`Fixed username format for ${fixed.employeeId}`);
    }
    
    // Ensure isActive is set
    if (fixed.isActive === undefined) {
      fixed.isActive = true;
      fixesApplied.push(`Set active status for ${fixed.employeeId}`);
    }
    
    return fixed;
  });
  
  // Fix sales data
  const userIds = new Set(fixedUsers.map(u => u.id));
  const fixedSales = sales.filter(sale => {
    if (!userIds.has(sale.userId)) {
      fixesApplied.push(`Removed sales record ${sale.id} with invalid user reference`);
      return false;
    }
    return true;
  }).map(sale => {
    const fixed = { ...sale };
    
    // Recalculate total amount
    const expectedTotal = (sale.quantity * sale.unitPrice) - (sale.discount || 0);
    if (Math.abs(sale.totalAmount - expectedTotal) > 0.01) {
      fixed.totalAmount = expectedTotal;
      fixesApplied.push(`Fixed total amount calculation for sales record ${sale.id}`);
    }
    
    return fixed;
  });
  
  // Fix attendance data
  const fixedAttendance = attendance.filter(record => {
    if (!userIds.has(record.userId)) {
      fixesApplied.push(`Removed attendance record ${record.id} with invalid user reference`);
      return false;
    }
    return true;
  });
  
  return {
    users: fixedUsers,
    sales: fixedSales,
    attendance: fixedAttendance,
    fixesApplied,
  };
};