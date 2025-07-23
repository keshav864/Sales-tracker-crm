import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { SalesRecord, User } from '../../types';
import { format, subDays, eachDayOfInterval } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface SalesAnalyticsProps {
  sales: SalesRecord[];
  users: User[];
  currentUser: User;
}

export const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({
  sales,
  users,
  currentUser,
}) => {
  const canViewAll = currentUser.role === 'admin' || currentUser.role === 'manager';
  const relevantSales = canViewAll ? sales : sales.filter(sale => sale.userId === currentUser.id);

  const weeklyData = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, 6);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const labels = days.map(day => format(day, 'MMM dd'));
    const salesData = days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      return relevantSales
        .filter(record => record.date === dayStr)
        .reduce((sum, record) => sum + record.totalAmount, 0);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Daily Sales ($)',
          data: salesData,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
      ],
    };
  }, [relevantSales]);

  const categoryData = useMemo(() => {
    const categories = relevantSales.reduce((acc, sale) => {
      acc[sale.category] = (acc[sale.category] || 0) + sale.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(categories),
      datasets: [
        {
          data: Object.values(categories),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(147, 51, 234, 0.8)',
          ],
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  }, [relevantSales]);

  const performanceData = useMemo(() => {
    if (!canViewAll) return null;

    const userSales = users.map(user => {
      const userSalesRecords = sales.filter(sale => sale.userId === user.id);
      const totalSales = userSalesRecords.reduce((sum, sale) => sum + sale.totalAmount, 0);
      return {
        name: user.name,
        sales: totalSales,
      };
    }).filter(user => user.sales > 0);

    return {
      labels: userSales.map(user => user.name),
      datasets: [
        {
          label: 'Total Sales ($)',
          data: userSales.map(user => user.sales),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
        },
      ],
    };
  }, [sales, users, canViewAll]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          },
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Weekly Sales Trend
          </h3>
          <Bar data={weeklyData} options={chartOptions} />
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sales by Category
          </h3>
          <div className="h-64">
            <Pie data={categoryData} options={pieOptions} />
          </div>
        </div>
      </div>

      {canViewAll && performanceData && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sales Team Performance
          </h3>
          <Bar data={performanceData} options={chartOptions} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h4>
          <p className="text-xl font-bold text-green-600">
            ${relevantSales.reduce((sum, sale) => sum + sale.totalAmount, 0).toLocaleString()}
          </p>
        </div>
        <div className="card text-center">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Average Sale</h4>
          <p className="text-xl font-bold text-blue-600">
            ${relevantSales.length > 0 
              ? (relevantSales.reduce((sum, sale) => sum + sale.totalAmount, 0) / relevantSales.length).toFixed(2)
              : '0.00'
            }
          </p>
        </div>
        <div className="card text-center">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Top Category</h4>
          <p className="text-xl font-bold text-purple-600 capitalize">
            {Object.entries(
              relevantSales.reduce((acc, sale) => {
                acc[sale.category] = (acc[sale.category] || 0) + sale.totalAmount;
                return acc;
              }, {} as Record<string, number>)
            ).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
          </p>
        </div>
        <div className="card text-center">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Total Transactions</h4>
          <p className="text-xl font-bold text-orange-600">{relevantSales.length}</p>
        </div>
      </div>
    </div>
  );
};