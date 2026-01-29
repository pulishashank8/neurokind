'use client';

import { useState, useEffect } from 'react';
import { Building2, Star, CheckCircle, MessageSquare } from 'lucide-react';

interface ProviderStats {
  totalProviders: number;
  verifiedProviders: number;
  totalReviews: number;
  topProviders: {
    id: string;
    name: string;
    rating: number | null;
    totalReviews: number;
    isVerified: boolean;
  }[];
}

export default function ProviderStatsPage() {
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProviderStats();
  }, []);

  async function fetchProviderStats() {
    try {
      const res = await fetch('/api/owner/stats?type=providers');
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/owner/login';
          return;
        }
        throw new Error('Failed to fetch stats');
      }
      const data = await res.json();
      if (data.totalProviders !== undefined) {
        setStats(data);
      } else {
        setStats({ totalProviders: 0, verifiedProviders: 0, totalReviews: 0, topProviders: [] });
      }
    } catch (error) {
      console.error('Error fetching provider stats:', error);
      setError('Failed to load provider statistics');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-500">
          <Building2 size={48} className="mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Provider Directory</h1>
        <p className="text-slate-400">Overview of autism specialists and reviews</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Building2 className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Providers</p>
              <p className="text-2xl font-bold text-white tabular-nums">{stats?.totalProviders || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <CheckCircle className="text-emerald-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Verified</p>
              <p className="text-2xl font-bold text-white tabular-nums">{stats?.verifiedProviders || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <MessageSquare className="text-amber-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Reviews</p>
              <p className="text-2xl font-bold text-white tabular-nums">{stats?.totalReviews || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Top Reviewed Providers</h2>

        {stats?.topProviders && stats.topProviders.length > 0 ? (
          <div className="space-y-4">
            {stats.topProviders.map((provider, index) => (
              <div key={provider.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-400 w-6">#{index + 1}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800">{provider.name}</p>
                      {provider.isVerified && (
                        <CheckCircle className="text-green-500" size={16} />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {provider.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="text-yellow-500" size={14} />
                          <span className="text-sm text-gray-600">{Number(provider.rating).toFixed(1)}</span>
                        </div>
                      )}
                      <span className="text-sm text-gray-500">{provider.totalReviews} reviews</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Building2 size={48} className="mx-auto mb-2 opacity-50" />
            <p>No providers in directory yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
