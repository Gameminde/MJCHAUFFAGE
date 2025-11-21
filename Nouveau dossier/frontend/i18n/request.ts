import { getRequestConfig } from "next-intl/server";

export const locales = ["fr", "ar"] as const;
export type AppLocale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // Utiliser la locale par défaut si la locale demandée n'est pas supportée
  // au lieu de notFound() qui n'est pas autorisé dans le layout racine
  const currentLocale = locales.includes(locale as AppLocale) 
    ? (locale as AppLocale)
    : 'fr'; // Fallback vers le français

  return {
    locale: currentLocale,
    messages: (await import(`../messages/${currentLocale}.json`)).default,
    timeZone: "Africa/Algiers",
    now: new Date(),
    formats: {
      number: {
        currency: {
          style: "currency",
          currency: "DZD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      },
    },
  };
});
