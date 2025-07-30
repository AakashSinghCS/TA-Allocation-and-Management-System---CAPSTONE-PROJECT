/**
 * @vitest-environment jsdom
 */

import React from 'react'
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import { vi } from 'vitest'
import InstructorHomePage from './InstructorHomePage'

// 1) AuthContext
vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ userId: 1, token: 'fake-token' }),
}))

// 2) Section filter → returns an empty year list
vi.mock('../../../api/course/sectionfilter/fetchAllExistingYears', () => ({
  fetchAllExistingYears: vi.fn().mockResolvedValue([]),
}))

// 3) Section needs & allocations → empty
vi.mock('../../../api/instructor/fetchSectionNeedAndAllocations', () => ({
  fetchSectionNeedAndAllocations: vi.fn().mockResolvedValue([]),
}))

// 4) Qualifications → empty
vi.mock('../../../api/instructor/fetchAllInstructorQualifications', () => ({
  fetchAllInstructorQualifications: vi.fn().mockResolvedValue([]),
}))

// 5) Instructor details → stub a name
vi.mock('../../../api/instructor/fetchInstructorDetails', () => ({
  fetchInstructorDetails: vi.fn().mockResolvedValue({ firstName: 'Test', lastName: 'User' }),
}))

// 6) Deadlines → empty
vi.mock('../../../api/config/fetchDeadlines', () => ({
  fetchDeadlines: vi.fn().mockResolvedValue([]),
}))

describe('InstructorHomePage', () => {
  it('renders loading initially', () => {
    render(<InstructorHomePage />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})
