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
  email: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  region: string;
}

const ALGERIA_REGIONS = [
  'Adrar',
  'Chlef',
  'Laghouat',
  'Oum El Bouaghi',
  'Batna',
  'Béjaïa',
  'Biskra',
  'Béchar',
  'Blida',
  'Bouira',
  'Tamanrasset',
  'Tébessa',
  'Tlemcen',
  'Tiaret',
  'Tizi Ouzou',
  'Alger',
  'Djelfa',
  'Jijel',
  'Sétif',
  'Saïda',
  'Skikda',
  'Sidi Bel Abbès',
  'Annaba',
  'Guelma',
  'Constantine',
  'Médéa',
  'Mostaganem',
  'MSila',
  'Mascara',
  'Ouargla',
  'Oran',
  'El Bayadh',
];

export function ModernCheckoutForm() {
  const { items, total, clearCart, formatPrice } = useCart();
  const router = useRouter();
  const { locale } = useLanguage();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ShippingAddress>>({});
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    region: '',
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const finalTotal = total + (shippingCost || 0);

  useEffect(() => {
    if (items.length === 0) {
      router.push(`/${locale}/products`);
    }
  }, [items.length, router, locale]);

  // Fetch shipping cost
  useEffect(() => {
    const wilaya = shippingAddress.region;
    if (!wilaya) {
      setShippingCost(0);
      return;
    }
    PaymentService.getShippingCost(wilaya, total)
      .then((cost) => setShippingCost(Number(cost) || 0))
      .catch(() => setShippingCost(0));
  }, [shippingAddress.region, total]);

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
      'email',
      'phone',
      'street',
      'city',
      'region',
      'postalCode',
    ];

    requiredFields.forEach((field) => {
      if (!shippingAddress[field].trim()) {
        newErrors[field] = locale === 'ar' ? 'مطلوب' : 'Requis';
      }
    });

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (shippingAddress.email && !emailRegex.test(shippingAddress.email)) {
      newErrors.email =
        locale === 'ar' ? 'بريد إلكتروني غير صحيح' : 'Email invalide';
    }

    // Phone validation
    const phoneRegex = /^(\+213|0)[567]\d{8}$/;
    if (
      shippingAddress.phone &&
      !phoneRegex.test(shippingAddress.phone.replace(/\s/g, ''))
    ) {
      newErrors.phone =
        locale === 'ar' ? 'رقم هاتف غير صحيح' : 'Numéro invalide';
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
      const response = await fetch('/api/orders', {
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
            postalCode: shippingAddress.postalCode,
            region: shippingAddress.region,
            country: 'Algeria',
          },
          customerInfo: {
            firstName: shippingAddress.firstName,
            lastName: shippingAddress.lastName,
            email: shippingAddress.email,
            phone: shippingAddress.phone,
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
      clearCart();
      router.push(`/${locale}/checkout/success?orderId=${result.data.order.id}`);
    } catch (err) {
      setErrors({
        email:
          err instanceof Error
            ? err.message
            : locale === 'ar'
            ? 'فشل في إنشاء الطلب'
            : 'Échec de la commande',
      });
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
                        label={locale === 'ar' ? 'الاسم الأول' : 'Prénom'}
                        value={shippingAddress.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        leftIcon={<User className="w-4 h-4" />}
                        error={errors.firstName}
                        required
                      />
                      <Input
                        label={locale === 'ar' ? 'الاسم الأخير' : 'Nom'}
                        value={shippingAddress.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        leftIcon={<User className="w-4 h-4" />}
                        error={errors.lastName}
                        required
                      />
                    </div>

                    <Input
                      label={locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      leftIcon={<Mail className="w-4 h-4" />}
                      error={errors.email}
                      required
                    />

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
                        label={locale === 'ar' ? 'الرمز البريدي' : 'Code postal'}
                        value={shippingAddress.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        error={errors.postalCode}
                        required
                      />
                      <div className="space-y-2">
                        <label className="block text-body-sm font-medium text-neutral-700">
                          {locale === 'ar' ? 'الولاية' : 'Wilaya'}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                          value={shippingAddress.region}
                          onChange={(e) => handleInputChange('region', e.target.value)}
                          className="form-input"
                          required
                        >
                          <option value="">
                            {locale === 'ar' ? 'اختر ولاية' : 'Sélectionner'}
                          </option>
                          {ALGERIA_REGIONS.map((region) => (
                            <option key={region} value={region}>
                              {region}
                            </option>
                          ))}
                        </select>
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

