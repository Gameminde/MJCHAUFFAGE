'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Clock, CheckCircle, Settings, Wrench, AlertTriangle, Phone, Shield } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  icon?: 'settings' | 'wrench' | 'alert';
}

interface ServicesPageClientProps {
  services: Service[];
  locale: string;
}

const iconMap = {
  settings: Settings,
  wrench: Wrench,
  alert: AlertTriangle,
  default: Wrench,
};

export default function ServicesPageClient({ services, locale }: ServicesPageClientProps) {
  const t = useTranslations('ServicesPage');
  const isRTL = locale === 'ar';
  
  const processSteps = [
    { 
      step: 1, 
      title: t('process.step1.title'), 
      description: t('process.step1.description') 
    },
    { 
      step: 2, 
      title: t('process.step2.title'), 
      description: t('process.step2.description') 
    },
    { 
      step: 3, 
      title: t('process.step3.title'), 
      description: t('process.step3.description') 
    },
    { 
      step: 4, 
      title: t('process.step4.title'), 
      description: t('process.step4.description') 
    }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {t('hero.description')}
          </p>
          <Link 
            href={`/${locale}/contact`} 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Phone className="h-5 w-5 mr-2" />
            {t('hero.cta')}
          </Link>
        </div>

        {/* Services Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('services.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const IconComponent = iconMap[service.icon as keyof typeof iconMap] || iconMap.default;
              return (
                <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-blue-100 rounded-full mr-4">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-blue-600">{service.price} DZD</span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {service.duration} {t('services.hours')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Process Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('process.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step) => (
              <div key={step.step} className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full text-blue-600 font-bold text-lg mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('whyChoose.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('whyChoose.quality.title')}</h3>
              <p className="text-gray-600">{t('whyChoose.quality.description')}</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Shield className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('whyChoose.warranty.title')}</h3>
              <p className="text-gray-600">{t('whyChoose.warranty.description')}</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Wrench className="h-12 w-12 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('whyChoose.expertise.title')}</h3>
              <p className="text-gray-600">{t('whyChoose.expertise.description')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
