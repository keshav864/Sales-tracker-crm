import React, { useState, useEffect } from 'react';
import { SalesForm } from './SalesForm';
import { SalesEntryManager } from './SalesEntryManager';
import { SalesRecord, User } from '../../types';
import { salesService } from '../../services/salesService';
import { TrendingUp, Users, Target, Calendar } from 'lucide-react';

interface SalesTrackerProps {
  users: User[];
  sales: SalesRecord[];
  currentUser: User;
  onSalesUpdate: (sales: SalesRecord[]) => void;
}

export const SalesTracker: React.FC<SalesTrackerProps> = ({
  users,
  sales,
  currentUser,
  onSalesUpdate,
}) => {
  const totalSales = sales.reduce((sum, record) => sum + record.totalAmount, 0);
  const todaySales = sales.filter(record => {
    const today = new Date().toDateString();
    return new Date(record.date).toDateString() === today;
  }).reduce((sum, record) => sum + record.totalAmount, 0);

  const activeSalesPersons = new Set(sales.map(record => record.userId)).size;

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
              <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
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
        <SalesForm 
          currentUser={currentUser}
          onSalesAdd={(sale) => onSalesUpdate([...sales, sale])}
        />
      </div>

      {/* Sales Entry Manager */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Manage Sales Records</h2>
        <SalesEntryManager 
          sales={sales}
          users={users}
          currentUser={currentUser}
          onSalesUpdate={onSalesUpdate}
        />
      </div>
    </div>
  );
};