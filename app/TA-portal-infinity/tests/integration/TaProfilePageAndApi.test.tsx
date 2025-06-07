import { render, screen } from '@testing-library/react';
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
        render(<TaProfilePageContainer />);

        const fullNameRegex = new RegExp(`^${mockStudentJohnDoe.firstName}\\s+${mockStudentJohnDoe.lastName}$`, "i");
        expect(screen.getByRole("heading", { level: 1, name: fullNameRegex })).toBeInTheDocument();
    })
})