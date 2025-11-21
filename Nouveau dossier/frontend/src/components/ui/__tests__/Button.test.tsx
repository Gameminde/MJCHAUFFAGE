import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../Button';
import { vi } from 'vitest';

// Mock jest with vi
global.jest = vi;

describe('Button', () => {
  afterEach(() => {
    cleanup();
  });
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-gradient-to-r', 'from-primary-500', 'to-primary-600', 'text-white');
  });

  it('renders with secondary variant', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    expect(screen.getByRole('button', { name: /secondary button/i })).toHaveClass('bg-white', 'text-primary-600', 'border-primary-500');
  });

  it('renders with outline variant', () => {
    render(<Button variant="outline">Outline Button</Button>);
    expect(screen.getByRole('button', { name: /outline button/i })).toHaveClass('border-neutral-300', 'bg-transparent');
  });

  it('renders with ghost variant', () => {
    render(<Button variant="ghost">Ghost Button</Button>);
    expect(screen.getByRole('button', { name: /ghost button/i })).toHaveClass('bg-transparent', 'text-neutral-700');
  });

  it('renders with danger variant', () => {
    render(<Button variant="danger">Danger Button</Button>);
    expect(screen.getByRole('button', { name: /danger button/i })).toHaveClass('bg-gradient-to-r', 'from-red-500', 'to-red-600');
  });

  it('renders with small size', () => {
    render(<Button size="sm">Small Button</Button>);
    expect(screen.getByRole('button', { name: /small button/i })).toHaveClass('px-4', 'py-2', 'text-xs');
  });

  it('renders with medium size', () => {
    render(<Button size="md">Medium Button</Button>);
    expect(screen.getByRole('button', { name: /medium button/i })).toHaveClass('px-6', 'py-3', 'text-sm');
  });

  it('renders with large size', () => {
    render(<Button size="lg">Large Button</Button>);
    expect(screen.getByRole('button', { name: /large button/i })).toHaveClass('px-8', 'py-4', 'text-base');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Test Click Handler</Button>);

    const button = screen.getByRole('button', { name: /test click handler/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with icon', () => {
    const TestIcon = () => <span data-testid="test-icon">🔥</span>;

    render(<Button icon={<TestIcon />}>With Icon</Button>);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });

  it('renders as disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled State</Button>);

    const button = screen.getByRole('button', { name: /disabled state/i });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders as loading', () => {
    render(<Button loading>Loading State</Button>);

    const button = screen.getByRole('button', { name: /loading state/i });
    expect(button).toBeDisabled();
    expect(screen.getByText('Loading State')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>);

    const button = screen.getByRole('button', { name: /custom button/i });
    expect(button).toHaveClass('custom-class');
  });

  it('forwards other props to button element', () => {
    render(<Button type="submit" data-testid="submit-button">Submit</Button>);

    const button = screen.getByTestId('submit-button');
    expect(button).toHaveAttribute('type', 'submit');
  });
});
