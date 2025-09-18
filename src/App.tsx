import React, { useState, useEffect } from 'react';
import { User } from './types';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/auth/LoginForm';
import Dashboard from './components/dashboard/Dashboard';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import AttendanceTracker from './components/attendance/AttendanceTracker';
import SalesTracker from './components/sales/SalesTracker';
import SalesReports from './components/sales/SalesReports';
import EmployeeManagement from './components/admin/EmployeeManagement';
import ProfileSettings from './components/profile/ProfileSettings';
import SystemSettings from './components/settings/SystemSettings';
import { initializeDefaultData } from './utils/storage';

type ViewType = 'dashboard' | 'attendance' | 'sales' | 'reports' | 'employees' | 'profile' | 'settings';

function App() {
  const { user, login, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    initializeDefaultData();
  }, []);

  if (!user) {
    return <LoginForm onLogin={login} />;
  }

  const renderContent = () => {
    const lastSyncTime = new Date().toISOString();
    
    switch (currentView) {
      case 'attendance':
        return <AttendanceTracker />;
      case 'sales':
        return <SalesTracker />;
      case 'reports':
        return <SalesReports />;
      case 'employees':
        return user.role === 'admin' ? <EmployeeManagement /> : <Dashboard lastSyncTime={lastSyncTime} />;
      case 'profile':
        return <ProfileSettings />;
      case 'settings':
        return user.role === 'admin' ? <SystemSettings /> : <Dashboard lastSyncTime={lastSyncTime} />;
      default:
        return <Dashboard lastSyncTime={lastSyncTime} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user} 
        onLogout={logout}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex">
        <Sidebar 
          user={user}
          currentView={currentView}
          onViewChange={setCurrentView}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 lg:ml-64">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;