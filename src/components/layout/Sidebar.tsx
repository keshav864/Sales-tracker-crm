import React from 'react';
import {
  LayoutDashboard,
  Clock,
  TrendingUp,
  Users,
  FileText,
  Settings,
  Download,
  Target,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  user: User;
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
  user,
  isCollapsed = false,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
    { id: 'attendance', label: 'Attendance', icon: Clock, color: 'text-green-500' },
    { id: 'sales', label: 'Sales Entry', icon: TrendingUp, color: 'text-purple-500' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-orange-500' },
    ...(user.role === 'admin'
      ? [
          { id: 'employees', label: 'Team Management', icon: Users, color: 'text-indigo-500' },
          { id: 'reports', label: 'Reports', icon: FileText, color: 'text-pink-500' },
          { id: 'targets', label: 'Sales Targets', icon: Target, color: 'text-red-500' },
        ]
      : []),
    { id: 'export', label: 'Export Data', icon: Download, color: 'text-cyan-500' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, color: 'text-yellow-500' },
    ...(user.role === 'admin'
      ? [{ id: 'settings', label: 'System Settings', icon: Settings, color: 'text-gray-500' }]
      : []),
  ];

  return (
    <aside className={`bg-white shadow-xl border-r border-gray-200 transition-all duration-300 fixed md:static inset-y-0 left-0 z-40 ${
      isCollapsed ? 'w-16' : 'w-64'
    } min-h-screen top-16`}>
      {/* User Profile Section */}
      {!isCollapsed && (
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                alt={user.name}
                className="w-12 h-12 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.designation || user.role}</p>
              <p className="text-xs text-blue-600 font-medium">{user.employeeId}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="mt-4 md:mt-6 px-2 md:px-3">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center px-2 md:px-3 py-2 md:py-3 rounded-xl text-left transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:scale-105'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {/* Background Animation */}
                <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 transform transition-transform duration-300 ${
                  isActive ? 'scale-100' : 'scale-0 group-hover:scale-100'
                } rounded-xl opacity-10`} />
                
                <Icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} relative z-10 ${
                  isActive ? 'text-white' : item.color
                } transition-colors duration-300`} />
                
                {!isCollapsed && (
                  <span className="font-medium relative z-10 transition-colors duration-300 text-sm md:text-base">
                    {item.label}
                  </span>
                )}

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Performance Summary */}
      {!isCollapsed && user.role === 'employee' && (
        <div className="mt-4 md:mt-8 mx-2 md:mx-3 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">This Month</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Target</span>
              <span className="text-xs font-semibold text-gray-900">₹{(user.target || 0) > 1000 ? ((user.target || 0) / 1000).toFixed(0) + 'K' : (user.target || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Achieved</span>
              <span className="text-xs font-semibold text-green-600">₹85K</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full" style={{ width: '68%' }}></div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-1">68% Complete</p>
          </div>
        </div>
      )}
    </aside>
  );
};