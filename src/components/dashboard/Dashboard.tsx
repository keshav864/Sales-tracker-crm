import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { StatsCard } from './StatsCard';
import { WeeklySalesChart } from './WeeklySalesChart';
import { MonthlySalesChart } from './MonthlySalesChart';
import { AttendanceChart } from './AttendanceChart';
import { 
  getUsers, 
  getSalesRecords, 
  getAttendanceRecords, 
  getSalesTargets 
} from '../../utils/storage';
import { User, SalesRecord, AttendanceRecord } from '../../types';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Target,
  ChevronDown,
  Download,
  Filter
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedManager, setSelectedManager] = useState<string>('all');
  const [filteredEmployees, setFilteredEmployees] = useState<User[]>([]);
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user, selectedManager]);

  const loadDashboardData = () => {
    setLoading(true);
    
    const allUsers = getUsers();
    const allSales = getSalesRecords();
    const allAttendance = getAttendanceRecords();

    let filteredUsers = allUsers;
    let filteredSales = allSales;
    let filteredAttendance = allAttendance;

    // Filter based on user role and selected manager
    if (user?.role === 'admin') {
      if (selectedManager !== 'all') {
        filteredUsers = allUsers.filter(u => 
          u.manager === selectedManager || u.id === selectedManager
        );
        const userIds = filteredUsers.map(u => u.id);
        filteredSales = allSales.filter(s => userIds.includes(s.employeeId));
        filteredAttendance = allAttendance.filter(a => userIds.includes(a.employeeId));
      }
    } else if (user?.role === 'manager') {
      filteredUsers = allUsers.filter(u => 
        u.manager === user.id || u.id === user.id
      );
      const userIds = filteredUsers.map(u => u.id);
      filteredSales = allSales.filter(s => userIds.includes(s.employeeId));
      filteredAttendance = allAttendance.filter(a => userIds.includes(a.employeeId));
    } else {
      filteredUsers = allUsers.filter(u => u.id === user?.id);
      filteredSales = allSales.filter(s => s.employeeId === user?.id);
      filteredAttendance = allAttendance.filter(a => a.employeeId === user?.id);
    }

    setFilteredEmployees(filteredUsers);
    setSalesData(filteredSales);
    setAttendanceData(filteredAttendance);
    setLoading(false);
  };

  const getManagers = () => {
    const allUsers = getUsers();
    return allUsers.filter(u => u.role === 'manager' || u.role === 'admin');
  };

  const calculateStats = () => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    // Total sales this month
    const monthlySales = salesData
      .filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getMonth() === thisMonth && saleDate.getFullYear() === thisYear;
      })
      .reduce((sum, sale) => sum + sale.amount, 0);

    // Total employees
    const totalEmployees = filteredEmployees.length;

    // Present today
    const todayStr = today.toISOString().split('T')[0];
    const presentToday = attendanceData.filter(record => 
      record.date === todayStr && record.status === 'present'
    ).length;

    // Monthly target achievement
    const targets = getSalesTargets();
    const totalTarget = filteredEmployees.reduce((sum, emp) => sum + (emp.target || 0), 0);
    const targetAchievement = totalTarget > 0 ? (monthlySales / totalTarget) * 100 : 0;

    return {
      monthlySales,
      totalEmployees,
      presentToday,
      targetAchievement
    };
  };

  const handleExportTeamData = () => {
    const csvData = filteredEmployees.map(emp => ({
      'Employee ID': emp.employeeId,
      'Name': emp.name,
      'Role': emp.role,
      'Department': emp.department,
      'Territory': emp.territory,
      'Target': emp.target,
      'Phone': emp.phone,
      'Join Date': emp.joinDate,
      'Status': emp.isActive ? 'Active' : 'Inactive'
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `team_data_${selectedManager}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

  const stats = calculateStats();
  const managers = getManagers();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with Manager Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}! Here's your overview.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Manager Filter - Only for Admin */}
          {user?.role === 'admin' && (
            <div className="relative">
              <select
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
              >
                <option value="all">All Teams</option>
                {managers.map(manager => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name} ({manager.role})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={handleExportTeamData}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Monthly Sales"
          value={`₹${stats.monthlySales.toLocaleString()}`}
          icon={TrendingUp}
          trend={stats.monthlySales > 0 ? 'up' : 'neutral'}
          trendValue={`${stats.targetAchievement.toFixed(1)}% of target`}
          color="blue"
        />
        <StatsCard
          title="Team Members"
          value={stats.totalEmployees.toString()}
          icon={Users}
          trend="neutral"
          trendValue={`${filteredEmployees.filter(e => e.isActive).length} active`}
          color="green"
        />
        <StatsCard
          title="Present Today"
          value={stats.presentToday.toString()}
          icon={Calendar}
          trend={stats.presentToday > stats.totalEmployees * 0.8 ? 'up' : 'down'}
          trendValue={`${((stats.presentToday / stats.totalEmployees) * 100).toFixed(1)}% attendance`}
          color="purple"
        />
        <StatsCard
          title="Target Achievement"
          value={`${stats.targetAchievement.toFixed(1)}%`}
          icon={Target}
          trend={stats.targetAchievement >= 100 ? 'up' : stats.targetAchievement >= 80 ? 'neutral' : 'down'}
          trendValue={stats.targetAchievement >= 100 ? 'Target achieved!' : 'Keep pushing!'}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Sales Trend</h3>
          <WeeklySalesChart salesData={salesData} />
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
          <MonthlySalesChart salesData={salesData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview</h3>
          <AttendanceChart attendanceData={attendanceData} />
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Overview</h3>
          <div className="space-y-4">
            {filteredEmployees.slice(0, 5).map(employee => (
              <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <img
                    src={employee.profilePicture || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150'}
                    alt={employee.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{employee.name}</p>
                    <p className="text-sm text-gray-500">{employee.designation}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ₹{salesData
                      .filter(s => s.employeeId === employee.id)
                      .reduce((sum, s) => sum + s.amount, 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">This month</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};