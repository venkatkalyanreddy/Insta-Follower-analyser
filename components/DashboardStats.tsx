import React from 'react';
import { AnalysisStats } from '../types';
import { Users, UserMinus, UserPlus, Repeat, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStatsProps {
  stats: AnalysisStats;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const data = [
    { name: 'Mutual', value: stats.mutualCount, color: '#8b5cf6' }, // Violet 500
    { name: 'Not Following Back', value: stats.notFollowingBackCount, color: '#f43f5e' }, // Rose 500
    { name: 'Fans', value: stats.fansCount, color: '#10b981' }, // Emerald 500
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Cards */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Not Following Back</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.notFollowingBackCount}</h3>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-rose-500">
            <UserMinus size={24} />
          </div>
        </div>
        <div className="mt-4 text-xs text-rose-600 font-medium">
          {((stats.notFollowingBackCount / stats.followingCount) * 100).toFixed(1)}% of your following
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Fans (They follow you)</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.fansCount}</h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500">
            <UserPlus size={24} />
          </div>
        </div>
        <div className="mt-4 text-xs text-emerald-600 font-medium">
          {((stats.fansCount / stats.followersCount) * 100).toFixed(1)}% of your followers
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Mutual Connections</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.mutualCount}</h3>
          </div>
          <div className="p-3 bg-violet-50 rounded-xl text-violet-500">
            <Repeat size={24} />
          </div>
        </div>
         <div className="mt-4 text-xs text-violet-600 font-medium">
          Real friends
        </div>
      </div>

       <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
         <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Follow Ratio</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.followRatio.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="mt-4 text-xs text-blue-600 font-medium">
            {stats.followRatio > 1 ? 'Influencer territory' : 'Normal user'}
          </div>
      </div>

      {/* Chart Section */}
      <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-2">
        <h4 className="text-lg font-bold text-gray-800 mb-6">Network Composition</h4>
        <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#374151' }}
                />
              </PieChart>
            </ResponsiveContainer>
             <div className="flex flex-col justify-center space-y-3 ml-8">
              {data.map((item) => (
                <div key={item.name} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
