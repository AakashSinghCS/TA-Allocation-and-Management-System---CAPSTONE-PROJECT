import { render,screen } from "@testing-library/react"
import AllocationCard from "./AllocationCard"
import { mockAllocationJohnDoe } from "../../../mocked-objects/allocation/mockAllocations"
import { MemoryRouter } from "react-router-dom"

describe('AllocationCard', () => {
  it('shows placeholder when no need is passed', () => {
    render(
      <MemoryRouter>
        <AllocationCard />
      </MemoryRouter>
    )
    expect(screen.getByText(/No Confirmed TAs/i)).toBeInTheDocument()
  })

  it('renders students and hours', () => {
    render(
      <MemoryRouter>
        <AllocationCard allocations={[mockAllocationJohnDoe]}/>
      </MemoryRouter>
    )

    expect(screen.getByText(/John/i)).toBeInTheDocument()
    expect(screen.getByText('6h')).toBeInTheDocument()
  })
})
