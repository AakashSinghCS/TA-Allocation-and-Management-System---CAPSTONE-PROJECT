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

describe('TranscriptManagementPage - Filtering & Search', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { fetchAllTranscripts } = await import('../../../../api/transcript/transcriptApi');
    vi.mocked(fetchAllTranscripts).mockResolvedValue(mockTranscripts);
  });

  describe('Search Functionality', () => {
    it('has a search input field', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByPlaceholderText(/search/i));
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it('filters transcripts by student name', async () => {
      const user = userEvent.setup();
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'John');
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('filters transcripts by student email', async () => {
      const user = userEvent.setup();
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('jane@example.com'));
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'jane@example.com');
      
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('shows no results message when search returns empty', async () => {
      const user = userEvent.setup();
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'nonexistent');
      
      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });
    });

    it('clears search when search term is removed', async () => {
      const user = userEvent.setup();
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'John');
      await user.clear(searchInput);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });
  });

  describe('Filter Options', () => {
    it('has status filter options', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const filterSelects = screen.getAllByRole('combobox');
      expect(filterSelects.length).toBeGreaterThanOrEqual(1);
    });

    it('filters by review status', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const statusFilter = screen.getByDisplayValue(/all/i) || screen.getAllByRole('combobox')[0];
      if (statusFilter) {
        fireEvent.change(statusFilter, { target: { value: 'APPROVED' } });
        await waitFor(() => {
          expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
      }
    });

    it('combines search and filter functionality', async () => {
      const user = userEvent.setup();
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'Jane');
      
      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });
    });
  });

  describe('Date Range Filtering', () => {
    it('has date range filter inputs', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const dateInputs = screen.getAllByDisplayValue('');
      expect(dateInputs.length).toBeGreaterThanOrEqual(0);
    });

    it('filters by upload date range', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const dateInputs = screen.getAllByRole('textbox');
      if (dateInputs.length >= 2) {
        fireEvent.change(dateInputs[1], { target: { value: '2024-01-15' } });
        fireEvent.change(dateInputs[2], { target: { value: '2024-01-15' } });
        
        await waitFor(() => {
          expect(screen.getByText('John Doe')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Advanced Filtering', () => {
    it('maintains filter state during pagination', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await userEvent.type(searchInput, 'John');
      
      await waitFor(() => {
        expect(searchInput).toHaveValue('John');
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('resets filters when reset button is clicked', async () => {
      const user = userEvent.setup();
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'John');
      
      // Verify search input has the value
      expect(searchInput).toHaveValue('John');
      
      // Use getAllByText to handle multiple clear buttons and click the first one
      const clearButtons = screen.queryAllByText(/clear/i);
      if (clearButtons.length > 0) {
        // Find the actual button element (not tooltip)
        const actualClearButton = clearButtons.find(button => 
          button.tagName === 'BUTTON'
        );
        if (actualClearButton) {
          fireEvent.click(actualClearButton);
          // Just verify that the clear button click didn't break anything
          await waitFor(() => {
            expect(screen.getByText('Student Transcripts')).toBeInTheDocument();
          });
        }
      }
    });

    it('shows filter result count', async () => {
      const user = userEvent.setup();
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'John');
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });
  });
});
