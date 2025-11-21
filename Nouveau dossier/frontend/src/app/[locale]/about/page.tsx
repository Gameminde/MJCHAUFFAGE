import { setRequestLocale } from 'next-intl/server';
import { Users, Wrench, Package, Headphones, Award, Clock, CheckCircle, Star, Heart } from 'lucide-react';

type Props = {
  params: { locale: string };
};

export default function AboutPage({ params }: Props) {
  const { locale } = params;
  setRequestLocale(locale);
  const isArabic = locale === 'ar';

  const stats = [
    {
      number: '30+',
      label: isArabic ? 'سنوات خبرة' : 'Années d\'expérience',
      icon: Award,
      description: isArabic ? 'خبرة متراكمة' : 'Expérience cumulée'
    },
    {
      number: '500+',
      label: isArabic ? 'عميل راضي' : 'Clients satisfaits',
      icon: Users,
      description: isArabic ? 'عملاء سعداء' : 'Clients heureux'
    },
    {
      number: '1000+',
      label: isArabic ? 'تركيب مكتمل' : 'Installations réalisées',
      icon: CheckCircle,
      description: isArabic ? 'تركيبات ناجحة' : 'Installations réussies'
    },
    {
      number: '24/7',
      label: isArabic ? 'دعم فني' : 'Support technique',
      icon: Headphones,
      description: isArabic ? 'دعم متواصل' : 'Support continu'
    }
  ];

  const team = [
    {
      name: 'Madjid Hablal',
      role: isArabic ? 'خبير في الغلايات' : 'Expert en Chaudières',
      experience: isArabic ? '30+ سنة خبرة' : '30+ ans d\'expérience',
      description: isArabic
        ? 'مؤسس وعمود الشركة، يمتلك أكثر من ثلاثة عقود من الخبرة في إصلاح وصيانة وتركيب الغلايات. خبرته الفنية العميقة ودقته تجعله مرجعاً لا غنى عنه في المجال.'
        : 'Fondateur et pilier de l\'entreprise, Madjid possède plus de trois décennies d\'expérience dans la réparation, la maintenance et l\'installation de chaudières. Son expertise technique approfondie et sa précision font de lui une référence incontournable.',
      icon: Wrench,
      specialties: ['Réparation', 'Maintenance', 'Installation']
    },
    {
      name: 'Karim Hablal',
      role: isArabic ? 'مسؤول تجاري' : 'Responsable Commercial',
      experience: isArabic ? 'إدارة المنتجات' : 'Gestion Produits',
      description: isArabic
        ? 'حامل لإجازة في التجارة، يجيد تماماً آلية عمل الغلايات وقطع الغيار. مسؤول عن الكتالوج الإلكتروني، خدمة العملاء واختيار القطع الأكثر موثوقية لتلبية احتياجات المهنيين والأفراد.'
        : 'Titulaire d\'une licence en commerce, Karim maîtrise parfaitement le fonctionnement des chaudières et de leurs pièces détachées. Il est responsable du catalogue e-commerce, du service clients et de la sélection des pièces les plus fiables.',
      icon: Package,
      specialties: ['Commerce', 'Service Client', 'Sélection Produits']
    },
    {
      name: 'Tarek Hablal',
      role: isArabic ? 'فني علوي' : 'Technicien Supérieur',
      experience: isArabic ? 'تشخيص وإصلاح' : 'Diagnostic & Réparation',
      description: isArabic
        ? 'متخصص في تشخيص وإصلاح الغلايات. بفضل كفاءاته الفنية العميقة، يحدد الأعطال بسرعة، يقترح أفضل الحلول ويضمن تدخلات نظيفة وفعالة ودائمة.'
        : 'Spécialisé dans le diagnostic et la réparation des chaudières. Grâce à ses compétences techniques approfondies, il identifie rapidement les pannes, propose les meilleures solutions et assure des interventions propres, efficaces et durables.',
      icon: Star,
      specialties: ['Diagnostic', 'Réparation', 'Maintenance']
    }
  ];

  const values = [
    {
      title: isArabic ? 'خبرة فنية قوية' : 'Expertise technique solide',
      description: isArabic
        ? 'أكثر من 30 عاماً من الخبرة المتراكمة في مجال الغلايات والتدفئة'
        : 'Plus de 30 ans d\'expérience cumulée dans le domaine des chaudières et du chauffage',
      icon: Award,
      color: 'from-orange-500 to-amber-500'
    },
    {
      title: isArabic ? 'خيار واسع من القطع' : 'Large choix de pièces',
      description: isArabic
        ? 'قطع غيار أصلية وموثوقة من أفضل العلامات التجارية'
        : 'Pièces détachées authentiques et fiables des meilleures marques',
      icon: Package,
      color: 'from-amber-500 to-orange-600'
    },
    {
      title: isArabic ? 'خدمة سريعة ومهنية' : 'Service rapide et professionnel',
      description: isArabic
        ? 'تدخلات فورية وفعالة مع فريق فنيين مؤهلين'
        : 'Interventions immédiates et efficaces avec une équipe de techniciens qualifiés',
      icon: Clock,
      color: 'from-orange-600 to-amber-700'
    },
    {
      title: isArabic ? 'شركة عائلية صادقة' : 'Entreprise familiale honnête',
      description: isArabic
        ? 'قيم عائلية وشغف بالعمل الجيد والثقة المتبادلة'
        : 'Valeurs familiales et passion pour le travail bien fait et la confiance mutuelle',
      icon: Heart,
      color: 'from-amber-700 to-orange-800'
    }
  ];

  return (
    <div className={`min-h-screen bg-neutral-50 ${isArabic ? 'rtl' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6 px-6 py-2 bg-orange-100 text-orange-800 rounded-full font-semibold">
            MJ CHAUFFAGE
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            {isArabic ? 'من نحن' : 'À propos de nous'}
          </h1>
          <p className="text-xl text-neutral-600 max-w-4xl mx-auto leading-relaxed">
            {isArabic
              ? 'MJChauffage هي شركة عائلية متخصصة في بيع الغلايات، قطع الغيار، بالإضافة إلى إصلاح وصيانة غلايات المنازل. منذ بداياتنا، نضع خبرتنا وجديتنا في خدمة الأسر الجزائرية لضمان الراحة، الأمان والأداء.'
              : 'MJChauffage est une entreprise familiale spécialisée dans la vente de chaudières, pièces détachées, ainsi que dans la réparation et la maintenance des chaudières domestiques. Depuis nos débuts, nous mettons notre expertise et notre sérieux au service des foyers algériens afin de garantir confort, sécurité et performance.'
            }
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center bg-white p-6 rounded-2xl shadow-lg border border-neutral-100 hover:shadow-xl transition-shadow">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full">
                    <IconComponent className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-neutral-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-neutral-600 text-sm font-medium mb-1">
                  {stat.label}
                </div>
                <div className="text-neutral-500 text-xs">
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mission Section */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-8 md:p-12 text-white text-center mb-16 shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {isArabic ? 'مهمتنا' : 'Notre mission'}
          </h2>
          <p className="text-xl md:text-2xl text-orange-100 max-w-4xl mx-auto leading-relaxed">
            {isArabic
              ? 'تقديم منتجات موثوقة للعملاء، مرافقة احترافية وخدمات إصلاح عالية الجودة، كل ذلك برصانة وثقة شركة عائلية.'
              : 'Offrir aux clients des produits fiables, un accompagnement professionnel et des services de réparation de haute qualité, le tout avec la rigueur et la confiance d\'une entreprise familiale.'
            }
          </p>
        </div>

        {/* Family Expertise Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-16 border border-neutral-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              {isArabic ? 'خبرة تم توراثها من جيل إلى جيل' : 'Une expertise transmise de génération en génération'}
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              {isArabic
                ? 'عائلة هابلال هي في قلب MJChauffage. كل واحد يقدم معرفته الفريدة لتقديم خدمة كاملة وموثوقة.'
                : 'La famille Hablal est au cœur de MJChauffage. Chacun apporte son savoir-faire unique pour offrir un service complet et fiable.'
              }
            </p>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => {
              const IconComponent = member.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <IconComponent className="w-12 h-12 text-white" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                    {member.name}
                  </h3>

                  <div className="inline-block px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold mb-3">
                    {member.role}
                  </div>

                  <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium mb-4">
                    {member.experience}
                  </div>

                  <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                    {member.description}
                  </p>

                  <div className="flex flex-wrap justify-center gap-2">
                    {member.specialties.map((specialty, i) => (
                      <span key={i} className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 text-center mb-12">
            {isArabic ? 'لماذا تختار MJChauffage؟' : 'Pourquoi choisir MJChauffage ?'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-neutral-100 hover:shadow-xl transition-all group">
                  <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-neutral-900 mb-3">
                    {value.title}
                  </h3>

                  <p className="text-neutral-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-2xl p-8 md:p-12 text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {isArabic ? 'تواصل معنا' : 'Contactez-nous'}
          </h2>
          <p className="text-neutral-300 mb-6 max-w-2xl mx-auto">
            {isArabic
              ? 'فريقنا من الخبراء جاهز لمساعدتك في جميع احتياجات التدفئة الخاصة بك'
              : 'Notre équipe d\'experts est prête à vous aider dans tous vos besoins de chauffage'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`/${locale}/contact`}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              {isArabic ? 'اتصل بنا' : 'Nous contacter'}
            </a>
            <a
              href={`/${locale}/products`}
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-neutral-900 font-semibold rounded-xl transition-all"
            >
              {isArabic ? 'اكتشف منتجاتنا' : 'Découvrir nos produits'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'À propos de nous – MJChauffage',
  description: 'Découvrez l\'expertise familiale des Hablal, notre mission et pourquoi choisir MJChauffage pour vos solutions de chauffage en Algérie.',
};