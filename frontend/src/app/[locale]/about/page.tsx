'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Users, Wrench, Package, Headphones, Award, Clock, CheckCircle, Star, Heart } from 'lucide-react';

type Props = {
  params: { locale: string };
};

export default function AboutPage({ params }: Props) {
  const { locale } = params;
  const t = useTranslations('about');
  const tStats = useTranslations('about.stats');
  const tTeam = useTranslations('about.team');
  const tValues = useTranslations('about.values');
  const tCta = useTranslations('about.cta');
  const currentLocale = useLocale();
  const isRTL = currentLocale === 'ar';

  const stats = [
    {
      number: '30+',
      labelKey: 'experience',
      descKey: 'experienceDesc',
      icon: Award
    },
    {
      number: '500+',
      labelKey: 'clients',
      descKey: 'clientsDesc',
      icon: Users
    },
    {
      number: '1000+',
      labelKey: 'installations',
      descKey: 'installationsDesc',
      icon: CheckCircle
    },
    {
      number: '24/7',
      labelKey: 'support',
      descKey: 'supportDesc',
      icon: Headphones
    }
  ];

  const team = [
    {
      nameKey: 'madjid.name',
      roleKey: 'madjid.role',
      experienceKey: 'madjid.experience',
      descriptionKey: 'madjid.description',
      icon: Wrench,
      specialties: ['Réparation', 'Maintenance', 'Installation']
    },
    {
      nameKey: 'karim.name',
      roleKey: 'karim.role',
      experienceKey: 'karim.experience',
      descriptionKey: 'karim.description',
      icon: Package,
      specialties: ['Commerce', 'Service Client', 'Sélection Produits']
    },
    {
      nameKey: 'tarek.name',
      roleKey: 'tarek.role',
      experienceKey: 'tarek.experience',
      descriptionKey: 'tarek.description',
      icon: Star,
      specialties: ['Diagnostic', 'Réparation', 'Maintenance']
    }
  ];

  const values = [
    {
      titleKey: 'expertise.title',
      descriptionKey: 'expertise.description',
      icon: Award,
      color: 'from-orange-500 to-amber-500'
    },
    {
      titleKey: 'choice.title',
      descriptionKey: 'choice.description',
      icon: Package,
      color: 'from-amber-500 to-orange-600'
    },
    {
      titleKey: 'service.title',
      descriptionKey: 'service.description',
      icon: Clock,
      color: 'from-orange-600 to-amber-700'
    },
    {
      titleKey: 'family.title',
      descriptionKey: 'family.description',
      icon: Heart,
      color: 'from-amber-700 to-orange-800'
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block mb-6 px-6 py-2 bg-orange-100 text-orange-800 rounded-full font-semibold">
            MJ CHAUFFAGE
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-6">
            {t('title')}
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 max-w-4xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {/* Stats Section - Mobile: 2x2, Desktop: 4 cols */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-neutral-100 hover:shadow-xl transition-shadow">
                <div className="flex justify-center mb-3 md:mb-4">
                  <div className="p-3 md:p-4 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full">
                    <IconComponent className="h-6 w-6 md:h-8 md:w-8 text-orange-600" />
                  </div>
                </div>
                <div className="text-2xl md:text-4xl font-bold text-neutral-900 mb-1 md:mb-2">
                  {stat.number}
                </div>
                <div className="text-neutral-600 text-xs md:text-sm font-medium mb-1">
                  {tStats(stat.labelKey)}
                </div>
                <div className="text-neutral-500 text-xs hidden md:block">
                  {tStats(stat.descKey)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mission Section */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-6 md:p-12 text-white text-center mb-12 md:mb-16 shadow-2xl">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">
            {t('mission.title')}
          </h2>
          <p className="text-lg md:text-2xl text-orange-100 max-w-4xl mx-auto leading-relaxed">
            {t('mission.description')}
          </p>
        </div>

        {/* Family Expertise Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-12 mb-12 md:mb-16 border border-neutral-100">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-neutral-900 mb-4">
              {t('expertise.title')}
            </h2>
            <p className="text-base md:text-lg text-neutral-600 max-w-3xl mx-auto">
              {t('expertise.description')}
            </p>
          </div>

          {/* Team Grid - Mobile: Stack, Desktop: 3 cols */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {team.map((member, index) => {
              const IconComponent = member.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="relative mb-4 md:mb-6">
                    {/* Touch-friendly icon */}
                    <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <IconComponent className="w-10 h-10 md:w-12 md:h-12 text-white" />
                    </div>
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold text-neutral-900 mb-2">
                    {tTeam(member.nameKey)}
                  </h3>

                  <div className="inline-block px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold mb-2 md:mb-3">
                    {tTeam(member.roleKey)}
                  </div>

                  <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium mb-3 md:mb-4">
                    {tTeam(member.experienceKey)}
                  </div>

                  <p className="text-neutral-600 text-sm leading-relaxed mb-4 line-clamp-3 md:line-clamp-none">
                    {tTeam(member.descriptionKey)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold text-neutral-900 text-center mb-8 md:mb-12">
            {t('whyChoose')}
          </h2>

          {/* Mobile: 2 cols, Desktop: 4 cols */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-neutral-100 hover:shadow-xl transition-all group">
                  {/* Touch-friendly icon */}
                  <div className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${value.color} rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>

                  <h3 className="text-sm md:text-lg font-bold text-neutral-900 mb-2 md:mb-3">
                    {tValues(value.titleKey)}
                  </h3>

                  <p className="text-neutral-600 text-xs md:text-sm leading-relaxed line-clamp-3 md:line-clamp-none">
                    {tValues(value.descriptionKey)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-2xl p-6 md:p-12 text-white">
          <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">
            {tCta('title')}
          </h2>
          <p className="text-neutral-300 mb-6 max-w-2xl mx-auto text-sm md:text-base">
            {tCta('description')}
          </p>
          {/* Touch-friendly buttons - minimum 48px height */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <a
              href={`/${locale}/contact`}
              className="inline-flex items-center justify-center px-6 md:px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl min-h-[48px] active:scale-95"
            >
              {tCta('contact')}
            </a>
            <a
              href={`/${locale}/products`}
              className="inline-flex items-center justify-center px-6 md:px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-neutral-900 font-semibold rounded-xl transition-all min-h-[48px] active:scale-95"
            >
              {tCta('discover')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
