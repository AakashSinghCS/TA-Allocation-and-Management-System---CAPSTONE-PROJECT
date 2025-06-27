import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TAAllocationPage from './AllocationPage';
import { AuthContext } from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { UserRole } from '../../interfaces/enum/UserRole';

// Mocking global fetch function
window.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      sections: [
        { sectionId: '1', department: 'COSC', courseNumber: '111', section: '001', term: 'Winter 2023' },
        { sectionId: '2', department: 'COSC', courseNumber: '121', section: '001', term: '2023W1' },
        { sectionId: '3', department: 'MATH', courseNumber: '125', section: '001', term: 'Winter 2023' }
      ],
      selectedCourseDetails: {
        gradingNeed: 'Grading Need Details',
        requiredHours: 10
      },
    }),
  })
) as unknown as typeof fetch;

const mockContext = {
  token: 'test-token',
  userId: 123,
  userRoles: [UserRole.STUDENT],
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: true
};

const renderWithProviders = () =>
  render(
    <AuthContext.Provider value={mockContext}>
      <MemoryRouter>
        <TAAllocationPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe('TAAllocationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the course filter panel', () => {
    renderWithProviders();
    expect(screen.getByText(/Course Filter/)).toBeInTheDocument();
  });

  it('displays mock sections correctly', () => {
    renderWithProviders();
    const sectionButtons = screen.getAllByText(/Winter 2023/);
    expect(sectionButtons).toHaveLength(3);
    expect(sectionButtons[0]).toHaveTextContent('COSC 111 • 001 • Winter 2023');
    expect(sectionButtons[1]).toHaveTextContent('COSC 121 • 001 • 2023W1');
    expect(sectionButtons[2]).toHaveTextContent('MATH 125 • 001 • Winter 2023');
  });

  it('filters courses based on search input', async () => {
    renderWithProviders();
    const searchInput = screen.getByPlaceholderText('Search…');
    fireEvent.change(searchInput, { target: { value: 'COSC 111' } });

    const sectionButtons = screen.getAllByText(/Winter 2023/);
    expect(sectionButtons).toHaveLength(1);  // Only COSC 111 should be visible
    expect(sectionButtons[0]).toHaveTextContent('COSC 111 • 001 • Winter 2023');
  });

  it('selecting a course displays its details', async () => {
    renderWithProviders();
    fireEvent.click(screen.getByText('COSC 111 • 001 • Winter 2023'));
    
    await waitFor(() => {
      expect(screen.getByText('Grading Need')).toBeInTheDocument();
      expect(screen.getByText('Required Hours:')).toBeInTheDocument();
    });
  });

  it('handles course selection and displays relevant details', async () => {
    renderWithProviders();
    fireEvent.click(screen.getByText('COSC 111 • 001 • Winter 2023'));

    await waitFor(() => {
      expect(screen.getByText('Grading Need Details')).toBeInTheDocument();
      expect(screen.getByText('Required Hours: 10')).toBeInTheDocument();
    });
  });
});
