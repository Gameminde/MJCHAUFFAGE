'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ModernHero } from '@/components/modern-home/ModernHero';
import { ModernCategories } from '@/components/modern-home/ModernCategories';
import { ModernWhyChooseUs } from '@/components/modern-home/ModernWhyChooseUs';
import { TrustBar } from '@/components/home/TrustBar';
import { MobileCallButton } from '@/components/home/MobileCallButton';

type Props = {
  params: { locale: string };
};

export default function ModernHomePage({ params }: Props) {
  const { locale } = params;
  const t = useTranslations('home');
  const currentLocale = useLocale();
  const isRTL = currentLocale === 'ar';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <ModernHero />

      {/* Trust Bar - Now visible on mobile too */}
      <TrustBar />

      {/* Categories Section */}
      <ModernCategories />

      {/* Why Choose Us Section */}
      <ModernWhyChooseUs />

      {/* CTA Section - Mobile optimized */}
      <section className="py-12 md:py-20 px-4 bg-neutral-50">
        <div className="max-w-4xl mx-auto">
          <Card variant="elevated" className="bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden border-0 shadow-xl">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-4xl font-bold text-orange-800 mb-4">
                {t('cta.titleLine1')}
              </h2>
              <p className="text-base md:text-xl text-orange-700 mb-8 max-w-2xl mx-auto">
                {t('cta.description')}
              </p>
              {/* Touch-friendly CTA button - minimum 48px height */}
              <div className="flex flex-wrap justify-center gap-4">
                <a 
                  href="tel:0774102255" 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all min-h-[56px]"
                >
                  <Phone className="w-5 h-5" />
                  0774 102 255
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mobile Call Button - Sticky at bottom on mobile */}
      <MobileCallButton />
    </div>
  );
}
