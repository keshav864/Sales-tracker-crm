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
import { AttendanceRecord } from '../../types';
import { format, subDays, eachDayOfInterval } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AttendanceChartProps {
  attendance: AttendanceRecord[];
}

export const AttendanceChart: React.FC<AttendanceChartProps> = ({ attendance }) => {
  const chartData = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, 6);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const labels = days.map(day => format(day, 'MMM dd'));
    const presentData = days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      return attendance.filter(
        record => record.date === dayStr && record.status === 'present'
      ).length;
    });

    const lateData = days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      return attendance.filter(
        record => record.date === dayStr && record.status === 'late'
      ).length;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Present',
          data: presentData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          tension: 0.4,
        },
        {
          label: 'Late',
          data: lateData,
          borderColor: 'rgb(251, 191, 36)',
          backgroundColor: 'rgba(251, 191, 36, 0.2)',
          tension: 0.4,
        },
      ],
    };
  }, [attendance]);

  const options = {
    responsive: true,
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
          stepSize: 1,
        },
      },
      x: {
        grid: {
          color: '#f3f4f6'
        },
        ticks: {
          color: '#374151',
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div style={{ backgroundColor: '#ffffff' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};