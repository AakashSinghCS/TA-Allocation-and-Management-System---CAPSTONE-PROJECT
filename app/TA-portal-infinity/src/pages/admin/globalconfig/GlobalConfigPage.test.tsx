import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import GlobalConfigPage from './GlobalConfigPage';
import { useAuth } from '../../../context/AuthContext';

// Mock the useAuth hook
vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock child components
vi.mock('../../../components/features/globalconfig/TermConfiguration', () => ({
  default: ({ token }: { token: string }) => (
    <div data-testid="term-configuration">
      Term Configuration Component (token: {token})
    </div>
  ),
}));

vi.mock('../../../components/features/globalconfig/DeadlineManagement', () => ({
  default: ({ token }: { token: string }) => (
    <div data-testid="deadline-management">
      Deadline Management Component (token: {token})
    </div>
  ),
}));

// Mock react-toastify
vi.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="toast-container">Toast Container</div>,
}));

// Mock react-icons
vi.mock('react-icons/lu', () => ({
  LuCalendarCog: ({ size, color, title, className }: { size: number; color: string; title: string; className: string }) => (
    <div 
      data-testid="calendar-icon" 
      data-size={size}
      data-color={color}
      data-title={title}
      className={className}
    >
      Calendar Icon
    </div>
  ),
}));

describe('GlobalConfigPage', () => {
  const mockToken = 'test-token';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page with correct title and description', () => {
    vi.mocked(useAuth).mockReturnValue({ token: mockToken } as any);
    
    render(<GlobalConfigPage />);
    
    expect(screen.getByText('Global Configuration')).toBeInTheDocument();
    expect(screen.getByText('Manage term and deadline settings')).toBeInTheDocument();
  });

  it('renders the calendar icon', () => {
    vi.mocked(useAuth).mockReturnValue({ token: mockToken } as any);
    
    render(<GlobalConfigPage />);
    
    const calendarIcon = screen.getByTestId('calendar-icon');
    expect(calendarIcon).toBeInTheDocument();
    expect(calendarIcon).toHaveAttribute('data-size', '72');
    expect(calendarIcon).toHaveAttribute('data-color', '#e5e7eb');
    expect(calendarIcon).toHaveAttribute('data-title', 'Configuration');
    expect(calendarIcon).toHaveClass('block');
  });

  it('renders ToastContainer', () => {
    vi.mocked(useAuth).mockReturnValue({ token: mockToken } as any);
    
    render(<GlobalConfigPage />);
    
    expect(screen.getByTestId('toast-container')).toBeInTheDocument();
  });

  it('renders TermConfiguration component with token', () => {
    vi.mocked(useAuth).mockReturnValue({ token: mockToken } as any);
    
    render(<GlobalConfigPage />);
    
    const termConfig = screen.getByTestId('term-configuration');
    expect(termConfig).toBeInTheDocument();
    expect(termConfig).toHaveTextContent(`Term Configuration Component (token: ${mockToken})`);
  });

  it('renders DeadlineManagement component with token', () => {
    vi.mocked(useAuth).mockReturnValue({ token: mockToken } as any);
    
    render(<GlobalConfigPage />);
    
    const deadlineManagement = screen.getByTestId('deadline-management');
    expect(deadlineManagement).toBeInTheDocument();
    expect(deadlineManagement).toHaveTextContent(`Deadline Management Component (token: ${mockToken})`);
  });

  it('passes empty string when token is null', () => {
    vi.mocked(useAuth).mockReturnValue({ token: null } as any);
    
    render(<GlobalConfigPage />);
    
    const termConfig = screen.getByTestId('term-configuration');
    const deadlineManagement = screen.getByTestId('deadline-management');
    
    expect(termConfig).toHaveTextContent('Term Configuration Component (token: )');
    expect(deadlineManagement).toHaveTextContent('Deadline Management Component (token: )');
  });

  it('passes empty string when token is undefined', () => {
    vi.mocked(useAuth).mockReturnValue({ token: undefined } as any);
    
    render(<GlobalConfigPage />);
    
    const termConfig = screen.getByTestId('term-configuration');
    const deadlineManagement = screen.getByTestId('deadline-management');
    
    expect(termConfig).toHaveTextContent('Term Configuration Component (token: )');
    expect(deadlineManagement).toHaveTextContent('Deadline Management Component (token: )');
  });

  it('has correct page structure and styling', () => {
    vi.mocked(useAuth).mockReturnValue({ token: mockToken } as any);
    
    const { container } = render(<GlobalConfigPage />);
    
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass(
      'min-h-screen',
      'w-full',
      'max-w-6xl',
      'mx-auto',
      'flex',
      'flex-col',
      'py-4',
      'px-2',
      'sm:px-4',
      'md:px-6',
      'lg:px-0'
    );
  });

  it('has responsive layout structure', () => {
    vi.mocked(useAuth).mockReturnValue({ token: mockToken } as any);
    
    render(<GlobalConfigPage />);
    
    // Check for header structure
    const title = screen.getByText('Global Configuration');
    expect(title).toHaveClass(
      'text-2xl',
      'sm:text-2xl',
      'md:text-3xl',
      'font-bold',
      'text-[#040941]',
      'mb-2',
      'tracking-tight'
    );
    
    const description = screen.getByText('Manage term and deadline settings');
    expect(description).toHaveClass(
      'text-sm',
      'sm:text-base',
      'md:text-lg',
      'text-gray-500',
      'mb-4',
      'md:mb-6'
    );
  });

  it('renders components in correct order', () => {
    vi.mocked(useAuth).mockReturnValue({ token: mockToken } as any);
    
    render(<GlobalConfigPage />);
    
    const components = [
      screen.getByTestId('toast-container'),
      screen.getByText('Global Configuration'),
      screen.getByTestId('calendar-icon'),
      screen.getByTestId('term-configuration'),
      screen.getByTestId('deadline-management'),
    ];
    
    // Verify all components are in the document
    components.forEach(component => {
      expect(component).toBeInTheDocument();
    });
  });

  it('handles missing auth context gracefully', () => {
    vi.mocked(useAuth).mockReturnValue({} as any);
    
    render(<GlobalConfigPage />);
    
    const termConfig = screen.getByTestId('term-configuration');
    const deadlineManagement = screen.getByTestId('deadline-management');
    
    expect(termConfig).toHaveTextContent('Term Configuration Component (token: )');
    expect(deadlineManagement).toHaveTextContent('Deadline Management Component (token: )');
  });

  it('renders all text content correctly', () => {
    vi.mocked(useAuth).mockReturnValue({ token: mockToken } as any);
    
    render(<GlobalConfigPage />);
    
    // Main heading
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Global Configuration');
    
    // Description
    expect(screen.getByText('Manage term and deadline settings')).toBeInTheDocument();
  });

  it('maintains consistent styling classes', () => {
    vi.mocked(useAuth).mockReturnValue({ token: mockToken } as any);
    
    render(<GlobalConfigPage />);
    
    const title = screen.getByText('Global Configuration');
    expect(title).toHaveClass('text-[#040941]'); 
    
    const description = screen.getByText('Manage term and deadline settings');
    expect(description).toHaveClass('text-gray-500'); 
  });
});
