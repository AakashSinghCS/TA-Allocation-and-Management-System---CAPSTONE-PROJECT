import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createRef } from 'react';
import ApplicationForm from './ApplicationForm';
import { AuthContext } from '../../../context/AuthContext';
import { UserRole } from '../../../interfaces/enum/UserRole';

// Mock FullCalendar
vi.mock('@fullcalendar/react', () => ({
  default: vi.fn(() => <div data-testid="full-calendar">Calendar</div>)
}));

const mockAuthContext = {
  token: 'test-token',
  userId: 123,
  userRoles: [UserRole.STUDENT],
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: true
};

describe('ApplicationForm', () => {
  const mockCalendarRef = createRef<any>();
  const mockHandleSubmit = vi.fn();
  
  const defaultProps = {
    selectedTerms: ['2025-Summer'],
    existingTerms: new Set(['2025-Summer']),
    termFormsData: { '2025-Summer': { firstPreference: '', secondPreference: '', thirdPreference: '', wantWorkingHours: '', wantRemote: '', confirmProfileUpdated: false, applicationType: '' } },
    errors: {},
    activeFormTab: '2025-Summer',
    availability: [],
    calendarRef: mockCalendarRef,
    handleTermSelection: vi.fn(),
    handleChange: vi.fn(),
    handleDateSelect: vi.fn(),
    handleEventClick: vi.fn(),
    handleSubmit: mockHandleSubmit,
    getTermFormData: vi.fn(() => ({ firstPreference: '', secondPreference: '', thirdPreference: '', wantWorkingHours: '', wantRemote: '', confirmProfileUpdated: false, applicationType: '' })),
    setActiveFormTab: vi.fn(),
  };

  const renderWithProvider = (props = defaultProps) =>
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ApplicationForm {...props} />
      </AuthContext.Provider>
    );

  it('renders term selector and submit button', () => {
    renderWithProvider();
    // The pages ApplicationForm doesn't show "Select Terms to Apply For" - that's in ApplicationPage
    // Check for loading state or form fields instead
    expect(screen.getByText(/Loading available terms/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Update Application/i })).toBeInTheDocument();
  });

  it('shows error message when errors.general is set', () => {
    renderWithProvider({ ...defaultProps, errors: { general: 'Test error' } });
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('calls handleSubmit on form submit', () => {
    renderWithProvider();
    // Find the form by its tag name and submit it
    const form = screen.getByRole('button', { name: /Update Application/i }).closest('form');
    expect(form).toBeInTheDocument();
    fireEvent.submit(form!);
    // Verify the form submission was triggered
    expect(mockHandleSubmit).toHaveBeenCalled();
  });
});
