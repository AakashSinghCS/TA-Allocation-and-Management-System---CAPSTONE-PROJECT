import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import TAAllocationPage from './AllocationPage';  
import { mockSectionCOSC111 } from '../../mocked-objects/section/mockSectionCOSC111';
import { fetchSection } from '../../api/section/fetchSection';
import { useAuth } from '../../context/AuthContext';

// --- Mock out all the APIs and auth context ---
vi.mock('../api/application/FetchApplications', () => ({
  fetchApplications: vi.fn(() => Promise.resolve([])),
}));

vi.mock('../api/application/FetchApplicants', () => ({
  fetchApplicants: vi.fn(() => Promise.resolve([])),
}));


// vi.mock('../../../../context/AuthContext', () => ({
//     useAuth: vi.fn(),
// }));

vi.mock('../../api/section/fetchSection', () => ({
  fetchSection: vi.fn(() =>
    Promise.resolve({
      sectionDetails: mockSectionCOSC111.sectionDetails,
      sectionSchedule: [],
      need: undefined,
    })
  ),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ token: 'fake-token' }),
}));

describe('TAAllocationPage', () => {

   beforeEach(() => {
          vi.clearAllMocks();
      });
  it('renders the course filter and seeded course buttons', async () => {
    render(<TAAllocationPage />);
    // Check the filter header
    expect(screen.getByText(/Course Filter/i)).toBeInTheDocument();

    // One of the seeded mocks is COSC 111 – make sure its button appears
    const courseBtn = await screen.findByText(/COSC\s111/i);
    expect(courseBtn).toBeInTheDocument();
  });

  it('calls fetchSection when a course button is clicked', async () => {
    render(<TAAllocationPage />);

    // Wait for the course button to appear and click it
    const courseBtn = await screen.findByText(/COSC\s111/i);
    fireEvent.click(courseBtn);

    // Assert our mock was called with the right sectionId
    expect(fetchSection).toHaveBeenCalledWith(
      mockSectionCOSC111.sectionDetails?.sectionId
    );
  });
});

