import { setRequestLocale } from 'next-intl/server';
import { Users, Target, Award, Clock, MapPin, Phone, Mail } from 'lucide-react';

type Props = {
  params: { locale: string };
};

export default function AboutPage({ params }: Props) {
  const { locale } = params;
  setRequestLocale(locale);
  const isArabic = locale === 'ar';

  const stats = [
    {
      number: '500+',
      label: isArabic ? 'عميل راضي' : 'Clients satisfaits',
      icon: Users
    },
    {
      number: '10+',
      label: isArabic ? 'سنوات خبرة' : 'Années d\'expérience',
      icon: Award
    },
    {
      number: '1000+',
      label: isArabic ? 'تركيب مكتمل' : 'Installations réalisées',
      icon: Target
    },
    {
      number: '24/7',
      label: isArabic ? 'دعم العملاء' : 'Support client',
      icon: Clock
    }
  ];

  const values = [
    {
      title: isArabic ? 'الجودة' : 'Qualité',
      description: isArabic 
        ? 'نستخدم أفضل المواد والمعدات لضمان أعلى معايير الجودة'
        : 'Nous utilisons les meilleurs matériaux et équipements pour garantir les plus hauts standards',
      icon: '🏆'
    },
    {
      title: isArabic ? 'الاحترافية' : 'Professionnalisme',
      description: isArabic 
        ? 'فريق من الخبراء المدربين والمعتمدين في مجال التدفئة'
        : 'Équipe d\'experts formés et certifiés dans le domaine du chauffage',
      icon: '👨‍🔧'
    },
    {
      title: isArabic ? 'الثقة' : 'Confiance',
      description: isArabic 
        ? 'نبني علاقات طويلة الأمد مع عملائنا القائمة على الثقة والجودة'
        : 'Nous construisons des relations durables basées sur la confiance et la qualité',
      icon: '🤝'
    },
    {
      title: isArabic ? 'الابتكار' : 'Innovation',
      description: isArabic 
        ? 'نواكب أحدث التقنيات والحلول المبتكرة في مجال التدفئة'
        : 'Nous suivons les dernières technologies et solutions innovantes',
      icon: '💡'
    }
  ];

  const team = [
    {
      name: isArabic ? 'محمد جمال' : 'Mohamed Djamel',
      role: isArabic ? 'المدير العام ومؤسس الشركة' : 'Directeur Général et Fondateur',
      experience: isArabic ? '15 سنة خبرة' : '15 ans d\'expérience',
      description: isArabic 
        ? 'خبير في أنظمة التدفئة والتبريد مع شهادات دولية'
        : 'Expert en systèmes de chauffage avec certifications internationales'
    },
    {
      name: isArabic ? 'أحمد بن علي' : 'Ahmed Ben Ali',
      role: isArabic ? 'رئيس الفنيين' : 'Chef des Techniciens',
      experience: isArabic ? '12 سنة خبرة' : '12 ans d\'expérience',
      description: isArabic 
        ? 'متخصص في تركيب وصيانة الغلايات والمشعات'
        : 'Spécialisé dans l\'installation et maintenance des chaudières'
    },
    {
      name: isArabic ? 'فاطمة زهرة' : 'Fatima Zohra',
      role: isArabic ? 'مديرة خدمة العملاء' : 'Responsable Service Client',
      experience: isArabic ? '8 سنوات خبرة' : '8 ans d\'expérience',
      description: isArabic 
        ? 'تضمن أفضل تجربة خدمة عملاء ومتابعة ما بعد البيع'
        : 'Assure la meilleure expérience client et le suivi après-vente'
    }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 ${isArabic ? 'rtl' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            {isArabic ? 'من نحن' : 'À propos de nous'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {isArabic 
              ? 'شركة MJ CHAUFFAGE هي الشريك الموثوق لحلول التدفئة في الجزائر، نقدم خدمات احترافية ومنتجات عالية الجودة منذ أكثر من 10 سنوات'
              : 'MJ CHAUFFAGE est votre partenaire de confiance pour les solutions de chauffage en Algérie, offrant des services professionnels et des produits de haute qualité depuis plus de 10 ans'
            }
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {isArabic ? 'قصتنا' : 'Notre Histoire'}
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  {isArabic 
                    ? 'بدأت رحلتنا في عام 2013 برؤية واضحة: تقديم حلول تدفئة موثوقة وعالية الجودة للمنازل والشركات في الجزائر. منذ ذلك الحين، نمت الشركة لتصبح واحدة من الرواد في هذا المجال.'
                    : 'Notre aventure a commencé en 2013 avec une vision claire : fournir des solutions de chauffage fiables et de haute qualité aux foyers et entreprises d\'Algérie. Depuis, l\'entreprise a grandi pour devenir l\'un des leaders du secteur.'
                  }
                </p>
                <p>
                  {isArabic 
                    ? 'نحن نفخر بتقديم خدمات شاملة تشمل التركيب والصيانة والإصلاح، بالإضافة إلى توفير أفضل المنتجات من العلامات التجارية العالمية المعروفة.'
                    : 'Nous sommes fiers d\'offrir des services complets incluant l\'installation, la maintenance et la réparation, ainsi que les meilleurs produits des marques internationales reconnues.'
                  }
                </p>
                <p>
                  {isArabic 
                    ? 'اليوم، نخدم العملاء في جميع أنحاء الجزائر مع فريق من الخبراء المتخصصين والملتزمين بتقديم أفضل الخدمات.'
                    : 'Aujourd\'hui, nous servons des clients dans toute l\'Algérie avec une équipe d\'experts spécialisés et dévoués à fournir les meilleurs services.'
                  }
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-8 flex items-center justify-center">
              <div className="text-6xl">🏢</div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            {isArabic ? 'قيمنا' : 'Nos Valeurs'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            {isArabic ? 'فريقنا' : 'Notre Équipe'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-6xl">👨‍💼</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-semibold mb-1">
                    {member.role}
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    {member.experience}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-blue-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            {isArabic ? 'مهمتنا' : 'Notre Mission'}
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            {isArabic 
              ? 'نسعى لجعل كل منزل وشركة في الجزائر يتمتع بأنظمة تدفئة موثوقة وفعالة، مع تقديم خدمة عملاء استثنائية وحلول مبتكرة تلبي احتياجات عملائنا المتنوعة'
              : 'Nous nous efforçons de faire en sorte que chaque foyer et entreprise en Algérie bénéficie de systèmes de chauffage fiables et efficaces, avec un service client exceptionnel et des solutions innovantes répondant aux besoins diversifiés de nos clients'
            }
          </p>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'À propos - MJ CHAUFFAGE',
  description: 'Découvrez l\'histoire, les valeurs et l\'équipe de MJ CHAUFFAGE, votre partenaire de confiance pour les solutions de chauffage en Algérie.',
};