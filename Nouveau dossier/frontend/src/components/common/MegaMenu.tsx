'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ChevronDown, Flame, Droplet, Wind, Zap } from 'lucide-react';

interface MegaMenuProps {
  locale: string;
}

export function MegaMenu({ locale }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('products');

  const categories = [
    {
      name: 'Chaudières',
      icon: <Flame className="w-5 h-5" />,
      items: [
        { name: 'Chaudières à gaz', href: `/${locale}/products?category=chaudieres-gaz` },
        { name: 'Chaudières électriques', href: `/${locale}/products?category=chaudieres-electriques` },
        { name: 'Chaudières à condensation', href: `/${locale}/products?category=chaudieres-condensation` },
        { name: 'Chaudières à bois', href: `/${locale}/products?category=chaudieres-bois` },
      ],
    },
    {
      name: 'Radiateurs',
      icon: <Zap className="w-5 h-5" />,
      items: [
        { name: 'Radiateurs électriques', href: `/${locale}/products?category=radiateurs-electriques` },
        { name: 'Radiateurs à eau', href: `/${locale}/products?category=radiateurs-eau` },
        { name: 'Radiateurs design', href: `/${locale}/products?category=radiateurs-design` },
        { name: 'Sèche-serviettes', href: `/${locale}/products?category=seche-serviettes` },
      ],
    },
    {
      name: 'Climatisation',
      icon: <Wind className="w-5 h-5" />,
      items: [
        { name: 'Climatisation split', href: `/${locale}/products?category=clim-split` },
        { name: 'Climatisation mobile', href: `/${locale}/products?category=clim-mobile` },
        { name: 'Climatisation réversible', href: `/${locale}/products?category=clim-reversible` },
        { name: 'Climatisation gainable', href: `/${locale}/products?category=clim-gainable` },
      ],
    },
    {
      name: 'Accessoires',
      icon: <Droplet className="w-5 h-5" />,
      items: [
        { name: 'Thermostats', href: `/${locale}/products?category=thermostats` },
        { name: 'Vannes', href: `/${locale}/products?category=vannes` },
        { name: 'Circulateurs', href: `/${locale}/products?category=circulateurs` },
        { name: 'Pièces détachées', href: `/${locale}/products?category=pieces-detachees` },
      ],
    },
  ];

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger Button */}
      <button className="nav-link px-4 py-2 text-body-md font-medium text-neutral-700 hover:text-primary-600 rounded-xl transition-all duration-200 hover:bg-primary-50 flex items-center gap-2">
        {t('categories', { defaultValue: 'Produits' })}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-[800px] -translate-x-1/4 animate-scale-in">
          <div className="bg-white rounded-2xl shadow-elevated border border-neutral-200 overflow-hidden">
            <div className="grid grid-cols-4 gap-6 p-8">
              {categories.map((category, index) => (
                <div
                  key={category.name}
                  className="space-y-4 animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-neutral-200">
                    <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
                      {category.icon}
                    </div>
                    <h3 className="text-body-lg font-semibold text-neutral-900">
                      {category.name}
                    </h3>
                  </div>

                  {/* Category Items */}
                  <ul className="space-y-2">
                    {category.items.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="block text-body-sm text-neutral-600 hover:text-primary-600 hover:translate-x-1 transition-all duration-200"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Featured Banner */}
            <div className="border-t border-neutral-200 bg-gradient-primary p-6">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h4 className="text-body-lg font-semibold mb-1">
                    Besoin d'aide pour choisir ?
                  </h4>
                  <p className="text-body-sm opacity-90">
                    Nos experts sont là pour vous conseiller
                  </p>
                </div>
                <Link
                  href={`/${locale}/contact`}
                  className="btn btn-secondary bg-white text-primary-600 hover:bg-neutral-50 border-0"
                >
                  Contactez-nous
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

