import { useState } from "react";
import { Menu, X, Flame, Phone } from "lucide-react";
import { Button } from "../ui/Button";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";

export function ModernNavbar() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as string) || 'fr';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Accueil", href: `/${locale}` },
    { name: "Catalogue", href: `/${locale}/products` },
    { name: "Contact", href: `/${locale}/contact` },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg shadow-lg border-b border-neutral-200/50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href={`/${locale}`} className="flex items-center gap-3 group transition-all duration-200 hover:scale-105">
              <div className="w-12 h-12 rounded-xl shadow-lg bg-white border border-neutral-200 flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.png"
                  alt="MJ Chauffage Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-neutral-900 group-hover:text-orange-600 transition-colors">
                  MJ Chauffage
                </span>
                <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
                  Professional Heating
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-neutral-700 hover:text-orange-600 font-medium transition-colors duration-200 relative group"
              >
                {item.name}
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-orange-600 rounded-full transition-all duration-200 group-hover:w-8 transform -translate-x-1/2"></span>
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a href="tel:0774102255" className="flex items-center gap-2 text-neutral-700 hover:text-orange-600 transition-colors">
              <Phone className="w-4 h-4" />
              <span className="font-medium">0774 102 255</span>
            </a>
            <Link href={`/${locale}/contact`}>
              <Button variant="accent" size="sm" className="bg-orange-600 hover:bg-orange-700">
                Contactez-nous
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-700 hover:text-orange-600 hover:bg-orange-50 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-20 bottom-0 bg-white z-40 overflow-y-auto border-t border-neutral-200 shadow-xl">
            <div className="flex flex-col p-6 space-y-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-neutral-800 hover:text-orange-600 font-semibold text-xl py-3 border-b border-neutral-100 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-6 space-y-6">
                <a
                  href="tel:0774102255"
                  className="flex items-center gap-4 text-neutral-800 hover:text-orange-600 transition-colors p-4 bg-neutral-50 rounded-xl"
                >
                  <div className="bg-white p-3 rounded-full shadow-sm">
                    <Phone className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="font-bold text-xl">0774 102 255</span>
                </a>
                <div>
                  <Link href={`/${locale}/contact`} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="accent" size="lg" className="w-full bg-orange-600 hover:bg-orange-700 py-4 text-lg shadow-lg">
                      Contactez-nous
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
