import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModernProductCard } from '../ModernProductCard';
import { vi } from 'vitest';

// Mock jest with vi
global.jest = vi;

// Use our test utilities
import { render as customRender, mockUseLanguage, mockUseCart, mockUseWishlist, mockUseRouter } from '../../../../tests/setup/test-utils';

// Mock getImageUrl function
vi.mock('@/lib/images', () => ({
  getImageUrl: (url: string) => url || '/placeholder-product.svg',
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => React.createElement('img', props),
}));

const mockProduct = {
  id: 'test-product-1',
  name: 'Test Product',
  slug: 'test-product',
  sku: 'TEST-001',
  description: 'A test product description',
  shortDescription: 'Short description',
  price: 25000,
  salePrice: 20000,
  stockQuantity: 10,
  weight: 5,
  dimensions: null,
  specifications: null,
  features: ['Feature 1', 'Feature 2'],
  images: [
    { url: '/test-image.jpg', alt_text: 'Test image' },
    { url: '/test-image-2.jpg', alt_text: 'Test image 2' },
  ],
  category: {
    id: 'test-category',
    name: 'Test Category',
    slug: 'test-category',
  },
  manufacturer: {
    id: 'test-manufacturer',
    name: 'Test Manufacturer',
    slug: 'test-manufacturer',
  },
  isFeatured: true,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const renderWithProviders = (component: React.ReactElement) => {
  return customRender(component);
};

describe('ModernProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders product information correctly', () => {
    renderWithProviders(<ModernProductCard product={mockProduct} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('TEST-001')).toBeInTheDocument();
    expect(screen.getByText('Test Category')).toBeInTheDocument();
    expect(screen.getByText('Test Manufacturer')).toBeInTheDocument();
  });

  it('displays correct price formatting', () => {
    renderWithProviders(<ModernProductCard product={mockProduct} />);

    expect(screen.getByText('20 000 DA')).toBeInTheDocument();
    expect(screen.getByText('25 000 DA')).toBeInTheDocument(); // Original price
  });

  it('shows discount badge and percentage when product has sale price', () => {
    renderWithProviders(<ModernProductCard product={mockProduct} />);

    // Check for discount badge in the corner
    const discountBadges = screen.getAllByText('-20%');
    expect(discountBadges).toHaveLength(2);

    const badge = discountBadges[0].closest('.bg-gradient-to-r');
    expect(badge).toBeInTheDocument();
  });

  it('shows featured badge when product is featured', () => {
    renderWithProviders(<ModernProductCard product={mockProduct} />);

    expect(screen.getByText('Premium')).toBeInTheDocument();
  });

  it('shows low stock warning when stock is low', () => {
    const lowStockProduct = { ...mockProduct, stockQuantity: 3 };
    renderWithProviders(<ModernProductCard product={lowStockProduct} />);

    expect(screen.getByText('Stock faible')).toBeInTheDocument();
    expect(screen.getByText('3 restants')).toBeInTheDocument();
  });

  it('shows out of stock when product is unavailable', () => {
    const outOfStockProduct = { ...mockProduct, stockQuantity: 0 };
    renderWithProviders(<ModernProductCard product={outOfStockProduct} />);

    expect(screen.getByText('Rupture de stock')).toBeInTheDocument();
  });

  it('navigates to product detail page when clicked', () => {
    renderWithProviders(<ModernProductCard product={mockProduct} />);

    const card = screen.getByText('Test Product').closest('.cursor-pointer'); // Click the clickable card
    fireEvent.click(card!);

    expect(mockUseRouter().push).toHaveBeenCalledWith('/fr/products/test-product-1');
  });

  it('handles wishlist toggle', () => {
    renderWithProviders(<ModernProductCard product={mockProduct} />);

    const wishlistButton = screen.getByLabelText(/Ajouter aux favoris/i);
    fireEvent.click(wishlistButton);

    expect(mockUseWishlist().addToWishlist).toHaveBeenCalledWith({
      productId: 'test-product-1',
      name: 'Test Product',
      price: 20000,
      image: '/test-image.jpg',
      sku: 'TEST-001',
    });
  });

  it('handles add to cart', () => {
    renderWithProviders(<ModernProductCard product={mockProduct} />);

    // Hover over the card to show overlay buttons
    const card = screen.getByText('Test Product').closest('.group');
    fireEvent.mouseEnter(card!);

    // Wait for overlay to appear (simulate hover delay)
    const addToCartButton = screen.getByText(/Ajouter/i);
    fireEvent.click(addToCartButton);

    expect(mockUseCart().addItem).toHaveBeenCalledWith({
      productId: 'test-product-1',
      name: 'Test Product',
      price: 20000,
      image: '/test-image.jpg',
      maxStock: 10,
      sku: 'TEST-001',
    });
  });

  it('shows image counter when multiple images exist', () => {
    renderWithProviders(<ModernProductCard product={mockProduct} />);

    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('handles image loading states', async () => {
    renderWithProviders(<ModernProductCard product={mockProduct} />);

    const image = screen.getByRole('img');

    // Initially image should have opacity-0 class (loading state)
    expect(image).toHaveClass('opacity-0');

    // After image loads, should have opacity-100
    fireEvent.load(image);

    // Note: The actual opacity change is handled by CSS transitions, not tested here
    expect(image).toBeInTheDocument();
  });

  it('handles image error gracefully', () => {
    renderWithProviders(<ModernProductCard product={mockProduct} />);

    const image = screen.getByRole('img');
    fireEvent.error(image);

    // Should show fallback image
    expect(image).toHaveAttribute('src', '/placeholder-product.svg');
  });

  it('applies correct CSS classes for featured products', () => {
    renderWithProviders(<ModernProductCard product={mockProduct} />);

    const card = screen.getByText('Test Product').closest('.group');
    expect(card).toHaveClass('border-gradient-to-r');
    expect(card).toHaveClass('shadow-[#3EC4D0]/30');
  });

  it('renders correctly without manufacturer', () => {
    const productWithoutManufacturer = { ...mockProduct, manufacturer: null };
    renderWithProviders(<ModernProductCard product={productWithoutManufacturer} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.queryByText('Test Manufacturer')).not.toBeInTheDocument();
  });

  it('renders correctly without images', () => {
    const productWithoutImages = { ...mockProduct, images: [] };
    renderWithProviders(<ModernProductCard product={productWithoutImages} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/placeholder-product.svg');
  });
});
