import React, { useState, useMemo } from 'react';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Target, 
  DollarSign, 
  Award,
  Filter,
  Search,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Building,
  MapPin,
  Phone
} from 'lucide-react';
import { User, SalesRecord, AttendanceRecord } from '../../types';
import { StatsCard } from './StatsCard';
import { WeeklySalesChart } from './WeeklySalesChart';
import { MonthlySalesChart } from './MonthlySalesChart';
import { AttendanceChart } from './AttendanceChart';
import { 
  getUsers, 
  getSalesRecords, 
  getAttendanceRecords,
  exportToCSV 
} from '../../utils/storage';
import { formatDate } from '../../utils/dateUtils';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [selectedManager, setSelectedManager] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'overview' | 'team' | 'analytics'>('overview');

  const allUsers = getUsers();
  const allSales = getSalesRecords();
  const allAttendance = getAttendanceRecords();

  // Get managers and team structure
  const managers = useMemo(() => 
    allUsers.filter(u => u.role === 'manager'),
    [allUsers]
  );

  const teamStructure = useMemo(() => {
    const structure: Record<string, User[]> = {};
    managers.forEach(manager => {
      structure[manager.id] = allUsers.filter(u => u.manager === manager.id);
    });
    return structure;
  }, [allUsers, managers]);

  // Filter users based on role and selection
  const visibleUsers = useMemo(() => {
    let filtered = allUsers;
    
    if (user.role === 'manager') {
      // Manager can only see their team
      filtered = allUsers.filter(u => u.manager === user.id || u.id === user.id);
    } else if (user.role === 'employee') {
      // Employee can only see themselves
      filtered = [user];
    }
    
    if (selectedManager !== 'all') {
      filtered = filtered.filter(u => u.manager === selectedManager || u.id === selectedManager);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.territory?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [allUsers, user, selectedManager, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    const today = formatDate(new Date());
    const thisMonth = new Date().toISOString().slice(0, 7);
    
    const todayAttendance = allAttendance.filter(a => a.date === today);
    const thisMonthSales = allSales.filter(s => s.date.startsWith(thisMonth));
    
    return {
      totalEmployees: allUsers.length,
      totalManagers: managers.length,
      presentToday: todayAttendance.filter(a => a.status === 'present').length,
      absentToday: todayAttendance.filter(a => a.status === 'absent').length,
      lateToday: todayAttendance.filter(a => a.status === 'late').length,
      totalSalesToday: allSales.filter(s => s.date === today).reduce((sum, s) => sum + s.totalAmount, 0),
      totalSalesThisMonth: thisMonthSales.reduce((sum, s) => sum + s.totalAmount, 0),
      totalTarget: allUsers.reduce((sum, u) => sum + (u.target || 0), 0),
      activeEmployees: allUsers.filter(u => u.isActive !== false).length,
    };
  }, [allUsers, allSales, allAttendance, managers]);

  const handleExportTeam = (managerId?: string) => {
    const dataToExport = managerId 
      ? allUsers.filter(u => u.manager === managerId || u.id === managerId)
      : visibleUsers;

    const exportData = dataToExport.map(emp => ({
      'Employee ID': emp.employeeId,
      'Name': emp.name,
      'Role': emp.role,
      'Department': emp.department,
      'Designation': emp.designation || '',
      'Territory': emp.territory || '',
      'Phone': emp.phone || '',
      'Target': emp.target || 0,
      'Manager': allUsers.find(u => u.id === emp.manager)?.name || 'None',
      'Status': emp.isActive !== false ? 'Active' : 'Inactive',
    }));

    const filename = managerId 
      ? `team_${allUsers.find(u => u.id === managerId)?.name.replace(/\s+/g, '_')}_${formatDate(new Date())}`
      : `dashboard_data_${formatDate(new Date())}`;

    exportToCSV(exportData, filename);
  };

  return (
    <div className="space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              {user.role === 'admin' ? 'System Overview' : 
               user.role === 'manager' ? 'Team Management Dashboard' : 
               'Personal Dashboard'}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
            
            {(user.role === 'admin' || user.role === 'manager') && (
              <select
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Teams</option>
                {managers.map(manager => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name} ({teamStructure[manager.id]?.length || 0} members)
                  </option>
                ))}
              </select>
            )}
            
            <button
              onClick={() => handleExportTeam()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveView('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeView === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          {(user.role === 'admin' || user.role === 'manager') && (
            <button
              onClick={() => setActiveView('team')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeView === 'team'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Team Structure
            </button>
          )}
          <button
            onClick={() => setActiveView('analytics')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeView === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Analytics
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Employees"
              value={stats.totalEmployees}
              icon={Users}
              color="blue"
              trend={{ value: 5, isPositive: true }}
            />
            <StatsCard
              title="Managers"
              value={stats.totalManagers}
              icon={Building}
              color="green"
            />
            <StatsCard
              title="Present Today"
              value={stats.presentToday}
              icon={Clock}
              color="green"
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Monthly Sales"
              value={`₹${stats.totalSalesThisMonth.toLocaleString()}`}
              icon={TrendingUp}
              color="purple"
              trend={{ value: 8, isPositive: true }}
            />
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 rounded-xl p-3 mr-4">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Total Target</h3>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.totalTarget.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-red-100 rounded-xl p-3 mr-4">
                  <Users className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Absent Today</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.absentToday}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-orange-100 rounded-xl p-3 mr-4">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Late Today</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.lateToday}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Structure Tab */}
      {activeView === 'team' && (user.role === 'admin' || user.role === 'manager') && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Team Structure</h3>
            
            {managers.map(manager => (
              <div key={manager.id} className="mb-8 border border-gray-200 rounded-xl overflow-hidden">
                {/* Manager Header */}
                <div className="bg-gray-50 p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={manager.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(manager.name)}&background=6366f1&color=fff`}
                        alt={manager.name}
                        className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm"
                      />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{manager.name}</h4>
                        <p className="text-blue-600 font-medium">{manager.designation}</p>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {manager.territory}
                          </span>
                          <span className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {manager.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Team Size</p>
                        <p className="text-2xl font-bold text-blue-600">{teamStructure[manager.id]?.length || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Target</p>
                        <p className="text-2xl font-bold text-green-600">₹{manager.target?.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => handleExportTeam(manager.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export Team</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamStructure[manager.id]?.map(employee => (
                      <div key={employee.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <img
                            src={employee.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=6366f1&color=fff`}
                            alt={employee.name}
                            className="w-12 h-12 rounded-lg object-cover"
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
                            <span className="font-medium">{employee.territory}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Target:</span>
                            <span className="font-medium text-green-600">₹{employee.target?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{employee.phone}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            employee.isActive !== false 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {employee.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeView === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Sales Trend</h3>
              <WeeklySalesChart sales={allSales} />
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Sales</h3>
              <MonthlySalesChart sales={allSales} />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview</h3>
            <AttendanceChart attendance={allAttendance} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;