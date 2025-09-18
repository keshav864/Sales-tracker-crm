import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock,
  User as UserIcon,
  CheckCircle,
  AlertCircle,
  Flag,
  Tag
} from 'lucide-react';
import { User } from '../../types';

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  createdBy: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'completed' | 'cancelled';
  category: string;
  tags: string[];
  createdAt: string;
  completedAt?: string;
}

interface TasksManagementProps {
  users: User[];
  currentUser: User;
}

export const TasksManagement: React.FC<TasksManagementProps> = ({
  users,
  currentUser,
}) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Follow up with Tech Corp',
      description: 'Call Alice Johnson to discuss the proposal',
      assignedTo: 'BM001',
      createdBy: 'ADMIN001',
      dueDate: '2024-01-20',
      priority: 'high',
      status: 'todo',
      category: 'Sales',
      tags: ['Follow-up', 'Important'],
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Prepare quarterly report',
      description: 'Compile sales data for Q1 2024',
      assignedTo: 'BM002',
      createdBy: 'ADMIN001',
      dueDate: '2024-01-25',
      priority: 'medium',
      status: 'in-progress',
      category: 'Reporting',
      tags: ['Report', 'Quarterly'],
      createdAt: '2024-01-14'
    },
    {
      id: '3',
      title: 'Update CRM database',
      description: 'Clean up duplicate contacts and update information',
      assignedTo: 'BM003',
      createdBy: 'BM001',
      dueDate: '2024-01-18',
      priority: 'low',
      status: 'completed',
      category: 'Maintenance',
      tags: ['Database', 'Cleanup'],
      createdAt: '2024-01-12',
      completedAt: '2024-01-17'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

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

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesAssigned = assignedFilter === 'all' || task.assignedTo === assignedFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesAssigned && matchesPriority;
    });
  }, [tasks, searchTerm, statusFilter, assignedFilter, priorityFilter]);

  const getStatusColor = (status: string) => {
    const colors = {
      'todo': 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unassigned';
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'completed' && new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6 px-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Tasks Management</h2>
          <p className="text-gray-600 mt-1">Organize and track team tasks and activities</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-500 mb-1">Total Tasks</h4>
          <p className="text-2xl font-bold text-blue-600">{tasks.length}</p>
        </div>
        <div className="card text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-500 mb-1">Completed</h4>
          <p className="text-2xl font-bold text-green-600">
            {tasks.filter(t => t.status === 'completed').length}
          </p>
        </div>
        <div className="card text-center">
          <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-500 mb-1">In Progress</h4>
          <p className="text-2xl font-bold text-orange-600">
            {tasks.filter(t => t.status === 'in-progress').length}
          </p>
        </div>
        <div className="card text-center">
          <Flag className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-500 mb-1">Overdue</h4>
          <p className="text-2xl font-bold text-red-600">
            {tasks.filter(t => isOverdue(t.dueDate, t.status)).length}
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
              placeholder="Search tasks..."
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
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
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

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map(task => (
          <div key={task.id} className={`card hover:shadow-lg transition-shadow duration-200 ${
            isOverdue(task.dueDate, task.status) ? 'border-l-4 border-red-500' : ''
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="mt-1">
                  {getStatusIcon(task.status)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                      {task.status.replace('-', ' ')}
                    </span>
                    <Flag className={`w-4 h-4 ${getPriorityColor(task.priority)}`} />
                  </div>
                  
                  <p className="text-gray-600 mb-3">{task.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <UserIcon className="w-4 h-4" />
                      <span>Assigned to: {getUserName(task.assignedTo)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span className={isOverdue(task.dueDate, task.status) ? 'text-red-600 font-medium' : ''}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Tag className="w-4 h-4" />
                      <span>{task.category}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-3">
                    {task.tags.map(tag => (
                      <span key={tag} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
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

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No tasks found for the selected criteria.</p>
        </div>
      )}
    </div>
  );
};