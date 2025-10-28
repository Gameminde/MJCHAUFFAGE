'use client';

import { useState, useEffect } from 'react';
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
    success: 'Rendez-vous confirmé !',
    successMessage: 'Votre demande a été enregistrée. Nous vous contacterons bientôt.',
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
    success: 'تم تأكيد الموعد!',
    successMessage: 'تم تسجيل طلبك. سنتصل بك قريباً.',
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          credentials: 'include',
        });
        setIsAuthenticated(response.ok);
      } catch {
        setIsAuthenticated(false);
      }
    };
    
    if (isOpen) {
      checkAuth();
    }
  }, [isOpen]);

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
        });
        setErrors({});
        setSubmitStatus('idle');
      }, 300);
    }
  }, [isOpen]);

  const selectedServiceData = services.find(s => s.id === formData.serviceTypeId);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setSubmitStatus('error');
      setErrors({ auth: t.loginRequired });
      return;
    }

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
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create appointment');
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
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.price.toLocaleString(locale)} DZD
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
                    <p className="text-lg font-bold text-orange-600">
                      {selectedServiceData.price.toLocaleString(locale)} DZD
                    </p>
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

            {/* Success Message */}
            {submitStatus === 'success' && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900">{t.success}</p>
                  <p className="text-sm text-green-700">{t.successMessage}</p>
                </div>
              </div>
            )}

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
        </div>

        {/* Footer - Actions */}
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
