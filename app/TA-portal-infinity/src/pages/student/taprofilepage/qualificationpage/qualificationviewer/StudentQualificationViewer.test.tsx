import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { mockDeptCodeQualificationResponse } from '../../../../../mocked-objects/qualification/mockDeptCodeQualificationResponse';
import StudentQualificationViewer from './StudentQualificationViewer';

const mockDeptCodes = ['COSC', 'MATH'];
const mockQualifications = mockDeptCodeQualificationResponse; 
vi.mock('../../../../../context/AuthContext', () => ({
  useAuth: () => ({ userRoles: ['STUDENT'] as const }),
}));
vi.mock('../../../../../api/student/qualification/fetchAllStudentQualifications', () => ({
  fetchAllStudentQualifications: vi.fn().mockResolvedValue([]), 
}));

vi.mock('../../../../../utility/genericapicontainer/GenericAPIContainer', () => ({
    GenericAPIContainer: ({ fetchFunction, render }: any) => {
        const isDeptFetch = fetchFunction.name.includes('fetchAllExistingDeptCodes');
        const result = isDeptFetch ? mockDeptCodes : mockQualifications;
        return render(result);
    },
}));


describe('<StudentQualificationViewer />', () => {
    it('shows the dropdown, and after selecting one, renders the table', async () => {
        render(
            <MemoryRouter>
                <StudentQualificationViewer studentId={123} />
            </MemoryRouter>
        );

        const select = screen.getByLabelText(/department/i);
        expect(select).toBeInTheDocument();

        expect(screen.queryByRole('table')).toBeNull();

        fireEvent.change(select, { target: { value: 'COSC' } });

        const matches = await screen.findAllByText((content) =>
            content.includes("somersaults")
        );

        expect(matches.length).toBeGreaterThan(0);
        expect(matches[0]).toBeVisible();
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();
        expect(table).toBeInTheDocument();

        const firstItem = mockDeptCodeQualificationResponse[0];
        expect(
            screen.getByText(firstItem.qualification.description!)
        ).toBeInTheDocument();
        const matchesCourse = screen.getAllByText(
            `${firstItem.course.deptCode} ${firstItem.course.courseNum}`
        );
        expect(matchesCourse.length).toBeGreaterThan(0);
        expect(matchesCourse[0]).toBeVisible();
    });
});
