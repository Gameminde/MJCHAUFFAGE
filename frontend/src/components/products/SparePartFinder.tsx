'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Wrench, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';

interface Manufacturer {
  id: string;
  name: string;
  slug: string;
}

interface BoilerModel {
  id: string;
  name: string;
  series?: string;
  type?: string;
}

export function SparePartFinder() {
  const router = useRouter();
  const { locale } = useLanguage();
  const supabase = createClient();

  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [models, setModels] = useState<BoilerModel[]>([]);

  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');

  const [loadingManufacturers, setLoadingManufacturers] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);

  // 1. Fetch Manufacturers
  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        const { data, error } = await supabase
          .from('manufacturers')
          .select('id, name, slug')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        if (data) {
          setManufacturers(data);
        }
      } catch (error) {
        console.error('Failed to fetch manufacturers', error);
      } finally {
        setLoadingManufacturers(false);
      }
    };
    fetchManufacturers();
  }, []);

  // 2. Fetch Models when Manufacturer selected
  useEffect(() => {
    if (!selectedManufacturer) {
      setModels([]);
      setSelectedModel('');
      return;
    }

    const fetchModels = async () => {
      setLoadingModels(true);
      try {
        const { data, error } = await supabase
          .from('boiler_models')
          .select('id, name, series, type')
          .eq('manufacturer_id', selectedManufacturer)
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        if (data) {
          setModels(data);
        }
      } catch (error) {
        console.error('Failed to fetch models', error);
      } finally {
        setLoadingModels(false);
      }
    };
    fetchModels();
  }, [selectedManufacturer]);

  const handleSearch = () => {
    if (selectedModel) {
      router.push(`/${locale}/products?boilerModel=${selectedModel}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-100">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Wrench className="w-6 h-6" />
          <h2 className="text-xl font-bold">
            {locale === 'ar' ? 'البحث عن قطع الغيار' : 'Trouver votre pièce'}
          </h2>
        </div>
        <p className="text-primary-100 text-sm">
          {locale === 'ar'
            ? 'اختر ماركة وموديل جهازك للعثور على القطع المتوافقة 100%'
            : 'Sélectionnez la marque et le modèle pour voir les pièces 100% compatibles'
          }
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Step 1: Manufacturer */}
        <div className="space-y-3">
          <label className="block text-base font-medium text-neutral-700">
            {locale === 'ar' ? '1. الماركة (Fabricant)' : '1. Marque (Fabricant)'}
          </label>
          <div className="relative">
            <select
              value={selectedManufacturer}
              onChange={(e) => setSelectedManufacturer(e.target.value)}
              className="w-full px-4 py-4 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all bg-neutral-50 text-base appearance-none"
              disabled={loadingManufacturers}
            >
              <option value="">
                {loadingManufacturers
                  ? (locale === 'ar' ? 'جاري التحميل...' : 'Chargement...')
                  : (locale === 'ar' ? 'اختر الماركة...' : 'Choisir la marque...')}
              </option>
              {manufacturers.map((man) => (
                <option key={man.id} value={man.id}>
                  {man.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
              <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>
        </div>

        {/* Step 2: Model */}
        <div className="space-y-3">
          <label className="block text-base font-medium text-neutral-700">
            {locale === 'ar' ? '2. الموديل (Modèle)' : '2. Modèle (Chaudière)'}
          </label>
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-4 py-4 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all bg-neutral-50 disabled:opacity-50 text-base appearance-none"
              disabled={!selectedManufacturer || loadingModels}
            >
              <option value="">
                {loadingModels
                  ? (locale === 'ar' ? 'جاري التحميل...' : 'Chargement...')
                  : !selectedManufacturer
                    ? (locale === 'ar' ? 'اختر الماركة أولاً' : 'Sélectionnez la marque d\'abord')
                    : (locale === 'ar' ? 'اختر الموديل...' : 'Choisir le modèle...')}
              </option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} {model.type ? `(${model.type})` : ''}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
              <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
            {selectedManufacturer && !loadingModels && models.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                {locale === 'ar' ? 'لا توجد موديلات متاحة' : 'Aucun modèle trouvé'}
              </p>
            )}
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={!selectedModel}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all ${selectedModel
              ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-primary-500/30 transform hover:-translate-y-0.5'
              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
            }`}
        >
          <Search className="w-5 h-5" />
          {locale === 'ar' ? 'بحث عن القطع' : 'Voir les pièces compatibles'}
          {selectedModel && <ChevronRight className="w-5 h-5" />}
        </button>

        {/* Trust Indicators */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-center gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            <span>Compatibilité garantie</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            <span>Pièces d'origine</span>
          </div>
        </div>
      </div>
    </div>
  );
}
