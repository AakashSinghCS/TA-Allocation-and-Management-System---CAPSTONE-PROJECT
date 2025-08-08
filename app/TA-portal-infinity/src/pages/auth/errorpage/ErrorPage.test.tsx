import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ErrorPage from './ErrorPage';

describe('ErrorPage', () => {
  it('renders default error message when no state is provided', () => {
    render(
      <MemoryRouter>
        <ErrorPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Unexpected error.')).toBeInTheDocument();
  });

  it('renders custom error message when provided in state', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/error', state: { message: 'Custom error message' } }]}>
        <ErrorPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('renders main container with correct styling', () => {
    const { container } = render(
      <MemoryRouter>
        <ErrorPage />
      </MemoryRouter>
    );
    
    const mainElement = container.querySelector('main');
    expect(mainElement).toHaveClass('h-screen', 'grid', 'place-items-center', 'text-center');
  });
});
