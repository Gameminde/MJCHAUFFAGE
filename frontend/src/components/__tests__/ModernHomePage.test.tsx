import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModernHomePage from '@/app/[locale]/ModernHomePage';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('ModernHomePage', () => {
  it('renders the homepage with hero section', () => {
    render(<ModernHomePage params={{ locale: 'fr' }} />);

    // Check if main elements are rendered
    expect(screen.getByText(/Votre Confort/i)).toBeInTheDocument();
    expect(screen.getByText(/Notre Priorité/i)).toBeInTheDocument();
  });

  it('renders features section', () => {
    render(<ModernHomePage params={{ locale: 'fr' }} />);

    expect(screen.getByText(/Pourquoi nous choisir/i)).toBeInTheDocument();
    expect(screen.getByText(/Excellence & Qualité/i)).toBeInTheDocument();
  });

  it('renders categories section', () => {
    render(<ModernHomePage params={{ locale: 'fr' }} />);

    expect(screen.getByText(/Nos Catégories/i)).toBeInTheDocument();
    expect(screen.getByText(/Radiateurs/i)).toBeInTheDocument();
  });
});
