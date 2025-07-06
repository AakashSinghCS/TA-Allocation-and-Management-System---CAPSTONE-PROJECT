import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type Section from '../../../../interfaces/section/Section';
import InstructorAddNeedPage from './InstructorAddNeedPage';

// --- Mocks ---

// react-router hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = (await vi.importActual('react-router-dom')) as any;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ sectionId: '99' }),
    Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  };
});

// API calls
const mockFetchSection = vi.fn();
const mockFetchFiltered = vi.fn();
const mockConvert = vi.fn();
const mockFetchAddNeed = vi.fn();

vi.mock('../../../../api/section/fetchSection', () => ({
  fetchSection: (...args: any[]) => mockFetchSection(...args),
}));
vi.mock('../../../../api/sectionfilter/fetchFilteredSections', () => ({
  fetchFilteredSections: (...args: any[]) => mockFetchFiltered(...args),
}));
vi.mock('../../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections', () => ({
  convertFilterSectionsToSections: (...args: any[]) => mockConvert(...args),
}));
vi.mock('../../../../api/need/fetchAddNeed', () => ({
  fetchAddNeed: (...args: any[]) => mockFetchAddNeed(...args),
}));

// SectionFilter stub
vi.mock('../../../../components/features/course/coursefilter/SectionFilter', () => ({
  default: ({ onFilterChange }: { onFilterChange: Function }) => (
    <button data-testid="filter-btn" onClick={() => onFilterChange({ dummy: true })}>
      Filter
    </button>
  ),
}));

// SectionList stub
vi.mock('../../../../components/features/course/sectionlist/SectionList', () => ({
  default: ({
    sections,
    onSelectCourse,
  }: {
    sections: Section[] | null;
    onSelectCourse: (id: number, dept: string, num: string, name: string) => void;
  }) => (
    <div data-testid="section-list">
      {sections?.map((s) => (
        <button
          key={s.sectionDetails?.sectionId}
          data-testid={`select-course-${s.sectionDetails?.sectionId}`}
          onClick={() =>
            onSelectCourse(
              s.sectionDetails!.id!,
              s.sectionDetails!.deptCode!,
              s.sectionDetails!.courseNum!,
              s.sectionDetails!.name!
            )
          }
        >
          Add {s.sectionDetails?.deptCode}{s.sectionDetails?.courseNum}
        </button>
      ))}
    </div>
  ),
}));

describe('<InstructorAddNeedPage />', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Mock initial fetchSection
    mockFetchSection.mockResolvedValue({
      sectionDetails: { id: 99, deptCode: 'CS', courseNum: '101', name: 'Intro', sectionId: 1 },
    });

    // Mock filtering
    mockFetchFiltered.mockResolvedValue([
      { sectionDetails: { id: 88, deptCode: 'MATH', courseNum: '125', name: 'Calc', sectionId: 2 } },
    ]);
    mockConvert.mockReturnValue([
      { sectionDetails: { id: 88, deptCode: 'MATH', courseNum: '125', name: 'Calc', sectionId: 2 } },
    ]);

    // Mock addNeed success
    mockFetchAddNeed.mockResolvedValue(true);
  });

it('loads section, filters courses, selects prereq and submits', async () => {
  render(
    <MemoryRouter>
      <InstructorAddNeedPage />
    </MemoryRouter>
  );

  // initial header
  expect(await screen.findByText(/CS 101 – Intro/i)).toBeInTheDocument();

  // trigger the filter and pick a prereq
  fireEvent.click(screen.getByTestId('filter-btn'));
  expect(await screen.findByTestId('section-list')).toBeInTheDocument();
  expect(mockFetchFiltered).toHaveBeenCalledWith({ dummy: true });
  fireEvent.click(screen.getByTestId('select-course-2'));
  expect(screen.getByText(/MATH 125 – Calc/i)).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/Additional Comments/i), {
    target: { value: 'Please comment' },
  });
  fireEvent.change(screen.getByLabelText(/Required Grading Hours/i), {
    target: { value: '5' },
  });

  fireEvent.click(screen.getByRole('button', { name: /Save Need/i }));

  await waitFor(() => {
    expect(mockFetchAddNeed).toHaveBeenCalled();
    expect(mockFetchAddNeed).toHaveBeenCalledWith(
      expect.objectContaining({
        section: {
          sectionDetails: {
            id: 99,
            deptCode: 'CS',
            courseNum: '101',
            name: 'Intro',
            sectionId: 1,
          },
        },
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
});
