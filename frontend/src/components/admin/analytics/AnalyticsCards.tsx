import { ArrowUpIcon, ArrowDownIcon, UsersIcon, CurrencyDollarIcon, ShoppingCartIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface Metrics {
    totalRevenue: number;
    revenueGrowth: number;
    totalOrders: number;
    averageOrderValue: number;
    conversionRate: number;
    liveVisitors: number;
}

export function AnalyticsCards({ metrics }: { metrics: Metrics }) {
    const cards = [
        {
            title: 'Total Revenue',
            value: `${metrics.totalRevenue.toLocaleString()} DZD`,
            change: metrics.revenueGrowth,
            icon: CurrencyDollarIcon,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            title: 'Conversion Rate',
            value: `${metrics.conversionRate.toFixed(2)}%`,
            change: 0, // Need historical data for this
            icon: ChartBarIcon,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            title: 'Avg Order Value',
            value: `${metrics.averageOrderValue.toLocaleString()} DZD`,
            change: 0,
            icon: ShoppingCartIcon,
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        },
        {
            title: 'Live Visitors',
            value: metrics.liveVisitors.toString(),
            change: null, // Real-time metric
            icon: UsersIcon,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            live: true
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card) => (
                <div key={card.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${card.bg}`}>
                            <card.icon className={`w-6 h-6 ${card.color}`} />
                        </div>
                        {card.live && (
                            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                Live
                            </span>
                        )}
                        {card.change !== null && !card.live && (
                            <div className={`flex items-center text-sm font-medium ${card.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {card.change >= 0 ? (
                                    <ArrowUpIcon className="w-4 h-4 mr-1" />
                                ) : (
                                    <ArrowDownIcon className="w-4 h-4 mr-1" />
                                )}
                                {Math.abs(card.change).toFixed(1)}%
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{card.title}</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
                    </div>
                </div>
            ))}
        </div>
    );
}
