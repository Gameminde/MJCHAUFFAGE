import { motion } from "framer-motion";
import { Phone, MessageCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";

export function ModernCallToAction() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as string) || 'fr';

  return (
    <section className="py-golden-7 px-golden-4 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600"></div>

      {/* Animated background elements */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-300/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="golden-ratio-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-golden-2xl p-golden-6 md:p-golden-8 border border-white/20 shadow-2xl">
            <h2 className="text-white m-golden-4 text-golden-xl sm:text-golden-2xl">
              Prêt à commander vos pièces ?
            </h2>

            <p className="text-white/90 m-golden-7 max-w-2xl mx-auto text-golden-base sm:text-golden-lg leading-relaxed">
              Contactez-nous pour toute demande spécifique ou conseil technique. Notre équipe d'experts est à votre disposition.
            </p>

            <div className="flex flex-col sm:flex-row space-golden-3 justify-center items-center">
              <a
                href="tel:0774102255"
                className="inline-flex items-center space-golden-2 bg-white text-orange-600 hover:bg-neutral-50 shadow-2xl hover:shadow-white/50 transition-golden-normal group px-golden-5 py-golden-4 rounded-golden-xl font-semibold"
              >
                <div className="bg-orange-100 p-golden-2 rounded-full">
                  <Phone className="w-golden-3 h-golden-3 text-orange-600" />
                </div>
                <div className="text-left">
                  <div className="text-golden-sm text-orange-500">Appelez-nous</div>
                  <div className="text-golden-base font-bold">0774 102 255</div>
                </div>
              </a>

              <Link href={`/${locale}/contact`}>
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-orange-600 shadow-2xl transition-golden-normal px-golden-5 py-golden-4 rounded-golden-xl"
                >
                  <span className="flex items-center space-golden-2">
                    <MessageCircle className="w-golden-3 h-golden-3" />
                    Formulaire de contact
                  </span>
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="m-golden-7 p-golden-5 border-t border-white/20">
              <div className="grid grid-cols-2 space-golden-5 max-w-xl mx-auto">
                <div>
                  <div className="text-white m-golden-1 text-golden-lg font-bold">10+</div>
                  <div className="text-white/70 text-golden-sm">Années d'expérience</div>
                </div>
                <div>
                  <div className="text-white m-golden-1 text-golden-lg font-bold">380+</div>
                  <div className="text-white/70 text-golden-sm">Produits disponibles</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
