import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to default locale (French)
  redirect('/fr');
}

export const metadata = {
  title: 'MJ CHAUFFAGE - Professional Heating Solutions Algeria',
  description: 'Professional heating equipment, installation and maintenance services for homes and businesses in Algeria.',
};
