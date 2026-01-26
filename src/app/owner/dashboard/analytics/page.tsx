'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, FileText, MessageSquare, Download } from 'lucide-react';

interface ChartData {
  date: string;
  users: number;
  posts: number;
  comments: number;
}

export default function AnalyticsPage() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrowthData();
  }, []);

  async function fetchGrowthData() {
    try {
      const res = await fetch('/api/owner/stats?type=growth');
      const data = await res.json();
      setChartData(data.chartData || []);
    } catch (error) {
      console.error('Error fetching growth data:', error);
    } finally {
      setLoading(false);
    }
  }

  const maxUsers = Math.max(...chartData.map(d => d.users), 1);
  const maxPosts = Math.max(...chartData.map(d => d.posts), 1);
  const maxComments = Math.max(...chartData.map(d => d.comments), 1);
  const maxValue = Math.max(maxUsers, maxPosts, maxComments);

  const totalUsers = chartData.reduce((sum, d) => sum + d.users, 0);
  const totalPosts = chartData.reduce((sum, d) => sum + d.posts, 0);
  const totalComments = chartData.reduce((sum, d) => sum + d.comments, 0);

  async function handleExport(type: string) {
    window.open(`/api/owner/export?type=${type}`, '_blank');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Analytics & Growth</h1>
          <p className="text-gray-500">Track platform growth over the last 30 days</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('users')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Download size={16} />
            Export Users
          </button>
          <button
            onClick={() => handleExport('posts')}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Download size={16} />
            Export Posts
          </button>
          <button
            onClick={() => handleExport('activity')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            <Download size={16} />
            Export Activity
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">New Users (30 days)</p>
              <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">New Posts (30 days)</p>
              <p className="text-2xl font-bold text-gray-800">{totalPosts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <MessageSquare className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">New Comments (30 days)</p>
              <p className="text-2xl font-bold text-gray-800">{totalComments}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="text-gray-600" size={24} />
          <h2 className="text-lg font-semibold text-gray-800">Growth Chart (Last 30 Days)</h2>
        </div>

        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Posts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-sm text-gray-600">Comments</span>
          </div>
        </div>

        <div className="relative h-64">
          <div className="absolute inset-0 flex items-end justify-between gap-1">
            {chartData.map((day, i) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1" title={day.date}>
                <div className="w-full flex gap-0.5 items-end h-48">
                  <div
                    className="flex-1 bg-blue-500 rounded-t transition-all"
                    style={{ height: `${(day.users / maxValue) * 100}%`, minHeight: day.users > 0 ? '4px' : '0' }}
                  ></div>
                  <div
                    className="flex-1 bg-green-500 rounded-t transition-all"
                    style={{ height: `${(day.posts / maxValue) * 100}%`, minHeight: day.posts > 0 ? '4px' : '0' }}
                  ></div>
                  <div
                    className="flex-1 bg-purple-500 rounded-t transition-all"
                    style={{ height: `${(day.comments / maxValue) * 100}%`, minHeight: day.comments > 0 ? '4px' : '0' }}
                  ></div>
                </div>
                {i % 5 === 0 && (
                  <span className="text-xs text-gray-400 rotate-45 origin-left whitespace-nowrap">
                    {day.date.slice(5)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {chartData.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
            <p>No data available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
