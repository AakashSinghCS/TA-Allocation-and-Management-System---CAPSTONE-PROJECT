import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusIndicator } from './StatusIndicator';

describe('StatusIndicator', () => {
  it('renders loading spinner when loading is true', () => {
    const { container } = render(<StatusIndicator loading={true} />);
    
    // Check that loading spinner is rendered
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    
    // Check spinner has correct classes
    expect(spinner).toHaveClass('animate-spin', 'rounded-full', 'h-6', 'w-6', 'border-2', 'border-blue-600', 'border-t-transparent');
  });

  it('renders empty element when loading is false', () => {
    const { container } = render(<StatusIndicator loading={false} />);
    
    // Check that no loading spinner is rendered
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).not.toBeInTheDocument();
    
    // Check that container has correct classes
    const mainDiv = container.querySelector('.flex.items-center.justify-center.self-center');
    expect(mainDiv).toBeInTheDocument();
  });

  it('renders with correct container structure', () => {
    const { container } = render(<StatusIndicator loading={true} />);
    
    // Check main container has correct classes
    const mainDiv = container.querySelector('.flex.items-center.justify-center.self-center');
    expect(mainDiv).toBeInTheDocument();
    expect(mainDiv).toHaveClass('flex', 'items-center', 'justify-center', 'self-center');
  });

  it('matches snapshot when loading', () => {
    const { container } = render(<StatusIndicator loading={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when not loading', () => {
    const { container } = render(<StatusIndicator loading={false} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
