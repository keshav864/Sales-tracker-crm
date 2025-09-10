import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { realTimeDataManager, captureRealTimeData } from './utils/realTimeData';
import { LoginForm } from './components/auth/LoginForm';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { AttendanceTracker } from './components/attendance/AttendanceTracker';
import { SalesTracker } from './components/sales/SalesTracker';
import { DataExport } from './components/export/DataExport';
import { EmployeeList } from './components/attendance/EmployeeList';
import { EmployeeManagement } from './components/admin/EmployeeManagement';
import { SystemSettings } from './components/settings/SystemSettings';
import {
  getUsers,
  getAttendanceRecords,
  getSalesRecords,
  saveAttendanceRecords,
  saveSalesRecords,
  initializeDefaultData,
} from './utils/storage';

function App() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [users, setUsers] = useState(getUsers());
  const [attendance, setAttendance] = useState(getAttendanceRecords());
  const [sales, setSales] = useState(getSalesRecords());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  useEffect(() => {
    initializeDefaultData();
    
    // Set up real-time data listeners
    realTimeDataManager.addListener('users', (updatedUsers: any[]) => {
      setUsers(updatedUsers);
      setLastSyncTime(new Date().toLocaleTimeString());
    });
    
    realTimeDataManager.addListener('sales', (updatedSales: any[]) => {
      setSales(updatedSales);
      setLastSyncTime(new Date().toLocaleTimeString());
    });
    
    realTimeDataManager.addListener('attendance', (updatedAttendance: any[]) => {
      setAttendance(updatedAttendance);
      setLastSyncTime(new Date().toLocaleTimeString());
    });

    // Capture user login
    if (user) {
      captureRealTimeData.userLogin(user);
    }

    // Cleanup on unmount
    return () => {
      realTimeDataManager.destroy();
    };
  }, []);

  // Update last sync time when user logs in
  useEffect(() => {
    if (user) {
      captureRealTimeData.userLogin(user);
      setLastSyncTime(new Date().toLocaleTimeString());
    }
  }, [user]);
  const handleAttendanceUpdate = (records: any[]) => {
    realTimeDataManager.updateAttendance(records);
  };

  const handleSalesUpdate = (records: any[]) => {
    realTimeDataManager.updateSales(records);
  };

  const handleUserUpdate = (updatedUser: any) => {
    captureRealTimeData.profileUpdate(updatedUser.id, updatedUser);
    // Update current user in auth context if it's the same user
    if (user && user.id === updatedUser.id) {
      // Update the auth state with the new user data
      login(updatedUser.employeeId, 'dummy'); // This will refresh the session
    }
  };

  const handleSettingsUpdate = (newSettings: any) => {
    // Handle settings update
    console.log('Settings updated:', newSettings);
    // Log settings change
    const settingsLog = JSON.parse(localStorage.getItem('crm_settings_log') || '[]');
    settingsLog.push({
      timestamp: new Date().toISOString(),
      userId: user?.id,
      settings: newSettings
    });
    localStorage.setItem('crm_settings_log', JSON.stringify(settingsLog));
  };

  if (!isAuthenticated || !user) {
    return <LoginForm onLogin={login} />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div>
            <Dashboard users={users} attendance={attendance} sales={sales} currentUser={user} />
            {lastSyncTime && (
              <div className="fixed bottom-4 right-4 bg-green-500 text-white px-3 py-1 rounded-lg text-xs shadow-lg">
                Last sync: {lastSyncTime}
              </div>
            )}
          </div>
        );
      case 'attendance':
        return (
          <AttendanceTracker
            users={users}
            attendance={attendance}
            currentUser={user}
            onAttendanceUpdate={handleAttendanceUpdate}
          />
        );
      case 'sales':
        return (
          <SalesTracker
            sales={sales}
            users={users}
            currentUser={user}
            onSalesUpdate={handleSalesUpdate}
          />
        );
      case 'employees':
        return (
          <EmployeeManagement
            users={users}
            sales={sales}
            attendance={attendance}
            onUsersUpdate={(updatedUsers) => realTimeDataManager.updateUsers(updatedUsers)}
            onDataUpdate={(updatedUsers, updatedSales, updatedAttendance) => {
              realTimeDataManager.updateUsers(updatedUsers);
              realTimeDataManager.updateSales(updatedSales);
              realTimeDataManager.updateAttendance(updatedAttendance);
            }}
          />
        );
      case 'export':
        return (
          <DataExport
            users={users}
            attendance={attendance}
            sales={sales}
            currentUser={user}
          />
        );
      case 'settings':
        return (
          <SystemSettings
            currentUser={user}
            onSettingsUpdate={handleSettingsUpdate}
          />
        );
      default:
        return (
          <div>
            <Dashboard users={users} attendance={attendance} sales={sales} currentUser={user} />
            {lastSyncTime && (
              <div className="fixed bottom-4 right-4 bg-green-500 text-white px-3 py-1 rounded-lg text-xs shadow-lg">
                Last sync: {lastSyncTime}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user} 
        onLogout={logout} 
        onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onUserUpdate={handleUserUpdate}
      />
      <div className="flex">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          user={user}
          isCollapsed={sidebarCollapsed}
        />
        <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-0' : 'ml-0'}`}>
          <div className="animate-fadeIn">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;