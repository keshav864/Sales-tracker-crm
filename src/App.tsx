import React, { useState } from 'react';
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
import { initializeDefaultData } from './utils/storage';

// Initialize default data on app start
initializeDefaultData();

type ViewType = 'dashboard' | 'attendance' | 'sales' | 'reports' | 'employees' | 'profile' | 'settings';

function App() {
  const { user, login, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return <LoginForm onLogin={login} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'attendance':
        return <AttendanceTracker />;
      case 'sales':
        return <SalesTracker />;
      case 'reports':
        return <SalesReports />;
      case 'employees':
        return user.role === 'admin' ? <EmployeeManagement /> : <Dashboard />;
      case 'profile':
        return <ProfileSettings />;
      case 'settings':
        return user.role === 'admin' ? <SystemSettings /> : <Dashboard />;
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