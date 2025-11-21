import { motion } from "framer-motion";
import { Phone, ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { OptimizedImage } from "../ui/OptimizedImage";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMobile, useTouchDevice } from "@/hooks/useMobile";
import { useTouchGestures } from "@/hooks/useTouchGestures";
import { useState, useRef } from "react";

export function ModernHero() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as string) || 'fr';
  const { isMobile } = useMobile();
  const isTouchDevice = useTouchDevice();
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  // Optimisations mobiles pour les animations
  const animationConfig = {
    duration: isMobile ? 0.4 : 0.8,
    delay: isMobile ? 0.1 : 0.2,
  };

  // Gestes tactiles pour navigation
  const { handleTouchStart, handleTouchEnd, handleTouchMove } = useTouchGestures({
    onSwipeLeft: () => setCurrentSlide(prev => Math.min(prev + 1, 2)),
    onSwipeRight: () => setCurrentSlide(prev => Math.max(prev - 1, 0)),
  });

  return (
    <section
      ref={heroRef}
      className={`relative ${isMobile ? 'min-h-[80vh]' : 'min-h-[75vh]'} flex items-center justify-center overflow-hidden ${isMobile ? 'pt-12' : 'pt-16'}`}
      onTouchStart={(e) => isTouchDevice && handleTouchStart(e.nativeEvent)}
      onTouchEnd={(e) => isTouchDevice && handleTouchEnd(e.nativeEvent)}
      onTouchMove={() => isTouchDevice && handleTouchMove()}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage
          src="/chaudiere-a-gaz-1024x683-removebg-preview.png"
          alt="Chaudière à gaz moderne - Fond"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/90 via-orange-500/85 to-amber-600/90"></div>

        {/* Animated circles */}
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 bg-amber-300/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 golden-ratio-container">
        <div className={`grid ${isMobile ? 'space-golden-6' : 'lg:grid-cols-2 space-golden-7'} items-center`}>
          {/* Text content */}
          <div className={`${isMobile ? 'text-center' : 'text-center lg:text-left'}`}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: animationConfig.duration }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-block m-golden-5 px-golden-4 py-golden-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30"
              >
                <span className="text-white text-golden-sm">Plus de 10 ans d'expérience</span>
              </motion.div>

              <h1 className="text-white m-golden-5 leading-tight text-golden-xl sm:text-golden-2xl lg:text-golden-3xl">
                Solutions de chauffage fiables pour votre maison
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-white/95 m-golden-7 text-golden-base sm:text-golden-lg"
            >
              Expertise et qualité depuis plus de 10 ans. Nous offrons les meilleures solutions de chauffage pour votre confort.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center w-full sm:w-auto"
            >
              <Link href={`/${locale}/products`} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-white text-white hover:bg-neutral-50 shadow-2xl hover:shadow-orange-500/50 transition-golden-normal group px-golden-5 py-golden-4 rounded-golden-xl">
                  <span className="flex items-center justify-center space-golden-2">
                    Voir le catalogue
                    <ArrowRight className="w-golden-3 h-golden-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>

              <Link href={`/${locale}/contact`} className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white hover:text-orange-600 shadow-2xl transition-golden-normal px-golden-5 py-golden-4 rounded-golden-xl"
                >
                  Nous contacter
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="m-golden-7 inline-flex items-center space-golden-2 bg-white/20 backdrop-blur-md px-golden-4 py-golden-3 rounded-golden-xl border border-white/30"
            >
              <div className="bg-white p-golden-2 rounded-full">
                <Phone className="w-golden-4 h-golden-4 text-orange-600" />
              </div>
              <div className="text-left">
                <p className="text-white/80 text-golden-sm">Appelez-nous</p>
                <a href="tel:0774102255" className="text-white text-golden-base font-semibold">
                  0774 102 255
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right side - Boiler image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative hidden lg:flex justify-center items-center"
          >
            <div className="relative">
              {/* Glow effect behind boiler */}
              <motion.div
                className="absolute inset-0 bg-white/30 rounded-full blur-[100px] scale-110"
                animate={{
                  scale: [1.1, 1.3, 1.1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Decorative rings */}
              <motion.div
                className="absolute inset-0 border-2 border-white/20 rounded-full"
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />

              {/* Main boiler image with floating animation */}
              <motion.div
                className="relative z-10"
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="relative w-full max-w-2xl h-auto drop-shadow-2xl rounded-golden-2xl overflow-hidden golden-ratio-aspect">
                  <OptimizedImage
                    src="/chaudiere-a-gaz-1024x683-removebg-preview.png"
                    alt="Chaudière professionnelle"
                    width={1024}
                    height={683}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
              </motion.div>

              {/* Floating particles */}
              <motion.div
                className="absolute top-10 -left-10 w-3 h-3 bg-white rounded-full"
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute bottom-20 -right-5 w-2 h-2 bg-white/70 rounded-full"
                animate={{
                  y: [0, -40, 0],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />
              <motion.div
                className="absolute top-1/3 -right-8 w-2.5 h-2.5 bg-white/60 rounded-full"
                animate={{
                  y: [0, -25, 0],
                  opacity: [0.3, 0.9, 0.3],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <motion.div
            className="w-1.5 h-1.5 bg-white rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
