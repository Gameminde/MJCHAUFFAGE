'use client'

import Image from 'next/image';
import { TopProduct } from '@/services/extendedAnalyticsService';

interface TopProductsListProps {
    products: TopProduct[];
}

export function TopProductsList({ products }: TopProductsListProps) {
    if (products.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
                <p className="text-gray-500 text-center py-8">No sales data available</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">🏆 Top Products</h3>
            <div className="space-y-4">
                {products.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold">
                            {index + 1}
                        </div>

                        {product.image_url && (
                            <div className="flex-shrink-0 w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100">
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.sales} units sold</p>
                        </div>

                        <div className="flex-shrink-0 text-right">
                            <p className="text-sm font-semibold text-gray-900">
                                {product.revenue.toLocaleString()} DA
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
