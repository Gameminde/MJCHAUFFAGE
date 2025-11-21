'use client';

import { ModernHero } from '@/components/modern-home/ModernHero';
import { ModernCategories } from '@/components/modern-home/ModernCategories';
import { ModernWhyChooseUs } from '@/components/modern-home/ModernWhyChooseUs';
import { ModernCallToAction } from '@/components/modern-home/ModernCallToAction';
import { ModernFooter } from '@/components/modern-home/ModernFooter';

type Props = {
  params: { locale: string };
};

export default function ModernHomePageNew({ params }: Props) {
  const { locale } = params;

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 overflow-x-hidden">
      {/* Hero Section - Golden Ratio Height */}
      <section className="relative min-h-[61.8vh] flex items-center justify-center">
        <ModernHero />
      </section>

      {/* Categories Section - Golden Ratio Spacing */}
      <section className="relative py-golden-8 bg-white">
        <div className="golden-ratio-container">
          <ModernCategories />
        </div>
      </section>

      {/* Why Choose Us Section - Golden Ratio Proportions */}
      <section className="relative py-golden-8 bg-neutral-50">
        <div className="golden-ratio-container">
          <ModernWhyChooseUs />
        </div>
      </section>

      {/* Call to Action Section - Golden Ratio Width */}
      <section className="relative py-golden-7 bg-orange-600">
        <div className="golden-ratio-container">
          <ModernCallToAction />
        </div>
      </section>

      {/* Footer - Full Width */}
      <footer className="relative bg-neutral-900 text-white">
        <ModernFooter />
      </footer>
    </div>
  );
}
