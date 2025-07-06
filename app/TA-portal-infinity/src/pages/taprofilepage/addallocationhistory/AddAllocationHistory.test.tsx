import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AddAllocationHistory from './AddAllocationHistory';

// ---------- helpers ----------
const makeSection = (id: number) => ({
  id,
  sectionDetails: {
    sectionId: id,
    deptCode: 'COSC',
    courseNum: '101',
    name: `Intro ${id}`,
  },
});

// ---------- global mocks ----------
vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ userId: 42 }),          // pretend our student has id 42
}));

// react-router hooks
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

// data-layer mocks
const mockFetchHistory = vi.fn();
vi.mock(
  '../../../api/student/fetchStudentAllocationHistory',
  () => ({
    fetchStudentAllocationHistory: (...args: any[]) =>
      mockFetchHistory(...args),
  }),
);

const mockFetchPost = vi.fn();
vi.mock('../../../api/student/fetchPostAllocationHistory', () => ({
  fetchPostAllocationHistory: (...args: any[]) => mockFetchPost(...args),
}));

// we don’t need filtering for this minimal test, so keep them inert
vi.mock('../../../api/sectionfilter/fetchFilteredSections', () => ({
  fetchFilteredSections: vi.fn().mockResolvedValue([]),
}));
vi.mock(
  '../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections',
  () => ({
    convertFilterSectionsToSections: vi.fn().mockReturnValue([]),
  }),
);

// stub the two child presentational components so they don’t pull in extra deps
vi.mock(
  '../../../components/features/course/coursefilter/SectionFilter',
  () => ({
    __esModule: true,
    default: () => <div data-testid="section-filter" />, // renders nothing fancy
  }),
);
vi.mock(
  '../../../components/features/course/sectionlist/SectionList',
  () => ({
    __esModule: true,
    default: () => <div data-testid="section-list" />, // we’re not selecting in this test
  }),
);

// ---------- tests ----------
describe('<AddAllocationHistory />', () => {
  const initialSection = makeSection(999);

  beforeEach(() => {
    mockNavigate.mockClear();
    mockFetchPost.mockClear();
    mockFetchHistory.mockResolvedValue([initialSection]);
  });


  it('shows existing history, lets user remove it, and calls POST on save', async () => {
    render(
      <MemoryRouter>
        <AddAllocationHistory />
      </MemoryRouter>,
    );

    // 1. wait for the initial fetch to resolve and the section to appear
    await waitFor(() =>
      expect(
        screen.getByText(/COSC 101 – Intro 999/i),
      ).toBeInTheDocument(),
    );

    // 2. click “Remove”
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));

    // section should be gone from the DOM
    expect(
      screen.queryByText(/COSC 101 – Intro 999/i),
    ).not.toBeInTheDocument();

    // 3. click “Save History”
    mockFetchPost.mockResolvedValue(true); // succeed
    fireEvent.click(screen.getByRole('button', { name: /save history/i }));

    // verify POST was called with the student id and the new empty list
    await waitFor(() =>
      expect(mockFetchPost).toHaveBeenCalledWith(
        42,
        [],                     // selectedSections after removal
        [initialSection],       // initialSections
      ),
    );

    // and that we navigated away
    expect(mockNavigate).toHaveBeenCalledWith('/user/taprofile/42');
  });
});
