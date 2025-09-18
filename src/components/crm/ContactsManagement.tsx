import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin,
  Building,
  User as UserIcon,
  Calendar,
  Star,
  MessageCircle
} from 'lucide-react';
import { User } from '../../types';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  address: string;
  assignedTo: string;
  tags: string[];
  lastContact: string;
  notes: string;
  type: 'customer' | 'prospect' | 'partner' | 'vendor';
}

interface ContactsManagementProps {
  users: User[];
  currentUser: User;
}

export const ContactsManagement: React.FC<ContactsManagementProps> = ({
  users,
  currentUser,
}) => {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@company.com',
      phone: '+1 234 567 8900',
      company: 'Tech Corp',
      position: 'CTO',
      address: '123 Tech Street, Silicon Valley',
      assignedTo: 'BM001',
      tags: ['VIP', 'Decision Maker'],
      lastContact: '2024-01-15',
      notes: 'Key decision maker for tech purchases',
      type: 'customer'
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@startup.com',
      phone: '+1 234 567 8901',
      company: 'Startup Inc',
      position: 'CEO',
      address: '456 Innovation Ave, Austin',
      assignedTo: 'BM002',
      tags: ['Hot Lead'],
      lastContact: '2024-01-14',
      notes: 'Interested in enterprise solution',
      type: 'prospect'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');

  // Group users by manager for hierarchical dropdown
  const groupedUsers = useMemo(() => {
    const managers = users.filter(user => user.role === 'manager' || user.role === 'admin');
    const grouped: { [key: string]: User[] } = {};
    
    managers.forEach(manager => {
      grouped[manager.id] = [
        manager,
        ...users.filter(user => user.manager === manager.id)
      ];
    });
    
    return grouped;
  }, [users]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contact.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || contact.type === typeFilter;
      const matchesAssigned = assignedFilter === 'all' || contact.assignedTo === assignedFilter;
      
      return matchesSearch && matchesType && matchesAssigned;
    });
  }, [contacts, searchTerm, typeFilter, assignedFilter]);

  const getTypeColor = (type: string) => {
    const colors = {
      'customer': 'bg-green-100 text-green-800',
      'prospect': 'bg-blue-100 text-blue-800',
      'partner': 'bg-purple-100 text-purple-800',
      'vendor': 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unassigned';
  };

  return (
    <div className="space-y-6 px-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Contacts Management</h2>
          <p className="text-gray-600 mt-1">Manage your business contacts and relationships</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <UserIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-500 mb-1">Total Contacts</h4>
          <p className="text-2xl font-bold text-blue-600">{contacts.length}</p>
        </div>
        <div className="card text-center">
          <Building className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-500 mb-1">Customers</h4>
          <p className="text-2xl font-bold text-green-600">
            {contacts.filter(c => c.type === 'customer').length}
          </p>
        </div>
        <div className="card text-center">
          <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-500 mb-1">Prospects</h4>
          <p className="text-2xl font-bold text-purple-600">
            {contacts.filter(c => c.type === 'prospect').length}
          </p>
        </div>
        <div className="card text-center">
          <MessageCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-500 mb-1">Recent Activity</h4>
          <p className="text-2xl font-bold text-orange-600">12</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="all">All Types</option>
            <option value="customer">Customer</option>
            <option value="prospect">Prospect</option>
            <option value="partner">Partner</option>
            <option value="vendor">Vendor</option>
          </select>

          {/* Hierarchical Assigned To Filter */}
          <select
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="all">All Assignees</option>
            {Object.entries(groupedUsers).map(([managerId, teamMembers]) => {
              const manager = teamMembers[0];
              return (
                <optgroup key={managerId} label={`${manager.name} (${manager.designation})`}>
                  {teamMembers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.id === managerId ? `${user.name} (Manager)` : `  └─ ${user.name}`}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map(contact => (
          <div key={contact.id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {contact.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                  <p className="text-sm text-gray-500">{contact.position}</p>
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(contact.type)}`}>
                {contact.type}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Building className="w-4 h-4 mr-2" />
                {contact.company}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                {contact.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {contact.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {contact.address}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Assigned to: <span className="font-medium">{getUserName(contact.assignedTo)}</span></p>
              <div className="flex flex-wrap gap-1">
                {contact.tags.map(tag => (
                  <span key={tag} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="text-xs text-gray-500">
                Last contact: {new Date(contact.lastContact).toLocaleDateString()}
              </span>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-900">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:text-red-900">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};