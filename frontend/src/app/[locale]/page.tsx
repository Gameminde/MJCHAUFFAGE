import LocalizedHomePageClient from './LocalizedHomePageClient';
import { useTranslations } from 'next-intl';

type Props = {
  params: { locale: string };
};

export default function LocalizedHomePage({ params }: Props) {
  return <LocalizedHomePageClient params={params} />;
}

export const metadata = {
  title: 'MJ CHAUFFAGE - Professional Heating Solutions Algeria',
  description: 'Professional heating equipment, installation and maintenance services for homes and businesses in Algeria. Quality boilers, expert installation, reliable maintenance.',
};
