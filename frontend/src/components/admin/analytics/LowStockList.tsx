import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Product {
    id: string;
    name: string;
    stock: number;
    minStock: number;
}

export function LowStockList({ products }: { products: Product[] }) {
    if (!products || products.length === 0) return null;

    return (
        <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-900">Low Stock Alert</h3>
                <span className="ml-auto bg-red-200 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full">
                    {products.length} Items
                </span>
            </div>
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                {products.map((product) => (
                    <div key={product.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">Threshold: {product.minStock}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-red-600">{product.stock} left</p>
                            <button className="text-xs text-blue-600 hover:underline mt-1">
                                Reorder
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
