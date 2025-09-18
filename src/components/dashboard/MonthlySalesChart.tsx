import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { SalesRecord } from '../../types';
import { format, subMonths, eachMonthOfInterval } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlySalesChartProps {
  sales: SalesRecord[];
}

export const MonthlySalesChart: React.FC<MonthlySalesChartProps> = ({ sales }) => {
  const chartData = useMemo(() => {
    const endDate = new Date();
    const startDate = subMonths(endDate, 5);
    const months = eachMonthOfInterval({ start: startDate, end: endDate });

    const labels = months.map(month => format(month, 'MMM yyyy'));
    const salesData = months.map(month => {
      const monthStr = format(month, 'yyyy-MM');
      return sales
        .filter(record => record.date.startsWith(monthStr))
        .reduce((sum, record) => sum + record.totalAmount, 0);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Monthly Sales (₹)',
          data: salesData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [sales]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#374151'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6'
        },
        ticks: {
          color: '#374151',
          callback: function(value: any) {
            return '₹' + value.toLocaleString();
          },
        },
      },
      x: {
        grid: {
          color: '#f3f4f6'
        },
        ticks: {
          color: '#374151',
        },
      },
    },
  };

  return (
    <div style={{ height: '300px', backgroundColor: '#ffffff' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};