import React, { useMemo } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  DollarSign,
  TrendingUp,
  Target,
  Award,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { User, AttendanceRecord, SalesRecord } from '../../types';
import { StatsCard } from './StatsCard';
import { AttendanceChart } from './AttendanceChart';
import { SalesChart } from './SalesChart';
import { formatDate } from '../../utils/dateUtils';

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
  const stats = useMemo(() => {
    const today = formatDate(new Date());
    const todayAttendance = attendance.filter(record => record.date === today);
    const todaySales = sales.filter(record => record.date === today);
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthSales = sales.filter(record => record.date.startsWith(currentMonth));
    const userMonthSales = monthSales.filter(record => record.userId === currentUser.id);

    // Calculate user-specific stats
    const userTotalSales = sales.filter(record => record.userId === currentUser.id)
      .reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    const userTodaySales = todaySales.filter(record => record.userId === currentUser.id)
      .reduce((sum, sale) => sum + sale.totalAmount, 0);

    const userMonthTotal = userMonthSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const targetAchievement = currentUser.target ? (userMonthTotal / currentUser.target) * 100 : 0;

    return {
      totalEmployees: users.length,
      presentToday: todayAttendance.filter(r => r.status === 'present').length,
      absentToday: todayAttendance.filter(r => r.status === 'absent').length,
      lateToday: todayAttendance.filter(r => r.status === 'late').length,
      totalSalesToday: todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0),
      totalSalesThisMonth: monthSales.reduce((sum, sale) => sum + sale.totalAmount, 0),
      userTotalSales,
      userTodaySales,
      userMonthTotal,
      targetAchievement,
      totalDeals: sales.length,
      conversionRate: 85.5,
    };
  }, [users, attendance, sales, currentUser]);

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="space-y-8 p-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {currentUser.name}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                {isAdmin ? 'Admin Dashboard - Complete System Overview' : 'Your Performance Dashboard'}
              </p>
              <p className="text-blue-200 text-sm mt-1">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <BarChart3 className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin ? (
          <>
            <StatsCard
              title="Total Employees"
              value={stats.totalEmployees}
              icon={Users}
              color="blue"
              trend={{ value: 25, isPositive: true }}
            />
            <StatsCard
              title="Present Today"
              value={stats.presentToday}
              icon={UserCheck}
              color="green"
              trend={{ value: 18, isPositive: true }}
            />
            <StatsCard
              title="Total Sales Today"
              value={`₹${stats.totalSalesToday.toLocaleString()}`}
              icon={DollarSign}
              color="purple"
              trend={{ value: 15, isPositive: true }}
            />
            <StatsCard
              title="Monthly Revenue"
              value={`₹${stats.totalSalesThisMonth.toLocaleString()}`}
              icon={TrendingUp}
              color="green"
              trend={{ value: 22, isPositive: true }}
            />
          </>
        ) : (
          <>
            <StatsCard
              title="My Sales Today"
              value={`₹${stats.userTodaySales.toLocaleString()}`}
              icon={DollarSign}
              color="green"
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Monthly Sales"
              value={`₹${stats.userMonthTotal.toLocaleString()}`}
              icon={TrendingUp}
              color="blue"
              trend={{ value: 18, isPositive: true }}
            />
            <StatsCard
              title="Target Achievement"
              value={`${stats.targetAchievement.toFixed(1)}%`}
              icon={Target}
              color="purple"
              trend={{ value: 5, isPositive: true }}
            />
            <StatsCard
              title="Total Career Sales"
              value={`₹${stats.userTotalSales.toLocaleString()}`}
              icon={Award}
              color="yellow"
              trend={{ value: 25, isPositive: true }}
            />
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-blue-500" />
              Weekly Attendance Trends
            </h3>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
          <AttendanceChart attendance={attendance} />
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-purple-500" />
              Sales Performance
            </h3>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </div>
          <SalesChart sales={isAdmin ? sales : sales.filter(s => s.userId === currentUser.id)} />
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105">
              Record New Sale
            </button>
            <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105">
              Mark Attendance
            </button>
            <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
              View Reports
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Sale Recorded</p>
                <p className="text-xs text-gray-500">₹25,000 - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Checked In</p>
                <p className="text-xs text-gray-500">9:15 AM - Today</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Report Generated</p>
                <p className="text-xs text-gray-500">Monthly Report - Yesterday</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Conversion Rate</span>
                <span className="text-sm font-bold text-green-600">85.5%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" style={{ width: '85.5%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Monthly Target</span>
                <span className="text-sm font-bold text-blue-600">{stats.targetAchievement.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full" style={{ width: `${Math.min(stats.targetAchievement, 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Attendance Rate</span>
                <span className="text-sm font-bold text-purple-600">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};