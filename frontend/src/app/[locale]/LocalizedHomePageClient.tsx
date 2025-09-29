'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { CheckCircle, Truck, Shield, Wrench, ShoppingCart, Phone } from 'lucide-react';

type Props = {
  params: { locale: string };
};

export default function LocalizedHomePageClient({ params }: Props) {
  const { locale } = params;
  const t = useTranslations();
  const isRTL = locale === 'ar';
  
  // Initialize AOS animation library
  useEffect(() => {
    const initAOS = async () => {
      try {
        const AOS = (await import('aos')).default;
        AOS.init({
          duration: 800,
          easing: 'ease-in-out',
          once: true
        });
      } catch (error) {
        console.warn('AOS animation library failed to load:', error);
      }
    };
    
    initAOS();
  }, []);
  
  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 
              className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl"
              data-aos="fade-up"
            >
              <span className="block">{t('home.hero.titleLine1')}</span>
              <span className="block text-primary-600">{t('home.hero.titleLine2')}</span>
            </h1>
            <p 
              className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
              data-aos="fade-up" 
              data-aos-delay="100"
            >
              {t('home.hero.description')}
            </p>
            <div 
              className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8" 
              data-aos="fade-up" 
              data-aos-delay="200"
            >
              <div className="rounded-md shadow">
                <Link 
                  href={`/${locale}/products`} 
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 transition-colors duration-300"
                >
                  {t('home.hero.catalogButton')}
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link 
                  href={`/${locale}/contact`} 
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors duration-300"
                >
                  {t('home.hero.contactButton')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 
              className="text-base text-primary-600 font-semibold tracking-wide uppercase" 
              data-aos="fade-up"
            >
              {t('home.features.subtitle')}
            </h2>
            <p 
              className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl" 
              data-aos="fade-up" 
              data-aos-delay="100"
            >
              {t('home.features.title')}
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div 
                className="bg-gray-50 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1" 
                data-aos="fade-up" 
                data-aos-delay="200"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div className="mt-5">
                  <h3 className="text-lg font-medium text-gray-900">{t('home.features.originalParts.title')}</h3>
                  <p className="mt-2 text-base text-gray-500">
                    {t('home.features.originalParts.description')}
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div 
                className="bg-gray-50 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1" 
                data-aos="fade-up" 
                data-aos-delay="300"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <Truck className="h-6 w-6" />
                </div>
                <div className="mt-5">
                  <h3 className="text-lg font-medium text-gray-900">{t('home.features.fastDelivery.title')}</h3>
                  <p className="mt-2 text-base text-gray-500">
                    {t('home.features.fastDelivery.description')}
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div 
                className="bg-gray-50 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1" 
                data-aos="fade-up" 
                data-aos-delay="400"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <div className="mt-5">
                  <h3 className="text-lg font-medium text-gray-900">{t('home.features.warranty.title')}</h3>
                  <p className="mt-2 text-base text-gray-500">
                    {t('home.features.warranty.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Categories */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 
              className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl" 
              data-aos="fade-up"
            >
              {t('home.categories.title')}
            </h2>
            <p 
              className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto" 
              data-aos="fade-up" 
              data-aos-delay="100"
            >
              {t('home.categories.description')}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Category 1 */}
            <div 
              className="group relative bg-white shadow-md rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl" 
              data-aos="fade-up" 
              data-aos-delay="200"
            >
              <div className="h-56 w-full bg-gray-200 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center">
                  <Wrench className="h-16 w-16 text-primary-600" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  <Link href={`/${locale}/products/category/burners`}>
                    <span className="absolute inset-0" aria-hidden="true"></span>
                    {t('home.categories.burners.title')}
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {t('home.categories.burners.description')}
                </p>
              </div>
            </div>

            {/* Category 2 */}
            <div 
              className="group relative bg-white shadow-md rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl" 
              data-aos="fade-up" 
              data-aos-delay="300"
            >
              <div className="h-56 w-full bg-gray-200 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-secondary-200 to-secondary-300 flex items-center justify-center">
                  <Truck className="h-16 w-16 text-secondary-600" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  <Link href={`/${locale}/products/category/pumps`}>
                    <span className="absolute inset-0" aria-hidden="true"></span>
                    {t('home.categories.pumps.title')}
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {t('home.categories.pumps.description')}
                </p>
              </div>
            </div>

            {/* Category 3 */}
            <div 
              className="group relative bg-white shadow-md rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl" 
              data-aos="fade-up" 
              data-aos-delay="400"
            >
              <div className="h-56 w-full bg-gray-200 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-primary-300 to-secondary-300 flex items-center justify-center">
                  <Shield className="h-16 w-16 text-white" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  <Link href={`/${locale}/products/category/safety`}>
                    <span className="absolute inset-0" aria-hidden="true"></span>
                    {t('home.categories.safety.title')}
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {t('home.categories.safety.description')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link 
              href={`/${locale}/products`} 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-300" 
              data-aos="fade-up"
            >
              {t('home.categories.allCategoriesButton')}
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 
              className="text-base text-primary-600 font-semibold tracking-wide uppercase" 
              data-aos="fade-up"
            >
              {t('home.testimonials.subtitle')}
            </h2>
            <p 
              className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl" 
              data-aos="fade-up" 
              data-aos-delay="100"
            >
              {t('home.testimonials.title')}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <div 
              className="bg-gray-50 p-6 rounded-lg" 
              data-aos="fade-up" 
              data-aos-delay="200"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                    JD
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-bold text-gray-900">{t('home.testimonials.jean.name')}</h4>
                  <p className="text-sm text-gray-500">{t('home.testimonials.jean.role')}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-600 italic">
                  {t('home.testimonials.jean.quote')}
                </p>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div 
              className="bg-gray-50 p-6 rounded-lg" 
              data-aos="fade-up" 
              data-aos-delay="300"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center text-white font-bold">
                    ML
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-bold text-gray-900">{t('home.testimonials.marie.name')}</h4>
                  <p className="text-sm text-gray-500">{t('home.testimonials.marie.role')}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-600 italic">
                  {t('home.testimonials.marie.quote')}
                </p>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div 
              className="bg-gray-50 p-6 rounded-lg" 
              data-aos="fade-up" 
              data-aos-delay="400"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                    TL
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-bold text-gray-900">{t('home.testimonials.thomas.name')}</h4>
                  <p className="text-sm text-gray-500">{t('home.testimonials.thomas.role')}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-600 italic">
                  {t('home.testimonials.thomas.quote')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-primary-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 
            className="text-3xl font-extrabold text-white sm:text-4xl" 
            data-aos="fade-up"
          >
            <span className="block">{t('home.cta.titleLine1')}</span>
            <span className="block">{t('home.cta.titleLine2')}</span>
          </h2>
          <p 
            className="mt-4 text-lg leading-6 text-primary-200" 
            data-aos="fade-up" 
            data-aos-delay="100"
          >
            {t('home.cta.description')}
          </p>
          <div 
            className="mt-10" 
            data-aos="fade-up" 
            data-aos-delay="200"
          >
            <Link 
              href={`tel:+213123456789`} 
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 md:py-4 md:text-lg md:px-10 transition-colors duration-300"
            >
              <Phone className="mr-2 h-5 w-5" /> +213 1 23 45 67 89
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
