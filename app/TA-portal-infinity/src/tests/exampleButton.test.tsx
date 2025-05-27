import { render, screen } from '@testing-library/react'
import Button from '../components/exampleButton'

describe('Button', () => {
  it('renders its label', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })
})
