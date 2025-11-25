'use client';

import { motion } from "framer-motion";
import { FlameKindling, Settings, Wind, ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { OptimizedImage } from "../ui/OptimizedImage";

export function ModernCategories() {
  const t = useTranslations('categories');
  const tCommon = useTranslations('common');
  const params = useParams();
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const categories = [
    {
      icon: FlameKindling,
      titleKey: 'boilers.title',
      descriptionKey: 'boilers.description',
      productsKey: 'boilers.products',
      image: "/chaudiere-a-gaz-1024x683-removebg-preview.png",
      gradient: "from-orange-500 to-red-500",
      href: `/${locale}/products?category=boilers`
    },
    {
      icon: Settings,
      titleKey: 'spareParts.title',
      descriptionKey: 'spareParts.description',
      productsKey: 'spareParts.products',
      image: "https://images.unsplash.com/photo-1701421047855-d7bafd8d6f69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMGhlYXRlcnxlbnwxfHx8fDE3NjMyOTc4ODB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      gradient: "from-blue-500 to-cyan-500",
      href: `/${locale}/products?category=spare-parts`
    },
    {
      icon: Wind,
      titleKey: 'radiators.title',
      descriptionKey: 'radiators.description',
      productsKey: 'radiators.products',
      image: "https://images.unsplash.com/photo-1587725950196-6ef36e3b474e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwcmFkaWF0b3J8ZW58MXx8fHwxNzYzMjk3ODgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
      gradient: "from-purple-500 to-pink-500",
      href: `/${locale}/products?category=radiators`
    }
  ];

  return (
    <section className="py-12 md:py-20 px-4 bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-orange-600 mb-4 text-2xl md:text-4xl font-bold">
            {t('title')}
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto text-base md:text-lg">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Mobile: Stack, Tablet: 2 cols, Desktop: 3 cols */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <Link href={category.href} className="block h-full">
                  <div className="relative h-full bg-neutral-50 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 active:scale-[0.98]">
                    {/* Image background - smaller on mobile */}
                    <div className="relative h-48 md:h-64 overflow-hidden">
                      <div className="relative w-full h-full">
                        <OptimizedImage
                          src={category.image}
                          alt={t(category.titleKey)}
                          width={400}
                          height={256}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={false}
                        />
                      </div>
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-80 group-hover:opacity-70 transition-opacity duration-500`}></div>

                      {/* Icon - touch friendly size */}
                      <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'}`}>
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                          <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                        </div>
                      </div>

                      {/* Badge */}
                      <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'}`}>
                        <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 text-xs md:text-sm px-3 py-1">
                          {t(category.productsKey)} {tCommon('products')}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 md:p-6">
                      <h3 className="text-neutral-900 mb-2 text-lg md:text-xl font-semibold">
                        {t(category.titleKey)}
                      </h3>

                      <p className="text-neutral-600 mb-4 leading-relaxed text-sm md:text-base line-clamp-2">
                        {t(category.descriptionKey)}
                      </p>

                      {/* Touch-friendly button - minimum 48px height */}
                      <div className="flex items-center text-orange-600 group-hover:text-orange-700 font-medium min-h-[48px]">
                        <span className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          {tCommon('discover')}
                          <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
