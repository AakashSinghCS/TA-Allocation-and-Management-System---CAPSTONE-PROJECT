import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import type { ApplicationDto } from '../../../../../interfaces/application/Application'
import type { Allocation } from '../../../../../interfaces/allocation/Allocation'
import SelectedApplicationDetails from './SelectedApplicationDetails'

describe('SelectedApplicationDetails', () => {
  // Stub out Date.toLocaleString for predictable output
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
      studentNum: '456789',
      program: 'someprogram',
      enrollmentYear: 2024,
      schoolYear: "3"
    },
    year: 2024,
    semester: 'Fall',
    applicationType: "UNDERGRADUATE",
    preferences: ['Pref1', 'Pref2'],
    wantRemote: true,
    wantWorkingHours: 2,
    timeSubmitted: '2025-07-21T12:34:56.000Z',
    availabilities: [
      { day: 'MONDAY', startTime: '09:00', endTime: '11:00' },
      { day: 'FRIDAY', startTime: '14:00', endTime: '16:00' },
    ],
  }

  const oneHistory: Allocation[] = [
    {
      id: 1,
      application: { timeSubmitted: '2025-07-20T09:00:00.000Z' },
      section: {
        course: { deptCode: 'COSC', courseNum: '111' },
        section: '001',
      },
      numberOfHours: 3,
      status: 'CONFIRMED',
    } as Allocation,
  ]

  it('renders all applicant & application details and availabilities', () => {
    render(<SelectedApplicationDetails selApp={baseApp} history={[]} />)

    // Applicant Details
    expect(screen.getByText('Applicant Details')).toBeInTheDocument()

    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'P' &&
        getNormalizedText(node) === 'Name: John Doe'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'P' &&
        getNormalizedText(node) === 'User ID: 123'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'P' &&
        getNormalizedText(node) === 'Student Number: 456789'
      )
    ).toBeInTheDocument()

    // Application Details
    expect(screen.getByText('Application Details')).toBeInTheDocument()
    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'P' &&
        getNormalizedText(node) === 'Preferences: Pref1, Pref2'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'P' &&
        getNormalizedText(node) === 'Remote? Yes'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'P' &&
        getNormalizedText(node) === 'Desired Hours: 2'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'P' &&
        getNormalizedText(node) === 'Submitted: TEST DATE'
      )
    ).toBeInTheDocument()

    expect(screen.getByText('Availabilities')).toBeInTheDocument()
    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'LI' &&
        getNormalizedText(node) === 'MONDAY: 09:00 – 11:00'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'LI' &&
        getNormalizedText(node) === 'FRIDAY: 14:00 – 16:00'
      )
    ).toBeInTheDocument()
  })

  it('renders a history item when history is non‑empty', () => {
    render(
      <SelectedApplicationDetails selApp={baseApp} history={oneHistory} />
    )

    expect(screen.getByText('Allocation History')).toBeInTheDocument()
    // Combined text: "TEST DATE — COSC 111 Section 001 — 3h (Confirmed)"
    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'LI' &&
        node.textContent?.replace(/\s+/g, ' ').trim() === 'TEST DATE — COSC 111 Section 001 — 3h (Confirmed)'
      )
    ).toBeInTheDocument()
  })

  it('shows "No previous allocations" when history is empty', () => {
    render(<SelectedApplicationDetails selApp={baseApp} history={[]} />)
    expect(
      screen.getByText('No previous allocations')
    ).toBeInTheDocument()
  })
})

function getNormalizedText(node: Element | null) {
  if (!node?.textContent) return ''
  return node.textContent
    .replace(/\u00A0/g, ' ')    // convert NBSP → normal space
    .replace(/\s+/g, ' ')        // collapse all whitespace
    .trim()
}

