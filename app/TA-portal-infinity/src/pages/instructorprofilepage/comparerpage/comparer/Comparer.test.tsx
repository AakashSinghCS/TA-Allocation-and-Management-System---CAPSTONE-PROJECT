import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Comparer from "./Comparer";
import { mockSectionCOSC121 } from "../../../../mocked-objects/section/mockSectionCOSC121";


const renderComparer = () =>
    render(
        <MemoryRouter>
            <Comparer sections={[mockSectionCOSC121]} />
        </MemoryRouter>
    );


describe('Instructor Profile Comparer', () => {
    it('shows no students before search', () => {
        renderComparer();

        expect(screen.getByText(/no students to display/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /search/i }));

        const headings = screen.getAllByText(/emma/i);
        expect(headings.length).toBeGreaterThan(0);
        expect(screen.getAllByText(/cosc\s*121/i).length).toBeGreaterThan(0);
    })

    it('enables “Compare Needs” once the user selects a student card', async() => {
    renderComparer();

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    //Change values here when the buttons are updated.
    const compareBtn = screen.getByRole('button', { name: /compare needs/i });

    expect(compareBtn).toBeDisabled();

    const headings = screen.getAllByText(/emma/i);
    fireEvent.click(headings[0]);

    expect(compareBtn).toBeEnabled();
    fireEvent.click(compareBtn);
    await waitFor(() => {
      // find the COSC 121 card by its text, then grab its container div
        const card = screen.getByTestId('section-card-2');
        expect(card).toHaveClass('outline-green-400');
    })
  });
})