import React, { useState } from 'react';
import { SalesRecord, User } from '../../types';
import { SalesReportForm } from './SalesReportForm';
import { SalesReports } from './SalesReports';
import { SalesAnalytics } from './SalesAnalytics';

interface SalesTrackerProps {
  sales: SalesRecord[];
  users: User[];
  currentUser: User;
  onSalesUpdate: (records: SalesRecord[]) => void;
}

export const SalesTracker: React.FC<SalesTrackerProps> = ({
  sales,
  users,
  currentUser,
  onSalesUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'entry' | 'reports' | 'analytics'>('entry');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Sales Tracking</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('entry')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'entry'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sales Report Form
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sales Reports
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'entry' && (
            <SalesReportForm
              currentUser={currentUser}
              onSalesAdd={(sale) => onSalesUpdate([...sales, sale])}
            />
          )}

          {activeTab === 'reports' && (
            <SalesReports
              sales={sales}
              users={users}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'analytics' && (
            <SalesAnalytics
              sales={sales}
              users={users}
              currentUser={currentUser}
            />
          )}
        </div>
      </div>
    </div>
  );
};