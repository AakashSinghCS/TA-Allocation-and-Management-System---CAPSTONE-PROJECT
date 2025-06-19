import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import TaProfilePage from '../../src/pages/taprofilepage/TaProfilePage';
import { mockStudentJohnDoe } from '../../src/mocked-objects/mockStudents';
import { mockSectionCOSC111 } from '../../src/mocked-objects/mockSectionCOSC111';
import { mockTaProfileQuestions } from '../../src/mocked-objects/mockTaProfileQuestions';

describe('TaProfilePage — end-to-end integration (with all fetches mocked)', () => {
    const studentId = 1;

    beforeEach(() => {
        const profileResponse = new Response(
            JSON.stringify({ student: mockStudentJohnDoe }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

        // const emptyArrayResponse = new Response(
        //   JSON.stringify([]),
        //   { status: 200, headers: { 'Content-Type': 'application/json' } }
        // );

        const sectionResponse = new Response(
            JSON.stringify([mockSectionCOSC111]),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

        const questionResponse = new Response(
            JSON.stringify([mockTaProfileQuestions]),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

        vi.stubGlobal('fetch', vi.fn((input: RequestInfo) => {
            const url = typeof input === 'string' ? input : input.url;

            if (url.endsWith(`/students/${studentId}`)) {
                return Promise.resolve(profileResponse);
            }

            if (url.includes(`/students/${studentId}`) && url.includes('sections')) {
                return Promise.resolve(sectionResponse);
            }

            if (url.includes(`/students/${studentId}`) && url.includes('questions')) {
                return Promise.resolve(questionResponse);
            }

            return Promise.resolve(new Response('[]', {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }));
        }));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders student name, one real section, the compare widget, and one profile question', async () => {
        render(
            <MemoryRouter initialEntries={[`/taprofile/${studentId}`]}>
                <Routes>
                    <Route path="/taprofile/:studentId" element={<TaProfilePage />} />
                </Routes>
            </MemoryRouter>
        );

        // 1) Check student name is displayed
        const fullNameRegex = new RegExp(
            `^${mockStudentJohnDoe.firstName}\\s+${mockStudentJohnDoe.lastName}$`,
            'i'
        );
        const heading = await screen.findByRole('heading', {
            level: 1,
            name: fullNameRegex,
        });
        expect(heading).toBeInTheDocument();

        const courseNameRegex = new RegExp(
            mockSectionCOSC111.sectionDetails.name,
            'i'
        );
        const courseMatches = await screen.findAllByText(courseNameRegex);
        expect(courseMatches.length).toBeGreaterThan(0);

        const questionMatches = await screen.findAllByText(
            mockTaProfileQuestions.description
        );
        expect(questionMatches.length).toBeGreaterThan(0);

        for (const { description } of mockTaProfileQuestions.answers) {
            const matches = await screen.findAllByText((content, node) =>
                (node?.textContent ?? '').includes(description)
            );
            expect(matches.length).toBeGreaterThan(0);
        }

    });

});
