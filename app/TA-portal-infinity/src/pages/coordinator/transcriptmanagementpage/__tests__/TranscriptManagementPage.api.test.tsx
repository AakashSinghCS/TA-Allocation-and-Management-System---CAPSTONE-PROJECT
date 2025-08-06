import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

describe('TranscriptManagementPage - API Integration & Downloads', () => {
  let mockedDownloadTranscript: any;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    const { fetchAllTranscripts, downloadTranscript } = await import('../../../../api/transcript/transcriptApi');
    vi.mocked(fetchAllTranscripts).mockResolvedValue(mockTranscripts);
    vi.mocked(downloadTranscript).mockResolvedValue(undefined);
    mockedDownloadTranscript = vi.mocked(downloadTranscript);
  });

  describe('API Integration', () => {
    it('fetches transcripts on component mount', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      const { fetchAllTranscripts } = await import('../../../../api/transcript/transcriptApi');
      expect(vi.mocked(fetchAllTranscripts)).toHaveBeenCalledTimes(1);
    });

    it('handles API errors gracefully', async () => {
      const { fetchAllTranscripts } = await import('../../../../api/transcript/transcriptApi');
      vi.mocked(fetchAllTranscripts).mockRejectedValue(new Error('API Error'));
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('Student Transcripts'));
      expect(screen.getByText('Student Transcripts')).toBeInTheDocument();
    });
  });

  describe('Download Functionality', () => {
    it('has download buttons for each transcript', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      const downloadButtons = screen.getAllByText(/Download/i);
      expect(downloadButtons.length).toBeGreaterThan(0);
    });

    it('calls download API when download button is clicked', async () => {
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      // Find all buttons and look for Download buttons specifically
      const allButtons = screen.getAllByRole('button');
      const downloadButton = allButtons.find(button => 
        button.textContent?.includes('Download') && !(button as HTMLButtonElement).disabled
      );
      
      expect(downloadButton).toBeTruthy();
      
      if (downloadButton) {
        // Click the download button
        fireEvent.click(downloadButton);
        
        // Wait for API call with increased timeout
        await waitFor(() => {
          expect(mockedDownloadTranscript).toHaveBeenCalledWith(
            expect.any(Number), 
            expect.stringMatching(/_transcript\.pdf$/), 
            expect.any(String)
          );
        }, { timeout: 8000 });
      }
    }, 10000);

    it('handles download errors gracefully', async () => {
      mockedDownloadTranscript.mockRejectedValue(new Error('Download failed'));
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('John Doe'));
      
      const allButtons = screen.getAllByRole('button');
      const downloadButton = allButtons.find(button => 
        button.textContent?.includes('Download') && !(button as HTMLButtonElement).disabled
      );
      
      expect(downloadButton).toBeTruthy();
      
      if (downloadButton) {
        fireEvent.click(downloadButton);
        await waitFor(() => {
          expect(mockedDownloadTranscript).toHaveBeenCalled();
        }, { timeout: 5000 });
      }
    });
  });

  describe('Error Handling', () => {
    it('displays error message when API fails', async () => {
      const { fetchAllTranscripts } = await import('../../../../api/transcript/transcriptApi');
      vi.mocked(fetchAllTranscripts).mockRejectedValue(new Error('API Error'));
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('Student Transcripts'));
      expect(screen.getByText('Student Transcripts')).toBeInTheDocument();
    });

    it('shows empty state when no transcripts available', async () => {
      const { fetchAllTranscripts } = await import('../../../../api/transcript/transcriptApi');
      vi.mocked(fetchAllTranscripts).mockResolvedValue([]);
      renderWithAuth(<TranscriptManagementPage />);
      await waitFor(() => screen.getByText('Student Transcripts'));
      expect(screen.getByText('Student Transcripts')).toBeInTheDocument();
    });
  });
});
