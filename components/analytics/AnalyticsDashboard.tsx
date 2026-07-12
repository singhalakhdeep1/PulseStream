import React, { useState, useEffect } from 'react';

interface AnalyticsData {
  totalViews: number;
  totalEngagements: number;
  followerGrowth: number;
  topPosts: any[];
  engagementRate: number;
  reach: number;
  impressions: number;
}

interface AnalyticsDashboardProps {
  userId: string;
}

export function AnalyticsDashboard({ userId }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/analytics?userId=${userId}&range=${timeRange}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-6">No analytics data available</div>;
  }

  const metrics = [
    { label: 'Total Views', value: data.totalViews.toLocaleString(), change: '+12%' },
    { label: 'Engagements', value: data.totalEngagements.toLocaleString(), change: '+8%' },
    { label: 'Followers', value: `+${data.followerGrowth.toLocaleString()}`, change: '+5%' },
    { label: 'Engagement Rate', value: `${data.engagementRate.toFixed(1)}%`, change: '+2%' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics</h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition ${
                timeRange === range
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="text-sm text-gray-500">{metric.label}</div>
            <div className="text-2xl font-bold mt-1">{metric.value}</div>
            <div className="text-sm text-green-500 mt-1">{metric.change}</div>
          </div>
        ))}
      </div>

      {/* Reach and Impressions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="font-semibold mb-4">Reach</h3>
          <div className="text-3xl font-bold">{data.reach.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-1">Unique accounts reached</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="font-semibold mb-4">Impressions</h3>
          <div className="text-3xl font-bold">{data.impressions.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-1">Total times content displayed</div>
        </div>
      </div>

      {/* Top performing posts */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="font-semibold mb-4">Top Performing Posts</h3>
        <div className="space-y-4">
          {data.topPosts.map((post, index) => (
            <div key={post.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm line-clamp-2">{post.content}</p>
                <div className="flex gap-4 mt-1 text-xs text-gray-500">
                  <span>👁 {post.views.toLocaleString()}</span>
                  <span>❤️ {post.likes.toLocaleString()}</span>
                  <span>💬 {post.comments.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-sm font-semibold text-green-500">
                {post.engagementRate.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement breakdown */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="font-semibold mb-4">Engagement Breakdown</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Likes</span>
              <span>45%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Comments</span>
              <span>30%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Shares</span>
              <span>15%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '15%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Saves</span>
              <span>10%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '10%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
