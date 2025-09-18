import React from 'react';
import { User } from '../../types';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome, {user.name}!</h2>
      <p className="text-gray-600">This is your personalized dashboard. Start building your widgets here.</p>
      {/* Add your dashboard content here */}
    </div>
  );
};

export default Dashboard;