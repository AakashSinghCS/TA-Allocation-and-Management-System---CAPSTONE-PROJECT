import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { toast } from 'react-toastify';
import TermConfiguration from './TermConfiguration';
import { getAllSemesters } from '../../../api/semester/getAllSemesters';
import type { Semester } from '../../../interfaces/semester/Semester';

// Mock the API functions
vi.mock('../../../api/semester/getAllSemesters');
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock child components
vi.mock('./AddTermForm', () => ({
  default: ({ token, onTermAdded }: { token: string; onTermAdded: (semesters: Semester[]) => void }) => (
    <div data-testid="add-term-form">
      <button onClick={() => onTermAdded([])}>Mock Add Term</button>
    </div>
  ),
}));

vi.mock('./ExistingTermsTable', () => ({
  default: ({ 
    token, 
    semesters, 
    semestersLoading, 
    onSemestersUpdated 
  }: { 
    token: string; 
    semesters: Semester[]; 
    semestersLoading: boolean; 
    onSemestersUpdated: (semesters: Semester[]) => void;
  }) => (
    <div data-testid="existing-terms-table">
      {semestersLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <div>Semesters count: {semesters.length}</div>
          <button onClick={() => onSemestersUpdated([])}>Mock Update</button>
        </div>
      )}
    </div>
  ),
}));

const mockSemesters: Semester[] = [
  {
    id: 1,
    year: 2024,
    semester: 'W1',
    startDate: '2024-01-08',
    endDate: '2024-04-12',
    active: true,
  },
  {
    id: 2,
    year: 2024,
    semester: 'S1',
    startDate: '2024-05-06',
    endDate: '2024-08-16',
    active: false,
  },
];

describe('TermConfiguration', () => {
  const mockToken = 'test-token';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with correct title', () => {
    vi.mocked(getAllSemesters).mockResolvedValue(mockSemesters);
    
    render(<TermConfiguration token={mockToken} />);
    
    expect(screen.getByText('Term Configuration')).toBeInTheDocument();
  });

  it('renders AddTermForm and ExistingTermsTable components', () => {
    vi.mocked(getAllSemesters).mockResolvedValue(mockSemesters);
    
    render(<TermConfiguration token={mockToken} />);
    
    expect(screen.getByTestId('add-term-form')).toBeInTheDocument();
    expect(screen.getByTestId('existing-terms-table')).toBeInTheDocument();
  });

  it('loads semesters on mount', async () => {
    vi.mocked(getAllSemesters).mockResolvedValue(mockSemesters);
    
    render(<TermConfiguration token={mockToken} />);
    
    await waitFor(() => {
      expect(getAllSemesters).toHaveBeenCalledWith(mockToken);
    });
  });

  it('displays loading state initially', () => {
    vi.mocked(getAllSemesters).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<TermConfiguration token={mockToken} />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays semester count after loading', async () => {
    vi.mocked(getAllSemesters).mockResolvedValue(mockSemesters);
    
    render(<TermConfiguration token={mockToken} />);
    
    await waitFor(() => {
      expect(screen.getByText(`Semesters count: ${mockSemesters.length}`)).toBeInTheDocument();
    });
  });

  it('handles API error with 404 status', async () => {
    const error = {
      response: {
        status: 404,
        data: 'Not found',
      },
    };
    vi.mocked(getAllSemesters).mockRejectedValue(error);
    
    render(<TermConfiguration token={mockToken} />);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('No semesters found.');
    });
  });

  it('handles API error with 500 status', async () => {
    const error = {
      response: {
        status: 500,
        data: 'Server error',
      },
    };
    vi.mocked(getAllSemesters).mockRejectedValue(error);
    
    render(<TermConfiguration token={mockToken} />);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server error while loading semesters. Please try again later.');
    });
  });

  it('handles network error', async () => {
    const error = {
      request: {},
      message: 'Network Error',
    };
    vi.mocked(getAllSemesters).mockRejectedValue(error);
    
    render(<TermConfiguration token={mockToken} />);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error. Please check your connection and try again.');
    });
  });

  it('handles general error', async () => {
    const error = new Error('General error');
    vi.mocked(getAllSemesters).mockRejectedValue(error);
    
    render(<TermConfiguration token={mockToken} />);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load semesters');
    });
  });

  it('does not load semesters if token is empty', () => {
    vi.mocked(getAllSemesters).mockResolvedValue(mockSemesters);
    
    render(<TermConfiguration token="" />);
    
    expect(getAllSemesters).not.toHaveBeenCalled();
  });

  it('handles semester update from AddTermForm', async () => {
    vi.mocked(getAllSemesters).mockResolvedValue(mockSemesters);
    
    render(<TermConfiguration token={mockToken} />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText(`Semesters count: ${mockSemesters.length}`)).toBeInTheDocument();
    });
    
    // Simulate term added
    const addButton = screen.getByText('Mock Add Term');
    addButton.click();
    
    await waitFor(() => {
      expect(screen.getByText('Semesters count: 0')).toBeInTheDocument();
    });
  });

  it('handles semester update from ExistingTermsTable', async () => {
    vi.mocked(getAllSemesters).mockResolvedValue(mockSemesters);
    
    render(<TermConfiguration token={mockToken} />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText(`Semesters count: ${mockSemesters.length}`)).toBeInTheDocument();
    });
    
    // Simulate semester updated
    const updateButton = screen.getByText('Mock Update');
    updateButton.click();
    
    await waitFor(() => {
      expect(screen.getByText('Semesters count: 0')).toBeInTheDocument();
    });
  });

  it('passes correct props to child components', async () => {
    vi.mocked(getAllSemesters).mockResolvedValue(mockSemesters);
    
    render(<TermConfiguration token={mockToken} />);
    
    await waitFor(() => {
      // Verify AddTermForm receives token
      expect(screen.getByTestId('add-term-form')).toBeInTheDocument();
      
      // Verify ExistingTermsTable receives all required props
      expect(screen.getByTestId('existing-terms-table')).toBeInTheDocument();
      expect(screen.getByText(`Semesters count: ${mockSemesters.length}`)).toBeInTheDocument();
    });
  });
});
