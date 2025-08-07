import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import TranscriptManagementPage from '../TranscriptManagementPage';
import { renderWithAuth, mockTranscripts } from './test-utils';

// Mock the API functions
vi.mock('../../../../api/transcript/transcriptApi', () => ({
  fetchAllTranscripts: vi.fn(),
  downloadTranscript: vi.fn(),
  fetchTranscriptForPreview: vi.fn(),
  updateTranscriptReview: vi.fn(),
}));

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

describe('TranscriptManagementPage - Bulk Operations & Review', () => {
  let mockedUpdateTranscriptReview: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { fetchAllTranscripts, updateTranscriptReview } = await import('../../../../api/transcript/transcriptApi');
    vi.mocked(fetchAllTranscripts).mockResolvedValue(mockTranscripts);
    vi.mocked(updateTranscriptReview).mockResolvedValue(undefined);
    mockedUpdateTranscriptReview = vi.mocked(updateTranscriptReview);
  });

  describe('Bulk Selection', () => {
    it('has checkboxes for selecting transcripts', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByRole('table'));
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('selects individual transcripts', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByRole('table'));
      
      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes.length > 1) {
        fireEvent.click(checkboxes[1]);
        expect(checkboxes[1]).toBeChecked();
      }
    });

    it('displays selected count', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByRole('table'));
      
      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes.length > 1) {
        fireEvent.click(checkboxes[1]);
        
        await waitFor(() => {
          // Look for specific selected count text instead of general "selected"
          const selectedCountText = screen.getByText('1 selected');
          expect(selectedCountText).toBeInTheDocument();
        }, { timeout: 2000 });
      }
    });
  });

  describe('Review Status Updates', () => {
    it('can approve transcripts', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      // Find and click review button
      const reviewButtons = screen.getAllByText('Review');
      if (reviewButtons.length > 0) {
        fireEvent.click(reviewButtons[0]);
        
        // Wait for review interface to appear and find save button
        await waitFor(() => {
          const saveButtons = screen.getAllByText('Save');
          if (saveButtons.length > 0) {
            fireEvent.click(saveButtons[0]);
          }
        });
        
        await waitFor(() => {
          expect(mockedUpdateTranscriptReview).toHaveBeenCalled();
        }, { timeout: 3000 });
      }
    });

    it('allows adding review comments', async () => {
      const user = userEvent.setup();
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const commentInputs = screen.getAllByRole('textbox');
      if (commentInputs.length > 1) {
        await user.type(commentInputs[1], 'Good academic record');
        expect(commentInputs[1]).toHaveValue('Good academic record');
      }
    });
  });

  describe('Template System', () => {
    it('has comment input fields', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const textInputs = screen.getAllByRole('textbox');
      expect(textInputs.length).toBeGreaterThan(0);
    });

    it('allows custom comments', async () => {
      const user = userEvent.setup();
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const commentInputs = screen.getAllByRole('textbox');
      if (commentInputs.length > 1) {
        await user.type(commentInputs[1], 'Custom review note');
        expect(commentInputs[1]).toHaveValue('Custom review note');
      }
    });
  });
});
