import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
      <div className="flex items-center">
        <div className={`${colorClasses[color]} rounded-xl p-3 mr-4 shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p
              className={`text-sm flex items-center mt-1 ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <span className={`mr-1 ${trend.isPositive ? '↗' : '↘'}`}>
                {trend.isPositive ? '↗' : '↘'}
              </span>
              {trend.isPositive ? '+' : ''}{trend.value}% from last month
            </p>
          )}
        </div>
      </div>
    </div>
  );
};