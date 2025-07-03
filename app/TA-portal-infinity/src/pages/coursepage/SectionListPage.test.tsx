// SectionListPage.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SectionListPage from './SectionListPage';

// ------------- quick section factory -------------
const makeSection = (id: number) => ({
  id,
  sectionDetails: {
    sectionId: id,
    deptCode: 'COSC',
    courseNum: '101',
    name: `Intro ${id}`,
  },
});

// ------------- DATA-LAYER MOCKS ------------------
const mockFetchFiltered = vi.fn();
vi.mock('../../api/sectionfilter/fetchFilteredSections', () => ({
  fetchFilteredSections: (...args: any[]) => mockFetchFiltered(...args),
}));

vi.mock(
  '../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections',
  () => ({
    convertFilterSectionsToSections: (raw: any) => raw, // identity for test
  }),
);

const mockDelSection = vi.fn();
vi.mock('../../api/section/fetchDeleteSection', () => ({
  fetchDeleteSection: (...args: any[]) => mockDelSection(...args),
}));

const mockDelCourse = vi.fn();
vi.mock('../../api/course/fetchDeleteCourse', () => ({
  fetchDeleteCourse: (...args: any[]) => mockDelCourse(...args),
}));

// ------------- ROUTER HELPER MOCK ----------------
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ------------- UI CHILD STUBS --------------------
// 1. SectionFilter – exposes a button that triggers onFilterChange
vi.mock(
  '../../components/features/course/coursefilter/SectionFilter',
  () => ({
    __esModule: true,
    default: ({ onFilterChange }: any) => (
      <button
        data-testid="run-filter"
        onClick={() => onFilterChange({} as any)}
      >
        run-filter
      </button>
    ),
  }),
);

// 2. SectionList – shows the sections and a delete button per section
vi.mock(
  '../../components/features/course/sectionlist/SectionList',
  () => ({
    __esModule: true,
    default: ({ sections = [], onDeleted }: any) => (
      <div data-testid="section-list">
        {sections.map((sec: any) => (
          <div key={sec.id}>
            <span>{`${sec.sectionDetails.deptCode} ${sec.sectionDetails.courseNum}`}</span>
            <button
              data-testid={`del-${sec.id}`}
              onClick={() => onDeleted(sec.id, /* isCourse = */ true)}
            >
              delete
            </button>
          </div>
        ))}
      </div>
    ),
  }),
);

// ------------- TESTS -----------------------------
describe('<SectionListPage />', () => {
  const s1 = makeSection(1);

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchFiltered.mockResolvedValue([s1]); // what the filter returns
  });

  it('filters, renders result, then deletes and refreshes', async () => {
    render(
      <MemoryRouter>
        <SectionListPage />
      </MemoryRouter>,
    );

    // (1) run the filter
    fireEvent.click(screen.getByTestId('run-filter'));

    // wait for the fetched section to show up
    await waitFor(() =>
      expect(
        screen.getByText(/COSC 101/i),
      ).toBeInTheDocument(),
    );
    expect(mockFetchFiltered).toHaveBeenCalledTimes(1);

    // (2) delete that course
    mockDelCourse.mockResolvedValueOnce({}); // pretend API success
    fireEvent.click(screen.getByTestId('del-1'));

    // we refresh filters after deletion → second call
    await waitFor(() => expect(mockFetchFiltered).toHaveBeenCalledTimes(2));
    expect(mockDelCourse).toHaveBeenCalledWith(1);
  });
});
