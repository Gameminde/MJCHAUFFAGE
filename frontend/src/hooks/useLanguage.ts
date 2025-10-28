import { useLocale } from 'next-intl';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  decimalPlaces: number;
}

export function useLanguage() {
  // Call the hook unconditionally - React will handle errors internally
  const locale = useLocale() || 'fr';
  
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