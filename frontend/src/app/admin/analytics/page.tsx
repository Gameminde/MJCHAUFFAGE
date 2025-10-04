import { AnalyticsDashboard } from '../../../components/analytics/AnalyticsDashboard';
import { TrafficSourceChart } from '../../../components/analytics/TrafficSourceChart';
import { ConversionMetrics } from '../../../components/analytics/ConversionMetrics';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Main Dashboard */}
        <AnalyticsDashboard />
        
        {/* Additional Analytics Components */}
        <div className="px-6 pb-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Sources */}
            <TrafficSourceChart />
            
            {/* Conversion Metrics */}
            <ConversionMetrics />
          </div>
        </div>
      </div>
    </div>
  );
}