import React, { useState } from 'react';
import { User, Users, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { User as UserType, AttendanceRecord } from '../../types';
import { formatDate, formatTime } from '../../utils/dateUtils';

interface EmployeeListProps {
  users: UserType[];
  attendance: AttendanceRecord[];
  onAttendanceUpdate: (records: AttendanceRecord[]) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  users,
  attendance,
  onAttendanceUpdate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTodayAttendance = (userId: string) => {
    const today = formatDate(new Date());
    return attendance.find(record => record.userId === userId && record.date === today);
  };

  const markAttendance = (userId: string, status: 'present' | 'absent' | 'late') => {
    const today = formatDate(new Date());
    const existingRecord = getTodayAttendance(userId);

    if (existingRecord) {
      const updatedRecords = attendance.map(record =>
        record.id === existingRecord.id
          ? { ...record, status }
          : record
      );
      onAttendanceUpdate(updatedRecords);
    } else {
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        userId,
        date: today,
        status,
        checkIn: status === 'present' || status === 'late' ? new Date().toISOString() : undefined,
      };
      onAttendanceUpdate([...attendance, newRecord]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-6 h-6 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-900">Employee Attendance</h3>
        </div>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-field max-w-xs"
          />
        </div>
      </div>

      <div className="overflow-hidden bg-white border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map(user => {
              const todayAttendance = getTodayAttendance(user.id);
              return (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{user.department}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {todayAttendance ? (
                      <span className={`status-badge status-${todayAttendance.status}`}>
                        {todayAttendance.status}
                      </span>
                    ) : (
                      <span className="status-badge status-absent">absent</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {todayAttendance?.checkIn ? formatTime(todayAttendance.checkIn) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => markAttendance(user.id, 'present')}
                      className="text-green-600 hover:text-green-900 transition-colors duration-200"
                      title="Mark Present"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => markAttendance(user.id, 'late')}
                      className="text-yellow-600 hover:text-yellow-900 transition-colors duration-200"
                      title="Mark Late"
                    >
                      <Clock className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => markAttendance(user.id, 'absent')}
                      className="text-red-600 hover:text-red-900 transition-colors duration-200"
                      title="Mark Absent"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};