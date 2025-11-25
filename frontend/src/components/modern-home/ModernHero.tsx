import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMobile } from "@/hooks/useMobile";
import Image from "next/image";
import { useState } from "react";

export function ModernHero() {
  const t = useTranslations('home');
  const params = useParams();
  const locale = (params?.locale as string) || 'fr';
  const { isMobile } = useMobile();
  const [imageLoaded, setImageLoaded] = useState(false);
  const isRTL = locale === 'ar';

  return (
    <section className="relative h-screen min-h-[100vh] w-full overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Gradient Placeholder - shown while image loads */}
      <div 
        className={`absolute inset-0 z-0 bg-gradient-to-br from-orange-900 via-amber-800 to-orange-950 transition-opacity duration-700 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}
      />
      
      {/* Background Image with Next.js optimization */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.png"
          alt="MJ Chauffage - Solutions de chauffage professionnelles"
          fill
          priority
          quality={75}
          sizes="100vw"
          className={`object-cover object-center transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className={`relative z-10 container mx-auto px-4 h-full flex flex-col justify-center ${isRTL ? 'text-right' : ''}`}>
        <div className={`max-w-4xl mx-auto lg:mx-0 text-center lg:text-${isRTL ? 'right' : 'left'} pt-20`}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white font-bold text-3xl md:text-6xl lg:text-7xl leading-tight mb-6"
          >
            {t('hero.titleLine1')}<br />
            {t('hero.titleLine2')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-white/90 text-lg md:text-xl mb-10 max-w-2xl mx-auto ${isRTL ? 'lg:mr-0' : 'lg:mx-0'} font-light`}
          >
            {t('hero.description')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={`flex flex-col sm:flex-row gap-4 justify-center ${isRTL ? 'lg:justify-end' : 'lg:justify-start'}`}
          >
            <Link href={`/${locale}/products`}>
              <button className="w-full sm:w-auto px-8 py-4 bg-[#D9772F] text-white rounded-full font-semibold hover:bg-[#c66a26] transition-colors text-lg shadow-lg">
                {t('hero.catalogButton')}
              </button>
            </Link>

            <Link href={`/${locale}/contact`}>
              <button className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-black transition-colors text-lg">
                {t('hero.contactButton')}
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
