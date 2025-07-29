import { render, screen, fireEvent } from '@testing-library/react'
import SectionSelectionList from './SectionSelectionList'
import type Section from '../../../../interfaces/section/Section'

// 1) Stub out Pagination to something testable
vi.mock(
  '../../../../utility/pagination/pagination/Pagination',
  () => ({
    default: ({
      page,
      pageCount,
      onPrev,
      onNext,
    }: {
      page: number
      pageCount: number
      onPrev: () => void
      onNext: () => void
    }) => (
      <div>
        <button onClick={onPrev}>Prev</button>
        <span>{page}/{pageCount}</span>
        <button onClick={onNext}>Next</button>
      </div>
    ),
  })
)

describe('SectionSelectionList', () => {
  const mockSections: Section[] = [
    {
      id: 1,
      section: '001',
      semester: 'Spring',
      year: 2025,
      course: { deptCode: 'COSC', courseNum: '349' },
    } as any,
    {
      id: 2,
      section: '002',
      semester: 'Fall',
      year: 2024,
      course: { deptCode: 'MATH', courseNum: '101' },
    } as any,
  ]

  it('renders section buttons, applies selected styling, and calls onSelect', () => {
    const onSelect = vi.fn()
    const onPrev = vi.fn()
    const onNext = vi.fn()

    render(
      <SectionSelectionList
        sections={mockSections}
        selectedId={2}
        onSelect={onSelect}
        page={1}
        pageCount={3}
        onPrev={onPrev}
        onNext={onNext}
      />
    )

    // — two buttons, labeled correctly
    const btn1 = screen.getByRole('button', {
      name: /COSC 349 • 001 • Spring 2025/,
    })
    const btn2 = screen.getByRole('button', {
      name: /MATH 101 • 002 • Fall 2024/,
    })

    // — selectedId=2 yields selected styling on btn2 only
    expect(btn1).toHaveClass('bg-gray-300')
    expect(btn2).toHaveClass('bg-gray-900', 'text-white')

    // — clicking btn1 selects that section
    fireEvent.click(btn1)
    expect(onSelect).toHaveBeenCalledWith(mockSections[0])

    // — pagination stub renders "1/3" and Prev/Next buttons
    expect(screen.getByText('1/3')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Prev'))
    expect(onPrev).toHaveBeenCalled()
    fireEvent.click(screen.getByText('Next'))
    expect(onNext).toHaveBeenCalled()
  })

  it('shows "No courses found" and still renders pagination when sections is empty', () => {
    const onSelect = vi.fn()
    const onPrev = vi.fn()
    const onNext = vi.fn()

    render(
      <SectionSelectionList
        sections={[]}
        selectedId={undefined}
        onSelect={onSelect}
        page={0}
        pageCount={0}
        onPrev={onPrev}
        onNext={onNext}
      />
    )

    expect(screen.getByText('No courses found')).toBeInTheDocument()
    // pagination stub still appears
    expect(screen.getByText('0/0')).toBeInTheDocument()
  })
})
