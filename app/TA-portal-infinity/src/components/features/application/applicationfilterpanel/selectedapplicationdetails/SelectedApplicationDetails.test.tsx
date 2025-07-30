import React from 'react'
import { render, screen, findByText, within } from '@testing-library/react'
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import type { ApplicationDto } from '../../../../../interfaces/application/Application'
import type { Allocation } from '../../../../../interfaces/allocation/Allocation'
import SelectedApplicationDetails from './SelectedApplicationDetails'
import { mockStudentJohnDoe } from '../../../../../mocked-objects/user/mockStudents'

// Mock the section fetch so our entries render immediately
vi.mock(
  '../../../../../api/section/fetchSectionIncludeInstructorId',
  () => ({
    fetchSectionIncludeInstructorId: vi.fn().mockImplementation((id: number) =>
      Promise.resolve({
        id,
        course: { deptCode: 'COSC', courseNum: '111', name: 'Dummy Course' },
        section: '001',
        type: 'TUT',
        semester: 'W1',
        year: 2025,
      })
    ),
  })
)

describe('SelectedApplicationDetails', () => {
  // Stub Date.toLocaleString for predictable output
  beforeAll(() => {
    vi.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('TEST DATE')
  })
  afterAll(() => {
    vi.restoreAllMocks()
  })

  const baseApp: ApplicationDto = {
    student: {
      id: 123,
      firstName: 'John',
      lastName: 'Doe',
      studentNum: 456789,
      program: 'someprogram',
      enrollmentYear: 2024,
      schoolYear: 3
    },
    year: 2024,
    semester: 'Fall',
    applicationType: "UNDERGRADUATE",
    preferences: ['Pref1', 'Pref2'],
    wantRemote: true,
    wantWorkingHours: 2,
    timeSubmitted: '2025-07-21T12:34:56.000Z',
    unavailabilities: [
      { day: 'MONDAY', startTime: '09:00', endTime: '11:00' },
      { day: 'FRIDAY', startTime: '14:00', endTime: '16:00' },
    ],
  }

  const oneHistory: Allocation = {
    id: 1,
    application: { timeSubmitted: '2025-07-20T09:00:00.000Z' },
    status: 'CONFIRMED',
    allocatedSections: [
      { id: 1, allocationId: 1, sectionId: 1, task: 'GRADING', hours: 3 }
    ],
  } as Allocation

  it('renders applicant & application details and unavailabilities', () => {
    render(<SelectedApplicationDetails selApp={baseApp} history={null} />)

    // Applicant Details
    expect(screen.getByText('Applicant Details')).toBeInTheDocument()
    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'P' && node.textContent === 'Name: John Doe'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'P' && node.textContent === 'User ID: 123'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'P' && node.textContent === 'Student Number: 456789'
      )
    ).toBeInTheDocument()

    // Application Details
    expect(screen.getByText('Application Details')).toBeInTheDocument();

    expect(
      screen.getByText((_, node) => {
        return node?.textContent?.replace(/\s+/g, ' ').trim() === 'Preferences: Pref1, Pref2';
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, node) => {
        return node?.textContent?.replace(/\s+/g, ' ').trim() === 'Remote? Yes';
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, node) => {
        return node?.textContent?.replace(/\s+/g, ' ').trim() === 'Desired Hours: 2';
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, node) => {
        return node?.textContent?.replace(/\s+/g, ' ').trim() === 'Submitted: TEST DATE';
      })
    ).toBeInTheDocument();

    // Unavailabilities
    expect(screen.getByText('Unavailabilities')).toBeInTheDocument()
    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'LI' && node.textContent === 'MONDAY: 09:00 – 11:00'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'LI' && node.textContent === 'FRIDAY: 14:00 – 16:00'
      )
    ).toBeInTheDocument()
  })

  it('renders a history entry when history is non‑empty', async () => {
    render(<SelectedApplicationDetails selApp={baseApp} history={oneHistory} />)

    // Allocation History header
    expect(screen.getByText('Allocation History')).toBeInTheDocument()

    // Wait for fetchSectionIncludeInstructorId to populate
    const confirmedNode = await screen.findByText('Confirmed')
    expect(confirmedNode).toBeInTheDocument()

    const listItem = confirmedNode.closest('li')
    expect(listItem).toBeInTheDocument()

    // Within that item, check each field
    const { getByText } = within(listItem!)
    expect(
      getByText((_, node) => {
        return node?.textContent?.replace(/\s+/g, ' ').trim() === 'Task: Grading, 3h';
      })
    ).toBeInTheDocument();
    expect(
      getByText((_, node) => {
        return node?.textContent?.replace(/\s+/g, ' ').trim() === 'Status: Confirmed';
      })
    ).toBeInTheDocument();
    expect(
      getByText((_, node) => {
        return node?.textContent?.replace(/\s+/g, ' ').trim() === 'Course: COSC 111 001';
      })
    ).toBeInTheDocument();
  })

  it('shows "No previous allocations" when history is null', () => {
    render(<SelectedApplicationDetails selApp={baseApp} history={null} />)
    expect(
      screen.getByText('No previous allocations')
    ).toBeInTheDocument()
  })
})
