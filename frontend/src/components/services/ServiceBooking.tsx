'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Calendar, Clock, MapPin, User, Phone, Mail, Wrench, Settings, AlertTriangle } from 'lucide-react'

interface ServiceBookingProps {
  locale: string
}

interface BookingForm {
  serviceType: string
  preferredDate: string
  preferredTime: string
  urgency: 'normal' | 'urgent' | 'emergency'
  customerInfo: {
    firstName: string
    lastName: string
    phone: string
    email: string
  }
  address: {
    street: string
    city: string
    wilaya: string
    postalCode: string
    building?: string
    floor?: string
    apartment?: string
  }
  description: string
  images?: File[]
}

const SERVICE_TYPES = [
  {
    id: 'installation',
    nameAr: 'تركيب',
    nameFr: 'Installation',
    duration: 120,
    price: 8000,
    icon: Settings
  },
  {
    id: 'maintenance',
    nameAr: 'صيانة',
    nameFr: 'Maintenance',
    duration: 90,
    price: 5000,
    icon: Wrench
  },
  {
    id: 'repair',
    nameAr: 'إصلاح',
    nameFr: 'Réparation',
    duration: 60,
    price: 6000,
    icon: AlertTriangle
  },
  {
    id: 'emergency',
    nameAr: 'طوارئ',
    nameFr: 'Urgence',
    duration: 45,
    price: 12000,
    icon: AlertTriangle
  }
]

const ALGERIA_WILAYAS = [
  'Alger', 'Blida', 'Boumerdès', 'Tipaza', 'Constantine', 'Oran', 'Annaba', 'Batna',
  'Sétif', 'Tlemcen', 'Béjaïa', 'Jijel', 'Skikda', 'Guelma', 'Tébessa', 'Khenchela',
  'Oum El Bouaghi', 'Souk Ahras', 'Mila', 'Bordj Bou Arréridj', 'Médéa', 'Aïn Defla',
  'Tissemsilt', 'Chlef', 'Laghouat', 'Djelfa', 'Tiaret', 'Saïda', 'Mascara', 'Mostaganem',
  'Relizane', 'Sidi Bel Abbès', 'Aïn Témouchent', 'Tindouf', 'Béchar', 'Adrar', 'Ouargla',
  'El Bayadh', 'Ghardaïa', 'Naâma', 'El Oued', 'Biskra', 'Tamanrasset', 'Illizi', 'El Tarf', 'Bouira'
]

export function ServiceBooking({ locale }: ServiceBookingProps) {
  const t = useTranslations('services')
  const isRTL = locale === 'ar'

  const [currentStep, setCurrentStep] = useState(1)
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    serviceType: '',
    preferredDate: '',
    preferredTime: '',
    urgency: 'normal',
    customerInfo: {
      firstName: '',
      lastName: '',
      phone: '',
      email: ''
    },
    address: {
      street: '',
      city: '',
      wilaya: '',
      postalCode: '',
      building: '',
      floor: '',
      apartment: ''
    },
    description: '',
    images: []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setBookingForm(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof BookingForm] as object || {}),
          [child]: value
        }
      }))
    } else {
      setBookingForm(prev => ({ ...prev, [field]: value }))
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!bookingForm.serviceType) newErrors.serviceType = t('fieldRequired')
      if (!bookingForm.preferredDate) newErrors.preferredDate = t('fieldRequired')
      if (!bookingForm.preferredTime) newErrors.preferredTime = t('fieldRequired')
    } else if (step === 2) {
      if (!bookingForm.customerInfo.firstName) newErrors['customerInfo.firstName'] = t('fieldRequired')
      if (!bookingForm.customerInfo.lastName) newErrors['customerInfo.lastName'] = t('fieldRequired')
      if (!bookingForm.customerInfo.phone) newErrors['customerInfo.phone'] = t('fieldRequired')
      if (!bookingForm.customerInfo.email) newErrors['customerInfo.email'] = t('fieldRequired')
    } else if (step === 3) {
      if (!bookingForm.address.street) newErrors['address.street'] = t('fieldRequired')
      if (!bookingForm.address.city) newErrors['address.city'] = t('fieldRequired')
      if (!bookingForm.address.wilaya) newErrors['address.wilaya'] = t('fieldRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)
    try {
      // TODO: Submit booking to API
  
      // Redirect to confirmation page
    } catch (error) {
      console.error('Booking submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('selectService')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SERVICE_TYPES.map((service) => (
            <div
              key={service.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                bookingForm.serviceType === service.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleInputChange('serviceType', service.id)}
            >
              <div className="flex items-center mb-3">
                <service.icon className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">
                    {locale === 'ar' ? service.nameAr : service.nameFr}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {service.duration} {t('minutes')} • {service.price} {t('dzd')}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {t(`serviceDescriptions.${service.id}`)}
              </p>
            </div>
          ))}
        </div>
        {errors.serviceType && (
          <p className="mt-1 text-sm text-red-600">{errors.serviceType}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('preferredDate')} *
          </label>
          <input
            type="date"
            value={bookingForm.preferredDate}
            onChange={(e) => handleInputChange('preferredDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {errors.preferredDate && (
            <p className="mt-1 text-sm text-red-600">{errors.preferredDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('preferredTime')} *
          </label>
          <select
            value={bookingForm.preferredTime}
            onChange={(e) => handleInputChange('preferredTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">{t('selectTime')}</option>
            <option value="08:00">08:00</option>
            <option value="09:00">09:00</option>
            <option value="10:00">10:00</option>
            <option value="11:00">11:00</option>
            <option value="14:00">14:00</option>
            <option value="15:00">15:00</option>
            <option value="16:00">16:00</option>
            <option value="17:00">17:00</option>
          </select>
          {errors.preferredTime && (
            <p className="mt-1 text-sm text-red-600">{errors.preferredTime}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('urgency')}
        </label>
        <div className="grid grid-cols-3 gap-4">
          {['normal', 'urgent', 'emergency'].map((urgency) => (
            <div
              key={urgency}
              className={`border-2 rounded-lg p-3 cursor-pointer text-center transition-all ${
                bookingForm.urgency === urgency
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleInputChange('urgency', urgency)}
            >
              <div className="font-medium text-gray-900">
                {t(`urgencyLevels.${urgency}`)}
              </div>
              {urgency === 'emergency' && (
                <div className="text-xs text-red-600 mt-1">
                  +50% {t('surcharge')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('customerInfo')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('firstName')} *
            </label>
            <input
              type="text"
              value={bookingForm.customerInfo.firstName}
              onChange={(e) => handleInputChange('customerInfo.firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors['customerInfo.firstName'] && (
              <p className="mt-1 text-sm text-red-600">{errors['customerInfo.firstName']}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('lastName')} *
            </label>
            <input
              type="text"
              value={bookingForm.customerInfo.lastName}
              onChange={(e) => handleInputChange('customerInfo.lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors['customerInfo.lastName'] && (
              <p className="mt-1 text-sm text-red-600">{errors['customerInfo.lastName']}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('phone')} *
            </label>
            <input
              type="tel"
              value={bookingForm.customerInfo.phone}
              onChange={(e) => handleInputChange('customerInfo.phone', e.target.value)}
              placeholder="+213 XXX XXX XXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors['customerInfo.phone'] && (
              <p className="mt-1 text-sm text-red-600">{errors['customerInfo.phone']}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('email')} *
            </label>
            <input
              type="email"
              value={bookingForm.customerInfo.email}
              onChange={(e) => handleInputChange('customerInfo.email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors['customerInfo.email'] && (
              <p className="mt-1 text-sm text-red-600">{errors['customerInfo.email']}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('serviceAddress')}</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('streetAddress')} *
            </label>
            <input
              type="text"
              value={bookingForm.address.street}
              onChange={(e) => handleInputChange('address.street', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors['address.street'] && (
              <p className="mt-1 text-sm text-red-600">{errors['address.street']}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('city')} *
              </label>
              <input
                type="text"
                value={bookingForm.address.city}
                onChange={(e) => handleInputChange('address.city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {errors['address.city'] && (
                <p className="mt-1 text-sm text-red-600">{errors['address.city']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('wilaya')} *
              </label>
              <select
                value={bookingForm.address.wilaya}
                onChange={(e) => handleInputChange('address.wilaya', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">{t('selectWilaya')}</option>
                {ALGERIA_WILAYAS.map((wilaya) => (
                  <option key={wilaya} value={wilaya}>{wilaya}</option>
                ))}
              </select>
              {errors['address.wilaya'] && (
                <p className="mt-1 text-sm text-red-600">{errors['address.wilaya']}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('building')}
              </label>
              <input
                type="text"
                value={bookingForm.address.building}
                onChange={(e) => handleInputChange('address.building', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('floor')}
              </label>
              <input
                type="text"
                value={bookingForm.address.floor}
                onChange={(e) => handleInputChange('address.floor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('apartment')}
              </label>
              <input
                type="text"
                value={bookingForm.address.apartment}
                onChange={(e) => handleInputChange('address.apartment', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('postalCode')}
            </label>
            <input
              type="text"
              value={bookingForm.address.postalCode}
              onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('additionalInfo')}</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('problemDescription')}
          </label>
          <textarea
            value={bookingForm.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder={t('descriptionPlaceholder')}
          />
        </div>
      </div>

      {/* Booking Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('bookingSummary')}</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">{t('service')}</span>
            <span className="font-medium">
              {SERVICE_TYPES.find(s => s.id === bookingForm.serviceType)?.[locale === 'ar' ? 'nameAr' : 'nameFr']}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">{t('date')}</span>
            <span className="font-medium">{bookingForm.preferredDate}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">{t('time')}</span>
            <span className="font-medium">{bookingForm.preferredTime}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">{t('location')}</span>
            <span className="font-medium">{bookingForm.address.city}, {bookingForm.address.wilaya}</span>
          </div>
          
          <div className="border-t pt-3 flex justify-between">
            <span className="text-lg font-semibold">{t('total')}</span>
            <span className="text-lg font-semibold text-primary-600">
              {SERVICE_TYPES.find(s => s.id === bookingForm.serviceType)?.price || 0} {t('dzd')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  const steps = [
    { number: 1, title: t('serviceDetails'), icon: Settings },
    { number: 2, title: t('customerInfo'), icon: User },
    { number: 3, title: t('address'), icon: MapPin },
    { number: 4, title: t('confirmation'), icon: Calendar }
  ]

  return (
    <div className={`min-h-screen bg-gray-50 py-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`mx-2 text-sm font-medium ${
                  currentStep >= step.number ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      currentStep > step.number ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                {t('previous')}
              </button>
            )}

            <div className={currentStep === 1 ? 'ml-auto' : ''}>
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  {t('next')}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-success-600 text-white rounded-md hover:bg-success-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('submitting')}
                    </div>
                  ) : (
                    t('confirmBooking')
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}