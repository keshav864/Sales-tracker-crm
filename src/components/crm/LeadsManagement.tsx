import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Calendar,
  DollarSign,
  User as UserIcon,
  Building,
  MapPin,
  Clock,
  Star,
  ChevronDown
} from 'lucide-react';
import { User, SalesRecord } from '../../types';

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  value: number;
  assignedTo: string;
  createdAt: string;
  lastContact: string;
  notes: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface LeadsManagementProps {
  users: User[];
  currentUser: User;
}

export const LeadsManagement: React.FC<LeadsManagementProps> = ({
  users,
  currentUser,
}) => {
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: '1',
      name: 'John Smith',
      company: 'Tech Solutions Inc',
      email: 'john@techsolutions.com',
      phone: '+1 234 567 8900',
      source: 'Website',
      status: 'new',
      value: 15000,
      assignedTo: 'BM001',
      createdAt: '2024-01-15',
      lastContact: '2024-01-15',
      notes: 'Interested in our premium package',
      priority: 'high'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      company: 'Marketing Pro',
      email: 'sarah@marketingpro.com',
      phone: '+1 234 567 8901',
      source: 'Referral',
      status: 'contacted',
      value: 25000,
      assignedTo: 'BM002',
      createdAt: '2024-01-14',
      lastContact: '2024-01-16',
      notes: 'Follow up next week',
      priority: 'medium'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

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

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesAssigned = assignedFilter === 'all' || lead.assignedTo === assignedFilter;
      
      return matchesSearch && matchesStatus && matchesAssigned;
    });
  }, [leads, searchTerm, statusFilter, assignedFilter]);

  const getStatusColor = (status: string) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800',
      'contacted': 'bg-yellow-100 text-yellow-800',
      'qualified': 'bg-green-100 text-green-800',
      'proposal': 'bg-purple-100 text-purple-800',
      'negotiation': 'bg-orange-100 text-orange-800',
      'closed-won': 'bg-emerald-100 text-emerald-800',
      'closed-lost': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'text-gray-500',
      'medium': 'text-yellow-500',
      'high': 'text-orange-500',
      'urgent': 'text-red-500'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-500';
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unassigned';
  };

  return (
    <div className="space-y-6 px-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Leads Management</h2>
          <p className="text-gray-600 mt-1">Track and manage your sales leads</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Lead</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <UserIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-500 mb-1">Total Leads</h4>
          <p className="text-2xl font-bold text-blue-600">{leads.length}</p>
        </div>
        <div className="card text-center">
          <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-500 mb-1">Qualified</h4>
          <p className="text-2xl font-bold text-green-600">
            {leads.filter(l => l.status === 'qualified').length}
          </p>
        </div>
        <div className="card text-center">
          <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-500 mb-1">Pipeline Value</h4>
          <p className="text-2xl font-bold text-purple-600">
            ${leads.reduce((sum, lead) => sum + lead.value, 0).toLocaleString()}
          </p>
        </div>
        <div className="card text-center">
          <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-500 mb-1">This Month</h4>
          <p className="text-2xl font-bold text-orange-600">
            {leads.filter(l => new Date(l.createdAt).getMonth() === new Date().getMonth()).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="negotiation">Negotiation</option>
            <option value="closed-won">Closed Won</option>
            <option value="closed-lost">Closed Lost</option>
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

      {/* Leads Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-500 flex items-center space-x-2">
                        <Mail className="w-3 h-3" />
                        <span>{lead.email}</span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center space-x-2">
                        <Phone className="w-3 h-3" />
                        <span>{lead.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{lead.company}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                      {lead.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ${lead.value.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getUserName(lead.assignedTo)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Star className={`w-4 h-4 ${getPriorityColor(lead.priority)}`} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setEditingLead(lead)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};