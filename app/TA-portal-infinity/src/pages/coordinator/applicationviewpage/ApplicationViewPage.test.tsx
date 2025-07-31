// __tests__/ApplicationPage.test.tsx
import React from 'react'
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fetchAllocationByStatus } from '../../../api/allocation/fetchAllocationByStatus';
// 1) Mock useAuth to provide a token
vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ token: 'fake-token' })
}))

// 2) Mock API calls
import type { ApplicationDto } from '../../../interfaces/application/Application'
import type { Allocation } from '../../../interfaces/allocation/Allocation'
import type Section from '../../../interfaces/section/Section'

const mockApp: ApplicationDto = {
  applicationId: 123,
  student: { id: 1, firstName: 'John', lastName: 'Doe', studentNum: 1234 },
  preferences: ['COSC'],
  wantRemote: false,
  wantWorkingHours: 5,
  timeSubmitted: '2025-07-01T00:00:00Z',
  applicationType: 'UNDERGRADUATE',
  unavailabilities: [],
  year: 2025,
  semester: 'W1'
}
const mockAlloc: Allocation = {
  id: 10,
  application: mockApp,
  student: mockApp.student,
  status: 'CONFIRMED',
  labPrepHours: 1,
  gradingHours: 2,
  sectionHours: 3,
  allocatedSections: [{ id: 1, allocationId: 10, sectionId: 5, task: 'LAB', hours: 1 }]
} as any

vi.mock('../../../api/application/FetchApplications', () => ({
  fetchApplications: vi.fn(() => Promise.resolve([mockApp]))
}))

vi.mock('../../../api/allocation/fetchAllocationByStudent', () => ({
  fetchAllocationsByStudent: vi.fn(() => Promise.resolve(mockAlloc))
}))

vi.mock('../../../api/allocation/fetchAllocationByStatus', () => ({
  fetchAllocationByStatus: vi.fn(() => Promise.resolve(mockAlloc))
}))

vi.mock('../../../api/section/fetchSectionIncludeInstructorId', () => ({
  fetchSectionIncludeInstructorId: vi.fn((id: number) =>
    Promise.resolve({ id, course: { deptCode: 'COSC', courseNum: '123', name: 'Test' }, section: '001', type: 'LECTURE', semester: 'W1', year: 2025 } as Section)
  )
}))

// 3) Mock child components
vi.mock('../../../components/features/application/viewtaapplication/ApplicationStats', () => ({
  default: (props: any) => <div data-testid="stats">{JSON.stringify(props)}</div>
}))
vi.mock('../../../components/features/application/viewtaapplication/ApplicationCard', () => ({
  default: (props: any) => <div data-testid="card">card:{props.app.applicationId}</div>
}))
vi.mock('../../../components/features/application/viewtaapplication/ApplicationDetailsPanel', () => ({
  default: () => <div data-testid="details-panel" />
}))

import ApplicationViewPage from './ApplicationViewPage'
import { fetchAllocationsByStudent } from '../../../api/allocation/fetchAllocationByStudent';

describe('ApplicationViewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders header and stats and card after load', async () => {
    render(<ApplicationViewPage />)

    // Header always present
    expect(screen.getByText(/Applications Overview/i)).toBeInTheDocument()

    // Wait for fetchApplications and allocations
    const stats = await screen.findByTestId('stats')
    expect(stats).toBeInTheDocument()

    // Stats should reflect one application and one confirmed allocation
    const statsProps = JSON.parse(stats.textContent || '{}')
    expect(statsProps.totalApplications).toBe(1)
    // wait until allocationHistory is hydrated
    await waitFor(() => {
      expect(fetchAllocationsByStudent).toHaveBeenCalled();
    });
    // Re-read stats after allocations loaded
    const statsAfter = JSON.parse((screen.getByTestId('stats').textContent || '{}'))
    expect(statsAfter.appsWithOffer).toBe(1)
    expect(statsAfter.appsWithConfirmed).toBe(1)

    expect(statsAfter.filteredCount).toBe(statsAfter.totalApplications)

    const card = await screen.findByTestId('card')
    expect(card).toHaveTextContent('card:123')
  })

  it('filters the displayed cards when filter button is clicked', async () => {
    render(<ApplicationViewPage />);

    // Wait for initial load
    await screen.findByTestId('stats');

    // 1) Confirm we start with exactly 1 card
    expect(screen.getAllByTestId('card')).toHaveLength(1);

    // 2) Find the "Allocation Confirmed" select and the Filter button
    const filterPanel = screen.getByText(/Allocation & Offer Related Filters/i)
      .closest('div')!;
    const { getByLabelText, getByRole } = within(filterPanel);
    const statusSelect = getByLabelText(/Allocation Confirmed/i);
    const filterBtn = getByRole('button', { name: /Filter/i });

    // 3) Select CONFIRMED and click — mockAlloc.status is CONFIRMED, so 1 card remains
    fireEvent.change(statusSelect, { target: { value: 'CONFIRMED' } });
    fireEvent.click(filterBtn);

    await waitFor(() => {
      expect(screen.getAllByTestId('card')).toHaveLength(1);
    });

    // 4) Select REJECTED and click — no card has status REJECTED, so 0 cards
    fireEvent.change(statusSelect, { target: { value: 'REJECTED' } });
    fireEvent.click(filterBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('card')).toBeNull();
    });
  });
});
