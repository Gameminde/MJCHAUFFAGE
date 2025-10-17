import { redirect } from 'next/navigation';

export default function HomePage() {
  // Rediriger vers la locale par défaut
  redirect("/fr");
}
