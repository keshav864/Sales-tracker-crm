import React, { useState } from 'react';
import { UserPlus, Edit, Trash2, Search, Users, Shield, User, AlertTriangle } from 'lucide-react';
import { User as UserType } from '../../types';
import { addNewEmployee, getUsers, saveUsers } from '../../utils/storage';
import { SearchAndFilter } from '../common/SearchAndFilter';
import { hashPassword } from '../../utils/auth';

interface EmployeeManagementProps {
  users: UserType[];
  onUsersUpdate: (users: UserType[]) => void;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({
  users,
  onUsersUpdate,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'manager' | 'employee'>('all');
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [filterDepartment, setFilterDepartment] = useState('all');

  const [newEmployee, setNewEmployee] = useState({
    employeeId: '',
    name: '',
    email: '',
    role: 'employee' as 'admin' | 'manager' | 'employee',
    department: 'Sales',
    password: '',
    phone: '',
    designation: '',
    target: 0,
    manager: '',
    territory: '',
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const departments = [...new Set(users.map(u => u.department))];

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if employee ID already exists
    if (users.some(u => u.employeeId === newEmployee.employeeId)) {
      alert('Employee ID already exists!');
      return;
    }

    const userData = {
      ...newEmployee,
      joinDate: new Date().toISOString().split('T')[0],
      profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(newEmployee.name)}&background=6366f1&color=fff`,
      password: hashPassword(newEmployee.password), // Hash password before saving
    };

    const addedUser = addNewEmployee(userData);
    const updatedUsers = [...users, addedUser];
    onUsersUpdate(updatedUsers);

    // Reset form
    setNewEmployee({
      employeeId: '',
      name: '',
      email: '',
      role: 'employee',
      department: 'Sales',
      password: '',
      phone: '',
      designation: '',
      target: 0,
      manager: '',
      territory: '',
    });
    setShowAddForm(false);

    alert('Employee added successfully!');
  };

  const handleEditEmployee = (user: UserType) => {
    setEditingUser(user);
  };

  const handleUpdateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updatedUsers = users.map(u => 
      u.id === editingUser.id ? editingUser : u
    );
    
    saveUsers(updatedUsers);
    onUsersUpdate(updatedUsers);
    setEditingUser(null);
    alert('Employee updated successfully!');
  };

  const handleDeleteEmployee = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    // Prevent deletion of admin users
    if (userToDelete.role === 'admin') {
      alert('Cannot delete admin users for security reasons.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${userToDelete.name}? This action cannot be undone.`)) {
      const updatedUsers = users.filter(u => u.id !== userId);
      saveUsers(updatedUsers);
      onUsersUpdate(updatedUsers);
      alert('Employee deleted successfully!');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4 text-red-500" />;
      case 'manager': return <Users className="w-4 h-4 text-blue-500" />;
      default: return <User className="w-4 h-4 text-green-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Employee Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filters */}
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search employees..."
        filters={[
          {
            label: 'Role',
            value: filterRole,
            options: [
              { value: 'all', label: 'All Roles' },
              { value: 'admin', label: 'Admin' },
              { value: 'manager', label: 'Manager' },
              { value: 'employee', label: 'Employee' },
            ],
            onChange: (value) => setFilterRole(value as any),
          },
          {
            label: 'Department',
            value: filterDepartment,
            options: [
              { value: 'all', label: 'All Departments' },
              ...departments.map(dept => ({ value: dept, label: dept })),
            ],
            onChange: setFilterDepartment,
          },
        ]}
      />

      {/* Employee List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Territory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                        alt={user.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.employeeId}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.territory || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.target ? `₹${user.target.toLocaleString()}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEditEmployee(user)}
                      className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteEmployee(user.id)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {user.role === 'admin' && (
                      <div className="text-gray-400" title="Admin users cannot be deleted">
                        <Shield className="w-4 h-4" />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New Employee</h3>
            
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    value={newEmployee.employeeId}
                    onChange={(e) => setNewEmployee({ ...newEmployee, employeeId: e.target.value.toUpperCase() })}
                    className="input-field"
                    placeholder="BM001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    className="input-field"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    className="input-field"
                    placeholder="john@company.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    className="input-field"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value as any })}
                    className="input-field"
                    required
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Management">Management</option>
                    <option value="Operations">Operations</option>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Target (₹)
                  </label>
                  <input
                    type="number"
                    value={newEmployee.target}
                    onChange={(e) => setNewEmployee({ ...newEmployee, target: parseInt(e.target.value) })}
                    className="input-field"
                    placeholder="150000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manager
                  </label>
                  <select
                    value={newEmployee.manager}
                    onChange={(e) => setNewEmployee({ ...newEmployee, manager: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select Manager</option>
                    {users.filter(u => u.role === 'manager' || u.role === 'admin').map(manager => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name} ({manager.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                    className="input-field"
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Password will be securely encrypted</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Important Notes:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Employee ID cannot be changed after creation</li>
                      <li>Password will be securely encrypted</li>
                      <li>Employee will be able to change their password after first login</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Employee</h3>
            
            <form onSubmit={handleUpdateEmployee} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={editingUser.employeeId}
                    className="input-field bg-gray-100"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Employee ID cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="input-field"
                    required
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    value={editingUser.department}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Management">Management</option>
                    <option value="Operations">Operations</option>
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
                    Monthly Target (₹)
                  </label>
                  <input
                    type="number"
                    value={editingUser.target || 0}
                    onChange={(e) => setEditingUser({ ...editingUser, target: parseInt(e.target.value) })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manager
                  </label>
                  <select
                    value={editingUser.manager || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, manager: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select Manager</option>
                    {users.filter(u => u.role === 'manager' || u.role === 'admin').map(manager => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name} ({manager.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Security Note:</p>
                    <p>To change password, the employee should use the "Change Password" option in their profile settings.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Update Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};