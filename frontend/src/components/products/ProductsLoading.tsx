"use client";

import React from "react";

export function ProductsLoading({ count = 9 }: { count?: number }) {
  const items = Array.from({ length: count });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden animate-pulse"
        >
          <div className="relative h-64 bg-gray-200">
            <div className="absolute top-4 left-4 h-5 w-24 bg-gray-300 rounded-full" />
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
              <div className="h-8 w-32 bg-gray-300 rounded-full" />
              <div className="h-6 w-20 bg-gray-300 rounded-lg" />
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-24 bg-gray-300 rounded-full" />
              <div className="h-6 w-16 bg-gray-200 rounded-full" />
            </div>
            <div className="h-6 w-3/4 bg-gray-300 rounded mb-3" />
            <div className="h-4 w-full bg-gray-200 rounded mb-2" />
            <div className="h-4 w-2/3 bg-gray-200 rounded mb-6" />
            <div className="flex items-center justify-between mb-6">
              <div className="h-7 w-40 bg-gray-300 rounded" />
              <div className="h-6 w-24 bg-gray-200 rounded" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-full bg-gray-300 rounded-xl" />
              <div className="h-10 w-10 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
