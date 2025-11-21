import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";

export function ModernFooter() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as string) || 'fr';

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl shadow-lg bg-white border border-neutral-700 flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.png"
                  alt="MJ Chauffage Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h3 className="text-white">
                  MJ Chauffage
                </h3>
                <p className="text-neutral-400 text-xs">Professional Heating</p>
              </div>
            </div>
            <p className="text-neutral-400 leading-relaxed mb-4">
              Votre partenaire de confiance pour toutes vos solutions de chauffage depuis plus de 10 ans.
            </p>
            <div className="flex gap-2">
              <div className="w-10 h-10 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                <Mail className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white mb-4">
              Navigation
            </h4>
            <ul className="space-y-1">
              <li>
                <Link href={`/${locale}`} className="block py-2 text-neutral-400 hover:text-orange-500 transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/products`} className="block py-2 text-neutral-400 hover:text-orange-500 transition-colors">
                  Catalogue
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="block py-2 text-neutral-400 hover:text-orange-500 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="text-white mb-4">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="text-neutral-400">
                  Rue Maure, djasr kasentina
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <a href="tel:0774102255" className="text-neutral-400 hover:text-orange-500 transition-colors">
                  0774 102 255
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-white mb-4">
              Horaires
            </h4>
            <div className="flex items-start gap-3 mb-4">
              <Clock className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="text-neutral-400 space-y-2">
                <p>Samedi - Jeudi</p>
                <p>9h00 - 18h00</p>
              </div>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mt-4">
              <p className="text-sm text-neutral-300">
                📍 Majid chauffage sur maps - direct au magasin
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800 mb-8"></div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-neutral-400 text-sm">
            <p>© 2024 Majid Chauffage. Tous droits réservés.</p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <a href="#" className="py-2 hover:text-orange-500 transition-colors">
                Mentions légales
              </a>
              <a href="#" className="py-2 hover:text-orange-500 transition-colors">
                Politique de confidentialité
              </a>
            </div>
          </div>
      </div>
    </footer>
  );
}
