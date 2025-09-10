// Input validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const validateEmployeeId = (employeeId: string): boolean => {
  // Employee ID should be alphanumeric and 3-10 characters
  const idRegex = /^[A-Z0-9]{3,10}$/;
  return idRegex.test(employeeId);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/[A-Za-z]/.test(password)) {
    errors.push('Password must contain at least one letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateSalesRecord = (record: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!record.productName || record.productName.trim().length === 0) {
    errors.push('Product name is required');
  }
  
  if (!record.customer || record.customer.trim().length === 0) {
    errors.push('Customer name is required');
  }
  
  if (!record.quantity || record.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }
  
  if (!record.unitPrice || record.unitPrice <= 0) {
    errors.push('Unit price must be greater than 0');
  }
  
  if (record.customerEmail && !validateEmail(record.customerEmail)) {
    errors.push('Invalid email format');
  }
  
  if (record.customerPhone && !validatePhone(record.customerPhone)) {
    errors.push('Invalid phone number format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};