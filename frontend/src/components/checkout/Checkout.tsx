'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  CreditCard,
  Truck,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { formatCurrency, paymentMethods } from '@/lib/i18n'

interface CheckoutProps {
  locale: string
  cartItems: Array<{
    id: string
    name: string
    price: number
    quantity: number
    image?: string
  }>
  total: number
}

interface ShippingAddress {
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
  city: string
  postalCode: string
  wilaya: string
}

interface PaymentMethod {
  id: string
  name: string
  icon: string
  enabled: boolean
}

export function Checkout({ locale, cartItems, total }: CheckoutProps) {
  const t = useTranslations('checkout')
  const isRTL = locale === 'ar'

  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPaymentMethod] = useState('CASH_ON_DELIVERY')
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    wilaya: '',
  })

  // Algerian wilayas (provinces)
  const algerianWilayas = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
    'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
    'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
    'Constantine', 'Médéa', 'Mostaganem', 'MSila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
    'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
    'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
    'Ghardaïa', 'Relizane'
  ]

  const steps = [
    { number: 1, title: t('shippingInfo'), icon: MapPin },
    { number: 2, title: t('paymentMethod'), icon: CreditCard },
    { number: 3, title: t('orderReview'), icon: CheckCircle },
  ]

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}

    if (!shippingAddress.firstName.trim()) {
      newErrors.firstName = t('fieldRequired')
    }
    if (!shippingAddress.lastName.trim()) {
      newErrors.lastName = t('fieldRequired')
    }
    if (!shippingAddress.phone.trim()) {
      newErrors.phone = t('fieldRequired')
    }
    if (!shippingAddress.email.trim()) {
      newErrors.email = t('fieldRequired')
    }
    if (!shippingAddress.address.trim()) {
      newErrors.address = t('fieldRequired')
    }
    if (!shippingAddress.city.trim()) {
      newErrors.city = t('fieldRequired')
    }
    if (!shippingAddress.wilaya) {
      newErrors.wilaya = t('fieldRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    // No validation needed for cash on delivery
    return true
  }

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2)
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3)
      }
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true)
    try {
      // TODO: Implement order placement logic
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      // Redirect to order confirmation

    } catch (error) {
      console.error('Error placing order:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= step.number
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'border-gray-300 text-gray-500'
              }`}
            >
              <step.icon className="w-4 h-4" />
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
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t('shippingAddress')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('firstName')} *
            </label>
            <input
              type="text"
              value={shippingAddress.firstName}
              onChange={(e) => handleAddressChange('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={t('firstName')}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('lastName')} *
            </label>
            <input
              type="text"
              value={shippingAddress.lastName}
              onChange={(e) => handleAddressChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={t('lastName')}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('phone')} *
            </label>
            <input
              type="tel"
              value={shippingAddress.phone}
              onChange={(e) => handleAddressChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="+213 XXX XXX XXX"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('email')} *
            </label>
            <input
              type="email"
              value={shippingAddress.email}
              onChange={(e) => handleAddressChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="example@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('address')} *
          </label>
          <textarea
            value={shippingAddress.address}
            onChange={(e) => handleAddressChange('address', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder={t('addressPlaceholder')}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('city')} *
            </label>
            <input
              type="text"
              value={shippingAddress.city}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={t('city')}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('wilaya')} *
            </label>
            <select
              value={shippingAddress.wilaya}
              onChange={(e) => handleAddressChange('wilaya', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">{t('selectWilaya')}</option>
              {algerianWilayas.map((wilaya) => (
                <option key={wilaya} value={wilaya}>
                  {wilaya}
                </option>
              ))}
            </select>
            {errors.wilaya && (
              <p className="mt-1 text-sm text-red-600">{errors.wilaya}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('postalCode')}
            </label>
            <input
              type="text"
              value={shippingAddress.postalCode}
              onChange={(e) => handleAddressChange('postalCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="16000"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t('paymentMethod')}
        </h2>

        <div className="space-y-4">
          {/* Cash on Delivery - Only Option */}
          <div className="border-2 border-primary-500 bg-primary-50 rounded-lg p-4">
            <div className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                value="CASH_ON_DELIVERY"
                checked={true}
                readOnly
                className="text-primary-600 focus:ring-primary-500"
              />
              <div className={`${isRTL ? 'mr-3' : 'ml-3'} flex items-center`}>
                <Truck className="h-6 w-6 text-gray-600 mr-2" />
                <div>
                  <p className="font-medium text-gray-900">
                    {locale === 'ar' ? 'الدفع عند الاستلام' : 'Paiement à la livraison'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {locale === 'ar' 
                      ? 'ستدفع نقداً عند وصول طلبك إلى عنوانك' 
                      : 'Vous paierez en espèces à la réception de votre commande'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  {locale === 'ar' ? 'معلومات الدفع' : 'Informations de paiement'}
                </h4>
                <p className="text-sm text-blue-700">
                  {locale === 'ar' 
                    ? 'سيتصل بك فريق التوصيل قبل الوصول لتأكيد الطلب والمبلغ المطلوب'
                    : 'Notre équipe de livraison vous contactera avant la livraison pour confirmer la commande et le montant à payer'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t('orderSummary')}
        </h2>

        {/* Order Items */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-4">{t('orderItems')}</h3>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    {t('quantity')}: {item.quantity}
                  </p>
                </div>
                <p className="font-medium text-gray-900">
                  {formatCurrency(item.price * item.quantity, locale as 'fr' | 'ar')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-4">{t('shippingAddress')}</h3>
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900">
              {shippingAddress.firstName} {shippingAddress.lastName}
            </p>
            <p>{shippingAddress.address}</p>
            <p>{shippingAddress.city}, {shippingAddress.wilaya}</p>
            <p>{shippingAddress.phone}</p>
            <p>{shippingAddress.email}</p>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-4">{t('paymentMethod')}</h3>
          <p className="text-sm text-gray-600">
            {locale === 'ar' ? 'الدفع عند الاستلام' : 'Paiement à la livraison'}
          </p>
        </div>

        {/* Order Total */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
            <span>{t('total')}</span>
            <span>{formatCurrency(total, locale as 'fr' | 'ar')}</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen bg-gray-50 py-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderStepIndicator()}

        <div className="bg-white rounded-lg shadow-card p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            {currentStep > 1 && (
              <button
                onClick={handlePreviousStep}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                {t('previous')}
              </button>
            )}

            <div className={currentStep === 1 ? 'ml-auto' : ''}>
              {currentStep < 3 ? (
                <button
                  onClick={handleNextStep}
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  {t('next')}
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="px-6 py-2 bg-success-600 text-white rounded-md hover:bg-success-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('processing')}
                    </div>
                  ) : (
                    t('placeOrder')
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