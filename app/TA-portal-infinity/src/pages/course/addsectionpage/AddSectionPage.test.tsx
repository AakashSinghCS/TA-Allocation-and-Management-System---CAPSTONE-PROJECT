import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AddSectionPage from './AddSectionPage';

// ---------- ROUTER mock ----------
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

// ---------- API mocks ----------
const mockCreateCourse = vi.fn();
vi.mock('../../../api/course/fetchCreateCourse', () => ({
  fetchCreateCourse: (...args: any[]) => mockCreateCourse(...args),
}));

const mockCreateSection = vi.fn();
vi.mock('../../../api/section/fetchCreateSection', () => ({
  fetchCreateSection: (...args: any[]) => mockCreateSection(...args),
}));

// ---------- UI stubs ----------
/** Replace CreateSectionForm with two buttons that directly call onCreateSection */
vi.mock(
  '../../../components/features/course/createsectionform/CreateSectionForm',
  () => ({
    __esModule: true,
    default: ({ onCreateSection }: any) => (
      <div>
        {/* “submit” a *course* */}
        <button
          data-testid="btn-course"
          onClick={() =>
            onCreateSection({
              isCourse: true,
              deptCode: 'COSC',
              name: 'Security',
              courseNum: '430',
            })
          }
        >
          add-course
        </button>

        {/* “submit” a *section* */}
        <button
          data-testid="btn-section"
          onClick={() =>
            onCreateSection({
              isCourse: false,
              deptCode: 'COSC',
              name: 'Security',
              courseNum: '430',
              section: '001',
              type: 'LECTURE',
              year: 2025,
              semester: 'W1',
              sectionSchedules: [],
              instructorId: 7,
            })
          }
        >
          add-section
        </button>
      </div>
    ),
  }),
);

/** CSV upload is irrelevant for this test */
vi.mock('../../../components/features/csv/csvupload/CsvUpload', () => ({
  __esModule: true,
  default: () => <div data-testid="csv-upload" />,
}));

// silence alert pop-ups
vi.spyOn(window, 'alert').mockImplementation(() => {});

describe('<AddSectionPage />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateCourse.mockResolvedValue(true);
    mockCreateSection.mockResolvedValue(true);
  });

  it('creates a *course* then navigates', async () => {
    render(
      <MemoryRouter>
        <AddSectionPage />
      </MemoryRouter>,
    );

    // Click the "Create Course" tab to switch to course mode
    const courseTab = screen.getByText('Create Course');
    fireEvent.click(courseTab);

    // Click the mocked submit button for course creation
    const submitButton = screen.getByText('add-course');
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(mockCreateCourse).toHaveBeenCalledWith({
        deptCode: 'COSC',
        name: 'Security',
        courseNum: '430',
      }),
    );
  });

  it('creates a *section* then navigates', async () => {
    render(
      <MemoryRouter>
        <AddSectionPage />
      </MemoryRouter>,
    );

    // Click the "Create Section" tab to switch to section mode
    const sectionTab = screen.getByText('Create Section');
    fireEvent.click(sectionTab);

    // Click the mocked submit button for section creation
    const submitButton = screen.getByText('add-section');
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(mockCreateSection).toHaveBeenCalledWith({
        deptCode: 'COSC',
        courseNum: '430',
        section: '001',
        type: 'LECTURE',
        year: 2025,
        semester: 'W1',
        sectionSchedules: [],
        instructorId: 7,
      })
    );
  });
});
