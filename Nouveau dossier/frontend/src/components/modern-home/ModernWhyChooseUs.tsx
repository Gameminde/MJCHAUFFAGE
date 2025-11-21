import { CheckCircle, Truck, Headphones } from "lucide-react";
import { useTranslations } from "next-intl";

const features = [
  {
    icon: CheckCircle,
    title: "Pièces d'origine",
    description: "Toutes nos pièces sont certifiées par les fabricants pour garantir qualité et durabilité",
    color: "from-orange-500 to-amber-500"
  },
  {
    icon: Truck,
    title: "Livraison rapide",
    description: "Service de livraison express pour répondre à vos besoins urgents",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Headphones,
    title: "Service client pro",
    description: "Notre équipe d'experts est à votre écoute pour tous vos besoins",
    color: "from-green-500 to-emerald-500"
  }
];

export function ModernWhyChooseUs() {
  const t = useTranslations();

  return (
    <section className="py-golden-8 px-golden-4 relative overflow-hidden bg-neutral-50">
      <div className="golden-ratio-container relative z-10">
        <div className="text-center m-golden-8">
          <h2 className="text-orange-800 text-golden-2xl font-bold m-golden-3">
            Pourquoi nous choisir ?
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto text-golden-base sm:text-golden-lg">
            Des solutions fiables pour votre chauffage avec un engagement sans compromis envers la qualité
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 space-golden-5">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="group h-full">
                <div className="relative h-full bg-white rounded-golden-xl p-golden-5 shadow-lg hover:shadow-2xl transition-golden-normal border border-neutral-100 flex flex-col items-center text-center md:items-start md:text-left">
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-golden-xl transition-opacity duration-300`}></div>

                  <div className="relative z-10">
                    <div className={`w-golden-6 h-golden-6 bg-gradient-to-br ${feature.color} rounded-golden-xl flex items-center justify-center m-golden-4 transform group-hover:scale-110 group-hover:rotate-3 transition-golden-normal shadow-lg`}>
                      <Icon className="w-golden-5 h-golden-5 text-white" />
                    </div>

                    <h3 className="m-golden-2 text-neutral-900 font-semibold text-golden-lg">
                      {feature.title}
                    </h3>

                    <p className="text-neutral-600 leading-relaxed text-golden-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
