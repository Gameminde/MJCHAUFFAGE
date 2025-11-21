import { motion } from "framer-motion";
import { FlameKindling, Settings, Wind, ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { OptimizedImage } from "../ui/OptimizedImage";

const categories = [
  {
    icon: FlameKindling,
    title: "Chaudières",
    description: "Large gamme de chaudières murales et au sol de toutes les grandes marques",
    products: "80+",
    image: "/chaudiere-a-gaz-1024x683-removebg-preview.png",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: Settings,
    title: "Pièces détachées",
    description: "Pièces détachées et accessoires pour chaudières de toutes marques",
    products: "200+",
    image: "https://images.unsplash.com/photo-1701421047855-d7bafd8d6f69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMGhlYXRlcnxlbnwxfHx8fDE3NjMyOTc4ODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Wind,
    title: "Radiateurs et convecteurs",
    description: "Collection complète de radiateurs et systèmes de chauffage modernes",
    products: "100+",
    image: "https://images.unsplash.com/photo-1587725950196-6ef36e3b474e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwcmFkaWF0b3J8ZW58MXx8fHwxNzYzMjk3ODgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    gradient: "from-purple-500 to-pink-500"
  }
];

export function ModernCategories() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as string) || 'fr';

  return (
    <section className="py-golden-8 px-golden-4 bg-white">
      <div className="golden-ratio-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center m-golden-8"
        >
          <h2 className="text-orange-600 m-golden-3 text-golden-xl sm:text-golden-2xl">
            Nos principales catégories
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto text-golden-base sm:text-golden-lg">
            Trouvez la pièce dont vous avez besoin parmi nos nombreuses références
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 space-golden-5">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative h-full bg-neutral-50 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                  {/* Image background */}
                  <div className="relative h-64 overflow-hidden">
                    <div className="relative w-full h-full">
                      <OptimizedImage
                        src={category.image}
                        alt={category.title}
                        width={400}
                        height={256}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        priority={false}
                      />
                    </div>
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-80 group-hover:opacity-70 transition-opacity duration-500`}></div>

                    {/* Icon */}
                    <div className="absolute top-golden-4 left-golden-4">
                      <div className="w-golden-6 h-golden-6 bg-white/20 backdrop-blur-md rounded-golden-xl flex items-center justify-center border border-white/30">
                        <Icon className="w-golden-5 h-golden-5 text-white" />
                      </div>
                    </div>

                    {/* Badge */}
                    <div className="absolute top-golden-4 right-golden-4">
                      <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 text-golden-xs">
                        {category.products} produits
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-golden-5">
                    <h3 className="text-neutral-900 m-golden-2 text-golden-lg font-semibold">
                      {category.title}
                    </h3>

                    <p className="text-neutral-600 m-golden-4 leading-relaxed text-golden-sm">
                      {category.description}
                    </p>

                    <Link href={`/${locale}/products`}>
                      <Button
                        variant="ghost"
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-0 h-auto group/btn transition-golden-normal"
                      >
                        <span className="flex items-center space-golden-2">
                          Découvrir
                          <ArrowRight className="w-golden-3 h-golden-3 group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
