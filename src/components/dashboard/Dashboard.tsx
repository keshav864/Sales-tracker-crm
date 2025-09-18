import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Target, 
  Calendar,
  BarChart3,
  Award,
  DollarSign,
  UserCheck,
  UserX,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Download,
  Filter
} from 'lucide-react';
import { User, AttendanceRecord, SalesRecord } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { getVisibleUsers, getVisibleSalesRecords, getVisibleAttendanceRecords } from '../../utils/dataPrivacy';
import { WeeklySalesChart } from './WeeklySalesChart';
import { MonthlySalesChart } from './MonthlySalesChart';
import { AttendanceChart } from './AttendanceChart';
import { exportToCSV } from '../../utils/storage';

interface DashboardProps {
  users: User[];
  attendance: AttendanceRecord[];
  sales: SalesRecord[];
  currentUser: User;
}

export const Dashboard: React.FC<DashboardProps> = ({
  users,
  attendance,
  sales,
  currentUser,
}) => {
  const [selectedManager, setSelectedManager] = useState<string>('all');
  const [expandedManagers, setExpandedManagers] = useState<Set<string>>(new Set());
  const [visibleSales, setVisibleSales] = useState<SalesRecord[]>([]);
  const [visibleAttendance, setVisibleAttendance] = useState<AttendanceRecord[]>([]);

  // Get visible data based on user role and selected manager filter
  const visibleUsers = useMemo(() => {
    let filtered = getVisibleUsers(currentUser, users);
    
    if (selectedManager !== 'all' && currentUser.role === 'admin') {
      filtered = filtered.filter(user => 
        user.manager === selectedManager || user.id === selectedManager
      );
    }
    
    return filtered;
  }, [currentUser, users, selectedManager]);

  // Update visible data when dependencies change
  useEffect(() => {
    setVisibleSales(getVisibleSalesRecords(currentUser, sales, users));
    setVisibleAttendance(getVisibleAttendanceRecords(currentUser, attendance, users));
  }, [currentUser, sales, attendance, users]);

  // Get managers for dropdown (only for admin)
  const managers = useMemo(() => 
    users.filter(user => user.role === 'manager'),
    [users]
  );

  // Get team structure
  const teamStructure = useMemo(() => {
    const structure: Record<string, User[]> = {};
    
    managers.forEach(manager => {
      structure[manager.id] = visibleUsers.filter(user => user.manager === manager.id);
    });
    
    return structure;
  }, [visibleUsers, managers]);

  // Calculate dashboard statistics
  const stats = useMemo(() => {
    const today = formatDate(new Date());
    const todayAttendance = visibleAttendance.filter(record => record.date === today);
    
    const presentToday = todayAttendance.filter(record => record.status === 'present').length;
    const lateToday = todayAttendance.filter(record => record.status === 'late').length;
    const absentToday = visibleUsers.length - presentToday - lateToday;
    
    const todaySales = visibleSales.filter(record => record.date === today);
    const totalSalesToday = todaySales.reduce((sum, record) => sum + record.totalAmount, 0);
    
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthSales = visibleSales.filter(record => record.date.startsWith(thisMonth));
    const totalSalesThisMonth = monthSales.reduce((sum, record) => sum + record.totalAmount, 0);
    
    const totalTarget = visibleUsers.reduce((sum, user) => sum + (user.target || 0), 0);
    const achievementRate = totalTarget > 0 ? (totalSalesThisMonth / totalTarget) * 100 : 0;

    return {
      totalEmployees: visibleUsers.length,
      presentToday,
      lateToday,
      absentToday,
      totalSalesToday,
      totalSalesThisMonth,
      totalTarget,
      achievementRate,
      totalRevenue: visibleSales.reduce((sum, record) => sum + record.totalAmount, 0),
    };
  }, [visibleUsers, visibleAttendance, visibleSales]);

  const toggleManagerExpansion = (managerId: string) => {
    const newExpanded = new Set(expandedManagers);
    if (newExpanded.has(managerId)) {
      newExpanded.delete(managerId);
    } else {
      newExpanded.add(managerId);
    }
    setExpandedManagers(newExpanded);
  };

  const handleExportTeamData = (managerId?: string) => {
    let dataToExport = managerId 
      ? users.filter(u => u.manager === managerId || u.id === managerId)
      : visibleUsers;

    const exportData = dataToExport.map(user => ({
      'Employee ID': user.employeeId,
      'Name': user.name,
      'Username': user.username,
      'Role': user.role,
      'Department': user.department,
      'Designation': user.designation || '',
      'Phone': user.phone || '',
      'Territory': user.territory || '',
      'Target': user.target || 0,
      'Manager': users.find(u => u.id === user.manager)?.name || 'None',
      'Join Date': user.joinDate,
      'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never',
      'Status': user.isActive !== false ? 'Active' : 'Inactive',
    }));

    const filename = managerId 
      ? `team_data_${users.find(u => u.id === managerId)?.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`
      : `dashboard_data_${new Date().toISOString().split('T')[0]}`;

    exportToCSV(exportData, filename);
  };

  return (
    <div className="space-y-6 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {currentUser.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your {currentUser.role === 'admin' ? 'organization' : 'team'} today.
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {currentUser.role === 'admin' && (
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
                className="input-field max-w-xs"
              >
                <option value="all">All Teams</option>
                {managers.map(manager => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name} ({teamStructure[manager.id]?.length || 0} members)
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <button
            onClick={() => handleExportTeamData()}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card hover-lift">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-xl p-3 mr-4 shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Employees</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
              <p className="text-sm text-blue-600 mt-1">
                {currentUser.role === 'admin' ? 'All employees' : 'Your team'}
              </p>
            </div>
          </div>
        </div>

        <div className="card hover-lift">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-xl p-3 mr-4 shadow-lg">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Present Today</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.presentToday}</p>
              <p className="text-sm text-green-600 mt-1">
                {stats.lateToday > 0 && `+${stats.lateToday} late`}
              </p>
            </div>
          </div>
        </div>

        <div className="card hover-lift">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-xl p-3 mr-4 shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Sales Today</h3>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalSalesToday.toLocaleString()}</p>
              <p className="text-sm text-purple-600 mt-1">
                This month: ₹{stats.totalSalesThisMonth.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card hover-lift">
          <div className="flex items-center">
            <div className="bg-orange-500 rounded-xl p-3 mr-4 shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Achievement</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.achievementRate.toFixed(1)}%</p>
              <p className="text-sm text-orange-600 mt-1">
                Target: ₹{stats.totalTarget.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Structure - Only for Admin and Managers */}
      {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Team Structure</h3>
            <div className="text-sm text-gray-600">
              {currentUser.role === 'admin' ? `${managers.length} managers, ${stats.totalEmployees} total employees` : 'Your team overview'}
            </div>
          </div>
          
          {managers
            .filter(manager => currentUser.role === 'admin' || manager.id === currentUser.id)
            .map(manager => (
            <div key={manager.id} className="mb-6 bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Manager Header */}
              <div className="bg-white p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleManagerExpansion(manager.id)}
                      className="p-1 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    >
                      {expandedManagers.has(manager.id) ? (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                    
                    <img
                      src={manager.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(manager.name)}&background=6366f1&color=fff`}
                      alt={manager.name}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                    />
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{manager.name}</h4>
                      <p className="text-blue-600 font-medium">{manager.designation}</p>
                      <p className="text-sm text-gray-600">{manager.territory}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Team Size</p>
                      <p className="font-bold text-blue-600 text-xl">{teamStructure[manager.id]?.length || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Target</p>
                      <p className="font-bold text-green-600 text-xl">₹{manager.target?.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{manager.phone}</p>
                    </div>
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => handleExportTeamData(manager.id)}
                        className="btn-secondary text-sm py-2 px-3 flex items-center space-x-1"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Team Members */}
              {expandedManagers.has(manager.id) && teamStructure[manager.id] && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {teamStructure[manager.id].map(employee => (
                      <div key={employee.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <img
                            src={employee.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=6366f1&color=fff`}
                            alt={employee.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{employee.name}</h5>
                            <p className="text-sm text-gray-600">{employee.designation}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">ID:</span>
                            <span className="font-medium">{employee.employeeId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Territory:</span>
                            <span className="font-medium text-xs">{employee.territory}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Target:</span>
                            <span className="font-medium text-green-600">₹{employee.target?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium text-xs">{employee.phone}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            employee.isActive !== false 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {employee.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                          
                          <div className="text-xs text-gray-500">
                            Last login: {employee.lastLogin ? new Date(employee.lastLogin).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Sales Trend</h3>
          <WeeklySalesChart sales={visibleSales} />
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Sales Overview</h3>
          <MonthlySalesChart sales={visibleSales} />
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trends</h3>
        <AttendanceChart attendance={visibleAttendance} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center hover-lift">
          <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h4 className="font-semibold text-gray-900 mb-2">Mark Attendance</h4>
          <p className="text-gray-600 text-sm mb-4">Quick check-in/out for today</p>
          <button className="btn-primary w-full">
            Check In/Out
          </button>
        </div>

        <div className="card text-center hover-lift">
          <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h4 className="font-semibold text-gray-900 mb-2">Add Sale</h4>
          <p className="text-gray-600 text-sm mb-4">Record a new sales transaction</p>
          <button className="btn-success w-full">
            Add Sale
          </button>
        </div>

        <div className="card text-center hover-lift">
          <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h4 className="font-semibold text-gray-900 mb-2">View Reports</h4>
          <p className="text-gray-600 text-sm mb-4">Detailed analytics and insights</p>
          <button className="btn-secondary w-full">
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
};