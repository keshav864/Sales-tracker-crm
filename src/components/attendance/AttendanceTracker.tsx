import React, { useState, useMemo } from 'react';
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { User, AttendanceRecord } from '../../types';
import { formatDate, formatTime, formatDateTime } from '../../utils/dateUtils';
import { AttendanceCalendar } from './AttendanceCalendar';
import { EmployeeList } from './EmployeeList';

interface AttendanceTrackerProps {
  users: User[];
  attendance: AttendanceRecord[];
  currentUser: User;
  onAttendanceUpdate: (records: AttendanceRecord[]) => void;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  users,
  attendance,
  currentUser,
  onAttendanceUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'check-in' | 'calendar' | 'employees'>('check-in');

  const todayRecord = useMemo(() => {
    const today = formatDate(new Date());
    return attendance.find(
      record => record.userId === currentUser.id && record.date === today
    );
  }, [attendance, currentUser.id]);

  const handleCheckIn = () => {
    const today = formatDate(new Date());
    const now = new Date().toISOString();
    
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      userId: currentUser.id,
      date: today,
      checkIn: now,
      status: 'present',
    };

    const updatedRecords = [...attendance, newRecord];
    onAttendanceUpdate(updatedRecords);
  };

  const handleCheckOut = () => {
    if (!todayRecord) return;

    const now = new Date().toISOString();
    const updatedRecord = {
      ...todayRecord,
      checkOut: now,
    };

    const updatedRecords = attendance.map(record =>
      record.id === todayRecord.id ? updatedRecord : record
    );
    onAttendanceUpdate(updatedRecords);
  };

  const canShowAllEmployees = currentUser.role === 'admin' || currentUser.role === 'manager';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Attendance Tracking</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('check-in')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'check-in'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Check In/Out
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'calendar'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Calendar View
            </button>
            {canShowAllEmployees && (
              <button
                onClick={() => setActiveTab('employees')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'employees'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                All Employees
              </button>
            )}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'check-in' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome, {currentUser.name}!
                </h3>
                <p className="text-gray-600">
                  {formatDateTime(new Date())}
                </p>
              </div>

              {todayRecord ? (
                <div className="max-w-md mx-auto">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">
                        Checked in at {formatTime(todayRecord.checkIn!)}
                      </span>
                    </div>
                  </div>

                  {!todayRecord.checkOut ? (
                    <button
                      onClick={handleCheckOut}
                      className="w-full btn-danger flex items-center justify-center space-x-2 py-3"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Check Out</span>
                    </button>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-gray-600 mr-2" />
                        <span className="text-gray-800 font-medium">
                          Checked out at {formatTime(todayRecord.checkOut)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <button
                    onClick={handleCheckIn}
                    className="w-full btn-success flex items-center justify-center space-x-2 py-3"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Check In</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'calendar' && (
            <AttendanceCalendar
              attendance={attendance}
              users={canShowAllEmployees ? users : [currentUser]}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'employees' && canShowAllEmployees && (
            <EmployeeList
              users={users}
              attendance={attendance}
              onAttendanceUpdate={onAttendanceUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
};