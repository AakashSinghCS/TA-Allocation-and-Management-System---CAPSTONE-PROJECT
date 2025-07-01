import { render, screen, within } from '@testing-library/react'
import NeedCard from './NeedCard'
import { mockSectionNeedCOSC121 } from '../../../../mocked-objects/section/mockSectionCOSC121'
import { MemoryRouter } from 'react-router-dom'
describe('NeedCard', () => {
  it('shows placeholder when no need is passed', () => {
    render(<MemoryRouter><NeedCard /></MemoryRouter>)
    expect(screen.getByText(/no data/i)).toBeInTheDocument()
  })

  it('renders description, hours and course list when need is provided', () => {

    render(<MemoryRouter><NeedCard need={mockSectionNeedCOSC121}  /></MemoryRouter>)

    expect(screen.getByText('I need smart people')).toBeInTheDocument()


    const card = screen.getByTestId('need-card')
    expect(card).toHaveTextContent('Allocated hours: 12 / Required hours: 12')


    expect(within(card).getAllByText(/cosc\s*111/i).length).toBeGreaterThan(0);
    expect(within(card).getAllByText(/math\s*125/i).length).toBeGreaterThan(0);
  })
})
