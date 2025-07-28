import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ApplicationFilterPanel from './ApplicationFilterPanel'
import { useAuth } from '../../../../context/AuthContext'
import { fetchAllocationsByStudent } from '../../../../api/allocation/fetchAllocationByStudent'
import { useApplicationSearchPage } from '../../../../api/application/useApplicationSearchPage'
import { fetchAllExistingYears } from '../../../../api/course/sectionfilter/fetchAllExistingYears'
import type { ApplicationDto } from '../../../../interfaces/application/Application'
import type { UseQueryResult } from '@tanstack/react-query'
import type PageableResponse from '../../../../interfaces/admin/audit/PageableResponse'

// 1) Mock all external dependencies
vi.mock('../../../../context/AuthContext')
vi.mock('../../../../api/allocation/fetchAllocationByStudent')
vi.mock('../../../../api/application/useApplicationSearchPage')
vi.mock('../../../../api/course/sectionfilter/fetchAllExistingYears')

// 2) Stub out the child details component
vi.mock(
  './selectedapplicationdetails/SelectedApplicationDetails',
  () => ({ default: () => <div>SelectedApplicationDetails</div> })
)

const mockUseAuth = vi.mocked(useAuth)
const mockFetchAlloc = vi.mocked(fetchAllocationsByStudent)
const mockUseAppPage = vi.mocked(useApplicationSearchPage)
const mockFetchYears = vi.mocked(fetchAllExistingYears)

const mockApplications: ApplicationDto[] = [
  {
    student: {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      studentNum: '123456',
      program: 'BSc Computer Science',
      enrollmentYear: 2022,
      schoolYear: '2nd',
    },
    applicationType: 'UNDERGRADUATE',
    preferences: ['Computer Science'],
    wantRemote: true,
    wantWorkingHours: 20,
    timeSubmitted: '2024-01-15T10:00:00Z',
    availabilities: [
      { day: 'MONDAY', startTime: '09:00', endTime: '17:00' },
    ],
  },
]

describe('ApplicationFilterPanel', () => {
  const loadApp = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    mockUseAuth.mockReturnValue({
      token: 'mock-token',
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
      userRoles: [],
      userId: 1,
    })

    mockFetchAlloc.mockResolvedValue([])
    mockFetchYears.mockResolvedValue(['2024', '2023'])

    const fakeSuccess = {
      data: {
        content: mockApplications,
        totalPages: 1,
        totalElements: 1,
        size: 5,
        number: 0,
      },
      isFetching: false,
      // you can omit everything else…
    } as unknown as UseQueryResult<
      PageableResponse<ApplicationDto>,
      Error
    >

    mockUseAppPage.mockReturnValue(fakeSuccess)
  })

  it('renders header and basic filter selects', async () => {
    render(<ApplicationFilterPanel selApp={null} loadApp={loadApp} />)

    // Header
    expect(screen.getByText('Application Filter')).toBeInTheDocument()

    // Wait for years to be fetched and injected
    await waitFor(() => {
      expect(mockFetchYears).toHaveBeenCalled()
    })

    // Basic selects
    expect(
      screen.getByRole('combobox', { name: /Year$/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText("Student's 1st Preference")
    ).toBeInTheDocument()
    expect(
      screen.getByText("Student's Requested Hours")
    ).toBeInTheDocument()
  })

  it('displays applications from API and calls loadApp when clicked', async () => {
    render(<ApplicationFilterPanel selApp={null} loadApp={loadApp} />)

    // Wait for applications to load
    await waitFor(() => {
      expect(mockUseAppPage).toHaveBeenCalled()
    })

    // There should be one button labeled with the student name
    const appButton = screen.getByRole('button', { name: /John Doe/i })
    expect(appButton).toBeInTheDocument()

    // Click it → should call loadApp with that DTO
    fireEvent.click(appButton)
    expect(loadApp).toHaveBeenCalledWith(mockApplications[0])
  })

  it('shows "No applications found" when API returns empty', async () => {
    const fakeEmpty = {
      data: {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 5,
        number: 0,
      },
      isFetching: false,
    } as unknown as UseQueryResult<
      PageableResponse<ApplicationDto>,
      Error
    >
   mockUseAppPage.mockReturnValue(fakeEmpty)

    render(<ApplicationFilterPanel selApp={null} loadApp={loadApp} />)

    await waitFor(() => {
      expect(
        screen.getByText('No applications found')
      ).toBeInTheDocument()
    })
  })

  it('renders SelectedApplicationDetails when selApp is provided', async () => {
    render(
      <ApplicationFilterPanel
        selApp={mockApplications[0]}
        loadApp={loadApp}
      />
    )

    // Should fetch allocation history
    await waitFor(() => {
      expect(mockFetchAlloc).toHaveBeenCalledWith(
        mockApplications[0].student.id,
        'mock-token'
      )
    })

    // Our mock component should show up
    expect(
      screen.getByText('SelectedApplicationDetails')
    ).toBeInTheDocument()
  })
})
