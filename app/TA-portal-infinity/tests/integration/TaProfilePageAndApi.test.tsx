import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TaProfilePage from "../../src/pages/taprofilepage/TaProfilePage"
import { mockStudentJohnDoe } from '../../src/mocked-objects/mockStudents'

const mockProfile = {
    student: mockStudentJohnDoe
}

describe('student details integration with api call', () => {
    beforeEach(() => {
        const profileResponse = new Response(JSON.stringify(mockProfile), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
        vi.stubGlobal('fetch', vi.fn((input: RequestInfo) => {
            //to be added later when backend is implemented. Don't know the mapping yet.
            // const url = typeof input === 'string' ? input : input.url;
            // if (url.endsWith(`/student/${studentId}`)) {
            //     return Promise.resolve(profileResponse);
            // }
            // if (url.includes('/student/') && url.includes('sections')) {
            //     return Promise.resolve(sectionsResponse);
            // }
            // return Promise.resolve(new Response('[]', { status: 200 }));
            return Promise.resolve(profileResponse);
        }));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });
    it('renders data', async () => {
        let studentId = 1;
        render(<MemoryRouter initialEntries={[`/taprofile/${studentId}`]}>
            <Routes>
                <Route path="/taprofile/:studentId" element={<TaProfilePage />} />
            </Routes>
        </MemoryRouter>);

        const fullNameRegex = new RegExp(`^${mockStudentJohnDoe.firstName}\\s+${mockStudentJohnDoe.lastName}$`, "i");
        const heading = await screen.findByRole("heading", { level: 1, name: fullNameRegex });
        expect(heading).toBeInTheDocument();
    })
})