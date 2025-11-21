import ModernHomePage from './ModernHomePage';
import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: { locale: string };
};

export default function LocalizedHomePage({ params }: Props) {
  setRequestLocale(params.locale);
  return <ModernHomePage params={params} />;
}

export const metadata = {
  title: 'MJ CHAUFFAGE - Professional Heating Solutions Algeria',
  description: 'Professional heating equipment, installation and maintenance services for homes and businesses in Algeria. Quality boilers, expert installation, reliable maintenance.',
};
