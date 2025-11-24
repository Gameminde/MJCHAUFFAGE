'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Flame,
  Zap,
  Droplet,
  CheckCircle,
  Truck,
  Phone,
  Star,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ModernHero } from '@/components/modern-home/ModernHero';
import { ModernCategories } from '@/components/modern-home/ModernCategories';
import { ModernWhyChooseUs } from '@/components/modern-home/ModernWhyChooseUs';
import { SparePartFinder } from '@/components/products/SparePartFinder';
import { TrustBar } from '@/components/home/TrustBar';
import { MobileCallButton } from '@/components/home/MobileCallButton';

type Props = {
  params: { locale: string };
};

export default function ModernHomePage({ params }: Props) {
  const { locale } = params;
  const t = useTranslations();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: t('home.features.originalParts.title'),
      description: t('home.features.originalParts.description'),
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: t('home.features.fastDelivery.title'),
      description: t('home.features.fastDelivery.description'),
      gradient: 'from-blue-500 to-cyan-600',
    },
  ];

  const categories = [
    {
      name: t('home.categories.burners.title'),
      description: t('home.categories.burners.description'),
      icon: <Flame className="w-8 h-8" />,
      href: `/${locale}/products?category=burners`,
      gradient: 'from-orange-500 to-red-600',
      products: '150+ produits',
    },
    {
      name: 'Radiateurs',
      description: 'Solutions de chauffage électrique et hydraulique',
      icon: <Zap className="w-8 h-8" />,
      href: `/${locale}/products?category=radiateurs`,
      gradient: 'from-yellow-500 to-orange-600',
      products: '200+ produits',
    },
    {
      name: 'Accessoires',
      description: 'Pièces détachées et accessoires de qualité',
      icon: <Droplet className="w-8 h-8" />,
      href: `/${locale}/products?category=accessoires`,
      gradient: 'from-blue-500 to-indigo-600',
      products: '300+ produits',
    },
  ];

  const stats = [
    { value: '15+', label: 'Années d\'expérience' },
    { value: '5000+', label: 'Clients satisfaits' },
    { value: '800+', label: 'Produits disponibles' },
    { value: '24/7', label: 'Support client' },
  ];

  return (
    <>
      {/* Hero Section - Nouveau design moderne */}
      <ModernHero />

      {/* Trust Bar - Desktop Only */}
      <TrustBar />

      {/* Categories Section - Nouveau design moderne */}
      <ModernCategories />

      {/* Why Choose Us Section - Nouveau design moderne */}
      <ModernWhyChooseUs />


      {/* CTA Section */}
      <section className="section-padding bg-neutral-50">
        <div className="container-modern">
          <Card variant="elevated" className="bg-gradient-mesh overflow-hidden">
            <CardContent className="p-12 text-center">
              <h2 className="text-display-md font-display font-bold text-orange-800 mb-4">
                {t('home.cta.titleLine1', { defaultValue: 'Besoin de conseils ?' })}
              </h2>
              <p className="text-body-xl text-orange-700 mb-8 max-w-2xl mx-auto">
                {t('home.cta.description', {
                  defaultValue: 'Notre équipe d\'experts est à votre disposition pour vous guider',
                })}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="accent" size="xl" icon={<Phone />}>
                  0774102255
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mobile Call Button - Mobile Only */}
      <MobileCallButton />
    </>
  );
}


