'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Calendar, Clock, MapPin, User, Phone, Mail, Wrench, Settings, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

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
    duration: 0,
    price: 0,
    icon: AlertTriangle
  },
]

export default function ServiceBooking({ locale }: ServiceBookingProps) {
  const t = useTranslations('services')
  const supabase = createClient()
  const { user } = useAuth()

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
      const priorityMap: Record<string, string> = {
        'normal': 'NORMAL',
        'urgent': 'HIGH',
        'emergency': 'URGENT'
      }

      let serviceTypeId = null

      // Try to find by case-insensitive name matching the form ID
      const { data: typeByName } = await supabase
        .from('service_types')
        .select('id')
        .ilike('name', bookingForm.serviceType)
        .single()
      serviceTypeId = typeByName?.id

      const bookingData = {
        request_number: `REQ-${Date.now()}`,
        user_id: user?.id || null,
        service_type_id: serviceTypeId,
        status: 'PENDING',
        priority: priorityMap[bookingForm.urgency] || 'NORMAL',
        preferred_date: bookingForm.preferredDate,
        preferred_time: bookingForm.preferredTime,
        contact_name: `${bookingForm.customerInfo.firstName} ${bookingForm.customerInfo.lastName}`,
        contact_phone: bookingForm.customerInfo.phone,
        contact_email: bookingForm.customerInfo.email,
        address: `${bookingForm.address.street}, ${bookingForm.address.city}, ${bookingForm.address.wilaya}`,
        wilaya: bookingForm.address.wilaya,
        city: bookingForm.address.city,
        description: bookingForm.description,
        notes: `Address details: Building ${bookingForm.address.building || '-'}, Floor ${bookingForm.address.floor || '-'}, Apt ${bookingForm.address.apartment || '-'}`
      }



      const { error } = await supabase
        .from('service_requests')
        .insert(bookingData)

      if (error) throw error

      const confirmationId = bookingData.request_number;
      const redirectUrl = `${window.location.origin}/${locale}/services/confirmation?id=${confirmationId}`;

      window.location.href = redirectUrl;
    } catch (error: any) {
      console.error('Booking submission error:', error)
      setIsSubmitting(false)
      alert(error.message || t('bookingError') || 'Error booking service');
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
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${bookingForm.serviceType === service.id
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
            name="preferredDate"
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
            name="preferredTime"
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
              className={`border-2 rounded-lg p-3 cursor-pointer text-center transition-all ${bookingForm.urgency === urgency
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
              name="firstName"
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
              name="lastName"
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
              name="phone"
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
              name="email"
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
              name="street"
              type="text"
              value={bookingForm.address.street}
              onChange={(e) => handleInputChange('address.street', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors['address.street'] && (
              <p className="mt-1 text-sm text-red-600">{errors['address.street']}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('city')} *
            </label>
            <input
              name="city"
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
            <input
              name="wilaya"
              type="text"
              value={bookingForm.address.wilaya}
              onChange={(e) => handleInputChange('address.wilaya', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors['address.wilaya'] && (
              <p className="mt-1 text-sm text-red-600">{errors['address.wilaya']}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('building')}
            </label>
            <input
              name="building"
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
              name="floor"
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
              name="apartment"
              type="text"
              value={bookingForm.address.apartment}
              onChange={(e) => handleInputChange('address.apartment', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('description')}</h2>
        <textarea
          name="description"
          value={bookingForm.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder={t('descriptionPlaceholder')}
        />
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10" />
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex flex-col items-center bg-white px-2 ${step <= currentStep ? 'text-primary-600' : 'text-gray-400'
                }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step <= currentStep
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
                  }`}
              >
                {step}
              </div>
              <span className="text-sm font-medium hidden md:block">
                {t(`step${step}`)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('summary')}</h2>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex justify-between border-b border-gray-200 pb-4">
                <span className="text-gray-600">{t('serviceType')}</span>
                <span className="font-medium">
                  {SERVICE_TYPES.find(s => s.id === bookingForm.serviceType)?.nameFr}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-4">
                <span className="text-gray-600">{t('dateAndTime')}</span>
                <span className="font-medium">
                  {bookingForm.preferredDate} {t('at')} {bookingForm.preferredTime}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-4">
                <span className="text-gray-600">{t('urgency')}</span>
                <span className="font-medium capitalize">{t(`urgencyLevels.${bookingForm.urgency}`)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('estimatedPrice')}</span>
                <span className="font-medium text-primary-600">
                  {SERVICE_TYPES.find(s => s.id === bookingForm.serviceType)?.price} {t('dzd')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${currentStep === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          {t('previous')}
        </button>

        {currentStep < 4 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            {t('next')}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {t('processing')}
              </>
            ) : (
              t('confirmBooking')
            )}
          </button>
        )}
      </div>
    </div>
  )
}