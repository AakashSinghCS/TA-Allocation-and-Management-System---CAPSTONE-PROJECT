import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AboutPage from './AboutPage';

describe('AboutPage', () => {
  it('renders the main heading', () => {
    render(<AboutPage />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('About');
  });

  it('renders the technology description', () => {
    render(<AboutPage />);
    
    const description = screen.getByText(/This app is built with React \+ Vite/);
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent(
      'This app is built with React + Vite, Tailwind CSS, and Spring-Boot micro-services on the back end.'
    );
  });

  it('renders the example page notice', () => {
    render(<AboutPage />);
    
    const notice = screen.getByRole('heading', { level: 2 });
    expect(notice).toBeInTheDocument();
    expect(notice).toHaveTextContent('This is an example page. The interface will be changed later.');
  });

  it('has correct page structure', () => {
    const { container } = render(<AboutPage />);
    
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('p-6');
  });

  it('applies correct CSS classes to main heading', () => {
    render(<AboutPage />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-3xl', 'font-bold', 'mb-4');
  });

  it('renders all expected content', () => {
    render(<AboutPage />);
    
    // Check that all main content is present
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText(/React \+ Vite/)).toBeInTheDocument();
    expect(screen.getByText(/This is an example page/)).toBeInTheDocument();
  });
});
