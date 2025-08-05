
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import TranscriptUploadPage from './TranscriptUploadPage';
import { showToastConfirmation, showToastSuccess, showToastError, showToastInfo } from '../../../utility/confirmation/toastConfirmation';

// Mock dependencies
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
  ToastContainer: vi.fn(),
}));

vi.mock('../../../utility/confirmation/toastConfirmation', () => ({
  showToastConfirmation: vi.fn(),
  showToastSuccess: vi.fn(),
  showToastError: vi.fn(),
  showToastInfo: vi.fn(),
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    token: 'mock-jwt-token',
    userId: 123,
    isAuthenticated: true,
    userRoles: ['STUDENT'],
  }),
}));

vi.mock('../../../components/layout/tabnav/TabNav', () => ({
  default: ({ roles }: { roles: string[] }) => React.createElement('div', { 'data-testid': 'tab-nav' }, `TabNav with roles: ${roles.join(', ')}`),
}));

vi.mock('../../../utility/genericapicontainer/GenericAPIContainer', () => ({
  GenericAPIContainer: ({ render }: { render: (data: any) => React.ReactNode }) => {
    // Mock user data for the container
    const mockRecord = { roles: ['STUDENT'] };
    return render(mockRecord);
  },
}));

vi.mock('../../../api/user/fetchUserDetails', () => ({
  fetchUserDetails: vi.fn().mockResolvedValue({ roles: ['STUDENT'] }),
}));

// Global fetch mock
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Get references to mocked functions
const mockToast = vi.mocked(toast);
const mockShowToastConfirmation = vi.mocked(showToastConfirmation);
const mockShowToastSuccess = vi.mocked(showToastSuccess);
const mockShowToastError = vi.mocked(showToastError);
const mockShowToastInfo = vi.mocked(showToastInfo);

// Helper function to render component with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <>
        {component}
      </>
    </MemoryRouter>
  );
};

// Helper function to create mock PDF file
const createMockPDFFile = (name: string, size: number = 1024 * 1024) => {
  const file = new File(['mock pdf content'], name, {
    type: 'application/pdf',
    lastModified: Date.now(),
  });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// Helper function to create mock file of any type
const createMockFile = (name: string, size: number, type: string) => {
  const file = new File(['mock file content'], name, {
    type,
    lastModified: Date.now(),
  });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// Helper function to create mock non-PDF file
const createMockInvalidFile = (name: string, type: string) => {
  return new File(['mock content'], name, {
    type: type,
    lastModified: Date.now(),
  });
};

describe('TranscriptUploadPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'mock-blob-url');
    global.URL.revokeObjectURL = vi.fn();
    // Mock XMLHttpRequest for upload progress
    const mockXHRImplementation = vi.fn().mockImplementation(() => ({
      open: vi.fn(),
      send: vi.fn(),
      setRequestHeader: vi.fn(),
      addEventListener: vi.fn(),
      upload: {
        addEventListener: vi.fn(),
      },
      status: 200,
      responseText: '',
    }));
    (global as any).XMLHttpRequest = mockXHRImplementation;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders upload form with essential elements', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
        expect(screen.getByText('Upload your official transcript (PDF only, max 5MB).')).toBeInTheDocument();
        expect(screen.getByText('Choose a PDF file or drag it here')).toBeInTheDocument();
        // Remove expectation for 'Back to Dashboard' button
        // expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
      });
    });

    it('displays existing transcript when available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          hasTranscript: true,
          fileName: 'existing-transcript.pdf',
          fileSize: 2048576,
          uploadDate: '2025-01-01T12:00:00Z',
          contentType: 'application/pdf',
        }),
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByText('Current Transcript')).toBeInTheDocument();
        expect(screen.getByText('existing-transcript.pdf')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Replace Transcript' })).toBeInTheDocument();
      });
    });

    it('shows upload zone when no existing transcript', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          hasTranscript: false,
        }),
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByText('Upload New Transcript')).toBeInTheDocument();
        expect(screen.queryByText('Current Transcript')).not.toBeInTheDocument();
      });
    });
  });

  describe('File Validation', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });
      renderWithRouter(<TranscriptUploadPage />);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
      });
    });

    it('accepts valid PDF files', async () => {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = createMockFile('valid-transcript.pdf', 2000000, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        expect(screen.getByText('valid-transcript.pdf')).toBeInTheDocument();
        expect(screen.queryByText(/File must be a PDF/)).not.toBeInTheDocument();
      });
    });

    it('rejects non-PDF files', async () => {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const invalidFile = createMockFile('document.txt', 1000000, 'text/plain');

      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      await waitFor(() => {
        expect(screen.getByText('Please upload a PDF file only.')).toBeInTheDocument();
      });
    });

    it('rejects files larger than 5MB', async () => {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const largeFile = createMockFile('large-transcript.pdf', 6000000, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      await waitFor(() => {
        expect(screen.getByText('File size must be less than 5MB.')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('component renders without back button', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
        // Component renders successfully without back button
        expect(screen.getByText('Choose a PDF file or drag it here')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows loading state while fetching existing transcript', async () => {
      // Create a promise that we can control
      let resolveFetch: (value: any) => void;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });
      mockFetch.mockReturnValueOnce(fetchPromise);

      renderWithRouter(<TranscriptUploadPage />);

      // Check that component renders initially (loading state)
      expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();

      // Resolve the fetch promise
      resolveFetch!({
        ok: false,
        status: 404,
      });

      await waitFor(() => {
        expect(screen.getByText('Upload New Transcript')).toBeInTheDocument();
      });
    });

    it('handles fetch error gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
        expect(screen.getByText('Upload New Transcript')).toBeInTheDocument();
      });
    });
  });

  describe('Existing Transcript Management', () => {
    it('displays file information for existing transcript', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          hasTranscript: true,
          fileName: 'my-transcript.pdf',
          fileSize: 1536000,
          uploadDate: '2024-01-15T10:30:00Z',
          contentType: 'application/pdf',
        }),
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByText('my-transcript.pdf')).toBeInTheDocument();
        expect(screen.getByText(/1.46 MB/)).toBeInTheDocument();
        expect(screen.getByText(/Jan 15, 2024, 02:30 AM/)).toBeInTheDocument();
      });
    });

    it('shows replace transcript section when transcript exists', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          hasTranscript: true,
          fileName: 'existing.pdf',
          fileSize: 2048000,
          uploadDate: '2024-01-01T12:00:00Z',
          contentType: 'application/pdf',
        }),
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Replace Transcript' })).toBeInTheDocument();
        expect(screen.queryByText('Upload New Transcript')).not.toBeInTheDocument();
      });
    });

    it('allows file replacement when existing transcript present', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          hasTranscript: true,
          fileName: 'old-transcript.pdf',
          fileSize: 1024000,
          uploadDate: '2024-01-01T12:00:00Z',
          contentType: 'application/pdf',
        }),
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByText('old-transcript.pdf')).toBeInTheDocument();
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const newFile = createMockFile('new-transcript.pdf', 2000000, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [newFile] } });

      await waitFor(() => {
        expect(screen.getByText('new-transcript.pdf')).toBeInTheDocument();
      });
    });
  });

  describe('Button States and Interactions', () => {
    it('enables upload button when valid file is selected', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
      });

      // Initially disabled
      const uploadButton = screen.getByRole('button', { name: 'Upload Transcript' });
      expect(uploadButton).toBeDisabled();

      // Select valid file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = createMockFile('test-transcript.pdf', 2000000, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        expect(uploadButton).not.toBeDisabled();
      });
    });

    it('keeps upload button disabled when invalid file is selected', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: 'Upload Transcript' });
      expect(uploadButton).toBeDisabled();

      // Select invalid file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const invalidFile = createMockFile('document.txt', 1000000, 'text/plain');

      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      await waitFor(() => {
        expect(screen.getByText('Please upload a PDF file only.')).toBeInTheDocument();
        expect(uploadButton).toBeDisabled();
      });
    });

    it('shows preview button for existing transcript', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          hasTranscript: true,
          fileName: 'preview-test.pdf',
          fileSize: 1024000,
          uploadDate: '2024-01-01T12:00:00Z',
          contentType: 'application/pdf',
        }),
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Preview/i })).toBeInTheDocument();
      });
    });

    it('shows delete button for existing transcript', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          hasTranscript: true,
          fileName: 'delete-test.pdf',
          fileSize: 1024000,
          uploadDate: '2024-01-01T12:00:00Z',
          contentType: 'application/pdf',
        }),
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
      });
    });
  });

  describe('Drag and Drop Functionality', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });
      renderWithRouter(<TranscriptUploadPage />);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
      });
    });

    it('handles drag enter event', async () => {
      const dropZone = screen.getByText('Choose a PDF file or drag it here').closest('div');
      
      fireEvent.dragEnter(dropZone!, {
        dataTransfer: {
          items: [{ kind: 'file', type: 'application/pdf' }],
        },
      });

      // The drop zone should be visually highlighted
      expect(dropZone).toBeInTheDocument();
    });

    it('handles drag over event', async () => {
      const dropZone = screen.getByText('Choose a PDF file or drag it here').closest('div');
      
      fireEvent.dragOver(dropZone!, {
        dataTransfer: {
          items: [{ kind: 'file', type: 'application/pdf' }],
        },
      });

      expect(dropZone).toBeInTheDocument();
    });

    it('handles drag leave event', async () => {
      const dropZone = screen.getByText('Choose a PDF file or drag it here').closest('div');
      
      fireEvent.dragLeave(dropZone!, {
        dataTransfer: {
          items: [{ kind: 'file', type: 'application/pdf' }],
        },
      });

      expect(dropZone).toBeInTheDocument();
    });

    it('handles file drop with valid PDF', async () => {
      const dropZone = screen.getByText('Choose a PDF file or drag it here').closest('div');
      const validFile = createMockFile('dropped-file.pdf', 2000000, 'application/pdf');
      
      fireEvent.drop(dropZone!, {
        dataTransfer: {
          files: [validFile],
        },
      });

      await waitFor(() => {
        expect(screen.getByText('dropped-file.pdf')).toBeInTheDocument();
      });
    });

    it('handles file drop with invalid file type', async () => {
      const dropZone = screen.getByText('Choose a PDF file or drag it here').closest('div');
      const invalidFile = createMockFile('document.docx', 2000000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      
      fireEvent.drop(dropZone!, {
        dataTransfer: {
          files: [invalidFile],
        },
      });

      await waitFor(() => {
        expect(screen.getByText('Please upload a PDF file only.')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission and Upload', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });
      renderWithRouter(<TranscriptUploadPage />);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
      });
    });

    it('prevents form submission without file', async () => {
      const form = screen.getByRole('button', { name: 'Upload Transcript' }).closest('form');
      const uploadButton = screen.getByRole('button', { name: 'Upload Transcript' });
      
      expect(uploadButton).toBeDisabled();
      
      // Try to submit form
      fireEvent.submit(form!);
      
      // Button should still be disabled
      expect(uploadButton).toBeDisabled();
    });

    it('enables form submission with valid file', async () => {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = createMockFile('upload-test.pdf', 2000000, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        const uploadButton = screen.getByRole('button', { name: 'Upload Transcript' });
        expect(uploadButton).not.toBeDisabled();
      });
    });

    it('shows file selection in upload area', async () => {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = createMockFile('selected-file.pdf', 3000000, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        expect(screen.getByText('selected-file.pdf')).toBeInTheDocument();
        // File size appears in multiple places (upload area and preview), so use getAllByText
        const fileSizeElements = screen.getAllByText(/2.86 MB/);
        expect(fileSizeElements.length).toBeGreaterThan(0);
      });
    });

    it('clears file selection when invalid file is chosen', async () => {
      // First select a valid file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = createMockFile('valid.pdf', 2000000, 'application/pdf');
      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        expect(screen.getByText('valid.pdf')).toBeInTheDocument();
      });

      // Then select an invalid file
      const invalidFile = createMockFile('invalid.txt', 1000000, 'text/plain');
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      await waitFor(() => {
        expect(screen.getByText('Please upload a PDF file only.')).toBeInTheDocument();
        expect(screen.queryByText('invalid.txt')).not.toBeInTheDocument();
      });
    });

    it('handles multiple file selection by taking first file', async () => {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file1 = createMockFile('first.pdf', 2000000, 'application/pdf');
      const file2 = createMockFile('second.pdf', 3000000, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [file1, file2] } });

      await waitFor(() => {
        expect(screen.getByText('first.pdf')).toBeInTheDocument();
        expect(screen.queryByText('second.pdf')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases and Validation', () => {
    it('handles empty file selection', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [] } });

      // No error should occur, button should remain disabled
      const uploadButton = screen.getByRole('button', { name: 'Upload Transcript' });
      expect(uploadButton).toBeDisabled();
    });

    it('handles file with exactly 5MB size', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const exactSizeFile = createMockFile('exact-5mb.pdf', 5 * 1024 * 1024, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [exactSizeFile] } });

      await waitFor(() => {
        expect(screen.getByText('exact-5mb.pdf')).toBeInTheDocument();
        expect(screen.queryByText(/File size must be less than 5MB/)).not.toBeInTheDocument();
      });
    });

    it('handles file just over 5MB limit', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const oversizeFile = createMockFile('oversize.pdf', (5 * 1024 * 1024) + 1, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [oversizeFile] } });

      await waitFor(() => {
        expect(screen.getByText('File size must be less than 5MB.')).toBeInTheDocument();
      });
    });
  });

  describe('UI States and Accessibility', () => {
    it('shows file preview when valid file is selected', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = createMockFile('preview-test.pdf', 2000000, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        expect(screen.getByText('New File Preview')).toBeInTheDocument();
        expect(screen.getByTitle('New File Preview')).toBeInTheDocument();
      });
    });

    it('shows fullscreen button in file preview', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = createMockFile('fullscreen-test.pdf', 2000000, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Fullscreen/i })).toBeInTheDocument();
      });
    });

    it('shows file removal button when file is selected', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = createMockFile('remove-test.pdf', 2000000, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        // Look for the trash/remove button in the file selection area
        const trashButtons = screen.getAllByRole('button');
        const removeButton = trashButtons.find(button => 
          button.querySelector('svg') && 
          button.querySelector('svg')?.classList.contains('lucide-trash2')
        );
        expect(removeButton).toBeInTheDocument();
      });
    });

    it('maintains requirements section visibility', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
        // Update to match actual UI: requirements is a div, not a heading
        expect(screen.getByText('Requirements')).toBeInTheDocument();
        expect(screen.getByText('PDF files only (max 5MB)')).toBeInTheDocument();
        expect(screen.getByText('Official academic transcript')).toBeInTheDocument();
        expect(screen.getByText('Clear and readable content')).toBeInTheDocument();
        expect(screen.getByText('Avoid special characters in filename')).toBeInTheDocument();
        // Remove expectation for 'After Upload' heading
        // expect(screen.getByRole('heading', { name: 'After Upload' })).toBeInTheDocument();
      });
    });

    it('shows success state when file is ready for upload', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = createMockFile('success-test.pdf', 2000000, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        expect(screen.getByText('✓ File ready - preview below')).toBeInTheDocument();
      });
    });
  });

  describe('Fullscreen Functionality', () => {
    it('opens fullscreen modal when fullscreen button is clicked', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = createMockFile('fullscreen-modal-test.pdf', 2000000, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Fullscreen/i })).toBeInTheDocument();
      });

      const fullscreenButton = screen.getByRole('button', { name: /Fullscreen/i });
      fireEvent.click(fullscreenButton);

      await waitFor(() => {
        expect(screen.getByText('Transcript Preview - Fullscreen')).toBeInTheDocument();
        expect(screen.getByTitle('Transcript Fullscreen Preview')).toBeInTheDocument();
      });
    });

    it('closes fullscreen modal when ESC key is pressed', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = createMockFile('esc-key-test.pdf', 2000000, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Fullscreen/i })).toBeInTheDocument();
      });

      // Open fullscreen
      const fullscreenButton = screen.getByRole('button', { name: /Fullscreen/i });
      fireEvent.click(fullscreenButton);

      await waitFor(() => {
        expect(screen.getByText('Transcript Preview - Fullscreen')).toBeInTheDocument();
      });

      // Press ESC key
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByText('Transcript Preview - Fullscreen')).not.toBeInTheDocument();
      });
    });

    it('closes fullscreen modal when close button is clicked', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = createMockFile('close-button-test.pdf', 2000000, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Fullscreen/i })).toBeInTheDocument();
      });

      // Open fullscreen
      const fullscreenButton = screen.getByRole('button', { name: /Fullscreen/i });
      fireEvent.click(fullscreenButton);

      await waitFor(() => {
        expect(screen.getByText('Transcript Preview - Fullscreen')).toBeInTheDocument();
      });

      // Click close button (X button in the modal)
      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find(button => 
        button.querySelector('svg') && 
        button.querySelector('svg')?.classList.contains('lucide-x')
      );
      expect(closeButton).toBeInTheDocument();
      fireEvent.click(closeButton!);

      await waitFor(() => {
        expect(screen.queryByText('Transcript Preview - Fullscreen')).not.toBeInTheDocument();
      });
    });
  });

  describe('Existing Transcript Actions', () => {
    it('shows confirmation toast when deleting existing transcript', async () => {
      const { showToastConfirmation } = await import('../../../utility/confirmation/toastConfirmation');
      (showToastConfirmation as any).mockResolvedValue(true);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          hasTranscript: true,
          fileName: 'delete-confirm-test.pdf',
          fileSize: 1024000,
          uploadDate: '2024-01-01T12:00:00Z',
          contentType: 'application/pdf',
        }),
      });

      // Mock successful delete
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      fireEvent.click(deleteButton);

      // Assert the custom confirmation toast was called
      expect(showToastConfirmation).toHaveBeenCalledWith({
        title: 'Delete Transcript',
        message: 'Are you sure you want to delete your existing transcript? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger',
      });
    });

    it('toggles existing transcript preview visibility', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          hasTranscript: true,
          fileName: 'preview-toggle-test.pdf',
          fileSize: 1024000,
          uploadDate: '2024-01-01T12:00:00Z',
          contentType: 'application/pdf',
        }),
      });

      // Mock successful preview download
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(['mock pdf content'], { type: 'application/pdf' }),
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Preview/i })).toBeInTheDocument();
      });

      const previewButton = screen.getByRole('button', { name: /Preview/i });
      
      // First click - show preview
      fireEvent.click(previewButton);

      await waitFor(() => {
        expect(screen.getByText('Current Transcript Preview')).toBeInTheDocument();
        expect(screen.getByText('Hide Preview')).toBeInTheDocument();
      });

      // Second click - hide preview
      fireEvent.click(previewButton);

      await waitFor(() => {
        expect(screen.queryByText('Current Transcript Preview')).not.toBeInTheDocument();
        expect(screen.getByText('Preview')).toBeInTheDocument();
      });
    });

    it('handles preview download error gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          hasTranscript: true,
          fileName: 'preview-error-test.pdf',
          fileSize: 1024000,
          uploadDate: '2024-01-01T12:00:00Z',
          contentType: 'application/pdf',
        }),
      });

      // Mock failed preview download
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Preview/i })).toBeInTheDocument();
      });

      const previewButton = screen.getByRole('button', { name: /Preview/i });
      fireEvent.click(previewButton);

      await waitFor(() => {
        // Preview should not be shown due to error
        expect(screen.queryByText('Current Transcript Preview')).not.toBeInTheDocument();
        // Button should still show "Preview" (not "Hide Preview")
        expect(screen.getByText('Preview')).toBeInTheDocument();
      });
    });
  });

  describe('Upload Progress and XHR', () => {
    it('tracks upload progress with XMLHttpRequest progress events', async () => {
      let progressHandler: ((e: any) => void) | null = null;
      let loadHandler: ((e: any) => void) | null = null;

      // Mock XMLHttpRequest with progress tracking
      const mockXHR = {
        open: vi.fn(),
        send: vi.fn(),
        setRequestHeader: vi.fn(),
        addEventListener: vi.fn((event: string, handler: any) => {
          if (event === 'load') {
            loadHandler = handler;
          }
        }),
        upload: {
          addEventListener: vi.fn((event: string, handler: any) => {
            if (event === 'progress') {
              progressHandler = handler;
            }
          }),
        },
        status: 200,
        responseText: '{"success": true}',
      };

      (global as any).XMLHttpRequest = vi.fn(() => mockXHR);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = createMockFile('progress-test.pdf', 2000000, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        const uploadButton = screen.getByRole('button', { name: 'Upload Transcript' });
        expect(uploadButton).not.toBeDisabled();
        fireEvent.click(uploadButton);
      });

      // Simulate progress events
      if (progressHandler) {
        // 25% progress
        (progressHandler as Function)({ lengthComputable: true, loaded: 500000, total: 2000000 });
        await waitFor(() => {
          expect(screen.getByText('Uploading... 25%')).toBeInTheDocument();
        });

        // 75% progress
        (progressHandler as Function)({ lengthComputable: true, loaded: 1500000, total: 2000000 });
        await waitFor(() => {
          expect(screen.getByText('Uploading... 75%')).toBeInTheDocument();
        });
      }

      // Complete the upload
      if (loadHandler) {
        (loadHandler as Function)({});
      }
    });

    it('handles XMLHttpRequest network errors during upload', async () => {
      let errorHandler: ((e: any) => void) | null = null;

      // Mock XMLHttpRequest with error
      const mockXHR = {
        open: vi.fn(),
        send: vi.fn(),
        setRequestHeader: vi.fn(),
        addEventListener: vi.fn((event: string, handler: any) => {
          if (event === 'error') {
            errorHandler = handler;
          }
        }),
        upload: {
          addEventListener: vi.fn(),
        },
        status: 0,
        responseText: '',
      };

      (global as any).XMLHttpRequest = vi.fn(() => mockXHR);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = createMockFile('xhr-error-test.pdf', 2000000, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        const uploadButton = screen.getByRole('button', { name: 'Upload Transcript' });
        expect(uploadButton).not.toBeDisabled();
        fireEvent.click(uploadButton);
      });

      // Simulate network error
      if (errorHandler) {
        (errorHandler as Function)({});
      }

      await waitFor(() => {
        expect(screen.getByText('Network error occurred during upload.')).toBeInTheDocument();
      });
    });
  });

  describe('Toast Notifications and Duplicate Prevention', () => {
    it('prevents duplicate toast messages from being shown', async () => {
      const { toast } = await import('react-toastify');
      const mockToastSuccess = vi.fn();
      (toast.success as any) = mockToastSuccess;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          hasTranscript: true,
          fileName: 'toast-test.pdf',
          fileSize: 1024000,
          uploadDate: '2024-01-01T12:00:00Z',
          contentType: 'application/pdf',
        }),
      });

      // Mock successful preview download
      mockFetch.mockResolvedValue({
        ok: true,
        blob: async () => new Blob(['mock pdf content'], { type: 'application/pdf' }),
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Preview/i })).toBeInTheDocument();
      });

      const previewButton = screen.getByRole('button', { name: /Preview/i });
      
      // Click preview multiple times rapidly
      fireEvent.click(previewButton);
      fireEvent.click(previewButton);
      fireEvent.click(previewButton);

      await waitFor(() => {
        expect(screen.getByText('Current Transcript Preview')).toBeInTheDocument();
      });

      // Should only show one success toast message despite multiple clicks
      expect(mockToastSuccess).toHaveBeenCalledTimes(1);
      expect(mockToastSuccess).toHaveBeenCalledWith('Preview loaded successfully');
    });

    it('shows success and error toast messages appropriately', async () => {
      const { showToastSuccess } = await import('../../../utility/confirmation/toastConfirmation');
      const { showToastConfirmation } = await import('../../../utility/confirmation/toastConfirmation');
      (showToastConfirmation as any).mockResolvedValue(true);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          hasTranscript: true,
          fileName: 'toast-messages-test.pdf',
          fileSize: 1024000,
          uploadDate: '2024-01-01T12:00:00Z',
          contentType: 'application/pdf',
        }),
      });

      // Mock successful delete
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        // Verify success toast was called
        expect(showToastSuccess).toHaveBeenCalledWith('Transcript deleted successfully!');
      });

      // Now test error toast by mocking a failed preview
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Try to trigger an error condition (this should be handled gracefully)
      await waitFor(() => {
        // Component should still be rendered even if there was an error
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
      });
    });
  });

  describe('HTTP Special Status Code Handling', () => {
    it('handles 401 Unauthorized session expiry during upload', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = createMockFile('session-expired.pdf', 2000000, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        const uploadButton = screen.getByRole('button', { name: 'Upload Transcript' });
        expect(uploadButton).not.toBeDisabled();
      });

      // Mock 401 Unauthorized response for upload
      let loadHandler: ((e: any) => void) | null = null;
      const mockXHR = {
        open: vi.fn(),
        send: vi.fn(),
        setRequestHeader: vi.fn(),
        addEventListener: vi.fn((event: string, handler: any) => {
          if (event === 'load') {
            loadHandler = handler;
          }
        }),
        upload: {
          addEventListener: vi.fn(),
        },
        status: 401,
        responseText: '{"error": "Session expired"}',
      };

      (global as any).XMLHttpRequest = vi.fn(() => mockXHR);

      const uploadButton = screen.getByRole('button', { name: 'Upload Transcript' });
      fireEvent.click(uploadButton);

      // Simulate 401 response
      if (loadHandler) {
        (loadHandler as any)({});
      }

      await waitFor(() => {
        // Check for a generic error message that might be displayed
        const errorElements = screen.getAllByText(/Session expired|Unauthorized|Authentication/i);
        expect(errorElements.length).toBeGreaterThan(0);
      });
    });

    it('handles 413 Payload Too Large server-side file size rejection', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = createMockFile('server-size-reject.pdf', 4000000, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        const uploadButton = screen.getByRole('button', { name: 'Upload Transcript' });
        expect(uploadButton).not.toBeDisabled();
      });

      // Mock 413 Payload Too Large response
      let loadHandler: ((e: any) => void) | null = null;
      const mockXHR = {
        open: vi.fn(),
        send: vi.fn(),
        setRequestHeader: vi.fn(),
        addEventListener: vi.fn((event: string, handler: any) => {
          if (event === 'load') {
            loadHandler = handler;
          }
        }),
        upload: {
          addEventListener: vi.fn(),
        },
        status: 413,
        responseText: '{"error": "File too large"}',
      };

      (global as any).XMLHttpRequest = vi.fn(() => mockXHR);

      const uploadButton = screen.getByRole('button', { name: 'Upload Transcript' });
      fireEvent.click(uploadButton);

      // Simulate 413 response
      if (loadHandler) {
        (loadHandler as any)({});
      }

      await waitFor(() => {
        expect(screen.getByText('File too large')).toBeInTheDocument();
      });
    });

    it('handles 429 Too Many Requests rate limiting', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      renderWithRouter(<TranscriptUploadPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = createMockFile('rate-limited.pdf', 2000000, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        const uploadButton = screen.getByRole('button', { name: 'Upload Transcript' });
        expect(uploadButton).not.toBeDisabled();
      });

      // Mock 429 Too Many Requests response
      let loadHandler: ((e: any) => void) | null = null;
      const mockXHR = {
        open: vi.fn(),
        send: vi.fn(),
        setRequestHeader: vi.fn(),
        addEventListener: vi.fn((event: string, handler: any) => {
          if (event === 'load') {
            loadHandler = handler;
          }
        }),
        upload: {
          addEventListener: vi.fn(),
        },
        status: 429,
        responseText: '{"error": "Too many requests"}',
      };

      (global as any).XMLHttpRequest = vi.fn(() => mockXHR);

      const uploadButton = screen.getByRole('button', { name: 'Upload Transcript' });
      fireEvent.click(uploadButton);

      // Simulate 429 response
      if (loadHandler) {
        (loadHandler as any)({});
      }

      await waitFor(() => {
        expect(screen.getByText('Too many requests')).toBeInTheDocument();
      });
    });
  });

  describe('Special Filename Handling', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });
      renderWithRouter(<TranscriptUploadPage />);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upload Transcript' })).toBeInTheDocument();
      });
    });

    it('handles files with special characters in filename', async () => {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const specialCharFile = createMockFile("test'file\"with%special&chars.pdf", 2000000, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [specialCharFile] } });

      await waitFor(() => {
        // The component validates filename and shows error for special characters
        expect(screen.getByText('File name contains invalid characters. Please rename your file and try again.')).toBeInTheDocument();
      });

      // Verify upload button is disabled due to invalid filename
      const uploadButton = screen.getByRole('button', { name: 'Upload Transcript' });
      expect(uploadButton).toBeDisabled();
    });

    it('handles extremely long filename (255 characters)', async () => {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      // Create a 255-character filename (251 chars + ".pdf")
      const longName = 'a'.repeat(251) + '.pdf';
      const longNameFile = createMockFile(longName, 2000000, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [longNameFile] } });

      await waitFor(() => {
        // The component validates filename length and shows error for long names
        expect(screen.getByText('File name is too long. Please use a shorter name (max 100 characters).')).toBeInTheDocument();
      });

      // Verify upload button is disabled due to long filename
      const uploadButton = screen.getByRole('button', { name: 'Upload Transcript' });
      expect(uploadButton).toBeDisabled();
    });
  });
});
