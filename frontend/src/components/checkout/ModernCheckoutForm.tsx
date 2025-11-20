'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import PaymentService from '@/services/paymentService';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Truck,
  Package,
  CreditCard,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string; // Optionnel
  street: string;
  city: string;
  postalCode: string;
  region: string;
  profession?: string; // Optionnel : "technicien", "particulier", "autre"
}

import { api } from '@/lib/api';

// Remove hardcoded wilayas, will fetch from API
const ALGERIA_REGIONS: string[] = [];

export function ModernCheckoutForm() {
  const { items, total, clearCart, formatPrice } = useCart();
  const router = useRouter();
  const { locale } = useLanguage();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ShippingAddress>>({});
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    postalCode: '',
    region: '',
    profession: '',
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const finalTotal = total + (shippingCost || 0);

  const [wilayas, setWilayas] = useState<any[]>([]);
  const [loadingWilayas, setLoadingWilayas] = useState(true);

  // Fetch wilayas on mount
  useEffect(() => {
    const fetchWilayas = async () => {
      setLoadingWilayas(true);
      try {
        // Use Next.js API proxy first (recommended), then fallback to direct backend
        let response: Response | null = null;
        let data: any = null;

        // List of endpoints to try in order (proxy first, then direct)
        const endpoints = [
          '/api/wilayas', // Next.js proxy -> backend /api/v1/wilayas
          '/api/v1/wilayas', // Direct proxy
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/wilayas`, // Direct backend
        ];

        for (const endpoint of endpoints) {
          try {
            console.log(`🔍 Tentative de connexion à: ${endpoint}`);
            response = await fetch(endpoint, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              cache: 'no-cache',
            });
            
            if (response.ok) {
              data = await response.json();
              console.log(`✅ Succès avec: ${endpoint}`);
              break;
            } else {
              console.warn(`⚠️ ${endpoint} retourné: ${response.status} ${response.statusText}`);
            }
          } catch (e) {
            console.warn(`❌ Erreur avec ${endpoint}:`, e);
            continue;
          }
        }

        if (data) {
          // Handle different response formats
          let wilayasList: any[] = [];
          
          if (data.success && Array.isArray(data.data)) {
            wilayasList = data.data;
          } else if (Array.isArray(data)) {
            wilayasList = data;
          } else if (data.data && Array.isArray(data.data)) {
            wilayasList = data.data;
          }

          if (wilayasList.length > 0) {
            console.log(`✅ ${wilayasList.length} wilayas chargées avec succès`);
            setWilayas(wilayasList);
          } else {
            console.warn('⚠️ Aucune wilaya trouvée dans la réponse:', data);
          }
        } else {
          throw new Error(`HTTP ${response?.status || 'unknown'}: ${response?.statusText || 'No response'}`);
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des wilayas:', error);
        console.error('💡 Vérifiez que le backend est démarré et que les wilayas sont dans la base de données');
        // Keep empty array to show error message
        setWilayas([]);
      } finally {
        setLoadingWilayas(false);
      }
    };

    fetchWilayas();
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      router.push(`/${locale}/products`);
    }
  }, [items.length, router, locale]);

  // Fetch shipping cost
  useEffect(() => {
    const wilayaCode = shippingAddress.region; // We store code in region now
    if (!wilayaCode) {
      setShippingCost(0);
      return;
    }
    
    const fetchShippingCost = async () => {
      try {
        // Try Next.js proxy first, then direct backend
        let response: Response | null = null;
        const endpoints = [
          `/api/wilayas/${wilayaCode}/shipping-cost`, // Next.js proxy
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/wilayas/${wilayaCode}/shipping-cost`, // Direct backend
        ];

        for (const endpoint of endpoints) {
          try {
            response = await fetch(endpoint, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            if (response.ok) break;
          } catch (e) {
            continue;
          }
        }

        if (response && response.ok) {
          const data = await response.json();
          if (data.success && data.data?.shippingCost) {
            setShippingCost(Number(data.data.shippingCost));
          } else {
            setShippingCost(600); // Default shipping cost
          }
        } else {
          setShippingCost(600); // Default shipping cost
        }
      } catch (error) {
        console.error('Failed to calculate shipping:', error);
        setShippingCost(600); // Default shipping cost on error
      }
    };

    fetchShippingCost();
  }, [shippingAddress.region]);

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingAddress> = {};
    const requiredFields: (keyof ShippingAddress)[] = [
      'firstName',
      'lastName',
      'phone',
      'street',
      'city',
      'region',
    ];

    requiredFields.forEach((field) => {
      if (!shippingAddress[field] || !String(shippingAddress[field]).trim()) {
        newErrors[field] = locale === 'ar' ? 'مطلوب' : 'Requis';
      }
    });

    // Phone validation (strict Algerian format)
    const phoneRegex = /^(\+213|0)[567]\d{8}$/;
    if (
      shippingAddress.phone &&
      !phoneRegex.test(shippingAddress.phone.replace(/\s/g, ''))
    ) {
      newErrors.phone =
        locale === 'ar' ? 'رقم هاتف غير صحيح (05/06/07)' : 'Numéro invalide (05/06/07)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && agreeToTerms;
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Use Next.js proxy to avoid duplicate /api/v1/api/v1
      const response = await fetch('/api/orders/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
          shippingAddress: {
            street: shippingAddress.street,
            city: shippingAddress.city,
            postalCode: shippingAddress.postalCode.trim() || undefined, // Optional postal code
            region: shippingAddress.region,
            country: 'Algeria',
          },
          customerInfo: {
            firstName: shippingAddress.firstName.trim(),
            lastName: shippingAddress.lastName.trim(),
            phone: shippingAddress.phone,
            email: shippingAddress.email?.trim() || undefined, // Optional email
            profession: shippingAddress.profession?.trim() || undefined, // Optional profession
          },
          paymentMethod: 'CASH_ON_DELIVERY',
          subtotal: total,
          shippingAmount: shippingCost,
          totalAmount: finalTotal,
          currency: 'DZD',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const result = await response.json();
      
      // Use orderNumber for tracking instead of orderId
      const orderNumber = result.data?.order?.orderNumber || result.data?.order?.id;
      
      if (!orderNumber) {
        throw new Error('Order number not received from server');
      }
      
      // Navigate to success page FIRST, then clear cart
      // Use replace to prevent back navigation to checkout
      router.replace(`/${locale}/checkout/success?orderNumber=${orderNumber}`);
      
      // Clear cart AFTER navigation to prevent redirect to empty cart page
      setTimeout(() => {
        clearCart();
      }, 100);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : locale === 'ar'
        ? 'فشل في إنشاء الطلب'
        : 'Échec de la commande';
      
      // Show error in a user-friendly way
      alert(errorMessage);
      console.error('Order creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 section-padding">
      <div className="container-modern">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-display-lg font-display font-bold text-neutral-900 mb-4">
              {locale === 'ar' ? 'إتمام الطلب' : 'Finaliser votre commande'}
            </h1>
            <p className="text-body-lg text-neutral-600">
              {locale === 'ar'
                ? 'خطوة واحدة فقط لتأكيد طلبك'
                : 'Une seule étape pour confirmer votre commande'}
            </p>
          </div>

          <form onSubmit={handleOrderSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Side: Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping Address Card */}
                <Card variant="default" hover="none">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Truck className="w-5 h-5 text-primary-600" />
                      </div>
                      <CardTitle>
                        {locale === 'ar' ? 'عنوان التسليم' : 'Adresse de livraison'}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label={locale === 'ar' ? 'الاسم' : 'Prénom'}
                        value={shippingAddress.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        error={errors.firstName}
                        required
                      />
                      <Input
                        label={locale === 'ar' ? 'اللقب' : 'Nom'}
                        value={shippingAddress.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        error={errors.lastName}
                        required
                      />
                    </div>

                    <Input
                      label={locale === 'ar' ? 'رقم الهاتف' : 'Téléphone'}
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      leftIcon={<Phone className="w-4 h-4" />}
                      error={errors.phone}
                      helperText="Ex: 0555123456 ou +213555123456"
                      required
                    />

                    <Input
                      label={locale === 'ar' ? 'البريد الإلكتروني (اختياري)' : 'Email (optionnel)'}
                      type="email"
                      value={shippingAddress.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      leftIcon={<Mail className="w-4 h-4" />}
                      error={errors.email}
                    />

                    <div className="space-y-2">
                      <label className="block text-body-sm font-medium text-neutral-700">
                        {locale === 'ar' ? 'المهنة (اختياري)' : 'Profession (optionnel)'}
                      </label>
                      <select
                        value={shippingAddress.profession || ''}
                        onChange={(e) => handleInputChange('profession', e.target.value)}
                        className="form-input w-full px-4 py-3 rounded-lg border border-neutral-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      >
                        <option value="">
                          {locale === 'ar' ? 'اختر...' : 'Sélectionner...'}
                        </option>
                        <option value="technicien">
                          {locale === 'ar' ? 'تقني' : 'Technicien'}
                        </option>
                        <option value="particulier">
                          {locale === 'ar' ? 'شخص عادي' : 'Particulier'}
                        </option>
                        <option value="autre">
                          {locale === 'ar' ? 'آخر' : 'Autre'}
                        </option>
                      </select>
                      <p className="text-body-xs text-neutral-500">
                        {locale === 'ar' 
                          ? '💡 Cette information nous aide à améliorer nos services' 
                          : '💡 Cette information nous aide à améliorer nos services'}
                      </p>
                    </div>

                    <Input
                      label={locale === 'ar' ? 'العنوان' : 'Adresse'}
                      value={shippingAddress.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      leftIcon={<MapPin className="w-4 h-4" />}
                      error={errors.street}
                      required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label={locale === 'ar' ? 'المدينة' : 'Ville'}
                        value={shippingAddress.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        error={errors.city}
                        required
                      />
                      <Input
                        label={locale === 'ar' ? 'الرمز البريدي (اختياري)' : 'Code postal (optionnel)'}
                        value={shippingAddress.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        error={errors.postalCode}
                      />
                      <div className="space-y-2">
                        <label className="block text-body-sm font-medium text-neutral-700">
                          {locale === 'ar' ? 'الولاية' : 'Wilaya'}
                          <span className="text-red-500 ml-1">*</span>
                          {wilayas.length > 0 && (
                            <span className="text-xs text-neutral-500 ml-2">
                              ({wilayas.length} {locale === 'ar' ? 'ولاية متاحة' : 'wilayas disponibles'})
                            </span>
                          )}
                        </label>
                        <select
                          value={shippingAddress.region}
                          onChange={(e) => handleInputChange('region', e.target.value)}
                          className={`form-input w-full px-4 py-3 rounded-lg border transition-all ${
                            loadingWilayas 
                              ? 'opacity-50 cursor-wait border-neutral-300 bg-neutral-50' 
                              : wilayas.length === 0 
                              ? 'border-red-300 bg-red-50' 
                              : 'border-neutral-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                          }`}
                          required
                          disabled={loadingWilayas}
                        >
                          <option value="">
                            {loadingWilayas 
                              ? (locale === 'ar' ? 'جاري التحميل...' : 'Chargement des wilayas...')
                              : wilayas.length === 0
                              ? (locale === 'ar' ? 'لا توجد ولايات متاحة - Rechargez la page' : 'Aucune wilaya disponible - Rechargez la page')
                              : (locale === 'ar' ? 'اختر ولاية' : 'Sélectionner une wilaya')}
                          </option>
                          {wilayas.map((w) => {
                            const code = w.code || w.id || '';
                            const name = locale === 'ar' ? (w.nameAr || w.name || '') : (w.name || w.nameAr || '');
                            return (
                              <option key={code} value={code}>
                                {code.padStart(2, '0')} - {name}
                              </option>
                            );
                          })}
                        </select>
                        {wilayas.length === 0 && !loadingWilayas && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                            <p className="text-body-xs text-red-700 font-medium">
                              {locale === 'ar' 
                                ? '⚠️ Impossible de charger les wilayas. Vérifiez votre connexion et rechargez la page.' 
                                : '⚠️ Impossible de charger les wilayas. Vérifiez votre connexion et rechargez la page.'}
                            </p>
                            <button
                              type="button"
                              onClick={() => window.location.reload()}
                              className="mt-2 text-xs text-red-600 underline hover:text-red-800"
                            >
                              {locale === 'ar' ? 'Recharger la page' : 'Recharger la page'}
                            </button>
                          </div>
                        )}
                        {errors.region && (
                          <p className="text-body-xs text-red-600 mt-1">{errors.region}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method - CASH ONLY */}
                <Card variant="default" hover="none">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-accent-600" />
                      </div>
                      <CardTitle>
                        {locale === 'ar' ? 'طريقة الدفع' : 'Mode de paiement'}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-primary p-6 rounded-xl">
                      <div className="flex items-center gap-4 text-white">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-heading-sm font-semibold mb-1">
                            {locale === 'ar'
                              ? 'الدفع عند الاستلام'
                              : 'Paiement à la livraison'}
                          </h4>
                          <p className="text-body-sm opacity-90">
                            {locale === 'ar'
                              ? 'ادفع نقدًا عندما تستلم طلبك'
                              : 'Payez en espèces à la réception de votre commande'}
                          </p>
                        </div>
                        <CheckCircle className="w-8 h-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Side: Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <Card variant="elevated" hover="none">
                    <CardHeader>
                      <CardTitle>
                        {locale === 'ar' ? 'ملخص الطلب' : 'Résumé de la commande'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Items List */}
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {items.map((item) => (
                          <div key={item.id} className="flex gap-3">
                            <div className="w-16 h-16 bg-neutral-100 rounded-lg flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-body-sm font-medium text-neutral-900 truncate">
                                {item.name}
                              </p>
                              <p className="text-body-xs text-neutral-500">
                                Qté: {item.quantity}
                              </p>
                              <p className="text-body-sm font-semibold text-primary-600">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Totals */}
                      <div className="border-t border-neutral-200 pt-4 space-y-2">
                        <div className="flex justify-between text-body-sm">
                          <span className="text-neutral-600">
                            {locale === 'ar' ? 'المجموع الفرعي' : 'Sous-total'}
                          </span>
                          <span className="font-medium">{formatPrice(total)}</span>
                        </div>
                        <div className="flex justify-between text-body-sm">
                          <span className="text-neutral-600">
                            {locale === 'ar' ? 'الشحن' : 'Livraison'}
                          </span>
                          <span className="font-medium">
                            {shippingCost > 0 ? formatPrice(shippingCost) : '--'}
                          </span>
                        </div>
                        <div className="flex justify-between text-heading-md font-bold border-t border-neutral-200 pt-2">
                          <span>{locale === 'ar' ? 'المجموع' : 'Total'}</span>
                          <span className="text-primary-600">{formatPrice(finalTotal)}</span>
                        </div>
                      </div>

                      {/* Terms Checkbox */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={agreeToTerms}
                          onChange={(e) => setAgreeToTerms(e.target.checked)}
                          className="mt-1"
                        />
                        <label htmlFor="terms" className="text-body-sm text-neutral-600">
                          {locale === 'ar' ? 'أوافق على ' : "J'accepte les "}
                          <a
                            href="/terms"
                            className="text-primary-600 hover:text-primary-700 underline"
                          >
                            {locale === 'ar' ? 'الشروط والأحكام' : 'termes et conditions'}
                          </a>
                        </label>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={isLoading}
                        disabled={!agreeToTerms || isLoading}
                        icon={<ShieldCheck className="w-5 h-5" />}
                      >
                        {isLoading
                          ? locale === 'ar'
                            ? 'جاري التأكيد...'
                            : 'Confirmation...'
                          : locale === 'ar'
                          ? 'تأكيد الطلب'
                          : 'Confirmer la commande'}
                      </Button>

                      {/* Security Badge */}
                      <div className="flex items-center justify-center gap-2 text-body-xs text-neutral-500 pt-2">
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                        <span>
                          {locale === 'ar' ? 'معاملة آمنة ومشفرة' : 'Transaction sécurisée'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

