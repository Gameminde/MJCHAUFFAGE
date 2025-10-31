"use client";

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState } from 'react';

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  // Avoid hydration mismatches from time-dependent values
  const [year, setYear] = useState<string>("");

  useEffect(() => {
    // Compute on client after hydration
    setYear(String(new Date().getFullYear()));
  }, []);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">MJ CHAUFFAGE</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-md font-semibold mb-4">{t('footer.products')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/products?category=boilers`} className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.boilers')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/products?category=radiators`} className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.radiators')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/products?category=accessories`} className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.accessories')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-md font-semibold mb-4">{t('footer.services')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/services`} className="text-gray-300 hover:text-white transition-colors">{t('footer.installation')}</Link></li>
              <li><Link href={`/${locale}/services`} className="text-gray-300 hover:text-white transition-colors">{t('footer.maintenance')}</Link></li>
              <li><Link href={`/${locale}/services`} className="text-gray-300 hover:text-white transition-colors">{t('footer.repair')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-md font-semibold mb-4">{t('footer.contact')}</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p>{t('footer.phone')}: +213 XXX XXX XXX</p>
              <p>{t('footer.email')}: contact@mjchauffage.com</p>
              <p>{t('footer.address')}: Algiers, Algeria</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          {/* Render year on client to prevent hydration mismatch; server renders empty year */}
          <p suppressHydrationWarning>&copy; {year} MJ CHAUFFAGE. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}