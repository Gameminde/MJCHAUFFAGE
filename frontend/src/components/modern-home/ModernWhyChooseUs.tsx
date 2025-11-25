'use client';

import { CheckCircle, Truck, Headphones } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

export function ModernWhyChooseUs() {
  const t = useTranslations('whyChoose');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const features = [
    {
      icon: CheckCircle,
      titleKey: 'originalParts.title',
      descriptionKey: 'originalParts.description',
      color: "from-orange-500 to-amber-500"
    },
    {
      icon: Truck,
      titleKey: 'fastDelivery.title',
      descriptionKey: 'fastDelivery.description',
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Headphones,
      titleKey: 'proService.title',
      descriptionKey: 'proService.description',
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <section className="py-12 md:py-20 px-4 relative overflow-hidden bg-neutral-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-orange-800 text-2xl md:text-4xl font-bold mb-4">
            {t('title')}
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto text-base md:text-lg">
            {t('subtitle')}
          </p>
        </div>

        {/* Mobile: Stack, Desktop: 3 cols */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="group h-full">
                <div className="relative h-full bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-neutral-100 flex flex-col items-center text-center">
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>

                  <div className="relative z-10 flex flex-col items-center">
                    {/* Touch-friendly icon - 56x56px */}
                    <div className={`w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br ${feature.color} rounded-xl md:rounded-2xl flex items-center justify-center mb-5 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                      <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                    </div>

                    <h3 className="mb-3 text-neutral-900 font-semibold text-lg md:text-xl">
                      {t(feature.titleKey)}
                    </h3>

                    <p className="text-neutral-600 leading-relaxed text-sm md:text-base">
                      {t(feature.descriptionKey)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
