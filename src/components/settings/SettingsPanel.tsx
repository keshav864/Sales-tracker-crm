import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Download,
  Upload,
  Bell,
  Palette,
  Shield,
  Link,
  Camera,
  Save,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase
} from 'lucide-react';
import { User } from '../../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUserUpdate: (user: User) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'data' | 'notifications' | 'display' | 'security' | 'integrations'>('profile');
  const [profileData, setProfileData] = useState({
    name: currentUser.name,
    phone: currentUser.phone || '',
    designation: currentUser.designation || '',
    territory: currentUser.territory || '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'data', label: 'Data', icon: Download },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'display', label: 'Display', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Link },
  ];

  const handleSaveProfile = () => {
    const updatedUser = {
      ...currentUser,
      ...profileData,
    };
    onUserUpdate(updatedUser);
    
    // Show success message
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-slideDown';
    successDiv.innerHTML = '✅ Profile updated successfully!';
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      if (document.body.contains(successDiv)) {
        document.body.removeChild(successDiv);
      }
    }, 3000);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    // Here you would typically validate current password and update
    alert('Password changed successfully!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">User Profile Management</h3>
            
            {/* Avatar Upload */}
            <div className="flex items-center space-x-4">
              <img
                src={currentUser.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=6366f1&color=fff`}
                alt={currentUser.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
              />
              <div>
                <button className="btn-primary flex items-center space-x-2">
                  <Camera className="w-4 h-4" />
                  <span>Upload Avatar</span>
                </button>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 2MB</p>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UserIcon className="w-4 h-4 inline mr-1" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="w-4 h-4 inline mr-1" />
                  Designation
                </label>
                <input
                  type="text"
                  value={profileData.designation}
                  onChange={(e) => setProfileData({ ...profileData, designation: e.target.value })}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Territory
                </label>
                <input
                  type="text"
                  value={profileData.territory}
                  onChange={(e) => setProfileData({ ...profileData, territory: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <button onClick={handleSaveProfile} className="btn-primary flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Data Export/Import</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h4 className="font-medium text-gray-900 mb-3">Export Data</h4>
                <div className="space-y-3">
                  <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Export to CSV</span>
                  </button>
                  <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Export to Excel</span>
                  </button>
                </div>
              </div>
              
              <div className="card">
                <h4 className="font-medium text-gray-900 mb-3">Import Data</h4>
                <div className="space-y-3">
                  <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>Import CSV</span>
                  </button>
                  <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>Import Excel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">In-App Notifications</h4>
                  <p className="text-sm text-gray-500">Show notifications in the application</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Push Notifications</h4>
                  <p className="text-sm text-gray-500">Receive push notifications on your device</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        );

      case 'display':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Display Customization</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <select className="input-field">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>Auto</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dashboard Layout</label>
                <select className="input-field">
                  <option>Compact</option>
                  <option>Comfortable</option>
                  <option>Spacious</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="input-field"
                />
              </div>
              
              <button onClick={handlePasswordChange} className="btn-primary">
                Change Password
              </button>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                  <button className="btn-secondary">Enable 2FA</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Integration Configurations</h3>
            
            <div className="space-y-4">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-8 h-8 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Email Integration</h4>
                      <p className="text-sm text-gray-500">Connect your email account</p>
                    </div>
                  </div>
                  <button className="btn-secondary">Connect</button>
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-8 h-8 text-green-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Calendar Integration</h4>
                      <p className="text-sm text-gray-500">Sync with your calendar</p>
                    </div>
                  </div>
                  <button className="btn-secondary">Connect</button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Settings Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}
        </div>
      </div>
    </>
  );
};