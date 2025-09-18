import React, { useState, useMemo } from 'react';
import { Search, Filter, TrendingUp, Calendar } from 'lucide-react';
import { SalesRecord, User } from '../../types';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

interface SalesReportsProps {
  sales: SalesRecord[];
  users: User[];
  currentUser: User;
}

export const SalesReports: React.FC<SalesReportsProps> = ({
  sales,
  users,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'customer'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const canViewAllSales = currentUser.role === 'admin' || currentUser.role === 'manager';

  const filteredSales = useMemo(() => {
    let filtered = canViewAllSales ? sales : sales.filter(sale => sale.userId === currentUser.id);

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by user
    if (filterUser !== 'all') {
      filtered = filtered.filter(sale => sale.userId === filterUser);
    }

    // Filter by period
    const now = new Date();
    if (filterPeriod === 'today') {
      const today = formatDate(now);
      filtered = filtered.filter(sale => sale.date === today);
    } else if (filterPeriod === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(sale => new Date(sale.date) >= weekAgo);
    } else if (filterPeriod === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      filtered = filtered.filter(sale => new Date(sale.date) >= monthAgo);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.totalAmount - b.totalAmount;
          break;
        case 'customer':
          comparison = a.customer.localeCompare(b.customer);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [sales, searchTerm, filterUser, filterPeriod, sortBy, sortOrder, currentUser, canViewAllSales]);

  const totalAmount = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const averageAmount = filteredSales.length > 0 ? totalAmount / filteredSales.length : 0;

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-900">Sales Reports</h3>
        </div>

        <div className="flex flex-wrap items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 max-w-xs"
            />
          </div>

          {canViewAllSales && (
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 max-w-xs"
            >
              <option value="all">All Salespeople</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 max-w-xs"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 text-center">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Total Sales</h4>
          <p className="text-xl md:text-2xl font-bold text-green-600">₹{totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 text-center">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Number of Sales</h4>
          <p className="text-xl md:text-2xl font-bold text-blue-600">{filteredSales.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 text-center">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Average Sale</h4>
          <p className="text-xl md:text-2xl font-bold text-purple-600">₹{averageAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base md:text-lg font-semibold text-gray-900">Sales Transactions</h4>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as 'date' | 'amount' | 'customer');
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="w-full px-3 md:px-4 py-2 md:py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 max-w-xs text-sm"
            >
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
              <option value="customer-asc">Customer (A-Z)</option>
              <option value="customer-desc">Customer (Z-A)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                {canViewAllSales && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salesperson
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map(sale => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(sale.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{sale.productName}</div>
                      <div className="text-sm text-gray-500 capitalize">{sale.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ${sale.totalAmount.toLocaleString()}
                  </td>
                  {canViewAllSales && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getUserName(sale.userId)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div className="text-center py-12 bg-white">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No sales records found for the selected criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};