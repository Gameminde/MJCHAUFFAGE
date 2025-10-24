'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Search, Share2, ExternalLink } from 'lucide-react';

interface TrafficSource {
  source: string;
  medium: string;
  sessions: number;
  percentage: number;
  bounceRate: number;
}

interface TrafficSourceData {
  sources: TrafficSource[];
  totalSessions: number;
}

export function TrafficSourceChart() {
  const [trafficData, setTrafficData] = useState<TrafficSourceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('7d');

  useEffect(() => {
    fetchTrafficData();
  }, [timeframe]);

  const fetchTrafficData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from API
      const response = await fetch(`/api/analytics/traffic-sources?timeframe=${timeframe}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTrafficData(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch traffic data');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
    } catch (err) {
      setError('Failed to load traffic source data');
      console.error('Traffic source fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (source: string, medium: string) => {
    if (medium === 'organic' || source.includes('google') || source.includes('bing')) {
      return <Search className="h-5 w-5 text-blue-600" />;
    }
    if (medium === 'social' || source.includes('facebook') || source.includes('twitter')) {
      return <Share2 className="h-5 w-5 text-purple-600" />;
    }
    if (source === 'direct') {
      return <Globe className="h-5 w-5 text-green-600" />;
    }
    return <ExternalLink className="h-5 w-5 text-gray-600" />;
  };

  const getSourceColor = (source: string, medium: string) => {
    if (medium === 'organic') return 'bg-blue-100 border-blue-200';
    if (medium === 'social') return 'bg-purple-100 border-purple-200';
    if (source === 'direct') return 'bg-green-100 border-green-200';
    return 'bg-gray-100 border-gray-200';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchTrafficData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Traffic Sources</h3>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {trafficData && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{trafficData.totalSessions.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Sessions</p>
            </div>
          </div>

          {/* Source List */}
          <div className="space-y-3">
            {trafficData.sources.length > 0 ? (
              trafficData.sources.map((source, index) => (
              <div key={`${source.source}-${source.medium}`} className="flex items-center space-x-4">
                {/* Icon */}
                <div className={`p-2 rounded-lg border ${getSourceColor(source.source, source.medium)}`}>
                  {getSourceIcon(source.source, source.medium)}
                </div>

                {/* Source Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {source.source}
                    </p>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {source.medium}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{source.sessions.toLocaleString()} sessions</span>
                      <span>{source.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Bounce Rate */}
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{source.bounceRate}%</p>
                  <p className="text-xs text-gray-500">Bounce Rate</p>
                </div>
              </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No traffic data available</p>
                <p className="text-sm text-gray-500 mt-1">
                  {(trafficData as any).message || 'Data will appear here once visitors start browsing your site.'}
                </p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-blue-600" />
                <span>Search Engine</span>
              </div>
              <div className="flex items-center space-x-2">
                <Share2 className="h-4 w-4 text-purple-600" />
                <span>Social Media</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-green-600" />
                <span>Direct Traffic</span>
              </div>
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4 text-gray-600" />
                <span>Referral</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}