import React, { useState, useEffect } from 'react';
import { StatsCard } from './StatsCard';
import { WeeklySalesChart } from './WeeklySalesChart';
import { MonthlySalesChart } from './MonthlySalesChart';
import { AttendanceChart } from './AttendanceChart';
import { useAuth } from '../../hooks/useAuth';
import { getUsers, getSalesRecords, getAttendanceRecords } from '../../utils/storage';
import { getVisibleSalesRecords, getVisibleAttendanceRecords, getVisibleUsers } from '../../utils/dataPrivacy';
import { TrendingUp, Users, Calendar, Target } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalEmployees: 0,
    presentToday: 0,
    targetAchievement: 0
  });
  const [visibleSales, setVisibleSales] = useState<any[]>([]);
  const [visibleAttendance, setVisibleAttendance] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const allUsers = getUsers();
    const allSalesRecords = getSalesRecords();
    const allAttendanceRecords = getAttendanceRecords();

    // Get visible data based on user role and hierarchy
    const visibleUsers = getVisibleUsers(user, allUsers);
    const visibleSalesRecords = getVisibleSalesRecords(user, allSalesRecords, allUsers);
    const visibleAttendanceRecords = getVisibleAttendanceRecords(user, allAttendanceRecords, allUsers);

    // Calculate total sales
    const totalSales = visibleSalesRecords.reduce((sum, record) => sum + record.amount, 0);

    // Calculate present today
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = visibleAttendanceRecords.filter(record => 
      record.date === today && record.status === 'present'
    );

    // Calculate target achievement
    const totalTarget = visibleUsers.reduce((sum, u) => sum + (u.target || 0), 0);
    const targetAchievement = totalTarget > 0 ? (totalSales / totalTarget) * 100 : 0;

    // Update state with visible data
    setVisibleSales(visibleSalesRecords);
    setVisibleAttendance(visibleAttendanceRecords);

    setStats({
      totalSales,
      totalEmployees: visibleUsers.length,
      presentToday: todayAttendance.length,
      targetAchievement: Math.round(targetAchievement)
    });
  }, [user]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Sales"
          value={`₹${stats.totalSales.toLocaleString()}`}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatsCard
          title="Team Members"
          value={stats.totalEmployees.toString()}
          icon={Users}
          color="bg-blue-500"
        />
        <StatsCard
          title="Present Today"
          value={stats.presentToday.toString()}
          icon={Calendar}
          color="bg-purple-500"
        />
        <StatsCard
          title="Target Achievement"
          value={`${stats.targetAchievement}%`}
          icon={Target}
          color="bg-orange-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Weekly Sales Trend</h2>
          <WeeklySalesChart sales={visibleSales} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Monthly Sales Overview</h2>
          <MonthlySalesChart sales={visibleSales} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Attendance Overview</h2>
        <AttendanceChart attendance={visibleAttendance} />
      </div>
    </div>
  );
};