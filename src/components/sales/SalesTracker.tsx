import React, { useState, useEffect } from 'react';
import { SalesForm } from './SalesForm';
import { SalesEntryManager } from './SalesEntryManager';
import { getSalesRecords, getUsers } from '../../utils/storage';
import { realTimeDataManager } from '../../utils/realTimeData';
import { SalesRecord, User } from '../../types';
import { TrendingUp, Users, Target, Calendar } from 'lucide-react';

export const SalesTracker: React.FC = () => {
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      try {
        const records = getSalesRecords();
        const userList = getUsers();
        setSalesRecords(records);
        setUsers(userList);
        setLoading(false);
      } catch (error) {
        console.error('Error loading sales data:', error);
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to real-time updates
    const unsubscribe = realTimeDataManager.subscribe('sales', loadData);
    
    return () => {
      unsubscribe();
    };
  }, []);

  const handleSalesUpdate = () => {
    // Trigger data reload when sales are updated
    const records = getSalesRecords();
    setSalesRecords(records);
    realTimeDataManager.notifyUpdate('sales');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

  const totalSales = salesRecords.reduce((sum, record) => sum + record.amount, 0);
  const todaySales = salesRecords.filter(record => {
    const today = new Date().toDateString();
    return new Date(record.date).toDateString() === today;
  }).reduce((sum, record) => sum + record.amount, 0);

  const activeSalesPersons = new Set(salesRecords.map(record => record.employeeId)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            Sales Tracker
          </h1>
          <p className="text-gray-600 mt-2">Track and manage sales performance</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalSales.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Sales</p>
              <p className="text-2xl font-bold text-gray-900">₹{todaySales.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Sales Persons</p>
              <p className="text-2xl font-bold text-gray-900">{activeSalesPersons}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{salesRecords.length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Form */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Sale</h2>
        <SalesForm onSalesAdded={handleSalesUpdate} />
      </div>

      {/* Sales Entry Manager */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Manage Sales Records</h2>
        <SalesEntryManager onSalesUpdated={handleSalesUpdate} />
      </div>
    </div>
  );
};