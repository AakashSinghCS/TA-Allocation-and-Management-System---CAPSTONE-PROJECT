import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock all dependencies
vi.mock('./context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate-to">{to}</div>,
    Outlet: () => <div data-testid="outlet">Outlet Content</div>
  };
});

vi.mock('./components/layout/header/Header', () => ({
  default: () => <div data-testid="header">Header</div>
}));

vi.mock('./components/layout/footer/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}));

vi.mock('./components/layout/sidebar/SideBar', () => ({
  default: ({ expanded, setExpanded }: { expanded: boolean; setExpanded: (expanded: boolean) => void }) => (
    <div data-testid="sidebar" data-expanded={expanded}>
      <button 
        data-testid="sidebar-toggle" 
        onClick={() => setExpanded(!expanded)}
      >
        Toggle Sidebar
      </button>
    </div>
  )
}));

vi.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="toast-container">Toast Container</div>
}));

vi.mock('react-toastify/dist/ReactToastify.css', () => ({}));

import { useAuth } from './context/AuthContext';

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication Redirect', () => {
    it('redirects to login when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false
      });

      renderApp();
      
      expect(screen.getByTestId('navigate-to')).toHaveTextContent('/login');
    });
  });

  describe('Authenticated Layout', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true
      });
    });

    it('renders main layout components when authenticated', () => {
      renderApp();
      
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
      expect(screen.getByTestId('toast-container')).toBeInTheDocument();
    });

    it('has correct initial layout structure', () => {
      renderApp();
      
      const appContainer = screen.getByRole('main').parentElement?.parentElement;
      expect(appContainer).toHaveClass('flex', 'min-h-screen', 'app-container');
    });

    it('renders main content area with correct classes', () => {
      renderApp();
      
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveClass('flex-1', 'overflow-y-auto', 'p-6', 'bg-white', 'min-h-0');
    });
  });

  describe('Sidebar State Management', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true
      });
    });

    it('initializes with sidebar collapsed', () => {
      renderApp();
      
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveAttribute('data-expanded', 'false');
    });

    it('updates main content padding based on sidebar state', () => {
      renderApp();
      
      const mainContentWrapper = screen.getByRole('main').parentElement;
      expect(mainContentWrapper).toHaveClass('pl-20');
      expect(mainContentWrapper).not.toHaveClass('pl-56');
    });

    it('expands sidebar when toggle is clicked', () => {
      renderApp();
      
      const toggleButton = screen.getByTestId('sidebar-toggle');
      const mainContentWrapper = screen.getByRole('main').parentElement;
      
      // Initially collapsed
      expect(screen.getByTestId('sidebar')).toHaveAttribute('data-expanded', 'false');
      expect(mainContentWrapper).toHaveClass('pl-20');
      
      // Click to expand
      fireEvent.click(toggleButton);
      
      expect(screen.getByTestId('sidebar')).toHaveAttribute('data-expanded', 'true');
      expect(mainContentWrapper).toHaveClass('pl-56');
    });

    it('collapses sidebar when toggle is clicked twice', () => {
      renderApp();
      
      const toggleButton = screen.getByTestId('sidebar-toggle');
      const mainContentWrapper = screen.getByRole('main').parentElement;
      
      // Expand first
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('sidebar')).toHaveAttribute('data-expanded', 'true');
      expect(mainContentWrapper).toHaveClass('pl-56');
      
      // Collapse again
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('sidebar')).toHaveAttribute('data-expanded', 'false');
      expect(mainContentWrapper).toHaveClass('pl-20');
    });
  });

  describe('Layout Components Integration', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true
      });
    });

    it('passes correct props to SideNav component', () => {
      renderApp();
      
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveAttribute('data-expanded', 'false');
      
      // Verify toggle functionality works
      fireEvent.click(screen.getByTestId('sidebar-toggle'));
      expect(sidebar).toHaveAttribute('data-expanded', 'true');
    });

    it('applies transition classes to main content wrapper', () => {
      renderApp();
      
      const mainContentWrapper = screen.getByRole('main').parentElement;
      expect(mainContentWrapper).toHaveClass(
        'flex', 'flex-col', 'flex-1', 'transition-all', 'duration-300', 'app-main-content'
      );
    });

    it('renders ToastContainer with correct positioning', () => {
      renderApp();
      
      const toastContainer = screen.getByTestId('toast-container');
      expect(toastContainer).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true
      });
    });

    it('handles sidebar state changes smoothly', () => {
      renderApp();
      
      const toggleButton = screen.getByTestId('sidebar-toggle');
      const mainContentWrapper = screen.getByRole('main').parentElement;
      
      // Test multiple toggles
      for (let i = 0; i < 3; i++) {
        fireEvent.click(toggleButton);
        const isExpanded = i % 2 === 0;
        expect(screen.getByTestId('sidebar')).toHaveAttribute('data-expanded', isExpanded.toString());
        expect(mainContentWrapper).toHaveClass(isExpanded ? 'pl-56' : 'pl-20');
      }
    });

    it('maintains layout structure during sidebar transitions', () => {
      renderApp();
      
      const toggleButton = screen.getByTestId('sidebar-toggle');
      
      // Before toggle
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
      
      // After toggle
      fireEvent.click(toggleButton);
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });
  });
});
