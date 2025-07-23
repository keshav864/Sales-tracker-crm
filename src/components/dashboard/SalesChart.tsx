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

interface SalesChartProps {
  sales: SalesRecord[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ sales }) => {
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
          label: 'Daily Sales ($)',
          data: salesData,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
      ],
    };
  }, [sales]);

  const options = {
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

  return <Bar data={chartData} options={options} />;
};