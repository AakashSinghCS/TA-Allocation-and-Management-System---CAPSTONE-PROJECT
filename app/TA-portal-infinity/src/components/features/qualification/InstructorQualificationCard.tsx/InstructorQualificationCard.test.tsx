import { describe, it, expect, vi, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InstructorQualificationCard from './InstructorQualificationCard';
import { mockQualificationCOSC111 } from '../../../../mocked-objects/qualification/mockQualifications';
import { mockCourseCOSC111 } from '../../../../mocked-objects/course/mockCourseCOSC111';
import { fetchCreateQualification } from '../../../../api/instructor/fetchCreateQualification';
import { fetchDeleteQualification } from '../../../../api/instructor/fetchDeleteQualification';

const renderer = () => render(<InstructorQualificationCard
  initialQualifications={mockQualificationCOSC111}
  course={mockCourseCOSC111}
  authenticated={true}
  deadlinePassed={false}
/>)

vi.mock('../../../../api/instructor/fetchCreateQualification', () => ({
  fetchCreateQualification: vi.fn(),
}));

vi.mock('../../../../api/instructor/fetchDeleteQualification', () => ({
  fetchDeleteQualification: vi.fn(),
}));

// Mock the toast confirmation system
vi.mock('../../../../utility/confirmation/toastConfirmation', () => ({
  showToastConfirmation: vi.fn(() => Promise.resolve(true)),
  showToastSuccess: vi.fn(),
  showToastError: vi.fn(),
}));

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  },
  ToastContainer: () => null,
}));

vi.mock('../../../../utility/fallbackTempId/fallbackTempId', () => {
  let counter = 1;
  return {
    fallbackTempId: () => `temp-${counter++}`,
    toObjectWithTempId: (quals: any[]) =>
      quals.map((q) => ({ ...q, tempId: `temp-${counter++}` })),
  };
});


describe('<InstructorQualificationCard />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the list of initial qualifications', () => {
    renderer();

    for (const qual of mockQualificationCOSC111) {
      // Use partial text matching to account for bullet points
      expect(screen.getByText(new RegExp(qual.description ?? "", 'i'))).toBeInTheDocument();
    }
  });

  it('handles addition and saving of qualifications', async () => {
    (fetchCreateQualification as unknown as Mock).mockResolvedValueOnce({
      id: 99,
      description: 'can juggle flaming torches',
      deptCode: 'COSC',
    });

    renderer();

    fireEvent.click(screen.getByRole('button', { name: /add a qualification/i }));
    const input = screen.getByPlaceholderText(/enter qualification/i);
    fireEvent.change(input, { target: { value: 'can juggle flaming torches' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(fetchCreateQualification).toHaveBeenCalledWith(
        'can juggle flaming torches',
        'COSC',
        mockCourseCOSC111.id,
      );
    });

    await waitFor(() => {
      // Use partial text matching for the new qualification
      expect(screen.getByText(/can juggle flaming torches/i)).toBeInTheDocument();
    });
  });


  it('handles deletion of existing qualification', async () => {
    // Import the mock function to control its behavior
    const { showToastConfirmation } = await import('../../../../utility/confirmation/toastConfirmation');
    (showToastConfirmation as Mock).mockResolvedValueOnce(true);
    (fetchDeleteQualification as unknown as Mock).mockResolvedValueOnce(true);

    renderer();

    const deleteBtn = screen.getAllByRole('button', { name: /delete/i })[0];
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(showToastConfirmation).toHaveBeenCalledWith({
        title: "Delete Skill/Qualification",
        message: expect.stringContaining(mockQualificationCOSC111[0].description ?? ''),
        confirmText: "Delete",
        cancelText: "Cancel",
        type: "danger"
      });
    });

    await waitFor(() => {
      expect(fetchDeleteQualification).toHaveBeenCalledWith(mockQualificationCOSC111[0].id);
    });

    await waitFor(() => {
      expect(
        screen.queryByText(new RegExp(mockQualificationCOSC111[0].description ?? '', 'i'))
      ).not.toBeInTheDocument();
    });
  });

  it('cancels edit row when closing editor', () => {
    renderer();

    fireEvent.click(screen.getByRole('button', { name: /add a qualification/i }));
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(screen.queryByPlaceholderText(/enter qualification/i)).not.toBeInTheDocument();
  });


});
