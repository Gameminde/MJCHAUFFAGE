'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'

interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  street: string
  city: string
  postalCode: string
  region: string
}

// A list of Algerian Wilayas for the dropdown
const ALGERIA_REGIONS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
  'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
  'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
  'Constantine', 'Médéa', 'Mostaganem', 'MSila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh'
  // In a real app, this list would be more complete
]

export function CheckoutForm() {
  const { items, total, clearCart, formatPrice } = useCart()
  const router = useRouter()
  const { locale } = useLanguage()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '', lastName: '', email: '', phone: '',
    street: '', city: '', postalCode: '', region: ''
  })
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const shippingCost = 500 // Flat rate shipping
  const finalTotal = total + shippingCost

  useEffect(() => {
    if (items.length === 0) {
      router.push(`/${locale}/products`)
    }
  }, [items.length, router, locale])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setShippingAddress(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    const requiredFields: (keyof ShippingAddress)[] = ['firstName', 'lastName', 'email', 'phone', 'street', 'city', 'region', 'postalCode']
    for (const field of requiredFields) {
      if (!shippingAddress[field].trim()) {
        setError(locale === 'ar' ? `حقل "${field}" مطلوب.` : `Le champ "${field}" est requis.`);
        return false
      }
    }
    if (!agreeToTerms) {
      setError(locale === 'ar' ? 'يجب الموافقة على الشروط والأحكام.' : 'Vous devez accepter les termes et conditions.');
      return false
    }
    setError('')
    return true
  }

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingAddress,
          paymentMethod: 'cash_on_delivery',
          subtotal: total,
          shippingCost,
          total: finalTotal,
          currency: 'DZD'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create order')
      }

      const result = await response.json()
      clearCart()
      router.push(`/${locale}/checkout/success?orderId=${result.orderId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la commande. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          {locale === 'ar' ? 'إتمام الطلب' : 'Finaliser la commande'}
        </h1>

        <form onSubmit={handleOrderSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Side: Shipping Form */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="text-xl font-semibold mb-4">{locale === 'ar' ? 'عنوان الشحن' : 'Adresse de livraison'}</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" name="firstName" placeholder={locale === 'ar' ? 'الاسم الأول *' : 'Prénom *'} onChange={handleInputChange} className="form-input" required />
              <input type="text" name="lastName" placeholder={locale === 'ar' ? 'الاسم الأخير *' : 'Nom *'} onChange={handleInputChange} className="form-input" required />
              <input type="email" name="email" placeholder={locale === 'ar' ? 'البريد الإلكتروني *' : 'Email *'} onChange={handleInputChange} className="form-input sm:col-span-2" required />
              <input type="tel" name="phone" placeholder={locale === 'ar' ? 'رقم الهاتف *' : 'Téléphone *'} onChange={handleInputChange} className="form-input sm:col-span-2" required />
              <input type="text" name="street" placeholder={locale === 'ar' ? 'عنوان الشارع *' : 'Adresse *'} onChange={handleInputChange} className="form-input sm:col-span-2" required />
              <input type="text" name="city" placeholder={locale === 'ar' ? 'المدينة *' : 'Ville *'} onChange={handleInputChange} className="form-input" required />
              <input type="text" name="postalCode" placeholder={locale === 'ar' ? 'الرمز البريدي *' : 'Code postal *'} onChange={handleInputChange} className="form-input" required />
              <select name="region" onChange={handleInputChange} className="form-select sm:col-span-2" required>
                <option value="">{locale === 'ar' ? 'اختر ولايتك *' : 'Sélectionner une wilaya *'}</option>
                {ALGERIA_REGIONS.map(region => <option key={region} value={region}>{region}</option>)}
              </select>
            </div>
          </div>

          {/* Right Side: Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">{locale === 'ar' ? 'ملخص الطلب' : 'Résumé de la commande'}</h3>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name} <span className="text-sm text-gray-500">x{item.quantity}</span></p>
                  </div>
                  <span className="text-gray-700">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 mt-4 space-y-2">
              <div className="flex justify-between"><span className="text-gray-600">{locale === 'ar' ? 'المجموع الفرعي' : 'Sous-total'}</span><span>{formatPrice(total)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">{locale === 'ar' ? 'الشحن' : 'Livraison'}</span><span>{formatPrice(shippingCost)}</span></div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>{locale === 'ar' ? 'المجموع الإجمالي' : 'Total'}</span><span className="text-primary-600">{formatPrice(finalTotal)}</span></div>
            </div>
            <div className="mt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="font-semibold text-blue-800">{locale === 'ar' ? 'الدفع عند الاستلام' : 'Paiement à la livraison'}</p>
                <p className="text-sm text-blue-700 mt-1">{locale === 'ar' ? 'ستدفع نقدًا عند وصول طلبك.' : 'Vous paierez en espèces à l\'arrivée de votre commande.'}</p>
              </div>

            <div className="mt-6 flex items-start">
              <input type="checkbox" id="terms" checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)} className="mt-1 mr-3" />
              <label htmlFor="terms" className="text-sm text-gray-600">{locale === 'ar' ? 'أوافق على ' : 'J\'accepte les '}<a href="/terms" className="text-primary-600 underline">{locale === 'ar' ? 'الشروط والأحكام' : 'termes et conditions'}</a></label>
            </div>
            {error && <p className="text-red-600 mt-4 text-sm">{error}</p>}

            <button type="submit" className="w-full mt-6 bg-primary-600 text-white py-3 rounded-md hover:bg-primary-700 disabled:opacity-50 font-semibold" disabled={isLoading}>
              {isLoading ? (locale === 'ar' ? 'جاري التأكيد...' : 'Confirmation...') : (locale === 'ar' ? 'تأكيد الطلب' : 'Confirmer la commande')}
            </button>
          </div>
        </div>
        </form>
      </div>
    </div>
  )
}