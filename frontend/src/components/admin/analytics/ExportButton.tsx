'use client';

import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface ExportButtonProps {
    data: any;
    filename?: string;
}

export function ExportButton({ data, filename = 'dashboard-export' }: ExportButtonProps) {
    const handleExport = () => {
        if (!data) return;

        // Flatten data for CSV
        // This is a simplified export. For complex nested data, we might need a better strategy.
        // Here we assume 'data' is an object with keys as sections.

        const rows = [];

        // Metrics
        if (data.metrics) {
            rows.push(['Metric', 'Value']);
            Object.entries(data.metrics).forEach(([key, value]) => {
                rows.push([key, value]);
            });
            rows.push([]); // Empty line
        }

        // Revenue Trend
        if (data.revenueTrend) {
            rows.push(['Date', 'Revenue']);
            data.revenueTrend.forEach((item: any) => {
                rows.push([item.date, item.revenue]);
            });
            rows.push([]);
        }

        // Funnel
        if (data.funnel) {
            rows.push(['Step', 'Count', 'DropOff']);
            data.funnel.forEach((item: any) => {
                rows.push([item.step, item.count, item.dropOff]);
            });
            rows.push([]);
        }

        // Convert to CSV string
        const csvContent = "data:text/csv;charset=utf-8,"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export Data
        </button>
    );
}
