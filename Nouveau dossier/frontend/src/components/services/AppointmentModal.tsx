'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { X, Calendar, Clock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

// Golden ratio constants
const fibonacci = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
const PHI = 1.618;

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService: Service | null;
  services: Service[];
  locale: string;
}

interface AppointmentForm {
  serviceTypeId: string;
  description: string;
  requestedDate: string;
  requestedTime: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  equipmentDetails: string;
  contactName: string;
  contactPhone: string;
  address: string;
}

const translations = {
  fr: {
    title: 'Réserver un rendez-vous',
    selectService: 'Sélectionnez un service',
    selectServicePlaceholder: 'Choisir un service...',
    date: 'Date souhaitée',
    time: 'Heure souhaitée',
    description: 'Description du problème',
    descriptionPlaceholder: 'Décrivez votre problème en détail...',
    equipmentDetails: 'Détails de l\'équipement (optionnel)',
    equipmentPlaceholder: 'Marque, modèle, âge de l\'équipement...',
    contactName: 'Nom complet',
    contactPhone: 'Numéro de téléphone',
    address: 'Adresse complète',
    addressPlaceholder: 'Wilaya, Commune, Rue...',
    priority: 'Priorité',
    priorities: {
      LOW: 'Basse',
      NORMAL: 'Normale',
      HIGH: 'Haute',
      URGENT: 'Urgente',
    },
    estimatedCost: 'Coût estimé',
    duration: 'Durée',
    minutes: 'min',
    submit: 'Confirmer le rendez-vous',
    cancel: 'Annuler',
    success: 'Merci ! Rendez-vous confirmé',
    successMessage: 'Votre demande a été enregistrée avec succès. Notre équipe vous contactera bientôt pour confirmer les détails.',
    close: 'Fermer',
    error: 'Erreur',
    errorMessage: 'Une erreur est survenue. Veuillez réessayer.',
    required: 'Ce champ est requis',
    minLength: 'Minimum 10 caractères',
    loginRequired: 'Vous devez être connecté pour réserver',
  },
  ar: {
    title: 'حجز موعد',
    selectService: 'اختر خدمة',
    selectServicePlaceholder: 'اختر خدمة...',
    date: 'التاريخ المطلوب',
    time: 'الوقت المطلوب',
    description: 'وصف المشكلة',
    descriptionPlaceholder: 'صف مشكلتك بالتفصيل...',
    equipmentDetails: 'تفاصيل المعدات (اختياري)',
    equipmentPlaceholder: 'العلامة التجارية، الطراز، عمر المعدات...',
    contactName: 'الاسم الكامل',
    contactPhone: 'رقم الهاتف',
    address: 'العنوان الكامل',
    addressPlaceholder: 'الولاية، البلدية، الشارع...',
    priority: 'الأولوية',
    priorities: {
      LOW: 'منخفضة',
      NORMAL: 'عادية',
      HIGH: 'عالية',
      URGENT: 'عاجلة',
    },
    estimatedCost: 'التكلفة المقدرة',
    duration: 'المدة',
    minutes: 'دقيقة',
    submit: 'تأكيد الموعد',
    cancel: 'إلغاء',
    success: 'شكراً! تم تأكيد الموعد',
    successMessage: 'تم تسجيل طلبك بنجاح. سيتصل بك فريقنا قريباً لتأكيد التفاصيل.',
    close: 'إغلاق',
    error: 'خطأ',
    errorMessage: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    required: 'هذا الحقل مطلوب',
    minLength: 'الحد الأدنى 10 أحرف',
    loginRequired: 'يجب تسجيل الدخول للحجز',
  },
};

export default function AppointmentModal({
  isOpen,
  onClose,
  selectedService,
  services,
  locale,
}: AppointmentModalProps) {
  const t = translations[locale as keyof typeof translations] || translations.fr;
  const isRTL = locale === 'ar';

  const [formData, setFormData] = useState<AppointmentForm>({
    serviceTypeId: selectedService?.id || '',
    description: '',
    requestedDate: '',
    requestedTime: '',
    priority: 'NORMAL',
    equipmentDetails: '',
    contactName: '',
    contactPhone: '',
    address: '',
  });

  const [fetchedServices, setFetchedServices] = useState<Service[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string>('idle');
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  // Pre-fill user data if available
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        contactName: prev.contactName || `${session.user?.name || ''}`,
        contactPhone: prev.contactPhone || (session.user as any).phone || '',
        address: prev.address || (session.user as any).address || '',
      }));
    }
  }, [session]);

  // Fetch services if not provided
  useEffect(() => {
    const fetchServices = async () => {
      if (services.length === 0) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/types`);
          if (response.ok) {
            const data = await response.json();
            // Handle both array response and object with data property
            const servicesList = Array.isArray(data) ? data : (data.data || []);
            setFetchedServices(servicesList);
          }
        } catch (error) {
          console.error('Failed to fetch services:', error);
        }
      }
    };

    if (isOpen) {
      fetchServices();
    }
  }, [isOpen, services.length]);

  // Merge passed services with fetched services, ensuring display of valid options
  const displayServices = services.length > 0 ? services : fetchedServices;

  // Update service when selectedService changes
  useEffect(() => {
    if (selectedService) {
      setFormData(prev => ({ ...prev, serviceTypeId: selectedService.id }));
    }
  }, [selectedService]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFormData({
          serviceTypeId: '',
          description: '',
          requestedDate: '',
          requestedTime: '',
          priority: 'NORMAL',
          equipmentDetails: '',
          contactName: '',
          contactPhone: '',
          address: '',
        });
        setErrors({});
        setSubmitStatus('idle');
      }, 300);
    }
  }, [isOpen]);

  const selectedServiceData = displayServices.find(s => s.id === formData.serviceTypeId);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.serviceTypeId) {
      newErrors.serviceTypeId = t.required;
    }
    if (!formData.description || formData.description.length < 10) {
      newErrors.description = formData.description ? t.minLength : t.required;
    }
    if (!formData.requestedDate) {
      newErrors.requestedDate = t.required;
    }
    if (!formData.requestedTime) {
      newErrors.requestedTime = t.required;
    }
    if (!formData.contactName) {
      newErrors.contactName = t.required;
    }
    if (!formData.contactPhone) {
      newErrors.contactPhone = t.required;
    }
    if (!formData.address) {
      newErrors.address = t.required;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Combine date and time into ISO 8601 format
      const requestedDateTime = new Date(`${formData.requestedDate}T${formData.requestedTime}`);

      const payload = {
        serviceTypeId: formData.serviceTypeId,
        description: formData.description,
        requestedDate: requestedDateTime.toISOString(),
        priority: formData.priority,
        equipmentDetails: formData.equipmentDetails || undefined,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        address: formData.address,
      };

      const submitRequest = async () => {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        // Add Authorization header if we have a session access token
        const accessToken = (session?.user as any)?.accessToken;
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }

        return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/requests`, {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify(payload),
        });
      };

      let response = await submitRequest();

      if (response.status === 401) {
        // Access token might be expired, try to refresh
        try {
          const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });

          if (refreshRes.ok) {
            // Retry original request
            response = await submitRequest();
          }
        } catch (e) {
          console.error('Token refresh failed', e);
        }
      }

      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to login if still unauthorized
          window.location.href = `/${locale}/auth/login`;
          return;
        }
        const errorData = await response.json();
        
        // Handle express-validator errors array
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const messages = errorData.errors.map((e: any) => e.msg).join('. ');
          throw new Error(messages);
        }
        
        throw new Error(errorData.message || 'Failed to create appointment');
      }

      setSubmitStatus('success');
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Appointment creation error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: '90vh',
          animation: 'modalFadeIn 0.382s ease-out',
        }}
      >
        {/* Header - Golden ratio 61.8% visual weight */}
        <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 px-8 py-6">
          <button
            onClick={onClose}
            className="absolute top-4 ltr:right-4 rtl:left-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-247"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-bold text-white mb-2">
            {t.title}
          </h2>
          {selectedServiceData && (
            <p className="text-orange-100 text-sm">
              {selectedServiceData.name}
            </p>
          )}
        </div>

        {/* Content - Scrollable form area */}
        <div className="overflow-y-auto px-8 py-6" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {submitStatus === 'success' ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.success}</h3>
              <p className="text-gray-600 max-w-md mb-8">{t.successMessage}</p>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {t.close}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Contact Information */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Informations de contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.contactName} <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                        errors.contactName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.contactName && (
                      <p className="mt-1 text-sm text-red-500">{errors.contactName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.contactPhone} <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                        errors.contactPhone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.contactPhone && (
                      <p className="mt-1 text-sm text-red-500">{errors.contactPhone}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.address} <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder={t.addressPlaceholder}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                  )}
                </div>
              </div>

              {/* Service Selection */}
            {!selectedService && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.selectService} <span className="text-orange-500">*</span>
                </label>
                <select
                  value={formData.serviceTypeId}
                  onChange={(e) => setFormData({ ...formData, serviceTypeId: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    errors.serviceTypeId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">{t.selectServicePlaceholder}</option>
                  {displayServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
                {errors.serviceTypeId && (
                  <p className="mt-1 text-sm text-red-500">{errors.serviceTypeId}</p>
                )}
              </div>
            )}

            {/* Service Info Card - When pre-selected */}
            {selectedServiceData && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedServiceData.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{selectedServiceData.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {selectedServiceData.duration} {t.minutes}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Date and Time - Side by side on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 ltr:mr-1 rtl:ml-1" />
                  {t.date} <span className="text-orange-500">*</span>
                </label>
                <input
                  type="date"
                  min={today}
                  value={formData.requestedDate}
                  onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    errors.requestedDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.requestedDate && (
                  <p className="mt-1 text-sm text-red-500">{errors.requestedDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="inline w-4 h-4 ltr:mr-1 rtl:ml-1" />
                  {t.time} <span className="text-orange-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.requestedTime}
                  onChange={(e) => setFormData({ ...formData, requestedTime: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    errors.requestedTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.requestedTime && (
                  <p className="mt-1 text-sm text-red-500">{errors.requestedTime}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.description} <span className="text-orange-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t.descriptionPlaceholder}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description ? (
                  <p className="text-sm text-red-500">{errors.description}</p>
                ) : (
                  <p className="text-xs text-gray-500">
                    {formData.description.length} / 1000
                  </p>
                )}
              </div>
            </div>

            {/* Equipment Details */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.equipmentDetails}
              </label>
              <textarea
                value={formData.equipmentDetails}
                onChange={(e) => setFormData({ ...formData, equipmentDetails: e.target.value })}
                placeholder={t.equipmentPlaceholder}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Priority Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {t.priority}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const).map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority })}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-247 ${
                      formData.priority === priority
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t.priorities[priority]}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Messages */}
            {submitStatus === 'error' && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900">{t.error}</p>
                  <p className="text-sm text-red-700">
                    {errors.auth || t.errorMessage}
                  </p>
                </div>
              </div>
            )}
          </form>
          )}
        </div>

        {/* Footer - Actions */}
        {submitStatus !== 'success' && (
        <div className="border-t border-gray-200 px-8 py-4 bg-gray-50 flex flex-col-reverse sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-247 disabled:opacity-50"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || submitStatus === 'success'}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-247 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>En cours...</span>
              </>
            ) : (
              t.submit
            )}
          </button>
        </div>
        )}
      </div>

      <style jsx>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
