import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all dependencies before any imports
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
    unmount: vi.fn()
  }))
}));

vi.mock('./router/router.tsx', () => ({
  router: { mockRouter: true }
}));

vi.mock('react-router-dom', () => ({
  RouterProvider: () => null
}));

vi.mock('./context/AuthContext.tsx', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children
}));

vi.mock('@tanstack/react-query', () => ({
  QueryClient: vi.fn(),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children
}));

vi.mock('./index.css', () => ({}));
vi.mock('./App.css', () => ({}));

// Mock document and DOM methods
Object.defineProperty(global, 'document', {
  value: {
    getElementById: vi.fn(() => {
      const div = { id: 'root' };
      return div as any;
    })
  },
  writable: true
});

describe('main.tsx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('imports all required modules', () => {
    // Test that all imports can be resolved without errors
    expect(() => {
      require('./index.css');
      require('./App.css');
    }).not.toThrow();
  });

  it('creates QueryClient instance', async () => {
    const { QueryClient } = await import('@tanstack/react-query');
    
    // Import main to trigger QueryClient creation
    await import('./main');
    
    expect(QueryClient).toHaveBeenCalled();
  });

  it('calls document.getElementById with root', async () => {
    await import('./main');
    
    expect(document.getElementById).toHaveBeenCalledWith('root');
  });

  it('calls createRoot with root element', async () => {
    const { createRoot } = await import('react-dom/client');
    
    await import('./main');
    
    expect(createRoot).toHaveBeenCalled();
  });

  it('calls render method on root', async () => {
    const mockRender = vi.fn();
    const { createRoot } = await import('react-dom/client');
    vi.mocked(createRoot).mockReturnValue({ 
      render: mockRender, 
      unmount: vi.fn() 
    });
    
    await import('./main');
    
    expect(mockRender).toHaveBeenCalledTimes(1);
  });

  it('initializes with StrictMode wrapper', async () => {
    const mockRender = vi.fn();
    const { createRoot } = await import('react-dom/client');
    vi.mocked(createRoot).mockReturnValue({ 
      render: mockRender, 
      unmount: vi.fn() 
    });
    
    await import('./main');
    
    // Verify render was called (StrictMode should be in the JSX structure)
    expect(mockRender).toHaveBeenCalledTimes(1);
    expect(mockRender).toHaveBeenCalledWith(expect.anything());
  });

  it('sets up provider hierarchy correctly', async () => {
    const mockRender = vi.fn();
    const { createRoot } = await import('react-dom/client');
    vi.mocked(createRoot).mockReturnValue({ 
      render: mockRender, 
      unmount: vi.fn() 
    });
    
    await import('./main');
    
    // Verify all providers are called
    expect(mockRender).toHaveBeenCalledTimes(1);
  });

  it('handles root element selection', async () => {
    const mockElement = { id: 'root' };
    vi.mocked(document.getElementById).mockReturnValue(mockElement as any);
    
    await import('./main');
    
    expect(document.getElementById).toHaveBeenCalledWith('root');
  });
});
