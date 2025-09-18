import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/auth/LoginForm';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { AttendanceTracker } from './components/attendance/AttendanceTracker';
import { SalesTracker } from './components/sales/SalesTracker';
import { SalesReports } from './components/sales/SalesReports';
import { EmployeeManagement } from './components/admin/EmployeeManagement';
import { ProfileSettings } from './components/profile/ProfileSettings';
import { SystemSettings } from './components/settings/SystemSettings';
import { DataExport } from './components/export/DataExport';
import { 
  getUsers, 
  getSalesRecords, 
  getAttendanceRecords, 
  saveUsers,
  saveSalesRecords,
  saveAttendanceRecords,
  initializeDefaultData 
} from './utils/storage';

// Initialize default data on app start
initializeDefaultData();

type ViewType = 'dashboard' | 'attendance' | 'sales' | 'reports' | 'employees' | 'profile' | 'settings' | 'export' | 'analytics' | 'calendar' | 'targets';

function App() {
  const { user, login, logout, updateUser } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data states
  const [users, setUsers] = useState(getUsers());
  const [sales, setSales] = useState(getSalesRecords());
  const [attendance, setAttendance] = useState(getAttendanceRecords());

  // Update data handlers
  const handleUsersUpdate = (updatedUsers: typeof users) => {
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
  };

  const handleSalesUpdate = (updatedSales: typeof sales) => {
    setSales(updatedSales);
    saveSalesRecords(updatedSales);
  };

  const handleAttendanceUpdate = (updatedAttendance: typeof attendance) => {
    setAttendance(updatedAttendance);
    saveAttendanceRecords(updatedAttendance);
  };

  if (!user) {
    return <LoginForm onLogin={login} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
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
            users={users}
            sales={sales}
            currentUser={user}
            onSalesUpdate={handleSalesUpdate}
          />
        );
      case 'reports':
        return (
          <SalesReports 
            sales={sales}
            users={users}
            currentUser={user}
          />
        );
      case 'employees':
        return user.role === 'admin' ? (
          <EmployeeManagement 
            users={users}
            currentUser={user}
            onUsersUpdate={handleUsersUpdate}
          />
        ) : <Dashboard />;
      case 'export':
        return (
          <DataExport 
            users={users}
            attendance={attendance}
            sales={sales}
            currentUser={user}
          />
        );
      case 'profile':
        return (
          <ProfileSettings 
            user={user}
            onUserUpdate={updateUser}
            onClose={() => setCurrentView('dashboard')}
          />
        );
      case 'settings':
        return user.role === 'admin' ? (
          <SystemSettings 
            currentUser={user}
            onSettingsUpdate={() => {}}
          />
        ) : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user} 
        onLogout={logout} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onUserUpdate={updateUser}
      />
      
      <div className="flex">
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:transform-none`}>
          <Sidebar 
            activeSection={currentView}
            onSectionChange={setCurrentView}
            user={user}
          />
        </div>
        
        <main className="flex-1 p-6 lg:ml-0">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;