import React, { useMemo, useState, useEffect } from 'react';
import { X, SlidersHorizontal, Wrench, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';

export type FilterValues = {
  search?: string;
  categories?: string[];
  manufacturers?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  boilerModelId?: string; // Compatibility filter
};

type ListItem = { id: string; name: string; slug?: string; productCount?: number };
type BoilerModel = { id: string; name: string; series?: string; type?: string };

type Props = {
  locale: string;
  categories?: ListItem[];
  manufacturers?: ListItem[];
  value?: FilterValues;
  onChange: (next: FilterValues) => void;
  isMobile?: boolean;
  onClose?: () => void;
};

function toggleArrayValue(arr: string[] | undefined, value: string): string[] {
  const current = Array.isArray(arr) ? arr : [];
  return current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
}

export default function FilterSidebarOptimized({
  locale,
  categories = [],
  manufacturers = [],
  value = {},
  onChange,
  isMobile = false,
  onClose,
}: Props) {
  const isArabic = locale === "ar";
  const [localPriceRange, setLocalPriceRange] = useState({
    min: value.minPrice?.toString() || '',
    max: value.maxPrice?.toString() || '',
  });

  // Compatibility State
  const [compatibilityMode, setCompatibilityMode] = useState(!!value.boilerModelId);
  const [selectedBoilerBrand, setSelectedBoilerBrand] = useState<string>('');
  const [boilerModels, setBoilerModels] = useState<BoilerModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // Sync compatibility mode with external value
  useEffect(() => {
    if (value.boilerModelId) {
      setCompatibilityMode(true);
      // Ideally we would fetch the brand of this model to pre-fill selectedBoilerBrand
      // For now we rely on user re-selecting if they want to change
    } else {
      // Don't auto-disable mode if just cleared, let user do it
    }
  }, [value.boilerModelId]);

  // Fetch Boiler Models when Brand selected
  useEffect(() => {
    if (!selectedBoilerBrand) {
      setBoilerModels([]);
      return;
    }

    const fetchModels = async () => {
      setLoadingModels(true);
      try {
        const result = await api.get(`/boilers/models?manufacturerId=${selectedBoilerBrand}`) as any;
        if (result.data?.success) {
          setBoilerModels(result.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch boiler models', error);
      } finally {
        setLoadingModels(false);
      }
    };
    fetchModels();
  }, [selectedBoilerBrand]);

  const update = React.useCallback(
    (partial: Partial<FilterValues>) => {
      const next = { ...value, ...partial } as FilterValues;
      onChange(next);
    },
    [value, onChange]
  );

  const handlePriceChange = (type: 'min' | 'max', priceValue: string) => {
    const numValue = priceValue === '' ? undefined : Number(priceValue);
    setLocalPriceRange(prev => ({ ...prev, [type]: priceValue }));

    if (type === 'min') {
      update({ minPrice: numValue });
    } else {
      update({ maxPrice: numValue });
    }
  };

  const clearPriceRange = () => {
    setLocalPriceRange({ min: '', max: '' });
    update({ minPrice: undefined, maxPrice: undefined });
  };

  const activeFiltersCount =
    (value.categories?.length || 0) +
    (value.manufacturers?.length || 0) +
    (value.inStock ? 1 : 0) +
    (value.featured ? 1 : 0) +
    ((value.minPrice !== undefined || value.maxPrice !== undefined) ? 1 : 0) +
    (value.boilerModelId ? 1 : 0);

  return (
    <div className={`bg-white ${isMobile ? '' : 'sticky top-4'} rounded-lg border border-neutral-200 p-6 shadow-sm`}>
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-neutral-600" />
            <h2 className="text-lg font-semibold text-neutral-900">
              {isArabic ? 'الفلاتر' : 'Filtres'}
            </h2>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-neutral-600" />
            <h3 className="font-semibold text-neutral-900">
              {isArabic ? 'فلترة المنتجات' : 'Filtrer les produits'}
            </h3>
          </div>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
      )}

      <div className="space-y-8">
        {/* 🚀 COMPATIBILITY FINDER (Integrated) */}
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="w-4 h-4 text-orange-600" />
            <h4 className="font-bold text-orange-900 text-sm">
              {isArabic ? 'البحث عن قطعة متوافقة' : 'Trouver ma pièce'}
            </h4>
          </div>
          
          <div className="space-y-3">
            {/* Brand Select */}
            <div>
              <label className="block text-xs text-neutral-600 mb-1 font-medium">
                {isArabic ? 'ماركة جهازي (المرجل)' : 'Marque de ma chaudière'}
              </label>
              <select
                value={selectedBoilerBrand}
                onChange={(e) => {
                  setSelectedBoilerBrand(e.target.value);
                  update({ boilerModelId: undefined }); // Reset model when brand changes
                }}
                className="w-full text-sm rounded-lg border-orange-200 focus:border-orange-500 focus:ring-orange-200 bg-white"
              >
                <option value="">{isArabic ? 'اختر الماركة...' : 'Choisir la marque...'}</option>
                {manufacturers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Model Select */}
            <div>
              <label className="block text-xs text-neutral-600 mb-1 font-medium">
                {isArabic ? 'موديل جهازي' : 'Modèle de ma chaudière'}
              </label>
              <select
                value={value.boilerModelId || ''}
                onChange={(e) => update({ boilerModelId: e.target.value || undefined })}
                disabled={!selectedBoilerBrand}
                className="w-full text-sm rounded-lg border-orange-200 focus:border-orange-500 focus:ring-orange-200 bg-white disabled:opacity-50 disabled:bg-neutral-100"
              >
                <option value="">
                  {loadingModels 
                    ? (isArabic ? 'جاري التحميل...' : 'Chargement...') 
                    : (isArabic ? 'اختر الموديل...' : 'Choisir le modèle...')}
                </option>
                {boilerModels.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.type ? `(${m.type})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {value.boilerModelId && (
               <div className="flex items-start gap-2 p-2 bg-green-50 rounded text-xs text-green-700 border border-green-100">
                 <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                 <span>
                   {isArabic 
                     ? 'يتم عرض القطع المتوافقة مع هذا الجهاز فقط.' 
                     : 'Affichage des pièces 100% compatibles.'}
                 </span>
               </div>
            )}
          </div>
        </div>

        <hr className="border-neutral-100" />

        {/* Categories */}
        <div>
          <h4 className="font-medium text-neutral-900 mb-3">
            {isArabic ? 'نوع القطعة (الفئة)' : 'Type de pièce (Catégorie)'}
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-200">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-3 cursor-pointer hover:bg-neutral-50 p-2 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={value.categories?.includes(category.id) || false}
                  onChange={() => update({
                    categories: toggleArrayValue(value.categories, category.id)
                  })}
                  className="w-4 h-4 text-orange-600 bg-neutral-100 border-neutral-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-neutral-700 flex-1">{category.name}</span>
                <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                  {category.productCount || 0}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Manufacturers (Product Brand) */}
        <div>
          <h4 className="font-medium text-neutral-900 mb-3">
            {isArabic ? 'ماركة القطعة' : 'Marque de la pièce'}
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-200">
            {manufacturers.map((manufacturer) => (
              <label key={manufacturer.id} className="flex items-center gap-3 cursor-pointer hover:bg-neutral-50 p-2 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={value.manufacturers?.includes(manufacturer.id) || false}
                  onChange={() => update({
                    manufacturers: toggleArrayValue(value.manufacturers, manufacturer.id)
                  })}
                  className="w-4 h-4 text-orange-600 bg-neutral-100 border-neutral-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-neutral-700 flex-1">{manufacturer.name}</span>
                <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                  {manufacturer.productCount || 0}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-neutral-900">
              {isArabic ? 'نطاق السعر' : 'Prix'}
            </h4>
            {(localPriceRange.min || localPriceRange.max) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearPriceRange}
                className="text-xs text-neutral-500 hover:text-neutral-700 h-auto py-1 px-2"
              >
                {isArabic ? 'مسح' : 'Effacer'}
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">
                {isArabic ? 'من (DZD)' : 'Min (DZD)'}
              </label>
              <Input
                type="number"
                placeholder="0"
                value={localPriceRange.min}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="text-sm h-10"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">
                {isArabic ? 'إلى (DZD)' : 'Max (DZD)'}
              </label>
              <Input
                type="number"
                placeholder="100000"
                value={localPriceRange.max}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="text-sm h-10"
              />
            </div>
          </div>
        </div>

        {/* Stock & Features */}
        <div className="space-y-3 pt-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={value.inStock || false}
                onChange={(e) => update({ inStock: e.target.checked })}
                className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-neutral-300 bg-white checked:border-orange-600 checked:bg-orange-600 focus:ring-2 focus:ring-orange-500/20"
              />
              <svg
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm text-neutral-700 group-hover:text-neutral-900">
              {isArabic ? 'متوفر في المخزون' : 'En stock uniquement'}
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={value.featured || false}
                onChange={(e) => update({ featured: e.target.checked })}
                className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-neutral-300 bg-white checked:border-orange-600 checked:bg-orange-600 focus:ring-2 focus:ring-orange-500/20"
              />
              <svg
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm text-neutral-700 group-hover:text-neutral-900">
              {isArabic ? 'منتجات مميزة' : 'Produits populaires'}
            </span>
          </label>
        </div>

        {/* Clear All Filters */}
        {activeFiltersCount > 0 && (
          <div className="pt-6 border-t border-neutral-200 sticky bottom-0 bg-white pb-2">
            <Button
              variant="outline"
              onClick={() => {
                update({
                  categories: undefined,
                  manufacturers: undefined,
                  minPrice: undefined,
                  maxPrice: undefined,
                  inStock: undefined,
                  featured: undefined,
                  boilerModelId: undefined,
                });
                setLocalPriceRange({ min: '', max: '' });
                setSelectedBoilerBrand('');
              }}
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
            >
              {isArabic ? 'مسح جميع الفلاتر' : 'Réinitialiser tous les filtres'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
