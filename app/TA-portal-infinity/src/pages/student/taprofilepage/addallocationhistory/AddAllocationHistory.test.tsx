import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AddAllocationHistory from './AddAllocationHistory';

// ---------- helpers ----------
const makeSection = (id: number) => ({
  id,
  course: {
    id,
    deptCode: 'COSC',
    courseNum: '101',
    name: `Intro ${id}`,
  },
});

// ---------- global mocks ----------
vi.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({ userId: 42 }),
}));

// react-router hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// data-layer mocks
const mockFetchHistory = vi.fn();
vi.mock(
  '../../../../api/student/allocation/fetchStudentAllocationHistory',
  () => ({
    fetchStudentAllocationHistory: (...args: any[]) =>
      mockFetchHistory(...args),
  }),
);

const mockFetchPost = vi.fn();
vi.mock('../../../../api/student/allocation/fetchPostAllocationHistory', () => ({
  fetchPostAllocationHistory: (...args: any[]) => mockFetchPost(...args),
}));

// Section search hook (new)
const mockUseSectionSearchPage = vi.fn();
vi.mock(
  '../../../../api/course/sectionfilter/useSectionFilter',
  () => ({
    useSectionSearchPage: (...args: any[]) => mockUseSectionSearchPage(...args),
  }),
);

// We still don't care about actual filtering/sections list rendering in this test
vi.mock(
  '../../../../components/features/course/coursefilter/SectionFilter',
  () => ({
    __esModule: true,
    default: () => <div data-testid="section-filter" />,
  }),
);
vi.mock(
  '../../../../components/features/course/sectionlist/SectionList',
  () => ({
    __esModule: true,
    default: () => <div data-testid="section-list" />,
  }),
);

// Optional UI bits
vi.mock(
  '../../../../components/ui/statusindicator/StatusIndicator',
  () => ({
    __esModule: true,
    StatusIndicator: ({ loading }: { loading: boolean }) =>
      loading ? <div data-testid="loading" /> : null,
  }),
);
vi.mock(
  '../../../../utility/pagination/pagination/Pagination',
  () => ({
    __esModule: true,
    default: () => <div data-testid="pagination" />,
  }),
);
vi.mock(
  '../../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections',
  () => ({
    convertFilterSectionsToSections: vi.fn().mockReturnValue([]),
  }),
);

// ---------- tests ----------
describe('<AddAllocationHistory />', () => {
  const initialSection = makeSection(999);

  beforeEach(() => {
    mockNavigate.mockClear();
    mockFetchPost.mockClear();
    mockFetchHistory.mockResolvedValue([initialSection]);

    mockUseSectionSearchPage.mockReturnValue({
      data: { content: [], totalPages: 0 },
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('shows existing history, lets user remove it, and calls POST on save', async () => {
    render(
      <MemoryRouter>
        <AddAllocationHistory />
      </MemoryRouter>,
    );

    // 1. wait for initial history to render
    await waitFor(() =>
      expect(
        screen.getByText(/COSC 101 – Intro 999/i),
      ).toBeInTheDocument(),
    );

    // 2. remove it
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(
      screen.queryByText(/COSC 101 – Intro 999/i),
    ).not.toBeInTheDocument();

    // 3. save
    mockFetchPost.mockResolvedValue(true);
    fireEvent.click(screen.getByRole('button', { name: /save history/i }));

    await waitFor(() =>
      expect(mockFetchPost).toHaveBeenCalledWith(
        42,
        [],                 // selectedSections after removal
        [initialSection],   // initialSections
      ),
    );

    expect(mockNavigate).toHaveBeenCalledWith('/user/taprofile/42/allocationHistory');
  });
});
