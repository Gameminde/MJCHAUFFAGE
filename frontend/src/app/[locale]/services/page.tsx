import { getTranslations, setRequestLocale } from 'next-intl/server';
import ModernServicesPage from './ModernServicesPage';
import { createClient } from '@/lib/supabase/server';

type Props = {
  params: { locale: string };
};

// Define the expected shape of the service data from the API
interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  icon?: 'settings' | 'wrench' | 'alert';
}

// This function fetches data from Supabase
async function getServices(): Promise<Service[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) {
      console.error('Error fetching services:', error);
      return [];
    }

    // Cast the data to match the Service interface
    return (data as any[])?.map(service => ({
      ...service,
      // Ensure icon is one of the expected values or undefined
      icon: ['settings', 'wrench', 'alert'].includes(service.icon) ? service.icon : undefined
    })) || [];

  } catch (error) {
    console.error('Unexpected error fetching services:', error);
    return [];
  }
}

export default async function ServicesPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'ServicesPage' });
  const services = await getServices();

  return <ModernServicesPage services={services} locale={locale} />;
}

export async function generateMetadata({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: 'ServicesPage' });
  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  };
}