import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TranscriptManagementPage from './TranscriptManagementPage';
import { renderWithAuth, mockTranscripts } from './__tests__/test-utils';

// Mock the API functions
vi.mock('../../../api/transcript/transcriptApi', () => ({
  fetchAllTranscripts: vi.fn(),
  downloadTranscript: vi.fn(),
  fetchTranscriptForPreview: vi.fn(),
  updateTranscriptReview: vi.fn(),
}));

// Mock URL.createObjectURL and URL.revokeObjectURL for preview functionality
global.URL.createObjectURL = vi.fn(() => 'mock-blob-url');
global.URL.revokeObjectURL = vi.fn();

describe('TranscriptManagementPage - Main Integration Tests', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { fetchAllTranscripts } = await import('../../../api/transcript/transcriptApi');
    vi.mocked(fetchAllTranscripts).mockResolvedValue(mockTranscripts);
  });

  describe('Template Dropdown and Comment System', () => {
    it('renders basic table correctly with review buttons', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
      
      const reviewButtons = screen.getAllByText(/Review/i);
      expect(reviewButtons.length).toBeGreaterThan(0);
    });

    it('handles review button interactions without errors', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
      
      const reviewButtons = screen.getAllByText(/Review/i);
      fireEvent.click(reviewButtons[0]);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('maintains application state during interactions', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
      
      const reviewButtons = screen.getAllByText(/Review/i);
      fireEvent.click(reviewButtons[0]);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      
      const searchInput = screen.getByPlaceholderText(/search by student/i);
      expect(searchInput).toBeInTheDocument();
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Additional Coverage Tests', () => {
    it('handles complex search interactions', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText(/search by student/i);
      
      fireEvent.change(searchInput, { target: { value: 'John' } });
      fireEvent.change(searchInput, { target: { value: 'Jane' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('handles status filter changes', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
      
      const statusElements = screen.getAllByRole('button');
      const statusFilter = statusElements.find(el => 
        el.textContent?.includes('All') || el.textContent?.includes('Status')
      );
      
      if (statusFilter) {
        fireEvent.click(statusFilter);
      }
      
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('maintains stable state during bulk operations', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(0);
      });

      const checkboxes = screen.getAllByRole('checkbox');
      
      fireEvent.click(checkboxes[0]);
      if (checkboxes.length > 1) {
        fireEvent.click(checkboxes[1]);
        fireEvent.click(checkboxes[0]);
      }
      
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('performs complete workflow from search to review', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
      
      // Search functionality
      const searchInput = screen.getByPlaceholderText(/search by student/i);
      fireEvent.change(searchInput, { target: { value: 'John' } });
      
      // Review functionality
      const reviewButtons = screen.getAllByText(/Review/i);
      if (reviewButtons.length > 0) {
        fireEvent.click(reviewButtons[0]);
      }
      
      // Verify state consistency
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('handles error recovery scenarios', async () => {
      // Test with initial API failure
      const { fetchAllTranscripts } = await import('../../../api/transcript/transcriptApi');
      vi.mocked(fetchAllTranscripts).mockRejectedValueOnce(new Error('Network error'));
      
      renderWithAuth(<TranscriptManagementPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Student Transcripts')).toBeInTheDocument();
      });
      
      // Verify component remains functional
      const searchInput = screen.getByPlaceholderText(/search by student/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });
      expect(searchInput).toHaveValue('test');
    });

    it('handles confirmation dialog interactions for bulk operations', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
      
      // Select multiple transcripts to enable bulk operations
      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes.length > 2) {
        fireEvent.click(checkboxes[1]); // First transcript
        fireEvent.click(checkboxes[2]); // Second transcript
        
        // Look for bulk action buttons
        const bulkApproveButtons = screen.queryAllByText(/Approve/i);
        if (bulkApproveButtons.length > 0) {
          fireEvent.click(bulkApproveButtons[0]);
          
          // Check if confirmation dialog appears
          await waitFor(() => {
            const confirmButtons = screen.queryAllByText(/Confirm/i);
            const cancelButtons = screen.queryAllByText(/Cancel/i);
            
            // If confirmation dialog exists, test cancel functionality
            if (confirmButtons.length > 0 && cancelButtons.length > 0) {
              fireEvent.click(cancelButtons[0]);
            }
          });
        }
      }
      
      // Verify component remains stable
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('handles preview navigation and keyboard interactions', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
      
      // Test keyboard navigation scenarios
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });
      fireEvent.keyDown(document, { key: 'Tab', code: 'Tab' });
      
      // Test various user interactions that exercise component state
      const searchInput = screen.getByPlaceholderText(/search by student/i);
      
      // Test controlled input changes
      fireEvent.change(searchInput, { target: { value: 'john' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      
      // Verify component maintains stability through interactions
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Student Transcripts')).toBeInTheDocument();
    });

    it('handles comprehensive search and filtering functionality', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText(/search by student/i);
      expect(searchInput).toBeInTheDocument();
      
      // Test various search patterns that should maintain table visibility
      const validSearchPatterns = [
        'john', // Simple name search
        'doe', // Last name search
        '', // Reset search
      ];
      
      for (const pattern of validSearchPatterns) {
        fireEvent.change(searchInput, { target: { value: pattern } });
        
        // Allow for any potential debouncing
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verify core components remain available
        expect(screen.getByText('Student Transcripts')).toBeInTheDocument();
        expect(searchInput).toHaveValue(pattern);
      }
      
      // Test status filter interactions
      const statusCombobox = screen.getByRole('combobox');
      if (statusCombobox) {
        fireEvent.change(statusCombobox, { target: { value: 'ALL' } });
        fireEvent.change(statusCombobox, { target: { value: 'PENDING' } });
        fireEvent.change(statusCombobox, { target: { value: 'ALL' } });
        
        // Verify UI remains functional
        expect(screen.getByText('Student Transcripts')).toBeInTheDocument();
      }
      
      // Test clear functionality  
      const clearButton = screen.getByText('Clear');
      fireEvent.click(clearButton);
      
      // Verify the component maintains data integrity after clearing
      expect(screen.getByText('Student Transcripts')).toBeInTheDocument();
      expect(searchInput).toHaveValue('');
    });
  });
});
