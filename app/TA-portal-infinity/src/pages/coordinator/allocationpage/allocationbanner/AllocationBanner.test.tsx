// __tests__/AllocationBanner.test.tsx
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// 1) Hoisted mocks
vi.mock('react-toastify', () => {
  const success = vi.fn()
  const error = vi.fn()
  return { toast: { success, error } }
})
vi.mock('../../../../api/allocation/deallocateAllocation', () => ({
  deallocateAllocation: vi.fn()
}))
vi.mock('../../../../utility/calendar/gettasklabels/getTaskLabel', () => ({
  getTaskLabel: (task: string) => task.toLowerCase().replace('_', ' ')
}))

import AllocationBanner from './AllocationBanner'
import type { ApplicationDto } from '../../../../interfaces/application/Application'
import type Section from '../../../../interfaces/section/Section'
import type { Allocation } from '../../../../interfaces/allocation/Allocation'
import { toast } from 'react-toastify'
import { deallocateAllocation } from '../../../../api/allocation/deallocateAllocation'
import { mockStudentJohnDoe } from '../../../../mocked-objects/user/mockStudents'

// Helpers to get the mocked functions
const mockToastSuccess = (toast.success as unknown as ReturnType<typeof vi.fn>)
const mockToastError   = (toast.error   as unknown as ReturnType<typeof vi.fn>)
const mockDealloc      = (deallocateAllocation as unknown as ReturnType<typeof vi.fn>)

describe('AllocationBanner', () => {
  const baseApp: ApplicationDto = {
    applicationId: 10,
    student: mockStudentJohnDoe,
    applicationType: 'UNDERGRADUATE',
    preferences: [],
    wantRemote: false,
    wantWorkingHours: 0,
    timeSubmitted: '',
    unavailabilities: [],
  }
  const selCourse: Section = {
    id: 5,
    course: { id: 1, deptCode: 'COSC', courseNum: '101', name: 'Intro' },
    section: '001',
    type: 'LECTURE',
    semester: 'W1',
    year: 2025,
    need: undefined,
    allocatedSections: [],
    allocations: []
  }

  let setSelApp: ReturnType<typeof vi.fn>
  let setShowBanner: ReturnType<typeof vi.fn>
  let refreshAlloc: ReturnType<typeof vi.fn>
  const token = 'tok'

  beforeEach(() => {
    vi.clearAllMocks()
    setSelApp = vi.fn()
    setShowBanner = vi.fn()
    refreshAlloc = vi.fn()
  })

  it('renders Offer Sent and details when showBanner=true', () => {
    const prevAlloc: Allocation = {
      id: 1,
      application: { applicationId: 10, timeSubmitted: '' },
      status: 'CONFIRMED',
      labPrepHours: 0,
      gradingHours: 0,
      sectionHours: 0,
      allocatedSections: [ { id: 2, allocationId: 1, sectionId: 5, task: 'LAB', hours: 3 } ],
    } as any

    render(
      <AllocationBanner
        selApp={baseApp}
        setSelApp={setSelApp}
        selCourse={selCourse}
        refreshAlloc={refreshAlloc}
        token={token}
        prevAlloc={prevAlloc}
        showBanner={true}
        setShowBanner={setShowBanner}
      />
    )

    expect(screen.getByText('Offer Sent')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('COSC 101 Section 001')).toBeInTheDocument()
    expect(screen.getByText('They’ve been offered 3 lab hours.')).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /Revoke\s+lab\s*\(\s*3\s*h\)/
      })
    ).toBeInTheDocument()
  })

  it('handles successful revoke', async () => {
    mockDealloc.mockResolvedValue(true)
    const prevAlloc: Allocation = {
      id: 1,
      application: { applicationId: 10, timeSubmitted: '' },
      status: 'CONFIRMED',
      labPrepHours: 0,
      gradingHours: 0,
      sectionHours: 0,
      allocatedSections: [ { id: 2, allocationId: 1, sectionId: 5, task: 'GRADING', hours: 2 } ],
    } as any

    render(
      <AllocationBanner
        selApp={baseApp}
        setSelApp={setSelApp}
        selCourse={selCourse}
        refreshAlloc={refreshAlloc}
        token={token}
        prevAlloc={prevAlloc}
        showBanner={false}
        setShowBanner={setShowBanner}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /Revoke grading/ }))

    await waitFor(() => {
      expect(mockDealloc).toHaveBeenCalledWith(2, token)
      expect(setSelApp).toHaveBeenCalledWith(null)
      expect(setShowBanner).toHaveBeenCalledWith(false)
      expect(refreshAlloc).toHaveBeenCalledWith(1, token)
      expect(mockToastSuccess).toHaveBeenCalledWith('Revoke successful')
    })
  })

  it('handles revoke failure', async () => {
    mockDealloc.mockResolvedValue(false)
    const prevAlloc: Allocation = {
      id: 1,
      application: { applicationId: 10, timeSubmitted: '' },
      status: 'CONFIRMED',
      labPrepHours: 0,
      gradingHours: 0,
      sectionHours: 0,
      allocatedSections: [ { id: 3, allocationId: 1, sectionId: 5, task: 'GRADING', hours: 4 } ],
    } as any

    render(
      <AllocationBanner
        selApp={baseApp}
        setSelApp={setSelApp}
        selCourse={selCourse}
        refreshAlloc={refreshAlloc}
        token={token}
        prevAlloc={prevAlloc}
        showBanner={false}
        setShowBanner={setShowBanner}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /Revoke grading/ }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Failed to revoke')
    })
  })
})