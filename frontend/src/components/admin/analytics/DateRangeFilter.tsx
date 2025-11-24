'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarIcon } from '@heroicons/react/24/outline';

const RANGES = [
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 90 Days', value: '90d' },
    { label: 'Last Year', value: '1y' }
];

export function DateRangeFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentRange = searchParams.get('range') || '7d';

    const handleRangeChange = (range: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('range', range);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            <div className="px-3 py-2 text-gray-500 border-r border-gray-100">
                <CalendarIcon className="w-5 h-5" />
            </div>
            <div className="flex gap-1">
                {RANGES.map((range) => (
                    <button
                        key={range.value}
                        onClick={() => handleRangeChange(range.value)}
                        className={`
                            px-4 py-1.5 text-sm font-medium rounded-md transition-colors
                            ${currentRange === range.value
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                        `}
                    >
                        {range.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
