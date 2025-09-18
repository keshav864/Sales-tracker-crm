// Data privacy utilities for role-based access control
import { User, SalesRecord, AttendanceRecord } from '../types';

// Get users that a manager can see (only their team members)
export const getVisibleUsers = (currentUser: User, allUsers: User[]): User[] => {
  if (currentUser.role === 'admin') {
    return allUsers; // Admin can see all users
  }
  
  if (currentUser.role === 'manager') {
    // Manager can see their direct reports only
    return allUsers.filter(user => 
      user.manager === currentUser.id || user.id === currentUser.id
    );
  }
  
  // Employee can only see themselves
  return allUsers.filter(user => user.id === currentUser.id);
};

// Get sales records that a user can see based on their role
export const getVisibleSalesRecords = (currentUser: User, allSales: SalesRecord[], allUsers: User[]): SalesRecord[] => {
  if (currentUser.role === 'admin') {
    return allSales; // Admin can see all sales
  }
  
  if (currentUser.role === 'manager') {
    // Manager can see sales from their team members only
    const teamUserIds = allUsers
      .filter(user => user.manager === currentUser.id || user.id === currentUser.id)
      .map(user => user.id);
    
    return allSales.filter(sale => teamUserIds.includes(sale.userId));
  }
  
  // Employee can only see their own sales
  return allSales.filter(sale => sale.userId === currentUser.id);
};

// Get attendance records that a user can see based on their role
export const getVisibleAttendanceRecords = (currentUser: User, allAttendance: AttendanceRecord[], allUsers: User[]): AttendanceRecord[] => {
  if (currentUser.role === 'admin') {
    return allAttendance; // Admin can see all attendance
  }
  
  if (currentUser.role === 'manager') {
    // Manager can see attendance from their team members only
    const teamUserIds = allUsers
      .filter(user => user.manager === currentUser.id || user.id === currentUser.id)
      .map(user => user.id);
    
    return allAttendance.filter(attendance => teamUserIds.includes(attendance.userId));
  }
  
  // Employee can only see their own attendance
  return allAttendance.filter(attendance => attendance.userId === currentUser.id);
};

// Get team hierarchy for a manager
export const getTeamHierarchy = (managerId: string, allUsers: User[]): { manager: User; teamMembers: User[] } | null => {
  const manager = allUsers.find(user => user.id === managerId);
  if (!manager || manager.role !== 'manager') {
    return null;
  }
  
  const teamMembers = allUsers.filter(user => user.manager === managerId);
  
  return {
    manager,
    teamMembers
  };
};

// Check if user can view another user's data
export const canViewUserData = (currentUser: User, targetUserId: string, allUsers: User[]): boolean => {
  if (currentUser.role === 'admin') {
    return true; // Admin can view all data
  }
  
  if (currentUser.id === targetUserId) {
    return true; // User can view their own data
  }
  
  if (currentUser.role === 'manager') {
    // Manager can view their team members' data
    const targetUser = allUsers.find(user => user.id === targetUserId);
    return targetUser?.manager === currentUser.id;
  }
  
  return false; // Employee cannot view others' data
};

// Get reporting structure for display
export const getReportingStructure = (allUsers: User[]): { [managerId: string]: User[] } => {
  const structure: { [managerId: string]: User[] } = {};
  
  const managers = allUsers.filter(user => user.role === 'manager');
  
  managers.forEach(manager => {
    structure[manager.id] = allUsers.filter(user => user.manager === manager.id);
  });
  
  return structure;
};