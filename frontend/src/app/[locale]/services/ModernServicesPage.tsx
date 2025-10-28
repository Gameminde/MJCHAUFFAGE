'use client';

import { useState } from 'react';
import { 
  Wrench, Clock, Calendar, Phone, Shield, Star, 
  CheckCircle, Settings, AlertTriangle, MapPin, Users,
  ArrowRight, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import AppointmentModal from '@/components/services/AppointmentModal';
import { fibonacci, goldenSpacing } from '@/lib/goldenRatio';

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  icon?: 'settings' | 'wrench' | 'alert';
}

interface ModernServicesPageProps {
  services: Service[];
  locale: string;
}

const iconMap = {
  settings: Settings,
  wrench: Wrench,
  alert: AlertTriangle,
  default: Wrench,
};

export default function ModernServicesPage({ services, locale }: ModernServicesPageProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  
  const isArabic = locale === 'ar';
  const numberLocale = isArabic ? 'ar-DZ' : 'fr-DZ';

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setShowAppointmentModal(true);
  };

  // Process steps with golden ratio timing
  const processSteps = [
    {
      icon: Calendar,
      title: isArabic ? 'احجز موعدك' : 'Réservez',
      description: isArabic ? 'اختر التاريخ والوقت المناسبين' : 'Choisissez date et heure',
      color: 'orange',
    },
    {
      icon: Users,
      title: isArabic ? 'تأكيد' : 'Confirmation',
      description: isArabic ? 'نؤكد موعدك خلال 24 ساعة' : 'Confirmation sous 24h',
      color: 'blue',
    },
    {
      icon: Wrench,
      title: isArabic ? 'تدخل الخبير' : 'Intervention',
      description: isArabic ? 'فني محترف في الموعد' : 'Technicien expert',
      color: 'green',
    },
    {
      icon: CheckCircle,
      title: isArabic ? 'إنجاز' : 'Satisfaction',
      description: isArabic ? 'عمل مضمون 100%' : 'Travail garanti',
      color: 'purple',
    },
  ];

  const benefits = [
    {
      icon: Shield,
      title: isArabic ? 'ضمان لمدة سنة' : 'Garantie 1 an',
      description: isArabic ? 'على جميع الإصلاحات' : 'Sur toutes les réparations',
    },
    {
      icon: Zap,
      title: isArabic ? 'تدخل سريع' : 'Intervention rapide',
      description: isArabic ? 'خلال 24-48 ساعة' : 'Sous 24-48h',
    },
    {
      icon: Star,
      title: isArabic ? 'خبراء معتمدون' : 'Experts certifiés',
      description: isArabic ? 'فنيون مؤهلون ومدربون' : 'Techniciens qualifiés',
    },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-b from-white via-gray-50 to-white ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Hero Section - Golden Ratio Height (61.8vh) */}
      <section 
        className="relative bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 text-white overflow-hidden"
        style={{ minHeight: `${fibonacci[9]}vh` }} // 61.8vh approximation
      >
        <div className="absolute inset-0 bg-[url('/patterns/dots.svg')] opacity-10" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content (61.8% focus) */}
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                <Wrench className="w-4 h-4 mr-2" />
                {isArabic ? 'خدمات احترافية' : 'Services professionnels'}
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                {isArabic ? (
                  <>
                    خدمات الصيانة
                    <span className="block text-orange-200">والإصلاح</span>
                  </>
                ) : (
                  <>
                    Services de
                    <span className="block text-orange-200">Maintenance & Réparation</span>
                  </>
                )}
              </h1>
              
              <p className="text-xl text-orange-100 max-w-xl">
                {isArabic
                  ? 'فريق من الخبراء المعتمدين لخدمة أنظمة التدفئة والسباكة الخاصة بك'
                  : 'Équipe d\'experts certifiés pour tous vos besoins en chauffage et plomberie'}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => setShowAppointmentModal(true)}
                  icon={<Calendar className="w-5 h-5" />}
                  iconRight={<ArrowRight className="w-5 h-5" />}
                  className="bg-white text-orange-600 hover:bg-orange-50"
                >
                  {isArabic ? 'احجز موعداً' : 'Prendre rendez-vous'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  icon={<Phone className="w-5 h-5" />}
                  className="border-white text-white hover:bg-white/10"
                >
                  {isArabic ? 'اتصل بنا' : 'Appelez-nous'}
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-6">
                <div>
                  <div className="text-3xl font-bold">{fibonacci[9]}+</div>
                  <div className="text-orange-200 text-sm">
                    {isArabic ? 'عميل سعيد' : 'Clients satisfaits'}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{fibonacci[6]}</div>
                  <div className="text-orange-200 text-sm">
                    {isArabic ? 'سنة خبرة' : 'Ans d\'expérience'}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold">24h</div>
                  <div className="text-orange-200 text-sm">
                    {isArabic ? 'استجابة سريعة' : 'Réponse rapide'}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Image/Visual (38.2% focus) */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl rotate-6 opacity-20" />
                <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                  <div className="space-y-4">
                    {benefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="p-3 bg-white/20 rounded-lg">
                          <benefit.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{benefit.title}</h3>
                          <p className="text-sm text-orange-100">{benefit.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid - Fibonacci Gap */}
      <section className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {isArabic ? 'خدماتنا' : 'Nos Services'}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {isArabic
              ? 'مجموعة كاملة من خدمات الصيانة والإصلاح لضمان راحتك'
              : 'Une gamme complète de services pour votre confort'}
          </p>
        </div>

        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          style={{ gap: `${goldenSpacing.lg}px` }}
        >
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon as keyof typeof iconMap] || iconMap.default;
            
            return (
              <div
                key={service.id}
                className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative p-8">
                  {/* Icon */}
                  <div className="mb-6">
                    <div className="inline-flex p-4 bg-orange-100 group-hover:bg-orange-500 rounded-xl transition-colors duration-300">
                      <IconComponent className="w-8 h-8 text-orange-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {service.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {service.description || (isArabic ? 'خدمة احترافية' : 'Service professionnel')}
                  </p>

                  {/* Price & Duration */}
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                    <div>
                      <div className="text-3xl font-bold text-orange-600">
                        {new Intl.NumberFormat(numberLocale, {
                          style: 'decimal',
                          minimumFractionDigits: 0,
                        }).format(Number(service.price))}
                        <span className="text-lg text-gray-500 ml-1">
                          {isArabic ? 'د.ج' : 'DA'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {isArabic ? 'السعر التقديري' : 'Prix estimé'}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="font-semibold">{service.duration}</span>
                        <span className="text-sm ml-1">{isArabic ? 'دقيقة' : 'min'}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {isArabic ? 'المدة' : 'Durée'}
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => handleBookService(service)}
                    icon={<Calendar className="w-5 h-5" />}
                  >
                    {isArabic ? 'حجز موعد' : 'Réserver'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Process Section - Golden Ratio Layout */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {isArabic ? 'كيف نعمل' : 'Notre Processus'}
            </h2>
            <p className="text-xl text-gray-600">
              {isArabic ? 'أربع خطوات بسيطة لخدمة مثالية' : 'Quatre étapes simples pour un service parfait'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div
                key={index}
                className="relative text-center"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Connector Line */}
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-orange-200 to-transparent" />
                )}

                {/* Step Number with Golden Circle */}
                <div className="relative mb-6">
                  <div 
                    className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-${step.color}-500 to-${step.color}-600 text-white shadow-lg mx-auto`}
                  >
                    <step.icon className="w-10 h-10" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center font-bold text-gray-900">
                    {index + 1}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Golden Ratio Spacing */}
      <section 
        className="bg-gradient-to-r from-gray-900 to-gray-800 text-white"
        style={{ padding: `${goldenSpacing['2xl']}px ${goldenSpacing.lg}px` }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {isArabic ? 'هل تحتاج إلى مساعدة؟' : 'Besoin d\'aide?'}
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            {isArabic
              ? 'فريقنا متاح 24/7 للإجابة على أسئلتك وحجز موعدك'
              : 'Notre équipe est disponible 24/7 pour répondre à vos questions'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="primary"
              onClick={() => setShowAppointmentModal(true)}
              icon={<Calendar className="w-5 h-5" />}
            >
              {isArabic ? 'احجز الآن' : 'Réserver maintenant'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              icon={<Phone className="w-5 h-5" />}
              className="border-white text-white hover:bg-white/10"
            >
              {isArabic ? '+213 XX XXX XXXX' : '+213 XX XXX XXXX'}
            </Button>
          </div>
        </div>
      </section>

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <AppointmentModal
          isOpen={showAppointmentModal}
          onClose={() => setShowAppointmentModal(false)}
          selectedService={selectedService}
          services={services}
          locale={locale}
        />
      )}
    </div>
  );
}
