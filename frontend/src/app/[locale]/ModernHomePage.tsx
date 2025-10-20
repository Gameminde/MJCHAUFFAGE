'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Flame,
  Wind,
  Zap,
  Droplet,
  CheckCircle,
  Truck,
  Shield,
  Phone,
  Star,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

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
    {
      icon: <Shield className="w-6 h-6" />,
      title: t('home.features.warranty.title'),
      description: t('home.features.warranty.description'),
      gradient: 'from-purple-500 to-pink-600',
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
      name: 'Climatisation',
      description: 'Systèmes de climatisation pour tous espaces',
      icon: <Wind className="w-8 h-8" />,
      href: `/${locale}/products?category=climatisation`,
      gradient: 'from-cyan-500 to-blue-600',
      products: '120+ produits',
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
      {/* Hero Section - Gradient animé avec parallax */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden hero-gradient">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        />
        
        <div className="container-modern relative z-10 py-32">
          <div className="max-w-4xl">
            <Badge variant="gradient-primary" size="lg" className="mb-6 animate-fade-in-up">
              <Sparkles className="w-4 h-4" />
              Nouveau : Gamme 2025 disponible
            </Badge>

            <h1 className="text-display-2xl font-display font-extrabold text-white mb-6 animate-fade-in-up">
              {t('home.hero.titleLine1', { defaultValue: 'Votre Confort,' })}
              <br />
              <span className="text-gradient-accent">
                {t('home.hero.titleLine2', { defaultValue: 'Notre Priorité' })}
              </span>
            </h1>

            <p className="text-body-xl text-white/90 mb-10 max-w-2xl animate-fade-in-up">
              {t('home.hero.description', {
                defaultValue:
                  'Solutions professionnelles de chauffage et climatisation pour votre maison et votre entreprise en Algérie.',
              })}
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-in-up">
              <Button variant="accent" size="lg" icon={<Flame />}>
                {t('home.hero.catalogButton', { defaultValue: 'Découvrir le catalogue' })}
              </Button>
              <Button variant="secondary" size="lg" icon={<Phone />}>
                {t('home.hero.contactButton', { defaultValue: 'Nous contacter' })}
              </Button>
            </div>

            {/* Stats en overlay */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="glass-card p-4 text-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-heading-xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-body-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </section>

      {/* Features Section - Bento Grid */}
      <section className="section-padding bg-neutral-50">
        <div className="container-modern">
          <div className="text-center mb-16">
            <Badge variant="primary" size="lg" className="mb-4">
              <TrendingUp className="w-4 h-4" />
              Pourquoi nous choisir
            </Badge>
            <h2 className="text-display-lg font-display font-bold text-neutral-900 mb-4">
              {t('home.features.title', { defaultValue: 'Excellence & Qualité' })}
            </h2>
            <p className="text-body-lg text-neutral-600 max-w-2xl mx-auto">
              {t('home.features.subtitle', {
                defaultValue: 'Des solutions professionnelles pour tous vos besoins',
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                variant="default"
                hover="lift"
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-8">
                  <div
                    className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center text-white mb-6 shadow-glow`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-heading-md font-semibold text-neutral-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-body-md text-neutral-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section - Bento Grid Modern */}
      <section className="section-padding bg-white">
        <div className="container-modern">
          <div className="text-center mb-16">
            <h2 className="text-display-lg font-display font-bold text-neutral-900 mb-4">
              {t('home.categories.title', { defaultValue: 'Nos Catégories' })}
            </h2>
            <p className="text-body-lg text-neutral-600 max-w-2xl mx-auto">
              {t('home.categories.description', {
                defaultValue: 'Large gamme de produits professionnels',
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link key={index} href={category.href}>
                <Card
                  variant="default"
                  hover="interactive"
                  className="h-full group animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${category.gradient} rounded-2xl flex items-center justify-center text-white mb-4 shadow-glow group-hover:shadow-glow-accent transition-all duration-300`}
                    >
                      {category.icon}
                    </div>
                    <Badge variant="secondary" size="sm" className="mb-3">
                      {category.products}
                    </Badge>
                    <h3 className="text-heading-sm font-semibold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-body-sm text-neutral-600 mb-4">{category.description}</p>
                    <div className="flex items-center text-primary-600 font-medium text-body-sm group-hover:translate-x-2 transition-transform">
                      Découvrir <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="primary" size="lg">
              {t('home.categories.allCategoriesButton', {
                defaultValue: 'Voir toutes les catégories',
              })}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-gradient-primary">
        <div className="container-modern">
          <div className="text-center mb-16">
            <Badge variant="gradient-accent" size="lg" className="mb-4">
              <Star className="w-4 h-4" />
              Avis clients
            </Badge>
            <h2 className="text-display-lg font-display font-bold text-white mb-4">
              {t('home.testimonials.title', { defaultValue: 'Ils nous font confiance' })}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Ahmed B.',
                role: 'Particulier',
                quote: 'Service excellent, livraison rapide et produits de qualité. Je recommande vivement !',
                rating: 5,
              },
              {
                name: 'Sarah L.',
                role: 'Entreprise',
                quote: 'Partenaire fiable pour tous nos besoins en chauffage. Équipe professionnelle.',
                rating: 5,
              },
              {
                name: 'Karim M.',
                role: 'Artisan',
                quote: 'Large choix de produits et conseils d\'experts. Un vrai plus pour mon activité.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                variant="glass"
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-body-md text-white mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-body-md font-semibold text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-body-sm text-white/70">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-white">
        <div className="container-modern">
          <Card variant="elevated" className="bg-gradient-mesh overflow-hidden">
            <CardContent className="p-12 text-center">
              <h2 className="text-display-md font-display font-bold text-white mb-4">
                {t('home.cta.titleLine1', { defaultValue: 'Besoin de conseils ?' })}
              </h2>
              <p className="text-body-xl text-white/90 mb-8 max-w-2xl mx-auto">
                {t('home.cta.description', {
                  defaultValue: 'Notre équipe d\'experts est à votre disposition pour vous guider',
                })}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="accent" size="xl" icon={<Phone />}>
                  +213 1 23 45 67 89
                </Button>
                <Button variant="secondary" size="xl">
                  Demander un devis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

