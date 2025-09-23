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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'from-blue-500 to-purple-600', bgColor: 'bg-gradient-to-r from-blue-500 to-purple-600' },
    { id: 'attendance', label: 'Attendance', icon: Clock, color: 'from-green-500 to-emerald-600', bgColor: 'bg-gradient-to-r from-green-500 to-emerald-600' },
    { id: 'sales', label: 'Sales Entry', icon: TrendingUp, color: 'from-orange-500 to-red-600', bgColor: 'bg-gradient-to-r from-orange-500 to-red-600' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'from-purple-500 to-pink-600', bgColor: 'bg-gradient-to-r from-purple-500 to-pink-600' },
    ...(user.role === 'admin'
      ? [
          { id: 'employees', label: 'Team Management', icon: Users, color: 'from-indigo-500 to-blue-600', bgColor: 'bg-gradient-to-r from-indigo-500 to-blue-600' },
          { id: 'reports', label: 'Reports', icon: FileText, color: 'from-pink-500 to-rose-600', bgColor: 'bg-gradient-to-r from-pink-500 to-rose-600' },
          { id: 'targets', label: 'Sales Targets', icon: Target, color: 'from-red-500 to-pink-600', bgColor: 'bg-gradient-to-r from-red-500 to-pink-600' },
        ]
      : []),
    { id: 'export', label: 'Export Data', icon: Download, color: 'from-cyan-500 to-blue-600', bgColor: 'bg-gradient-to-r from-cyan-500 to-blue-600' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, color: 'from-yellow-500 to-orange-600', bgColor: 'bg-gradient-to-r from-yellow-500 to-orange-600' },
    ...(user.role === 'admin'
      ? [{ id: 'settings', label: 'System Settings', icon: Settings, color: 'from-gray-500 to-gray-600', bgColor: 'bg-gradient-to-r from-gray-500 to-gray-600' }]
      : []),
  ];

  return (
    <aside className={`bg-white shadow-xl border-r border-gray-200 transition-all duration-300 fixed md:static inset-y-0 left-0 z-40 overflow-y-auto ${
      isCollapsed ? 'w-16' : 'w-64'
    } min-h-screen top-16 md:top-0`}>
      {/* User Profile Section */}
      {!isCollapsed && (
        <div className="p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                alt={user.name}
                className="w-12 md:w-14 h-12 md:h-14 rounded-xl object-cover border-2 border-white shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm md:text-base font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.designation || user.role}</p>
              <p className="text-xs text-blue-600 font-medium">{user.employeeId}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="mt-4 md:mt-6 px-3 md:px-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center px-3 md:px-4 py-3 md:py-3.5 rounded-xl text-left transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? `${item.bgColor} text-white shadow-lg transform scale-105`
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:scale-105'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {/* Background Animation */}
                <div className={`absolute inset-0 ${item.bgColor} transform transition-transform duration-300 ${
                  isActive ? 'scale-100' : 'scale-0 group-hover:scale-100'
                } rounded-xl opacity-10`} />
                
                <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isCollapsed ? 'mx-auto' : 'mr-3'} relative z-10 ${
                  isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'
                } transition-colors duration-300`} />
                
                {!isCollapsed && (
                  <span className="font-medium relative z-10 transition-colors duration-300 text-sm md:text-base">
                    {item.label}
                  </span>
                )}

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute right-3 w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Performance Summary */}
      {!isCollapsed && user.role === 'employee' && (
        <div className="mt-6 md:mt-8 mx-3 md:mx-4 p-4 md:p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            This Month
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-gray-600">Target</span>
              <span className="text-xs md:text-sm font-semibold text-gray-900">₹{(user.target || 0) > 1000 ? ((user.target || 0) / 1000).toFixed(0) + 'K' : (user.target || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-gray-600">Achieved</span>
              <span className="text-xs md:text-sm font-semibold text-green-600">₹85K</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: '68%' }}></div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">68% Complete</p>
            
            <div className="pt-3 border-t border-blue-200/50">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Rank</span>
                <span className="font-semibold text-blue-600">#3</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};