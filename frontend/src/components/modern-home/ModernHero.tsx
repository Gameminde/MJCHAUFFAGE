import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMobile } from "@/hooks/useMobile";

export function ModernHero() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as string) || 'fr';
  const { isMobile } = useMobile();

  return (
    <section className="relative h-screen min-h-[100vh] w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-gray-900"
        style={{ backgroundImage: "url('/images/hero-bg.png')" }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-4xl mx-auto lg:mx-0 text-center lg:text-left pt-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white font-bold text-3xl md:text-6xl lg:text-7xl leading-tight mb-6"
          >
            Chauffage Professionnel<br />
            & Confort Durable
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/90 text-lg md:text-xl mb-10 max-w-2xl mx-auto lg:mx-0 font-light"
          >
            Plus de 10 ans d'expertise pour votre maison.<br className="hidden md:block" />
            Découvrez nos solutions fiables.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <Link href={`/${locale}/products`}>
              <button className="w-full sm:w-auto px-8 py-4 bg-[#D9772F] text-white rounded-full font-semibold hover:bg-[#c66a26] transition-colors text-lg shadow-lg">
                Voir le catalogue
              </button>
            </Link>

            <Link href={`/${locale}/contact`}>
              <button className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-black transition-colors text-lg">
                Nous contacter
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
