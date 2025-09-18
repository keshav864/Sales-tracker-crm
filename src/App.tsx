import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/auth/LoginForm';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { AttendanceTracker } from './components/attendance/AttendanceTracker';
import { SalesTracker } from './components/sales/SalesTracker';
import { SalesReports } from './components/sales/SalesReports';
import { SalesAnalytics } from './components/sales/SalesAnalytics';
import { EmployeeManagement } from './components/admin/EmployeeManagement';
import { ProfileSettings } from './components/profile/ProfileSettings';
import { SystemSettings } from './components/settings/SystemSettings';
import { DataExport } from './components/export/DataExport';
import { getUsers, getSalesRecords, getAttendanceRecords, updateUserProfile } from './utils/storage';
import { realTimeDataManager } from './utils/realTimeData';
import { User, SalesRecord, AttendanceRecord } from './types';

type ViewType = 'dashboard' | 'attendance' | 'sales' | 'analytics' | 'reports' | 'employees' | 'profile' | 'settings' | 'export';

function App() {
  const { user, login, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Global state management
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allSales, setAllSales] = useState<SalesRecord[]>([]);
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = () => {
      try {
        const users = getUsers();
        const sales = getSalesRecords();
        const attendance = getAttendanceRecords();
        
        setAllUsers(users);
        setAllSales(sales);
        setAllAttendance(attendance);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to real-time updates
    const usersCallback = () => {
      setAllUsers(getUsers());
    };
    realTimeDataManager.addListener('users', usersCallback);
    
    const salesCallback = () => {
      setAllSales(getSalesRecords());
    };
    realTimeDataManager.addListener('sales', salesCallback);
    
    const attendanceCallback = () => {
      setAllAttendance(getAttendanceRecords());
    };
    realTimeDataManager.addListener('attendance', attendanceCallback);

    return () => {
      realTimeDataManager.removeListener('users', usersCallback);
      realTimeDataManager.removeListener('sales', salesCallback);
      realTimeDataManager.removeListener('attendance', attendanceCallback);
    };
  }, []);

  // Update handlers
  const handleUsersUpdate = (users: User[]) => {
    setAllUsers(users);
  };

  const handleSalesUpdate = (sales: SalesRecord[]) => {
    setAllSales(sales);
  };

  const handleAttendanceUpdate = (attendance: AttendanceRecord[]) => {
    setAllAttendance(attendance);
  };

  const handleUserUpdate = (updatedUser: User) => {
    const success = updateUserProfile(updatedUser.id, updatedUser);
    if (success) {
      const updatedUsers = allUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
      handleUsersUpdate(updatedUsers);
    }
  };

  if (!user) {
    return <LoginForm onLogin={login} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            users={allUsers}
            attendance={allAttendance}
            sales={allSales}
            currentUser={user}
          />
        );
      case 'attendance':
        return (
          <AttendanceTracker 
            users={allUsers}
            attendance={allAttendance}
            currentUser={user}
            onAttendanceUpdate={handleAttendanceUpdate}
          />
        );
      case 'sales':
        return (
          <SalesTracker 
            users={allUsers}
            sales={allSales}
            currentUser={user}
            onSalesUpdate={handleSalesUpdate}
          />
        );
      case 'analytics':
        return (
          <SalesAnalytics 
            sales={allSales}
            users={allUsers}
            currentUser={user}
          />
        );
      case 'reports':
        return (
          <SalesReports 
            sales={allSales}
            users={allUsers}
            currentUser={user}
          />
        );
      case 'employees':
        return user.role === 'admin' ? (
          <EmployeeManagement 
            users={allUsers}
            currentUser={user}
            onUsersUpdate={handleUsersUpdate}
          />
        ) : (
          <Dashboard 
            users={allUsers}
            attendance={allAttendance}
            sales={allSales}
            currentUser={user}
          />
        );
      case 'profile':
        return (
          <ProfileSettings 
            user={user}
            onUserUpdate={handleUserUpdate}
            onClose={() => setCurrentView('dashboard')}
          />
        );
      case 'settings':
        return user.role === 'admin' ? (
          <SystemSettings 
            currentUser={user}
            onSettingsUpdate={() => {}}
          />
        ) : (
          <Dashboard 
            users={allUsers}
            attendance={allAttendance}
            sales={allSales}
            currentUser={user}
          />
        );
      case 'export':
        return (
          <DataExport 
            users={allUsers}
            attendance={allAttendance}
            sales={allSales}
            currentUser={user}
          />
        );
      default:
        return (
          <Dashboard 
            users={allUsers}
            attendance={allAttendance}
            sales={allSales}
            currentUser={user}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user} 
        onLogout={logout} 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onUserUpdate={handleUserUpdate}
      />
      
      <div className="flex">
        <Sidebar 
          activeSection={currentView}
          onSectionChange={setCurrentView}
          user={user}
          isCollapsed={false}
        />
        
        <main className="flex-1 p-6 lg:ml-64">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;