export const locales = ['ar', 'fr'] as const
export type Locale = typeof locales[number]
export const defaultLocale: Locale = 'ar'

// Dictionaries for translations
export const dictionaries = {
  ar: () => import('./dictionaries/ar.json').then((module) => module.default),
  fr: () => import('./dictionaries/fr.json').then((module) => module.default),
}

export const getDictionary = async (locale: Locale) => {
  if (!dictionaries[locale]) {
    return dictionaries[defaultLocale]()
  }
  return dictionaries[locale]()
}

// RTL languages
export const rtlLocales: Locale[] = ['ar']

export const isRTL = (locale: Locale): boolean => {
  return rtlLocales.includes(locale)
}

// Currency configuration for Algeria
export const currencyConfig = {
  code: 'DZD',
  symbol: 'د.ج',
  name: 'دينار جزائري',
  nameFr: 'Dinar Algérien',
  decimalPlaces: 2,
}

// Payment methods for Algeria
export const paymentMethods = {
  CASH_ON_DELIVERY: {
    id: 'CASH_ON_DELIVERY',
    nameAr: 'الدفع عند الاستلام',
    nameFr: 'Paiement à la livraison',
    icon: 'cash',
    enabled: true,
  },
  DAHABIA_CARD: {
    id: 'DAHABIA_CARD',
    nameAr: 'بطاقة الذهبية',
    nameFr: 'Carte Dahabia',
    icon: 'card',
    enabled: true,
    provider: 'Algeria Post',
  },
  GOOGLE_PAY: {
    id: 'GOOGLE_PAY',
    nameAr: 'جوجل باي',
    nameFr: 'Google Pay',
    icon: 'google-pay',
    enabled: false, // Can be enabled later
  },
}

// Format currency for Algeria
export const formatCurrency = (amount: number, locale: Locale = 'ar'): string => {
  const formatter = new Intl.NumberFormat(
    locale === 'ar' ? 'ar-DZ' : 'fr-DZ',
    {
      style: 'currency',
      currency: currencyConfig.code,
      minimumFractionDigits: currencyConfig.decimalPlaces,
      maximumFractionDigits: currencyConfig.decimalPlaces,
    }
  )
  
  return formatter.format(amount)
}

// Format phone numbers for Algeria
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')
  
  // Algerian phone number formats
  if (digits.startsWith('213')) {
    // International format: +213XXXXXXXXX
    return `+${digits}`
  } else if (digits.startsWith('0')) {
    // National format: 0XXXXXXXXX
    return `+213${digits.slice(1)}`
  } else if (digits.length === 9) {
    // Without country code: XXXXXXXXX
    return `+213${digits}`
  }
  
  return phone
}