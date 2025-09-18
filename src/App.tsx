import React from 'react';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/auth/LoginForm';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import AttendanceTracker from './components/attendance/AttendanceTracker';
import SalesTracker from './components/sales/SalesTracker';
import SalesReports from './components/sales/SalesReports';
import EmployeeManagement from './components/admin/EmployeeManagement';
import ProfileSettings from './components/profile/ProfileSettings';
import SystemSettings from './components/settings/SystemSettings';
import { initializeDefaultData } from './utils/storage';

// Initialize default data on app start
initializeDefaultData();

const App: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = React.useState('dashboard');

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeView) {
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
        userRole={user.role}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={logout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;