import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, type Mock } from 'vitest';

import NeedViewer from './NeedViewer';
import { mockSectionCOSC111 as s111 } from '../../../../../mocked-objects/section/mockSectionCOSC111';
import { mockSectionCOSC121 as s121 } from '../../../../../mocked-objects/section/mockSectionCOSC121';
import { mockCourseCOSC111 as c111 } from '../../../../../mocked-objects/course/mockCourseCOSC111';
import { mockCourseCOSC121 as c121 } from '../../../../../mocked-objects/course/mockCourseCOSC121';
import { fetchSectionNeedAndAllocations } from '../../../../../api/instructor/fetchSectionNeedAndAllocations';
import type Section from '../../../../../interfaces/section/Section';

// Mock AuthContext to simulate an instructor
vi.mock('../../../../../context/AuthContext', () => ({
  useAuth: () => ({ userRoles: ['INSTRUCTOR'] as const }),
}));

// Mock API call for fetching section needs and allocations
vi.mock('../../../../../api/instructor/fetchSectionNeedAndAllocations', () => ({
  fetchSectionNeedAndAllocations: vi.fn(),
}));
const mockFetchSectionNeed = fetchSectionNeedAndAllocations as Mock;

const instructorId = 10;

function renderer() {
  return render(
    <MemoryRouter>
      <NeedViewer
        instructorId={instructorId}
        initial={{
          sections: [s111, s121],
          existingYears: ['2025'],
          allAssignedCourses: [c111, c121],
        }}
      />
    </MemoryRouter>
  );
}

describe('<NeedViewer />', () => {
  it('renders one SectionCard for each section', () => {
    renderer();
    expect(screen.getByTestId(`section-card-${s111.id}`)).toBeInTheDocument();
    expect(screen.getByTestId(`section-card-${s121.id}`)).toBeInTheDocument();
  });

  it('renders the correct number of NeedCard components', () => {
    renderer();
    expect(screen.getAllByTestId('need-card')).toHaveLength(1);
    expect(screen.getByText('I need smart people')).toBeInTheDocument();
  });

  it('renders the correct number of AllocationCard components', () => {
    renderer();
    expect(screen.getAllByTestId('allocation-card')).toHaveLength(2);
  });

  it('displays the initial filter values', () => {
    renderer();
    expect(screen.getByDisplayValue('All courses')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025')).toBeInTheDocument();
    expect(screen.getByDisplayValue('W1')).toBeInTheDocument();
  });

  it('shows the Add section link for instructors', () => {
    renderer();
    expect(screen.getByRole('link', { name: 'Add TA Requirement' })).toBeInTheDocument();
  });

  it('calls fetchSectionNeedAndAllocations with correct parameters on Search click', async () => {
    mockFetchSectionNeed.mockResolvedValue([s111, s121]);
    renderer();
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));
    await waitFor(() => {
      expect(fetchSectionNeedAndAllocations).toHaveBeenCalledWith(
        instructorId,
        null,
        2025,
        'W1'
      );
    });
  });

  it('shows fallback message for non-main sections without a need', () => {
    const nonMain: Section = {
      ...s111,
      type: 'LABORATORY',
      need: undefined,
      allocations: [],
    };
    render(
      <MemoryRouter>
        <NeedViewer
          instructorId={instructorId}
          initial={{
            sections: [nonMain],
            existingYears: ['2025'],
            allAssignedCourses: [c111],
          }}
        />
      </MemoryRouter>
    );
    expect(
      screen.getByText(
        'Non-lecture sections have the same TA requirements as the main section.'
      )
    ).toBeInTheDocument();
  });
});
