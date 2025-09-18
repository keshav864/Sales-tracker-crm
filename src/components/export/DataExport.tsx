import React, { useState } from 'react';
import { Download, FileText, Calendar, Users, TrendingUp, Filter } from 'lucide-react';
import { User, AttendanceRecord, SalesRecord } from '../../types';
import { exportToCSV } from '../../utils/storage';
import { captureRealTimeData } from '../../utils/realTimeData';
import { formatDate } from '../../utils/dateUtils';

interface DataExportProps {
  users: User[];
  attendance: AttendanceRecord[];
  sales: SalesRecord[];
  currentUser: User;
}

export const DataExport: React.FC<DataExportProps> = ({
  users,
  attendance,
  sales,
  currentUser,
}) => {
  const [exportType, setExportType] = useState<'attendance' | 'sales' | 'users' | 'comprehensive'>('comprehensive');
  const [dateRange, setDateRange] = useState({
    startDate: formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
    endDate: formatDate(new Date()),
  });
  const [selectedUser, setSelectedUser] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  const canExportAll = currentUser.role === 'admin' || currentUser.role === 'manager';

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      let dataToExport: any[] = [];
      let filename = '';

      switch (exportType) {
        case 'attendance':
          dataToExport = getFilteredAttendance();
          filename = `attendance_report_${formatDate(new Date())}`;
          break;
        case 'sales':
          dataToExport = getFilteredSales();
          filename = `sales_report_${formatDate(new Date())}`;
          break;
        case 'users':
          if (!canExportAll) {
            alert('You do not have permission to export user data.');
            return;
          }
          dataToExport = getFilteredUsers();
          filename = `users_report_${formatDate(new Date())}`;
          break;
        case 'comprehensive':
          dataToExport = getComprehensiveReport();
          filename = `comprehensive_report_${formatDate(new Date())}`;
          break;
      }

      if (dataToExport.length === 0) {
        alert('No data available for the selected criteria.');
        return;
      }

      exportToCSV(dataToExport, filename);
      
      // Capture export activity
      captureRealTimeData.dataExport(exportType, dataToExport.length);
      
      alert(`${dataToExport.length} records exported successfully!`);
    } catch (error) {
      alert('Error exporting data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getFilteredUsers = () => {
    let filtered = users;
    
    if (selectedUser !== 'all') {
      filtered = filtered.filter(user => user.id === selectedUser);
    }
    
    return filtered.map(user => ({
      ID: user.id,
      'Employee ID': user.employeeId,
      Name: user.name,
      Username: user.username,
      Role: user.role,
      Department: user.department,
      Designation: user.designation || '',
      Phone: user.phone || '',
      Territory: user.territory || '',
      Target: user.target || 0,
      Manager: user.manager || '',
      'Join Date': user.joinDate,
      'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never',
      Status: user.isActive !== false ? 'Active' : 'Inactive',
    }));
  };

  const getFilteredAttendance = () => {
    let filtered = attendance.filter(record => {
      const recordDate = new Date(record.date);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      return recordDate >= startDate && recordDate <= endDate;
    });

    if (!canExportAll) {
      filtered = filtered.filter(record => record.userId === currentUser.id);
    } else if (selectedUser !== 'all') {
      filtered = filtered.filter(record => record.userId === selectedUser);
    }

    return filtered.map(record => {
      const user = users.find(u => u.id === record.userId);
      return {
        Date: record.date,
        'Employee Name': user?.name || 'Unknown',
        'Employee Username': user?.username || 'Unknown',
        Department: user?.department || 'Unknown',
        Status: record.status,
        'Check In': record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '',
        'Check Out': record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '',
        'Total Hours': record.totalHours || '',
        'Break Time (min)': record.breakTime || '',
      };
    });
  };

  const getFilteredSales = () => {
    let filtered = sales.filter(record => {
      const recordDate = new Date(record.date);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      return recordDate >= startDate && recordDate <= endDate;
    });

    if (!canExportAll) {
      filtered = filtered.filter(record => record.userId === currentUser.id);
    } else if (selectedUser !== 'all') {
      filtered = filtered.filter(record => record.userId === selectedUser);
    }

    return filtered.map(record => {
      const user = users.find(u => u.id === record.userId);
      return {
        Date: record.date,
        'Sales Person': user?.name || 'Unknown',
        'Sales Person Username': user?.username || 'Unknown',
        'Product Name': record.productName,
        'Product Code': record.productCode || '',
        Category: record.category,
        Quantity: record.quantity,
        'Unit Price': record.unitPrice,
        Discount: record.discount || 0,
        'Total Amount': record.totalAmount,
        'Customer Name': record.customer,
        'Customer Email': record.customerEmail || '',
        'Customer Phone': record.customerPhone || '',
        'Customer Company': record.customerCompany || '',
        'Customer Address': record.customerAddress || '',
        'Payment Method': record.paymentMethod || '',
        'Payment Status': record.paymentStatus || '',
        'Lead Source': record.leadSource || '',
        Priority: record.priority || '',
        'Follow-up Required': record.followUpRequired ? 'Yes' : 'No',
        'Follow-up Date': record.followUpDate || '',
        Notes: record.notes || '',
        'Submitted At': record.submittedAt ? new Date(record.submittedAt).toLocaleString() : '',
      };
    });
  };

  const getComprehensiveReport = () => {
    const salesData = getFilteredSales();
    const attendanceData = getFilteredAttendance();
    
    // Combine sales and attendance data by user and date
    const combinedData: any[] = [];
    
    // Group by user and date
    const userDateMap = new Map();
    
    salesData.forEach(sale => {
      const key = `${sale['Sales Person']}_${sale.Date}`;
      if (!userDateMap.has(key)) {
        userDateMap.set(key, {
          Date: sale.Date,
          'Employee Name': sale['Sales Person'],
          'Employee Email': sale['Sales Person Email'],
          'Total Sales': 0,
          'Sales Count': 0,
          'Attendance Status': 'Unknown',
          'Check In': '',
          'Check Out': '',
          'Sales Details': [],
        });
      }
      
      const entry = userDateMap.get(key);
      entry['Total Sales'] += sale['Total Amount'];
      entry['Sales Count'] += 1;
      entry['Sales Details'].push(`${sale['Product Name']} (${sale.Quantity}x$${sale['Unit Price']})`);
    });
    
    attendanceData.forEach(att => {
      const key = `${att['Employee Name']}_${att.Date}`;
      if (!userDateMap.has(key)) {
        userDateMap.set(key, {
          Date: att.Date,
          'Employee Name': att['Employee Name'],
          'Employee Email': att['Employee Email'],
          'Total Sales': 0,
          'Sales Count': 0,
          'Attendance Status': att.Status,
          'Check In': att['Check In'],
          'Check Out': att['Check Out'],
          'Sales Details': [],
        });
      } else {
        const entry = userDateMap.get(key);
        entry['Attendance Status'] = att.Status;
        entry['Check In'] = att['Check In'];
        entry['Check Out'] = att['Check Out'];
      }
    });
    
    return Array.from(userDateMap.values()).map(entry => ({
      ...entry,
      'Sales Details': entry['Sales Details'].join('; '),
    }));
  };

  const getExportStats = () => {
    const filteredSales = getFilteredSales();
    const filteredAttendance = getFilteredAttendance();
    
    return {
      salesRecords: filteredSales.length,
      attendanceRecords: filteredAttendance.length,
      totalRevenue: filteredSales.reduce((sum, sale) => sum + (sale['Total Amount'] || 0), 0),
      uniqueEmployees: new Set([
        ...filteredSales.map(s => s['Sales Person']),
        ...filteredAttendance.map(a => a['Employee Name'])
      ]).size,
    };
  };

  const stats = getExportStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Data Export Center</h2>
        <div className="text-sm text-gray-500">
          Export data for analysis and reporting
        </div>
      </div>

      {/* Export Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-500 mb-1">Sales Records</h4>
          <p className="text-2xl font-bold text-green-600">{stats.salesRecords}</p>
        </div>
        <div className="card text-center">
          <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-500 mb-1">Attendance Records</h4>
          <p className="text-2xl font-bold text-blue-600">{stats.attendanceRecords}</p>
        </div>
        <div className="card text-center">
          <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-500 mb-1">Employees</h4>
          <p className="text-2xl font-bold text-purple-600">{stats.uniqueEmployees}</p>
        </div>
        <div className="card text-center">
          <FileText className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h4>
          <p className="text-2xl font-bold text-orange-600">${stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Export Configuration */}
      <div className="card">
        <div className="flex items-center mb-6">
          <Filter className="w-6 h-6 text-gray-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900">Export Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Type
            </label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value as any)}
              className="w-full px-3 md:px-4 py-2 md:py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm md:text-base"
            >
              <option value="comprehensive">Comprehensive Report</option>
              <option value="sales">Sales Data Only</option>
              <option value="attendance">Attendance Data Only</option>
              {canExportAll && <option value="users">User Directory</option>}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 md:px-4 py-2 md:py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm md:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 md:px-4 py-2 md:py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm md:text-base"
            />
          </div>

          {canExportAll && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee Filter
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 md:px-4 py-2 md:py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm md:text-base"
              >
                <option value="all">All Employees</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Export Descriptions */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Export Description:</h4>
          <div className="text-sm text-gray-600">
            {exportType === 'comprehensive' && (
              <p>Complete report combining sales and attendance data with employee performance metrics.</p>
            )}
            {exportType === 'sales' && (
              <p>Detailed sales records including customer information, product details, and CRM data.</p>
            )}
            {exportType === 'attendance' && (
              <p>Employee attendance records with check-in/out times and status information.</p>
            )}
            {exportType === 'users' && (
              <p>Employee directory with contact information and role assignments.</p>
            )}
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-center">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="btn-primary flex items-center justify-center space-x-2 py-3 px-8 text-lg"
          >
            {isExporting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Download className="w-6 h-6" />
                <span>Export Data</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Export Instructions */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start">
          <FileText className="w-6 h-6 text-blue-600 mr-3 mt-1" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Export Instructions</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Data will be exported in CSV format for easy analysis in Excel or Google Sheets</li>
              <li>• Comprehensive reports include both sales and attendance data merged by employee and date</li>
              <li>• Use date filters to export specific time periods for targeted analysis</li>
              <li>• All exported data respects your permission level and role-based access</li>
              <li>• Large exports may take a few moments to process</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};