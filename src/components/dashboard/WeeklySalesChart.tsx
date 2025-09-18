import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { SalesRecord } from '../../types';
import { format, subDays, eachDayOfInterval } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface WeeklySalesChartProps {
  sales: SalesRecord[];
}

export const WeeklySalesChart: React.FC<WeeklySalesChartProps> = ({ sales }) => {
  const chartData = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, 6);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const labels = days.map(day => format(day, 'MMM dd'));
    const salesData = days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      return sales
        .filter(record => record.date === dayStr)
        .reduce((sum, record) => sum + record.totalAmount, 0);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Daily Sales (₹)',
          data: salesData,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [sales]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    backgroundColor: '#ffffff',
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#000000'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#e5e7eb'
        },
        ticks: {
          color: '#000000',
          callback: function(value: any) {
            return '₹' + value.toLocaleString();
          },
        },
      },
      x: {
        grid: {
          color: '#e5e7eb'
        },
        ticks: {
          color: '#000000',
          callback: function(value: any) {
            return '₹' + value.toLocaleString();
          },
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};