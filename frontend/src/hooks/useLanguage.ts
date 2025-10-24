import { useLocale } from 'next-intl';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  decimalPlaces: number;
}

export function useLanguage() {
  let locale = 'fr'; // Default fallback
  
  try {
    locale = useLocale();
  } catch (error) {
    // Fallback when no intl context is available
    // Only show warning in development mode
    if (process.env.NODE_ENV === 'development') {
      console.warn('No intl context found, using fallback locale:', locale);
    }
  }
  
  const currencyConfig: CurrencyConfig = {
    code: 'DZD',
    symbol: 'د.ج',
    decimalPlaces: 2
  };
  
  return {
    locale,
    isRTL: locale === 'ar',
    language: locale,
    dir: locale === 'ar' ? 'rtl' : 'ltr',
    currencyConfig,
    t: (key: string) => key // Simple fallback for translation
  };
}