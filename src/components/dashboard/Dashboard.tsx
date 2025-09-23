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
  Filter,
  Activity,
  Briefcase,
  TrendingDown,
  CheckCircle2,
  XCircle
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

    // Calculate deals closed (successful sales)
    const dealsClosedToday = todaySales.length;
    const dealsClosedMonth = monthSales.length;
    
    // Calculate conversion rate (assuming 70% of sales are conversions for demo)
    const conversionRate = dealsClosedMonth > 0 ? Math.min(95, (dealsClosedMonth * 15) + 25) : 0;

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
      dealsClosedToday,
      dealsClosedMonth,
      conversionRate,
      avgDealSize: monthSales.length > 0 ? totalSalesThisMonth / monthSales.length : 0,
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {currentUser.role === 'admin' ? 'Admin Dashboard' : 'Sales Dashboard'}
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Team performance and analytics • Welcome back, {currentUser.name}!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            {currentUser.role === 'admin' && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <select
                  value={selectedManager}
                  onChange={(e) => setSelectedManager(e.target.value)}
                  className="w-full sm:w-48 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Export Team Data</span>
            </button>
          </div>
        </div>

        {/* Stats Cards - Market Standard Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Total Sales Card */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-6 h-6" />
                  <span className="text-green-100 text-sm font-medium">Total Sales</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold">₹{stats.totalSalesThisMonth.toLocaleString()}</div>
                <div className="text-green-100 text-sm mt-1">Sales Performance</div>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Deals Closed Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="text-blue-100 text-sm font-medium">Deals Closed</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold">{stats.dealsClosedMonth}</div>
                <div className="text-blue-100 text-sm mt-1">Successful Deals</div>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Briefcase className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Average Deal Size Card */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-purple-100 text-sm font-medium">Avg Deal Size</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold">₹{stats.avgDealSize.toLocaleString()}</div>
                <div className="text-purple-100 text-sm mt-1">Per Deal</div>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Target className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Conversion Rate Card */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-6 h-6" />
                  <span className="text-orange-100 text-sm font-medium">Conversion Rate</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
                <div className="text-orange-100 text-sm mt-1">Team Average</div>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Individual Performance Section */}
        {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Individual Performance
              </h3>
              <button
                onClick={() => handleExportTeamData()}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            
            <div className="space-y-4">
              {visibleUsers.slice(0, 5).map(user => {
                const userSales = visibleSales.filter(sale => sale.userId === user.id);
                const userTotalSales = userSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
                const userDealsCount = userSales.length;
                const userConversionRate = userDealsCount > 0 ? Math.min(100, (userDealsCount * 12) + 15) : 0;
                
                return (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.designation || user.role}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">₹{userTotalSales.toLocaleString()}</div>
                        <div className="text-gray-500">Total Sales</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{userDealsCount}</div>
                        <div className="text-gray-500">Deals Closed</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{userConversionRate.toFixed(1)}%</div>
                        <div className="text-gray-500">Conversion</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Team Structure - Only for Admin and Managers */}
        {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Team Structure
              </h3>
              <div className="text-sm text-gray-600">
                {currentUser.role === 'admin' ? `${managers.length} managers, ${stats.totalEmployees} total employees` : 'Your team overview'}
              </div>
            </div>
            
            {managers
              .filter(manager => currentUser.role === 'admin' || manager.id === currentUser.id)
              .map(manager => (
              <div key={manager.id} className="mb-6 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {/* Manager Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleManagerExpansion(manager.id)}
                        className="p-1 hover:bg-white rounded-lg transition-colors duration-200"
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
                    
                    <div className="flex flex-wrap items-center gap-4 lg:gap-6">
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
                          className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-2 px-3 rounded-lg transition-all duration-300 border border-gray-200 shadow-sm text-sm flex items-center gap-1"
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {teamStructure[manager.id].slice(0, 12).map(employee => (
                        <div key={employee.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={employee.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=6366f1&color=fff`}
                              alt={employee.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 truncate">{employee.name}</h5>
                              <p className="text-xs text-gray-600 truncate">{employee.designation}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">ID:</span>
                              <span className="font-medium text-gray-900">{employee.employeeId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Territory:</span>
                              <span className="font-medium text-xs truncate ml-1 text-gray-900">{employee.territory}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Target:</span>
                              <span className="font-medium text-green-600">₹{(employee.target || 0) > 1000 ? ((employee.target || 0) / 1000).toFixed(0) + 'K' : (employee.target || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Phone:</span>
                              <span className="font-medium text-xs text-gray-900">{employee.phone}</span>
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
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Weekly Sales Trend
            </h3>
            <div className="bg-white">
              <WeeklySalesChart sales={visibleSales} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Monthly Sales Overview
            </h3>
            <div className="bg-white">
              <MonthlySalesChart sales={visibleSales} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Attendance Trends
          </h3>
          <div className="bg-white">
            <AttendanceChart attendance={visibleAttendance} />
          </div>
        </div>

        {/* Recent Team Activity */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Recent Team Activity
          </h3>
          
          <div className="space-y-4">
            {visibleSales.slice(0, 5).map(sale => {
              const user = users.find(u => u.id === sale.userId);
              return (
                <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {user?.name || 'Unknown'} closed a deal
                      </div>
                      <div className="text-sm text-gray-500">
                        {sale.productName} • {sale.customer}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">₹{sale.totalAmount.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{new Date(sale.date).toLocaleDateString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};