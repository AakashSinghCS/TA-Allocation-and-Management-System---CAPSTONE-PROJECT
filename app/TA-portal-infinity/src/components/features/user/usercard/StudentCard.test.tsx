import { render, screen } from '@testing-library/react'
import StudentCard from './StudentCard'
import { studentFieldLabels, } from '../../../../interfaces/user/Student'
import { mockStudentJohnDoe } from '../../../../mocked-objects/user/mockStudents'
import { MemoryRouter } from 'react-router-dom'

describe('StudentCard', () => {
  it('shows placeholder when no user is passed', () => {
    render(<MemoryRouter><StudentCard /></MemoryRouter>)
    expect(screen.getByText(/no result/i)).toBeInTheDocument()
  })

  it('renders name, applies className, and displays profile fields', () => {
    render(<MemoryRouter><StudentCard user={mockStudentJohnDoe} /></MemoryRouter>)

    const heading = screen.getByRole('link', { name: /john/i })
    expect(heading).toBeInTheDocument()

    const emailLabel = studentFieldLabels['email']
    const snLabel    = studentFieldLabels['studentNumber']

    expect(screen.getByText(new RegExp(`${emailLabel}:`, 'i'))).toBeInTheDocument()
    expect(screen.getByText(mockStudentJohnDoe.email ??"")).toBeInTheDocument()

    expect(screen.getByText(new RegExp(`${snLabel}:`, 'i'))).toBeInTheDocument()
    expect(screen.getByText(mockStudentJohnDoe.studentNumber ??"")).toBeInTheDocument()
  })
})
