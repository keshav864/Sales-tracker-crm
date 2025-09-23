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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, {currentUser.name}!
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Here's what's happening with your {currentUser.role === 'admin' ? 'organization' : 'team'} today.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {currentUser.role === 'admin' && (
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
                className="input-field w-full sm:max-w-xs text-sm"
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
            className="btn-secondary flex items-center space-x-2 text-sm px-3 py-2"
          >
            <Download className="w-5 h-5" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-xl p-3 mr-4 shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Employees</h3>
              <p className="text-xl md:text-2xl font-bold text-black">{stats.totalEmployees}</p>
              <p className="text-xs md:text-sm text-blue-600 mt-1">
                {currentUser.role === 'admin' ? 'All' : 'Team'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-xl p-3 mr-4 shadow-lg">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Present Today</h3>
              <p className="text-xl md:text-2xl font-bold text-black">{stats.presentToday}</p>
              <p className="text-xs md:text-sm text-green-600 mt-1">
                {stats.lateToday > 0 ? `+${stats.lateToday} late` : 'On time'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-xl p-3 mr-4 shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Sales Today</h3>
              <p className="text-lg md:text-2xl font-bold text-black">₹{stats.totalSalesToday.toLocaleString()}</p>
              <p className="text-xs md:text-sm text-purple-600 mt-1">
                Month: ₹{(stats.totalSalesThisMonth / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="bg-orange-500 rounded-xl p-3 mr-4 shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Achievement</h3>
              <p className="text-xl md:text-2xl font-bold text-black">{stats.achievementRate.toFixed(1)}%</p>
              <p className="text-xs md:text-sm text-orange-600 mt-1">
                Target: ₹{(stats.totalTarget / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Structure - Only for Admin and Managers */}
      {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-black">Team Structure</h3>
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
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
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
                      <h4 className="font-semibold text-black text-lg">{manager.name}</h4>
                      <p className="text-blue-600 font-medium">{manager.designation}</p>
                      <p className="text-sm text-gray-600">{manager.territory}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 lg:space-x-6">
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
                      <p className="font-medium text-black">{manager.phone}</p>
                    </div>
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => handleExportTeamData(manager.id)}
                        className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-1 px-2 rounded-xl transition-all duration-300 border border-gray-200 shadow-sm text-xs flex items-center space-x-1"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                    {teamStructure[manager.id].slice(0, 12).map(employee => (
                      <div key={employee.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <img
                            src={employee.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=6366f1&color=fff`}
                            alt={employee.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h5 className="font-medium text-black">{employee.name}</h5>
                            <p className="text-xs text-gray-600">{employee.designation}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">ID:</span>
                            <span className="font-medium text-black">{employee.employeeId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Territory:</span>
                            <span className="font-medium text-xs truncate ml-1 text-black">{employee.territory}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Target:</span>
                            <span className="font-medium text-green-600">₹{(employee.target || 0) > 1000 ? ((employee.target || 0) / 1000).toFixed(0) + 'K' : (employee.target || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium text-xs text-black">{employee.phone}</span>
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
                            {employee.lastLogin ? new Date(employee.lastLogin).toLocaleDateString() : 'Never'}
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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-black mb-4">Weekly Sales Trend</h3>
          <div className="bg-white">
            <WeeklySalesChart sales={visibleSales} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-black mb-4">Monthly Sales Overview</h3>
          <div className="bg-white">
            <MonthlySalesChart sales={visibleSales} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-black mb-4">Attendance Trends</h3>
        <div className="bg-white">
          <AttendanceChart attendance={visibleAttendance} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center hover:shadow-xl transition-all duration-300">
          <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h4 className="font-semibold text-black mb-2">Mark Attendance</h4>
          <p className="text-gray-600 text-sm mb-4">Quick check-in/out for today</p>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-xl transition-all duration-300 w-full">
            Check In/Out
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center hover:shadow-xl transition-all duration-300">
          <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h4 className="font-semibold text-black mb-2">Add Sale</h4>
          <p className="text-gray-600 text-sm mb-4">Record a new sales transaction</p>
          <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-xl transition-all duration-300 w-full">
            Add Sale
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center hover:shadow-xl transition-all duration-300">
          <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h4 className="font-semibold text-black mb-2">View Reports</h4>
          <p className="text-gray-600 text-sm mb-4">Detailed analytics and insights</p>
          <button className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-2 md:py-3 px-4 md:px-6 rounded-xl transition-all duration-300 border border-gray-200 shadow-sm w-full">
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
};