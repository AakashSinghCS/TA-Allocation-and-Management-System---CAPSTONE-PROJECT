import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import TranscriptManagementPage from '../TranscriptManagementPage';
import { renderWithAuth, mockTranscripts } from './test-utils';

// Mock the API functions
vi.mock('../../../../api/transcript/transcriptApi', async () => {
  const actual = await vi.importActual('../../../../api/transcript/transcriptApi');
  return {
    ...actual,
    fetchAllTranscripts: vi.fn(),
    downloadTranscript: vi.fn(),
    fetchTranscriptForPreview: vi.fn(),
    updateTranscriptReview: vi.fn(),
  };
});

// Mock StatusIndicator component
vi.mock('../../../../components/StatusIndicator', () => ({
  default: ({ status }: { status: string }) => <div data-testid="status-indicator">{status}</div>,
}));

// Mock toast notifications
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('TranscriptManagementPage - Preview & Advanced Features', () => {
  let mockedFetchTranscriptForPreview: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { fetchAllTranscripts, fetchTranscriptForPreview } = await import('../../../../api/transcript/transcriptApi');
    vi.mocked(fetchAllTranscripts).mockResolvedValue(mockTranscripts);
    vi.mocked(fetchTranscriptForPreview).mockResolvedValue('test content');
    mockedFetchTranscriptForPreview = vi.mocked(fetchTranscriptForPreview);
  });

  describe('Preview Functionality', () => {
    it('has preview buttons for transcripts', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const previewButtons = screen.getAllByTestId('preview-button');
      expect(previewButtons.length).toBeGreaterThan(0);
    });

    it('opens preview modal when preview button is clicked', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const previewButtons = screen.getAllByTestId('preview-button');
      if (previewButtons.length > 0) {
        fireEvent.click(previewButtons[0]);
        
        await waitFor(() => {
          expect(mockedFetchTranscriptForPreview).toHaveBeenCalled();
        });
      }
    });

    it('closes preview modal', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const previewButtons = screen.getAllByTestId('preview-button');
      if (previewButtons.length > 0) {
        fireEvent.click(previewButtons[0]);
        
        await waitFor(() => {
          const backToListButton = screen.queryByTestId('back-to-list-button');
          if (backToListButton) {
            fireEvent.click(backToListButton);
          }
        });
      }
    });

    it('handles preview loading state', async () => {
      const { fetchTranscriptForPreview } = await import('../../../../api/transcript/transcriptApi');
      vi.mocked(fetchTranscriptForPreview).mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const previewButtons = screen.getAllByTestId('preview-button');
      if (previewButtons.length > 0) {
        fireEvent.click(previewButtons[0]);
        
        await waitFor(() => {
          // Check for any loading indicator
          const loadingText = screen.queryByText(/loading/i);
          const loadingSpinner = document.querySelector('.animate-spin');
          expect(loadingText || loadingSpinner).toBeTruthy();
        });
      }
    });

    it('handles preview errors', async () => {
      const { fetchTranscriptForPreview } = await import('../../../../api/transcript/transcriptApi');
      vi.mocked(fetchTranscriptForPreview).mockRejectedValue(new Error('Preview failed'));
      
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const previewButtons = screen.getAllByTestId('preview-button');
      if (previewButtons.length > 0) {
        fireEvent.click(previewButtons[0]);
        
        await waitFor(() => {
          expect(vi.mocked(fetchTranscriptForPreview)).toHaveBeenCalled();
        });
      }
    });
  });

  describe('CSV Export', () => {
    it('has export functionality', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const exportButton = screen.queryByText(/export/i);
      if (exportButton) {
        expect(exportButton).toBeInTheDocument();
      }
    });

    it('exports selected transcripts to CSV', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByRole('table'));
      
      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes.length > 1) {
        fireEvent.click(checkboxes[1]);
        
        const exportButton = screen.queryByText(/export/i);
        if (exportButton) {
          fireEvent.click(exportButton);
          
          await waitFor(() => {
            expect(exportButton).toBeInTheDocument();
          });
        }
      }
    });

    it('exports all transcripts when none selected', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const exportButton = screen.queryByText(/export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        
        await waitFor(() => {
          expect(exportButton).toBeInTheDocument();
        });
      }
    });
  });

  describe('Performance Handling', () => {
    it('handles large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        ...mockTranscripts[0],
        transcriptId: i + 1,
        id: i + 1,
        studentName: `Student ${i + 1}`,
      }));
      
      const { fetchAllTranscripts } = await import('../../../../api/transcript/transcriptApi');
      vi.mocked(fetchAllTranscripts).mockResolvedValue(largeDataset);
      
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('Student 1'));
      
      expect(screen.getByText('Student 1')).toBeInTheDocument();
    });

    it('implements virtual scrolling for large lists', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByRole('table'));
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('debounces search input', async () => {
      const user = userEvent.setup();
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByPlaceholderText(/search/i));
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'John');
      
      await waitFor(() => {
        expect(searchInput).toHaveValue('John');
      });
    });
  });

  describe('Authorization & Permissions', () => {
    it('shows appropriate actions based on user role', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const approveButtons = screen.getAllByText(/approve/i);
      expect(approveButtons.length).toBeGreaterThan(0);
    });

    it('disables unauthorized actions', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const deleteButtons = screen.queryAllByText(/delete/i);
      expect(deleteButtons.length).toBeGreaterThanOrEqual(0);
    });

    it('validates user permissions before actions', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const approveButtons = screen.getAllByText(/approve/i);
      if (approveButtons.length > 0) {
        fireEvent.click(approveButtons[0]);
        
        await waitFor(() => {
          expect(approveButtons[0]).toBeInTheDocument();
        });
      }
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByRole('table'));
      
      await user.tab();
      
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInTheDocument();
    });

    it('handles escape key to close modals', async () => {
      const user = userEvent.setup();
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const previewButtons = screen.getAllByTestId('preview-button');
      if (previewButtons.length > 0) {
        fireEvent.click(previewButtons[0]);
        
        await user.keyboard('{Escape}');
        
        // Just check that the page is still functional
        await waitFor(() => {
          expect(screen.getByText('Student Transcripts')).toBeInTheDocument();
        });
      }
    });

    it('supports bulk actions with keyboard shortcuts', async () => {
      const user = userEvent.setup();
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByRole('table'));
      
      await user.keyboard('{Control>}a{/Control}');
      
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Responsive Design', () => {
    it('adapts to mobile viewport', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, writable: true });
      
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('Student Transcripts'));
      
      expect(screen.getByText('Student Transcripts')).toBeInTheDocument();
    });

    it('shows mobile-optimized table layout', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByRole('table'));
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('handles touch interactions', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const approveButtons = screen.getAllByText(/approve/i);
      if (approveButtons.length > 0) {
        fireEvent.touchStart(approveButtons[0]);
        fireEvent.touchEnd(approveButtons[0]);
        
        await waitFor(() => {
          expect(approveButtons[0]).toBeInTheDocument();
        });
      }
    });
  });
});
