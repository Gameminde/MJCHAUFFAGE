import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModernHomePage from '@/app/[locale]/ModernHomePage';

import { vi } from 'vitest';

// Mock jest with vi
global.jest = vi;

// Mock next-intl with defaultValue support
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, any>) => {
    // If component passes a defaultValue, return it to simulate translation
    if (params && typeof params.defaultValue === 'string') {
      return params.defaultValue;
    }
    return key;
  },
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
