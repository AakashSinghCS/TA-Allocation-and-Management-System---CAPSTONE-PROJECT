import { render, screen } from '@testing-library/react'
import type Section from '../../../../interfaces/section/Section'
import SectionDetailsPanel from './SelectedSectionPanel'

interface Instructor {
  firstName: string
  lastName: string
}

describe('SelectedSectionPanel', () => {
  const fullSection: Section = {
    semester: 'Fall',
    year: 2025,
    section: '001',
    type: 'LECTURE',
    need: {
      description: 'Extra grading help',
      numHoursCurrentlyAllocated: 8,
      requiredGradingHours: 12,
      prerequisites: [
        { deptCode: 'MATH', courseNum: '101' },
        { deptCode: 'PHYS', courseNum: '201' },
      ],
    },
    // ...any other required Section fields can be stubbed or omitted if optional
  }

  const instructor: Instructor = {
    firstName: 'Jane',
    lastName: 'Smith',
  }

  it('renders all details when section and instructor are provided', () => {
    render(
      <SectionDetailsPanel
        section={fullSection}
        instructor={instructor}
      />
    )
    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'P' &&
        getNormalizedText(node) === 'Year & Semester: Fall 2025'
      )
    ).toBeInTheDocument()

    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'P' &&
        getNormalizedText(node) === 'Section: 001'
      )
    ).toBeInTheDocument()

    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'P' &&
        getNormalizedText(node) === 'Type: LECTURE'
      )
    ).toBeInTheDocument()

    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'P' &&
        getNormalizedText(node) === 'Instructor: Jane Smith'
      )
    ).toBeInTheDocument()

    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'P' &&
        getNormalizedText(node) === 'Description: Extra grading help'
      )
    ).toBeInTheDocument()

    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'P' &&
        getNormalizedText(node) === 'Allocated Hours: 8'
      )
    ).toBeInTheDocument()

    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'P' &&
        getNormalizedText(node) === 'Required Hours: 12'
      )
    ).toBeInTheDocument()

    // Course Need

    // Prerequisites list
    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'LI' &&
        getNormalizedText(node) === 'MATH 101'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'LI' &&
        getNormalizedText(node) === 'PHYS 201'
      )
    ).toBeInTheDocument()
  })

  it('falls back to "N/A" and "None" when data is missing', () => {
    const emptySection: Section = {
      semester: undefined,
      year: undefined,
      section: undefined,
      type: undefined,
      need: undefined,
    } as any

    render(
      <SectionDetailsPanel
        section={emptySection}
        instructor={null}
      />
    )

    // Section Details fallbacks
    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'P' &&
        node.textContent?.replace(/\s+/g, ' ').trim() === 'Year & Semester: N/A N/A'
      )
    ).toBeInTheDocument()

    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'P' &&
        node.textContent?.replace(/\s+/g, ' ').trim() === 'Section: N/A'
      )
    ).toBeInTheDocument()

    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'P' &&
        node.textContent?.replace(/\s+/g, ' ').trim() === 'Type: N/A'
      )
    ).toBeInTheDocument()

    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'P' &&
        node.textContent?.replace(/\s+/g, ' ').trim() === 'Instructor: N/A'
      )
    ).toBeInTheDocument()

    // Course Need fallbacks
    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'P' &&
        node.textContent?.replace(/\s+/g, ' ').trim() === 'Description: N/A'
      )
    ).toBeInTheDocument()

    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'P' &&
        node.textContent?.replace(/\s+/g, ' ').trim() === 'Allocated Hours: N/A'
      )
    ).toBeInTheDocument()

    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'P' &&
        node.textContent?.replace(/\s+/g, ' ').trim() === 'Required Hours: N/A'
      )
    ).toBeInTheDocument()

    // Prerequisites fallback
    expect(screen.getByText('None')).toBeInTheDocument()
  })
})

function getNormalizedText(node: Element | null) {
  if (!node?.textContent) return ''
  return node.textContent
    .replace(/\u00A0/g, ' ')    // convert NBSP → normal space
    .replace(/\s+/g, ' ')        // collapse all whitespace
    .trim()
}

