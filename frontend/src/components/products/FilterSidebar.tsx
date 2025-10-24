"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

export type FilterValues = {
  search?: string;
  categories?: string[];
  manufacturers?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean; // new: allow toggling featured products
  limit?: number; // new: items per page
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

type ListItem = { id: string; name: string; slug?: string; productCount?: number };

type Props = {
  locale: string;
  categories?: ListItem[];
  manufacturers?: ListItem[];
  value?: FilterValues;
  onChange: (next: FilterValues) => void;
};

function toggleArrayValue(arr: string[] | undefined, value: string): string[] {
  const current = Array.isArray(arr) ? arr : [];
  return current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
}
export default function FilterSidebar({
  locale,
  categories = [],
  manufacturers = [],
  value = {},
  onChange,
}: Props) {
  const isArabic = locale === "ar";
  const PRICE_MIN = 0;
  const PRICE_MAX = 500000;
  const [localMin, setLocalMin] = useState<number | undefined>(value.minPrice);
  const [localMax, setLocalMax] = useState<number | undefined>(value.maxPrice);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setLocalMin(value.minPrice);
    setLocalMax(value.maxPrice);
  }, [value.minPrice, value.maxPrice]);

  const handleDebouncedPriceChange = (nextMin?: number, nextMax?: number) => {
    setLocalMin(nextMin);
    setLocalMax(nextMax);
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      update({ minPrice: nextMin, maxPrice: nextMax });
    }, 300);
  };

  const update = useCallback(
    (partial: Partial<FilterValues>) => {
      const next = { ...value, ...partial } as FilterValues;
      onChange(next);
    },
    [value, onChange]
  );

  return (
    <aside
      className={`w-full lg:w-80 bg-white rounded-2xl shadow border border-gray-100 p-4 ${
        isArabic ? "rtl" : ""
      }`}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {isArabic ? "تصفية المنتجات" : "Filtres produits"}
      </h3>

      {/* Categories */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          {isArabic ? "الفئات" : "Catégories"}
        </h4>
        <div className="space-y-2 max-h-48 overflow-auto pr-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                checked={(value.categories ?? []).includes(cat.id)}
                onChange={() => update({
                  categories: toggleArrayValue(value.categories, cat.id),
                })}
              />
              <span className="text-gray-700">
                {cat.name}
                {typeof cat.productCount === "number" && (
                  <span className="ml-2 text-gray-400">({cat.productCount})</span>
                )}
              </span>
            </label>
          ))}
          {categories.length === 0 && (
            <div className="text-xs text-gray-400">
              {isArabic ? "لا توجد فئات" : "Aucune catégorie disponible"}
            </div>
          )}
        </div>
      </div>
      {/* Manufacturers */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          {isArabic ? "العلامات التجارية" : "Marques"}
        </h4>
        <div className="space-y-2 max-h-48 overflow-auto pr-2">
          {manufacturers.map((m) => (
            <label key={m.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                checked={(value.manufacturers ?? []).includes(m.id)}
                onChange={() => update({
                  manufacturers: toggleArrayValue(value.manufacturers, m.id),
                })}
              />
              <span className="text-gray-700">
                {m.name}
                {typeof m.productCount === "number" && (
                  <span className="ml-2 text-gray-400">({m.productCount})</span>
                )}
              </span>
            </label>
          ))}
          {manufacturers.length === 0 && (
            <div className="text-xs text-gray-400">
              {isArabic ? "لا توجد علامات تجارية" : "Aucune marque disponible"}
            </div>
          )}
        </div>
      </div>
      {/* In stock */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="rounded border-gray-300"
            checked={Boolean(value.inStock)}
            onChange={(e) => update({ inStock: e.target.checked })}
          />
          <span className="text-gray-700">
            {isArabic ? "متوفر في المخزون" : "En stock"}
          </span>
        </label>
      </div>
      {/* Featured */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="rounded border-gray-300"
            checked={Boolean(value.featured)}
            onChange={(e) => update({ featured: e.target.checked })}
          />
          <span className="text-gray-700">
            {isArabic ? "مميز" : "Mis en avant"}
          </span>
        </label>
      </div>

      {/* Price range */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          {isArabic ? "نطاق السعر" : "Prix"}
        </h4>
        {/* Numeric inputs */}
        <div className="flex items-center gap-3 mb-3">
          <input
            type="number"
            inputMode="numeric"
            placeholder={isArabic ? "د.ج الحد الأدنى" : "DA min"}
            className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            value={localMin ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              const num = val === '' ? undefined : Number(val);
              handleDebouncedPriceChange(num, localMax);
            }}
          />
          <span className="text-gray-400">—</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder={isArabic ? "د.ج الحد الأقصى" : "DA max"}
            className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            value={localMax ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              const num = val === '' ? undefined : Number(val);
              handleDebouncedPriceChange(localMin, num);
            }}
          />
        </div>
        {/* Range sliders with debounce */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={1000}
              className="flex-1"
              value={localMin ?? PRICE_MIN}
              onChange={(e) => {
                const next = Number(e.target.value);
                handleDebouncedPriceChange(next, localMax);
              }}
            />
            <span className="text-xs text-gray-500">{localMin ?? PRICE_MIN} DA</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={1000}
              className="flex-1"
              value={localMax ?? PRICE_MAX}
              onChange={(e) => {
                const next = Number(e.target.value);
                handleDebouncedPriceChange(localMin, next);
              }}
            />
            <span className="text-xs text-gray-500">{localMax ?? PRICE_MAX} DA</span>
          </div>
        </div>
      </div>

      {/* Limit per page */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          {isArabic ? "عدد العناصر لكل صفحة" : "Éléments par page"}
        </h4>
        <select
          className="w-36 px-3 py-2 border border-gray-200 rounded-lg text-sm"
          value={value.limit ?? 12}
          onChange={(e) => update({ limit: Number(e.target.value) })}
        >
          <option value={12}>12</option>
          <option value={24}>24</option>
          <option value={48}>48</option>
        </select>
      </div>
      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => {
            // noop: filters already apply on each change, this can serve as explicit action hook later
            onChange({ ...value });
          }}
        >
          {isArabic ? "تطبيق" : "Appliquer"}
        </button>
        <button
          type="button"
          className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          onClick={() => {
            onChange({});
          }}
        >
          {isArabic ? "إعادة تعيين" : "Réinitialiser"}
        </button>
      </div>
    </aside>
  );
}
