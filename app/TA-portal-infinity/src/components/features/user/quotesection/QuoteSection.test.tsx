import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import QuoteSection from './QuoteSection';

describe('QuoteSection', () => {
  it('renders the main quote and author', () => {
    render(<QuoteSection />);
    
    // Check for the main quote
    expect(screen.getByText('"Excellence is not a skill, it\'s an attitude."')).toBeInTheDocument();
    expect(screen.getByText('— Ralph Marston')).toBeInTheDocument();
  });

  it('renders the quote icon', () => {
    render(<QuoteSection />);
    
    // Check for the quote icon (SVG) - since SVG doesn't have role="img" by default, check for the SVG element
    const svgElement = document.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('renders additional quotes for larger screens', () => {
    render(<QuoteSection />);
    
    // Check for the hidden quotes that appear on larger screens
    expect(screen.getByText('"Success is the sum of small efforts repeated daily."')).toBeInTheDocument();
    expect(screen.getByText('— Robert Collier')).toBeInTheDocument();
    expect(screen.getByText('"The future belongs to those who believe in the beauty of their dreams."')).toBeInTheDocument();
    expect(screen.getByText('— Eleanor Roosevelt')).toBeInTheDocument();
  });

  it('applies responsive styling classes', () => {
    const { container } = render(<QuoteSection />);
    
    // Check that the main container has responsive spacing classes
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('flex', 'flex-col', 'justify-center', 'items-center');
    expect(mainContainer).toHaveClass('space-y-8', 'lg:space-y-12');
    expect(mainContainer).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
  });

  it('hides additional quotes on small screens', () => {
    render(<QuoteSection />);
    
    // The container for additional quotes should have hidden class for small screens
    // Look for the parent div that contains the additional quotes
    const additionalQuotesContainer = screen.getByText('"Success is the sum of small efforts repeated daily."').closest('.hidden');
    expect(additionalQuotesContainer).toBeInTheDocument();
    expect(additionalQuotesContainer).toHaveClass('hidden');
  });
});
