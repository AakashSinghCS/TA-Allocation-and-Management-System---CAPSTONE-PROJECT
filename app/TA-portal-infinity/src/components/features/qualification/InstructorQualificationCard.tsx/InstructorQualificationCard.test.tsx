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
/>)

vi.mock('../../../../api/instructor/fetchCreateQualification', () => ({
  fetchCreateQualification: vi.fn(),
}));

vi.mock('../../../../api/instructor/fetchDeleteQualification', () => ({
  fetchDeleteQualification: vi.fn(),
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
    vi.spyOn(window, "confirm").mockReturnValue(true)
    vi.spyOn(window, "prompt").mockReturnValue("DELETE")
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the list of initial qualifications', () => {
    renderer();

    for (const qual of mockQualificationCOSC111) {
      expect(screen.getByText(qual.description ?? "")).toBeInTheDocument();
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
      expect(screen.getByText('can juggle flaming torches')).toBeInTheDocument();
    });
  });


  it('handles deletion of existing qualification', async () => {
    renderer();

    // let window.confirm return true
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    // mock the delete call to succeed
    (fetchDeleteQualification as unknown as Mock).mockResolvedValueOnce(true);

    const deleteBtn = screen.getAllByRole('button', { name: /delete/i })[0];
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(
        screen.queryByText(mockQualificationCOSC111[0].description ?? '')
      ).not.toBeInTheDocument();
    });
  });

  it('cancels edit row when closing editor', () => {
    renderer();

    fireEvent.click(screen.getByRole('button', { name: /add a qualification/i }));
    const closeBtn = screen.getByRole('button', { name: /✕/ });
    fireEvent.click(closeBtn);

    expect(screen.queryByPlaceholderText(/enter qualification/i)).not.toBeInTheDocument();
  });


});
