import { getTranslations, setRequestLocale } from 'next-intl/server';
import ModernServicesPage from './ModernServicesPage';

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
  // Try to fetch from backend API
  const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  try {
    const url = `${backendUrl}/api/services/types`;
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // Revalidate every hour
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch services: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    } else {
      throw new Error('Invalid response format from services API');
    }
  } catch (error) {
    console.error('Error fetching services:', error);
    
    // Return empty array instead of mock data
    // The UI should handle empty state gracefully
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