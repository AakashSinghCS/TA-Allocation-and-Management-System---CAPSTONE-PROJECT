import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import InstructorAddSectionPage from './InstructorAddSectionPage';
import type Section from '../../../../interfaces/section/Section';
import { describe, it, expect, vi, beforeEach } from 'vitest';


const mockFetchFiltered = vi.fn();
const mockConvert = vi.fn();
const mockAssign = vi.fn();

// stub out react-router hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = (await vi.importActual('react-router-dom')) as any;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({}), // no params for 'add' mode
  };
});

// mock your API modules
vi.mock('../../../../api/sectionfilter/fetchFilteredSections', () => ({
  fetchFilteredSections: (...args: any[]) => mockFetchFiltered(...args),
}));
vi.mock('../../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections', () => ({
  convertFilterSectionsToSections: (...args: any[]) => mockConvert(...args),
}));
vi.mock('../../../../api/section/instructor/fetchAssignInstructor', () => ({
  fetchAssignInstructor: (...args: any[]) => mockAssign(...args),
}));

// mock AuthContext
vi.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({ userId: 123 }),
}));

// mock SectionFilter to trigger onFilterChange
vi.mock('../../../../components/features/course/coursefilter/SectionFilter', () => ({
  default: ({ onFilterChange }: { onFilterChange: Function }) => (
    <button data-testid="filter-btn" onClick={() => onFilterChange({ foo: 'bar' })}>
      Apply Filter
    </button>
  ),
}));

// mock SectionList to render buttons for onSelect
vi.mock('../../../../components/features/course/sectionlist/SectionList', () => ({
  default: ({
    sections,
    onSelect,
  }: {
    sections: Section[] | null;
    onSelect: (s: Section) => void;
  }) => (
    <div data-testid="section-list">
      {sections?.map((s) => (
        <button
          key={s?.id}
          data-testid={`select-${s?.id}`}
          onClick={() => onSelect(s)}
        >
          Select {s?.id}
        </button>
      ))}
    </div>
  ),
}));

describe('<InstructorAddSectionPage /> (add mode)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // prepare fetchFilteredSections -> raw data
    mockFetchFiltered.mockResolvedValue([{ sectionDetails: { sectionId: 42 } }]);
    // convert -> typed Section[]
    mockConvert.mockReturnValue([{ sectionDetails: { sectionId: 42 } }]);
    // assign -> success
    mockAssign.mockResolvedValue(true);
  });

  it('applies filter, displays sections, and assigns on select', async () => {
    render(
      <MemoryRouter>
        <InstructorAddSectionPage />
      </MemoryRouter>
    );

    // click the filter button
    fireEvent.click(screen.getByTestId('filter-btn'));
    // wait for SectionList to appear
    const list = await screen.findByTestId('section-list');
    expect(list).toBeInTheDocument();

    // ensure fetchFilteredSections was called with the dummy filter
    expect(mockFetchFiltered).toHaveBeenCalledWith({ foo: 'bar' });

    // now click the "Select 42" button
    fireEvent.click(screen.getByTestId('select-42'));

    // wait for the assign call
    await waitFor(() => {
      expect(mockAssign).toHaveBeenCalledWith(123, 42);
      // navigate to the instructor profile need page
      expect(mockNavigate).toHaveBeenCalledWith('/user/instructorprofile/123/need');
    });
  });
});
