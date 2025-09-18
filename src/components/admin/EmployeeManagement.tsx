import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  Upload,
  UserPlus,
  Eye,
  EyeOff,
  Save,
  X,
  Building,
  Phone,
  Mail,
  MapPin,
  Target,
  Calendar,
  User as UserIcon,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { User } from '../../types';
import { addNewEmployee, updateUserProfile, exportToCSV } from '../../utils/storage';
import { validateEmployeeId, validateEmail, validatePhone, sanitizeInput } from '../../utils/validation';

interface EmployeeManagementProps {
  users: User[];
  currentUser: User;
  onUsersUpdate: (users: User[]) => void;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({
  users,
  currentUser,
  onUsersUpdate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterManager, setFilterManager] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [expandedManagers, setExpandedManagers] = useState<Set<string>>(new Set());
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');

  const [newEmployee, setNewEmployee] = useState({
    employeeId: '',
    name: '',
    username: '',
    role: 'employee' as 'admin' | 'manager' | 'employee',
    department: 'Sales',
    designation: '',
    phone: '',
    password: '',
    target: 0,
    manager: '',
    territory: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get managers for dropdown
  const managers = useMemo(() => 
    users.filter(user => user.role === 'manager' || user.role === 'admin'),
    [users]
  );

  // Get team structure
  const teamStructure = useMemo(() => {
    const structure: Record<string, User[]> = {};
    
    managers.forEach(manager => {
      structure[manager.id] = users.filter(user => user.manager === manager.id);
    });
    
    return structure;
  }, [users, managers]);

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.territory?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    if (filterManager !== 'all') {
      filtered = filtered.filter(user => user.manager === filterManager);
    }

    return filtered;
  }, [users, searchTerm, filterRole, filterManager]);

  const validateForm = (data: any): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.employeeId || !validateEmployeeId(data.employeeId)) {
      newErrors.employeeId = 'Valid Employee ID required (3-10 alphanumeric characters)';
    }

    if (!data.name || data.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!data.username || data.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (data.phone && !validatePhone(data.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (!data.password || data.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Check for duplicate employee ID
    const existingUser = users.find(u => 
      u.employeeId.toLowerCase() === data.employeeId.toLowerCase() && 
      (!editingUser || u.id !== editingUser.id)
    );
    if (existingUser) {
      newErrors.employeeId = 'Employee ID already exists';
    }

    // Check for duplicate username
    const existingUsername = users.find(u => 
      u.username.toLowerCase() === data.username.toLowerCase() && 
      (!editingUser || u.id !== editingUser.id)
    );
    if (existingUsername) {
      newErrors.username = 'Username already exists';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddEmployee = () => {
    if (!validateForm(newEmployee)) return;

    try {
      const sanitizedData = {
        ...newEmployee,
        name: sanitizeInput(newEmployee.name),
        username: sanitizeInput(newEmployee.username.toLowerCase().replace(/\s+/g, '.')),
        employeeId: sanitizeInput(newEmployee.employeeId.toUpperCase()),
        phone: sanitizeInput(newEmployee.phone),
        designation: sanitizeInput(newEmployee.designation),
        territory: sanitizeInput(newEmployee.territory),
      };

      const newUser = addNewEmployee({
        ...sanitizedData,
        joinDate: new Date().toISOString().split('T')[0],
        isActive: true,
        profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(sanitizedData.name)}&background=6366f1&color=fff`,
      });

      onUsersUpdate([...users, newUser]);
      setShowAddModal(false);
      setNewEmployee({
        employeeId: '',
        name: '',
        username: '',
        role: 'employee',
        department: 'Sales',
        designation: '',
        phone: '',
        password: '',
        target: 0,
        manager: '',
        territory: '',
      });
      setErrors({});

      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-slideDown';
      successDiv.innerHTML = '✅ Employee added successfully!';
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv);
        }
      }, 3000);
    } catch (error) {
      alert('Error adding employee. Please try again.');
    }
  };

  const handleEditEmployee = (user: User) => {
    setEditingUser({ ...user });
  };

  const handleSaveEdit = () => {
    if (!editingUser || !validateForm(editingUser)) return;

    try {
      const success = updateUserProfile(editingUser.id, editingUser);
      
      if (success) {
        const updatedUsers = users.map(u => u.id === editingUser.id ? editingUser : u);
        onUsersUpdate(updatedUsers);
        setEditingUser(null);
        setErrors({});

        // Show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-slideDown';
        successDiv.innerHTML = '✅ Employee updated successfully!';
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
          if (document.body.contains(successDiv)) {
            document.body.removeChild(successDiv);
          }
        }, 3000);
      } else {
        alert('Failed to update employee. Please try again.');
      }
    } catch (error) {
      alert('Error updating employee. Please try again.');
    }
  };

  const handleDeleteEmployee = (userId: string) => {
    if (confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      const updatedUsers = users.filter(u => u.id !== userId);
      onUsersUpdate(updatedUsers);

      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-slideDown';
      successDiv.innerHTML = '🗑️ Employee deleted successfully!';
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv);
        }
      }, 3000);
    }
  };

  const handleExportTeamData = (managerId?: string) => {
    let dataToExport = managerId 
      ? users.filter(u => u.manager === managerId || u.id === managerId)
      : users;

    const exportData = dataToExport.map(user => ({
      'Employee ID': user.employeeId,
      'Name': user.name,
      'Username': user.username,
      'Role': user.role,
      'Department': user.department,
      'Designation': user.designation || '',
      'Phone': user.phone || '',
      'Territory': user.territory || '',
      'Target': user.target || 0,
      'Manager': users.find(u => u.id === user.manager)?.name || 'None',
      'Join Date': user.joinDate,
      'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never',
      'Status': user.isActive !== false ? 'Active' : 'Inactive',
    }));

    const filename = managerId 
      ? `team_data_${users.find(u => u.id === managerId)?.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`
      : `all_employees_${new Date().toISOString().split('T')[0]}`;

    exportToCSV(exportData, filename);
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedEmployees.size === 0) return;

    const selectedUsers = users.filter(u => selectedEmployees.has(u.id));

    switch (bulkAction) {
      case 'export':
        const exportData = selectedUsers.map(user => ({
          'Employee ID': user.employeeId,
          'Name': user.name,
          'Username': user.username,
          'Role': user.role,
          'Department': user.department,
          'Designation': user.designation || '',
          'Phone': user.phone || '',
          'Territory': user.territory || '',
          'Target': user.target || 0,
          'Manager': users.find(u => u.id === user.manager)?.name || 'None',
          'Join Date': user.joinDate,
          'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never',
          'Status': user.isActive !== false ? 'Active' : 'Inactive',
        }));
        exportToCSV(exportData, `selected_employees_${new Date().toISOString().split('T')[0]}`);
        break;
      
      case 'deactivate':
        if (confirm(`Are you sure you want to deactivate ${selectedUsers.length} employees?`)) {
          const updatedUsers = users.map(u => 
            selectedEmployees.has(u.id) ? { ...u, isActive: false } : u
          );
          onUsersUpdate(updatedUsers);
        }
        break;
      
      case 'activate':
        const updatedUsers = users.map(u => 
          selectedEmployees.has(u.id) ? { ...u, isActive: true } : u
        );
        onUsersUpdate(updatedUsers);
        break;
    }

    setSelectedEmployees(new Set());
    setBulkAction('');
  };

  const toggleManagerExpansion = (managerId: string) => {
    const newExpanded = new Set(expandedManagers);
    if (newExpanded.has(managerId)) {
      newExpanded.delete(managerId);
    } else {
      newExpanded.add(managerId);
    }
    setExpandedManagers(newExpanded);
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Employee Management</h2>
          <p className="text-gray-600 mt-1">Manage your team members and organizational structure</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => handleExportTeamData()}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Export All</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-500 mb-1">Total Employees</h4>
          <p className="text-2xl font-bold text-blue-600">{users.length}</p>
        </div>
        <div className="card text-center">
          <Building className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-500 mb-1">Managers</h4>
          <p className="text-2xl font-bold text-green-600">{managers.length}</p>
        </div>
        <div className="card text-center">
          <UserIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-500 mb-1">Active</h4>
          <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.isActive !== false).length}</p>
        </div>
        <div className="card text-center">
          <Target className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-500 mb-1">Total Target</h4>
          <p className="text-2xl font-bold text-orange-600">₹{users.reduce((sum, u) => sum + (u.target || 0), 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 max-w-xs"
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 max-w-xs"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>

            <select
              value={filterManager}
              onChange={(e) => setFilterManager(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 max-w-xs"
            >
              <option value="all">All Managers</option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} ({manager.designation})
                </option>
              ))}
            </select>
          </div>

          {selectedEmployees.size > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {selectedEmployees.size} selected
              </span>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 max-w-xs"
              >
                <option value="">Bulk Actions</option>
                <option value="export">Export Selected</option>
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="btn-primary text-sm py-2 px-4"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Team Structure View */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Team Structure</h3>
        
        {managers.map(manager => (
          <div key={manager.id} className="mb-6 border border-gray-200 rounded-xl overflow-hidden">
            {/* Manager Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleManagerExpansion(manager.id)}
                    className="p-1 hover:bg-white rounded-lg transition-colors duration-200"
                  >
                    {expandedManagers.has(manager.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  
                  <img
                    src={manager.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(manager.name)}&background=6366f1&color=fff`}
                    alt={manager.name}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                  />
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">{manager.name}</h4>
                    <p className="text-blue-600 font-medium">{manager.designation}</p>
                    <p className="text-sm text-gray-600">{manager.territory}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Team Size</p>
                    <p className="font-bold text-blue-600">{teamStructure[manager.id]?.length || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Target</p>
                    <p className="font-bold text-green-600">₹{manager.target?.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => handleExportTeamData(manager.id)}
                    className="btn-secondary text-sm py-2 px-3 flex items-center space-x-1"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Team</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Team Members */}
            {expandedManagers.has(manager.id) && teamStructure[manager.id] && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamStructure[manager.id].map(employee => (
                    <div key={employee.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.has(employee.id)}
                          onChange={() => toggleEmployeeSelection(employee.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <img
                          src={employee.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=6366f1&color=fff`}
                          alt={employee.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{employee.name}</h5>
                          <p className="text-sm text-gray-600">{employee.designation}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">ID:</span>
                          <span className="font-medium">{employee.employeeId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Territory:</span>
                          <span className="font-medium">{employee.territory}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Target:</span>
                          <span className="font-medium text-green-600">₹{employee.target?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{employee.phone}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          employee.isActive !== false 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditEmployee(employee)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center">
                  <UserPlus className="w-6 h-6 mr-2" />
                  Add New Employee
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setErrors({});
                  }}
                  className="text-white hover:text-gray-200 transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    value={newEmployee.employeeId}
                    onChange={(e) => setNewEmployee({ ...newEmployee, employeeId: e.target.value.toUpperCase() })}
                    className={`w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${errors.employeeId ? 'border-red-500' : ''}`}
                    placeholder="EMP001"
                  />
                  {errors.employeeId && <p className="text-red-500 text-xs mt-1">{errors.employeeId}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    className={`w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={newEmployee.username}
                    onChange={(e) => setNewEmployee({ ...newEmployee, username: e.target.value.toLowerCase().replace(/\s+/g, '.') })}
                    className={`input-field ${errors.username ? 'border-red-500' : ''}`}
                    placeholder="john.doe"
                  />
                  {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                    className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Minimum 6 characters"
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                    className="input-field"
                  >
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Management">Management</option>
                    <option value="Operations">Operations</option>
                    <option value="HR">Human Resources</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={newEmployee.designation}
                    onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })}
                    className="input-field"
                    placeholder="Sales Executive"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="+91 9876543210"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Target (₹)
                  </label>
                  <input
                    type="number"
                    value={newEmployee.target}
                    onChange={(e) => setNewEmployee({ ...newEmployee, target: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    placeholder="150000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reporting Manager
                  </label>
                  <select
                    value={newEmployee.manager}
                    onChange={(e) => setNewEmployee({ ...newEmployee, manager: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select Manager</option>
                    {managers.map(manager => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name} ({manager.designation})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Territory
                  </label>
                  <input
                    type="text"
                    value={newEmployee.territory}
                    onChange={(e) => setNewEmployee({ ...newEmployee, territory: e.target.value })}
                    className="input-field"
                    placeholder="North India"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setErrors({});
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEmployee}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Add Employee</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center">
                  <Edit className="w-6 h-6 mr-2" />
                  Edit Employee
                </h3>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setErrors({});
                  }}
                  className="text-white hover:text-gray-200 transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    value={editingUser.employeeId}
                    onChange={(e) => setEditingUser({ ...editingUser, employeeId: e.target.value.toUpperCase() })}
                    className={`input-field ${errors.employeeId ? 'border-red-500' : ''}`}
                  />
                  {errors.employeeId && <p className="text-red-500 text-xs mt-1">{errors.employeeId}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value.toLowerCase().replace(/\s+/g, '.') })}
                    className={`input-field ${errors.username ? 'border-red-500' : ''}`}
                  />
                  {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={editingUser.department}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="input-field"
                  >
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Management">Management</option>
                    <option value="Operations">Operations</option>
                    <option value="HR">Human Resources</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={editingUser.designation || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, designation: e.target.value })}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Target (₹)
                  </label>
                  <input
                    type="number"
                    value={editingUser.target || 0}
                    onChange={(e) => setEditingUser({ ...editingUser, target: parseInt(e.target.value) || 0 })}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reporting Manager
                  </label>
                  <select
                    value={editingUser.manager || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, manager: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select Manager</option>
                    {managers.filter(m => m.id !== editingUser.id).map(manager => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name} ({manager.designation})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Territory
                  </label>
                  <input
                    type="text"
                    value={editingUser.territory || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, territory: e.target.value })}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editingUser.isActive !== false ? 'active' : 'inactive'}
                    onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.value === 'active' })}
                    className="input-field"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setErrors({});
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="btn-success flex items-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};