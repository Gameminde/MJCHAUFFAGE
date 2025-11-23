'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { ordersService } from '@/services/ordersService';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Phone,
  MapPin,
  Truck,
  Package,
  CreditCard,
  ShieldCheck,
  CheckCircle,
  Mail,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  street: string;
  city: string;
  postalCode: string;
  region: string;
  profession?: string;
}

import { toast } from 'react-hot-toast';

import { ALGERIA_WILAYAS } from '@/constants/locations';

export function ModernCheckoutForm() {
  const { user } = useAuth();
  const router = useRouter();
  const { items, total, clearCart, formatPrice } = useCart();
  // ... existing hooks ...

  // ... existing state ...
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    postalCode: '',
    region: '',
    profession: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [wilayas] = useState<any[]>(ALGERIA_WILAYAS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const shippingCost = 600; // Default or calculated
  const finalTotal = total + shippingCost;
  const locale = useLanguage().language;

  // Sync user data when available
  useEffect(() => {
    if (user) {
      setShippingAddress(prev => ({
        ...prev,
        firstName: prev.firstName || user.firstName || '',
        lastName: prev.lastName || user.lastName || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!shippingAddress.firstName) newErrors.firstName = locale === 'ar' ? 'مطلوب' : 'Requis';
    if (!shippingAddress.lastName) newErrors.lastName = locale === 'ar' ? 'مطلوب' : 'Requis';
    if (!shippingAddress.phone) newErrors.phone = locale === 'ar' ? 'مطلوب' : 'Requis';
    if (!shippingAddress.street) newErrors.street = locale === 'ar' ? 'مطلوب' : 'Requis';
    if (!shippingAddress.city) newErrors.city = locale === 'ar' ? 'مطلوب' : 'Requis';
    if (!shippingAddress.region) newErrors.region = locale === 'ar' ? 'مطلوب' : 'Requis';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(locale === 'ar' ? `يرجى التحقق من الحقول: ${firstError}` : `Veuillez vérifier les champs requis`);
      return false;
    }
    return true;
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    if (!agreeToTerms) {
      toast.error(locale === 'ar' ? 'يرجى الموافقة على الشروط' : 'Veuillez accepter les conditions');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading(locale === 'ar' ? 'جاري معالجة الطلب...' : 'Traitement de la commande...');

    try {
      const orderData = {
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
          phone: shippingAddress.phone,
          email: shippingAddress.email || user?.email, // Fallback to auth email
          profession: shippingAddress.profession,
        },
        paymentMethod: 'CASH_ON_DELIVERY',
        subtotal: total,
        shippingAmount: shippingCost,
        totalAmount: finalTotal,
        userId: user?.id
      };

      const order = await ordersService.createOrder(orderData);

      if (!order || !order.orderNumber) {
        throw new Error('Order number not received');
      }

      await clearCart();
      toast.success(locale === 'ar' ? 'تم استلام الطلب بنجاح!' : 'Commande confirmée !', { id: toastId });
      router.replace(`/${locale}/checkout/success?orderNumber=${order.orderNumber}`);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : locale === 'ar'
          ? 'فشل في إنشاء الطلب'
          : 'Échec de la commande';

      console.error('Order creation error:', err);
      toast.error(errorMessage, { id: toastId });
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
                          className={`form-input w-full px-4 py-3 rounded-lg border transition-all ${wilayas.length === 0
                              ? 'border-red-300 bg-red-50'
                              : 'border-neutral-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                            }`}
                          required
                        >
                          <option value="">
                            {wilayas.length === 0
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

