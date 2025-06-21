// tests/integration/TaProfilePageAndApi.test.tsx
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import TaProfilePage from '../../src/pages/taprofilepage/TaProfilePage';
import { mockStudentJohnDoe } from '../../src/mocked-objects/user/mockStudents';
import { mockSectionCOSC111 } from '../../src/mocked-objects/section/mockSectionCOSC111';
import { mockTaProfileQuestion1 } from '../../src/mocked-objects/profile/mockTaProfileQuestions';

// --- MOCK useAuth so StudentTabNav doesn't blow up ---
vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    token: null,
    login: () => {},
    logout: () => {},
    isAuthenticated: true,
    userRoles: ['STUDENT'],       // or ['COORDINATOR'] if you need compare tab
    userId: 1,
  }),
}));

describe('TaProfilePage — end-to-end integration (with all fetches mocked)', () => {
  const studentId = 1;

  beforeEach(() => {

    const profileResponse = new Response(
      JSON.stringify({ student: mockStudentJohnDoe }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

    const sectionResponse = new Response(
      JSON.stringify([mockSectionCOSC111]),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

    const questionResponse = new Response(
      JSON.stringify({ profileAnswers: [mockTaProfileQuestion1] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

    vi.stubGlobal('fetch', vi.fn((input: RequestInfo) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes(`/students/${studentId}`) && url.includes('sections')) { //to be changed later when backend URL is implemented
        return Promise.resolve(sectionResponse);
      }
      if (url.endsWith(`/students/${studentId}`)) {//to be changed later when backend URL is implemented
        return Promise.resolve(profileResponse);
      }
      if (url.endsWith(`/profiles/${studentId}`)) {//to be changed later when backend URL is implemented
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

  it('renders student name, one real section, and one profile question', async () => {
    render(
      <MemoryRouter initialEntries={[`/user/taprofile/${studentId}`]}>
        <Routes>
          <Route path="/user/taprofile/:studentId" element={<TaProfilePage />} />
        </Routes>
      </MemoryRouter>
    );

    const fullNameRegex = new RegExp(
      `^${mockStudentJohnDoe.firstName}\\s+${mockStudentJohnDoe.lastName}$`,
      'i'
    );
    const heading = await screen.findByRole('heading', {
      level: 1,
      name: fullNameRegex,
    });
    expect(heading).toBeInTheDocument();

    const allocBtn = screen.getByRole('button', { name: /Allocation History/i });
    fireEvent.click(allocBtn);

    const sectionLink = await screen.findByTestId(
      `section-link-${mockSectionCOSC111.sectionDetails?.id}`
    );
    expect(sectionLink).toHaveTextContent(
      mockSectionCOSC111.sectionDetails?.name ?? ''
    );

    const questionMatches = await screen.findAllByText(
      mockTaProfileQuestion1.description ?? ''
    );
    expect(questionMatches.length).toBeGreaterThan(0);

    if (mockTaProfileQuestion1.answers) {
      for (const { description } of mockTaProfileQuestion1.answers) {
        const matches = await screen.findAllByText((content, node) =>
          (node?.textContent ?? '').includes(description ?? '')
        );
        expect(matches.length).toBeGreaterThan(0);
      }
    }
  });
});
