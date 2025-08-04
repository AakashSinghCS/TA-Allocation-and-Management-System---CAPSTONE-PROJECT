import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import InstructorAddSectionPage from './InstructorAddSectionPage';
import type Section from '../../../../../interfaces/section/Section';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockUseSectionSearchPage = vi.fn();
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

// mock the SectionSearchPage hook
vi.mock('../../../../../api/course/sectionfilter/useSectionFilter', () => ({
  useSectionSearchPage: (filters: any, page: number, size: number) => {
    mockUseSectionSearchPage(filters, page, size);
    return {
      data: { content: [{ id: 42 }] },
      isFetching: false,
      isError: false,
      error: null,
    };
  },
}));

// mock conversion util
vi.mock('../../../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections', () => ({
  convertFilterSectionsToSections: (...args: any[]) => mockConvert(...args),
}));

// mock assign API
vi.mock('../../../../../api/section/instructor/fetchAssignInstructor', () => ({
  fetchAssignInstructor: (...args: any[]) => mockAssign(...args),
}));

// mock AuthContext
vi.mock('../../../../../context/AuthContext', () => ({
  useAuth: () => ({ userId: 123 }),
}));

// mock SectionFilter to trigger onFilterChange
vi.mock('../../../../../components/features/course/coursefilter/SectionFilter', () => ({
  default: ({ onFilterChange }: { onFilterChange: Function }) => (
    <button data-testid="filter-btn" onClick={() => onFilterChange({ foo: 'bar' })}>
      Apply Filter
    </button>
  ),
}));

// mock SectionList to render select buttons
vi.mock('../../../../../components/features/course/sectionlist/SectionList', () => ({
  default: ({ sections, onSelect }: { sections: Section[] | null; onSelect: (s: Section) => void }) => (
    <div data-testid="section-list">
      {sections?.map((s) => (
        <button key={s.id} data-testid={`select-${s.id}`} onClick={() => onSelect(s)}>
          Select {s.id}
        </button>
      ))}
    </div>
  ),
}));

describe('<InstructorAddSectionPage /> (add mode)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockConvert.mockReturnValue([{ id: 42 }]);
    mockAssign.mockResolvedValue(true);
  });

  it('applies filter, displays sections, and assigns on select', async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <InstructorAddSectionPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByTestId('filter-btn'));

    const list = await screen.findByTestId('section-list');
    expect(list).toBeInTheDocument();

    await waitFor(() => {
      expect(mockUseSectionSearchPage).toHaveBeenCalledWith({ foo: 'bar' }, 0, 10);
    });

    fireEvent.click(screen.getByTestId('select-42'));

    await waitFor(() => {
      expect(mockAssign).toHaveBeenCalledWith(123, 42);
      expect(mockNavigate).toHaveBeenCalledWith('/user/instructorprofile/123/need');
    });
  });
});
