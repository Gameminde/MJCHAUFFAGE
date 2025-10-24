"use client";

import React from "react";
import { Search, RefreshCw } from "lucide-react";

export function ProductsEmpty({
  locale,
  hasActiveFilters,
  onResetFilters,
}: {
  locale: string;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}) {
  const isArabic = locale === "ar";
  return (
    <div className="bg-white rounded-2xl shadow border border-gray-100 p-12 text-center">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {isArabic ? "لا توجد منتجات" : "Aucun produit"}
      </h3>
      <p className="text-gray-600 mb-6">
        {hasActiveFilters
          ? isArabic
            ? "جرب إعادة تعيين الفلاتر أو تعديلها."
            : "Essayez de réinitialiser ou d'ajuster vos filtres."
          : isArabic
            ? "لا توجد produits à afficher pour le moment."
            : "Aucun produit à afficher pour le moment."}
      </p>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" />
          {isArabic ? "إعادة تعيين الفلاتر" : "Réinitialiser les filtres"}
        </button>
      )}
    </div>
  );
}
