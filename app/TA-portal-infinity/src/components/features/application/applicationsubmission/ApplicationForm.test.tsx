import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ApplicationForm from './ApplicationForm';

// Mock useAuth for all tests
vi.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({ token: undefined, userId: undefined, userRoles: undefined }),
}));
// Mock getAllDeptCodes to return a sample subject list
vi.mock('../../../../api/course/getAllDeptCodes', () => ({
  getAllDeptCodes: vi.fn(() => Promise.resolve(['COSC', 'MATH', 'PHYS'])),
}));

// Mock fetchDeadlines 
vi.mock('../../../../api/admin/FetchDeadline', () => ({
  fetchDeadlines: vi.fn(() => Promise.resolve({ deadline: '2025-12-31T23:59:59', deadlineType: 'APPLICATION' })),
}));

// Mock getActiveSemesters
vi.mock('../../../../api/semester/getActiveSemesters', () => ({
  getActiveSemesters: vi.fn(() => Promise.resolve([
    { year: 2025, semester: 'Summer' },
    { year: 2025, semester: 'W1' }
  ])),
}));

describe('ApplicationForm', () => {
  const baseProps = {
    formData: {
      selectedTerms: ['2025-Summer'],
      firstPreference: '',
      secondPreference: '',
      thirdPreference: '',
      wantWorkingHours: '',
      wantRemote: '',
      transcriptFile: null,
      confirmProfileUpdated: false,
      applicationType: '',
    },
    errors: {},
    handleChange: vi.fn(),
    handleSubmit: vi.fn(),
    children: null,
  };

  it('renders all required fields', () => {
    render(<ApplicationForm {...baseProps} />);
    expect(screen.getByText(/Subject Preferences/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Hours Requested/i)).toBeInTheDocument();
    // Check for application type and remote work preference radio buttons
    expect(screen.getAllByLabelText(/Application Type/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/Remote Work Preference/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/I confirm that I have updated my profile/i)).toBeInTheDocument();
  });


  it('calls handleSubmit on form submit', async () => {
    render(<ApplicationForm {...baseProps} />);
    // Wait for the form to finish loading (department codes)
    await screen.findByLabelText(/1st Preference/i);
    fireEvent.submit(screen.getByRole('form'));
    expect(baseProps.handleSubmit).toHaveBeenCalled();
  });

  it('calls handleChange on input change', () => {
    render(<ApplicationForm {...baseProps} />);
    const input = screen.getByLabelText(/Hours Requested/i);
    fireEvent.change(input, { target: { value: '10' } });
    expect(baseProps.handleChange).toHaveBeenCalled();
  });
});
