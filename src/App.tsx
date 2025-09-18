import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/auth/LoginForm';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { AttendanceTracker } from './components/attendance/AttendanceTracker';
import { SalesForm } from './components/sales/SalesForm';
import { SalesAnalytics } from './components/sales/SalesAnalytics';
import { EmployeeManagement } from './components/admin/EmployeeManagement';
import { DataExport } from './components/export/DataExport';
import { SystemSettings } from './components/settings/SystemSettings';
import { ProfileSettings } from './components/profile/ProfileSettings';
import { LeadsManagement } from './components/crm/LeadsManagement';
import { ContactsManagement } from './components/crm/ContactsManagement';
import { TasksManagement } from './components/crm/TasksManagement';
import { CalendarView } from './components/calendar/CalendarView';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { 
  getUsers, 
  getAttendanceRecords, 
  getSalesRecords, 
  saveUsers, 
  saveAttendanceRecords, 
  saveSalesRecords,
  initializeDefaultData 
} from './utils/storage';
import { User, AttendanceRecord, SalesRecord } from './types';

const App: React.FC = () => {
  const { user, isAuthenticated, login, logout, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    initializeDefaultData();
    setUsers(getUsers());
    setAttendance(getAttendanceRecords());
    setSales(getSalesRecords());
  }, []);

  const handleUsersUpdate = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
  };

  const handleAttendanceUpdate = (updatedAttendance: AttendanceRecord[]) => {
    setAttendance(updatedAttendance);
    saveAttendanceRecords(updatedAttendance);
  };

  const handleSalesUpdate = (updatedSales: SalesRecord[]) => {
    setSales(updatedSales);
    saveSalesRecords(updatedSales);
  };

  const handleSalesAdd = (newSale: SalesRecord) => {
    const updatedSales = [...sales, newSale];
    handleSalesUpdate(updatedSales);
  };

  const toggleSettingsPanel = () => {
    setIsSettingsPanelOpen(!isSettingsPanelOpen);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (!isAuthenticated || !user) {
    return <LoginForm onLogin={login} />;
  }

  const renderContent = () => {
    const contentProps = {
      users,
      attendance,
      sales,
      currentUser: user,
      onUsersUpdate: handleUsersUpdate,
      onAttendanceUpdate: handleAttendanceUpdate,
      onSalesUpdate: handleSalesUpdate,
    };

    switch (activeSection) {
      case 'dashboard':
        return <Dashboard {...contentProps} />;
      case 'attendance':
        return <AttendanceTracker {...contentProps} />;
      case 'sales':
        return <SalesForm currentUser={user} onSalesAdd={handleSalesAdd} />;
      case 'analytics':
        return <SalesAnalytics {...contentProps} />;
      case 'employees':
        return user.role === 'admin' ? <EmployeeManagement {...contentProps} /> : <Dashboard {...contentProps} />;
      case 'leads':
        return <LeadsManagement {...contentProps} />;
      case 'contacts':
        return <ContactsManagement {...contentProps} />;
      case 'tasks':
        return <TasksManagement {...contentProps} />;
      case 'calendar':
        return <CalendarView {...contentProps} />;
      case 'export':
        return <DataExport {...contentProps} />;
      case 'settings':
        return user.role === 'admin' ? <SystemSettings currentUser={user} onSettingsUpdate={() => {}} /> : <Dashboard {...contentProps} />;
      case 'profile':
        return <ProfileSettings currentUser={user} onUserUpdate={updateUser} />;
      default:
        return <Dashboard {...contentProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        user={user}
        isCollapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header
          user={user}
          onLogout={logout}
          onToggleSidebar={toggleSidebar}
          onOpenSettings={toggleSettingsPanel}
        />

        {/* Content Area with consistent padding */}
        <main className="flex-1 overflow-auto">
          <div className="px-5 py-6 max-w-full">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsPanelOpen}
        onClose={() => setIsSettingsPanelOpen(false)}
        currentUser={user}
        onUserUpdate={updateUser}
      />
    </div>
  );
};

export default App;