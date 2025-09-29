import { getTranslations } from 'next-intl/server';
import ServicesPageClient from './ServicesPageClient';

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
  // Assuming you might add an icon identifier in your model later
  icon?: 'settings' | 'wrench' | 'alert'; 
}

// This function fetches data from your backend API
async function getServices(): Promise<Service[]> {
  const url = `${process.env.BACKEND_API_URL}/services`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } }); // Revalidate every hour

    if (!res.ok) {
      throw new Error(`Failed to fetch services: ${res.statusText}`);
    }
    
    const data = await res.json();
    return data.data || []; // The services data is nested in 'data'
  } catch (error) {
    console.error('Error fetching services:', error);
    return []; // Return an empty array on error
  }
}

export default async function ServicesPage({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: 'ServicesPage' });
  const services = await getServices();
  
  return <ServicesPageClient services={services} locale={locale} />;
}

export async function generateMetadata({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: 'ServicesPage' });
  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  };
}
