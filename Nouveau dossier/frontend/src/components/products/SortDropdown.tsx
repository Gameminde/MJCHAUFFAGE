'use client';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

type SortOption = {
  label: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

const SORT_OPTIONS: SortOption[] = [
  { label: 'Prix croissant', sortBy: 'price', sortOrder: 'asc' },
  { label: 'Prix décroissant', sortBy: 'price', sortOrder: 'desc' },
  { label: 'Nouveautés', sortBy: 'createdAt', sortOrder: 'desc' },
  { label: 'Plus anciens', sortBy: 'createdAt', sortOrder: 'asc' },
  { label: 'Nom A-Z', sortBy: 'name', sortOrder: 'asc' },
  { label: 'Nom Z-A', sortBy: 'name', sortOrder: 'desc' },
];

interface Props {
  currentSortBy?: string;
  currentSortOrder?: 'asc' | 'desc';
  onChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export function SortDropdown({ currentSortBy = 'createdAt', currentSortOrder = 'desc', onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const currentOption = SORT_OPTIONS.find(
    opt => opt.sortBy === currentSortBy && opt.sortOrder === currentSortOrder
  ) || SORT_OPTIONS[2]; // Default: Nouveautés

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white"
        aria-label="Trier les produits"
      >
        <span className="text-sm text-gray-700">Trier: {currentOption.label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
          {SORT_OPTIONS.map((option) => {
            const isActive = option.sortBy === currentSortBy && option.sortOrder === currentSortOrder;
            return (
              <button
                key={`${option.sortBy}-${option.sortOrder}`}
                onClick={() => {
                  onChange(option.sortBy, option.sortOrder);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
