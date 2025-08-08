import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SearchUserBar, { type SearchCriteria } from './SearchUserBar'
import { UserRole } from '../../../../interfaces/enum/UserRole'

// 1️⃣ Mock out useAuth so we can switch roles per test
const mockUseAuth = vi.fn()
vi.mock('../../../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('SearchUserBar', () => {
  const initialCriteria: SearchCriteria = {
    role: '',
    firstname: '',
    lastname: '',
    universityNumber: '',
    userId: '',
  }
  let setCriteria: ReturnType<typeof vi.fn>

  beforeEach(() => {
    setCriteria = vi.fn()
    // default to a Coordinator
    mockUseAuth.mockReturnValue({ userRoles: [UserRole.COORDINATOR] })
  })

  it('renders role + name inputs enabled when nothing is filled', () => {
    render(
      <SearchUserBar
        criteria={initialCriteria}
        setCriteria={setCriteria}
        loading={false}
      />
    )
    expect(screen.getByRole('combobox')).toBeEnabled()
    expect(screen.getByPlaceholderText('First Name')).toBeEnabled()
    expect(screen.getByPlaceholderText('Last Name')).toBeEnabled()
  })

  it('calls setCriteria when first name changes', () => {
    render(
      <SearchUserBar
        criteria={initialCriteria}
        setCriteria={setCriteria}
        loading={false}
      />
    )
    fireEvent.change(screen.getByPlaceholderText('First Name'), {
      target: { value: 'Alice' },
    })
    expect(setCriteria).toHaveBeenCalledWith({
      ...initialCriteria,
      firstname: 'Alice',
    })
  })

  it('disables role & name inputs once universityNumber is set', () => {
    const crit = { ...initialCriteria, universityNumber: '12345678' }
    render(
      <SearchUserBar
        criteria={crit}
        setCriteria={setCriteria}
        loading={false}
      />
    )
    expect(screen.getByRole('combobox')).toBeDisabled()
    expect(screen.getByPlaceholderText('First Name')).toBeDisabled()
    expect(screen.getByPlaceholderText('Last Name')).toBeDisabled()

    // In view mode, hidden filters always render
    expect(screen.getByPlaceholderText('University Number')).toHaveValue(
      '12345678'
    )
  })

  it('does NOT show the User ID field for a Coordinator', () => {
    render(
      <SearchUserBar
        criteria={initialCriteria}
        setCriteria={setCriteria}
        loading={false}
      />
    )
    expect(
      screen.queryByPlaceholderText('User ID (Exact Match)')
    ).toBeNull()
  })

  it('does show the User ID field for an Admin', () => {
    mockUseAuth.mockReturnValue({ userRoles: [UserRole.ADMIN] })

    render(
      <SearchUserBar
        criteria={initialCriteria}
        setCriteria={setCriteria}
        loading={false}
      />
    )
    expect(
      screen.getByPlaceholderText('User ID (Exact Match)')
    ).toBeInTheDocument()
  })

  it('only lists the allowedRoles in the role dropdown when given', () => {
    render(
      <SearchUserBar
        criteria={initialCriteria}
        setCriteria={setCriteria}
        loading={false}
        allowedRoles={['Student']}
      />
    )
    const opts = screen.getAllByRole('option')
    // first is "Select a role", second is "Student"
    expect(opts).toHaveLength(2)
    expect(opts[1]).toHaveTextContent('Student')
  })

  it('toggles the hidden filters panel in select mode', () => {
    render(
      <SearchUserBar
        criteria={initialCriteria}
        setCriteria={setCriteria}
        loading={false}
        mode="select"
      />
    )
    // initially hidden
    expect(
      screen.queryByPlaceholderText('University Number')
    ).toBeNull()

    // open
    fireEvent.click(screen.getByRole('button'))
    expect(
      screen.getByPlaceholderText('University Number')
    ).toBeInTheDocument()

    // close
    fireEvent.click(screen.getByRole('button'))
    expect(
      screen.queryByPlaceholderText('University Number')
    ).toBeNull()
  })
})
