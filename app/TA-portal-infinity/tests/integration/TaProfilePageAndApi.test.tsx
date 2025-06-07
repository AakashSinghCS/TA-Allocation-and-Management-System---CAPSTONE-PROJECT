import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TaProfilePageContainer from '../../src/pages/taprofilepage/TaProfilePageContainer';
import {mockStudentJohnDoe} from '../../src/mocked-objects/mockStudentJohnDoe'

const mockProfile = {
    student: mockStudentJohnDoe
}

describe('student details integration with api call', () => {
    beforeEach(() => {  
        const ok = new Response(JSON.stringify(mockProfile), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(ok)));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });
    it('renders data',async ()=>{
        let studentId = 1;
        render(<MemoryRouter initialEntries={[`/taprofile/${studentId}`]}>
        <Routes>
          <Route path="/taprofile/:studentId" element={<TaProfilePageContainer />} />
          <Route path="/error" element={<div>Error Page</div>} />
        </Routes>
      </MemoryRouter>);

        const fullNameRegex = new RegExp(`^${mockStudentJohnDoe.firstName}\\s+${mockStudentJohnDoe.lastName}$`, "i");
        const heading = await screen.findByRole("heading", { level: 1, name: fullNameRegex });
        expect(heading).toBeInTheDocument();
    })
})