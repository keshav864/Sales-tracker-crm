import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { User, AttendanceRecord } from '../../types';
import { getMonthDays, formatDate, getCurrentMonth } from '../../utils/dateUtils';
import { format } from 'date-fns';

interface AttendanceCalendarProps {
  attendance: AttendanceRecord[];
  users: User[];
  currentUser: User;
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  attendance,
  users,
  currentUser,
}) => {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [selectedUser, setSelectedUser] = useState(currentUser.id);

  const monthDays = getMonthDays(currentMonth);

  const getAttendanceStatus = (date: Date, userId: string) => {
    const dateStr = formatDate(date);
    const record = attendance.find(
      r => r.date === dateStr && r.userId === userId
    );
    return record?.status || 'absent';
  };

  const navigateMonth = (direction: 1 | -1) => {
    const [year, month] = currentMonth.split('-').map(Number);
    const newDate = new Date(year, month - 1 + direction, 1);
    setCurrentMonth(format(newDate, 'yyyy-MM'));
  };

  const statusColors = {
    present: 'bg-green-100 text-green-800 border-green-200',
    late: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    absent: 'bg-red-100 text-red-800 border-red-200',
  };

  const canViewOthers = currentUser.role === 'admin' || currentUser.role === 'manager';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-semibold text-gray-900">
            {format(new Date(currentMonth + '-01'), 'MMMM yyyy')}
          </h3>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {canViewOthers && (
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 max-w-xs"
          >
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-gray-600">
            {day}
          </div>
        ))}

        {monthDays.map(day => {
          const status = getAttendanceStatus(day, selectedUser);
          const isToday = formatDate(day) === formatDate(new Date());

          return (
            <div
              key={day.toISOString()}
              className={`p-2 text-center border rounded-lg ${statusColors[status]} ${
                isToday ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="text-sm font-medium">
                {format(day, 'd')}
              </div>
              <div className="text-xs mt-1 capitalize">
                {status}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
          <span>Present</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
          <span>Late</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
          <span>Absent</span>
        </div>
      </div>
    </div>
  );
};