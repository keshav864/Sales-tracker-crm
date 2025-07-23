import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/auth/LoginForm';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { AttendanceTracker } from './components/attendance/AttendanceTracker';
import { SalesTracker } from './components/sales/SalesTracker';
import { DataExport } from './components/export/DataExport';
import { EmployeeList } from './components/attendance/EmployeeList';
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

  useEffect(() => {
    initializeDefaultData();
  }, []);

  const handleAttendanceUpdate = (records: any[]) => {
    setAttendance(records);
    saveAttendanceRecords(records);
  };

  const handleSalesUpdate = (records: any[]) => {
    setSales(records);
    saveSalesRecords(records);
  };

  if (!isAuthenticated || !user) {
    return <LoginForm onLogin={login} />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard users={users} attendance={attendance} sales={sales} currentUser={user} />;
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
          <EmployeeList
            users={users}
            attendance={attendance}
            onAttendanceUpdate={handleAttendanceUpdate}
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
      default:
        return <Dashboard users={users} attendance={attendance} sales={sales} currentUser={user} />;
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Header 
        user={user} 
        onLogout={logout} 
        onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
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