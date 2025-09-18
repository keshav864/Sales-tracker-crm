import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  User as UserIcon,
  Filter
} from 'lucide-react';
import { User } from '../../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'task' | 'follow-up' | 'deadline';
  assignedTo: string;
  description: string;
}

interface CalendarViewProps {
  users: User[];
  currentUser: User;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  users,
  currentUser,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [filterUser, setFilterUser] = useState('all');

  const [events] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Client Meeting - Tech Corp',
      date: '2024-01-20',
      time: '10:00',
      type: 'meeting',
      assignedTo: 'BM001',
      description: 'Discuss project requirements'
    },
    {
      id: '2',
      title: 'Follow up with Startup Inc',
      date: '2024-01-22',
      time: '14:30',
      type: 'follow-up',
      assignedTo: 'BM002',
      description: 'Check on proposal status'
    },
    {
      id: '3',
      title: 'Quarterly Report Due',
      date: '2024-01-25',
      time: '17:00',
      type: 'deadline',
      assignedTo: 'BM003',
      description: 'Submit Q1 sales report'
    }
  ]);

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

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (filterUser === 'all') return true;
      return event.assignedTo === filterUser;
    });
  }, [events, filterUser]);

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredEvents.filter(event => event.date === dateStr);
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      'meeting': 'bg-blue-500',
      'task': 'bg-green-500',
      'follow-up': 'bg-yellow-500',
      'deadline': 'bg-red-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unassigned';
  };

  const navigateMonth = (direction: 1 | -1) => {
    setCurrentDate(direction === 1 ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
  };

  return (
    <div className="space-y-6 px-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Calendar</h2>
          <p className="text-gray-600 mt-1">Manage your schedule and team activities</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Calendar Controls */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-semibold text-gray-900 min-w-48 text-center">
                {format(currentDate, 'MMMM yyyy')}
              </h3>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setCurrentDate(new Date())}
              className="btn-secondary"
            >
              Today
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {['month', 'week', 'day'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                    viewMode === mode
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {/* User Filter */}
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="input-field max-w-xs"
            >
              <option value="all">All Team Members</option>
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
      </div>

      {/* Calendar Grid */}
      <div className="card">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-t-lg overflow-hidden">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-gray-50 p-3 text-center font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {monthDays.map(day => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`bg-white p-2 min-h-32 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                  !isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''
                } ${isCurrentDay ? 'bg-blue-50 border-2 border-blue-200' : ''}`}
                onClick={() => setSelectedDate(day)}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentDay ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded text-white truncate ${getEventTypeColor(event.type)}`}
                      title={`${event.time} - ${event.title}`}
                    >
                      {event.time} {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Details Sidebar */}
      {selectedDate && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Events for {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            {getEventsForDate(selectedDate).map(event => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`} />
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4" />
                        <span>{getUserName(event.assignedTo)}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                  </div>
                  
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    event.type === 'meeting' ? 'bg-blue-100 text-blue-800' :
                    event.type === 'task' ? 'bg-green-100 text-green-800' :
                    event.type === 'follow-up' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {event.type}
                  </span>
                </div>
              </div>
            ))}
            
            {getEventsForDate(selectedDate).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No events scheduled for this date</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};