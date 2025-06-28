import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SectionList from './SectionList'
import type { FilterSectionsProps } from '../../../../api/sectionfilter/fetchFilteredSections'

describe('SectionList', () => {
  it('renders "No section found." when sections is empty or null', () => {
    const { rerender } = render(
      <MemoryRouter>
        <SectionList sections={[]} />
      </MemoryRouter>
    )
    expect(screen.getByText(/No section found\./i)).toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <SectionList sections={null} />
      </MemoryRouter>
    )
    expect(screen.getByText(/No section found\./i)).toBeInTheDocument()
  })

  it('renders a course header and a section row with correct data and delete buttons', () => {
    const onDeleted = vi.fn()
    const sections: FilterSectionsProps[] = [
      {
        courseId: 1,
        sectionId: 2,
        deptCode: 'COSC',
        courseNum: '111',
        name: 'Intro to CS',
        section: '001',
        year: 2024,
        semester: 'W1',
        type: 'LECTURE',
        day: 'Monday',
        startTime: '08:00',
        endTime: '09:30',
        isCourse: false,
      }
    ]

    render(
      <MemoryRouter>
        <SectionList sections={sections} onDeleted={onDeleted} />
      </MemoryRouter>
    )

    // Course header
    expect(screen.getByText(/COSC 111 — Intro to CS/)).toBeInTheDocument()
    // Section row data
    expect(screen.getByText(/COSC 111 001 – Intro to CS/)).toBeInTheDocument()
    expect(screen.getByText('2024')).toBeInTheDocument()
    expect(screen.getByText('W1')).toBeInTheDocument()
    expect(screen.getByText('LECTURE')).toBeInTheDocument()
    expect(screen.getByText(/Mon-08:00-09:30/)).toBeInTheDocument()

    // Delete buttons exist
    expect(screen.getByText(/Delete Course/i)).toBeInTheDocument()
    expect(screen.getByText(/Delete Section/i)).toBeInTheDocument()
  })
})
