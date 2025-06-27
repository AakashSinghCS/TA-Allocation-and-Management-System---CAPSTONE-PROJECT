// StudentQualificationTable.test.tsx
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import  StudentQualificationTable  from './StudentQualificationTable';
import { fetchAllStudentQualifications } from '../../../../../api/student/fetchAllStudentQualifications';
import { fetchSubmitStudentQualifications } from '../../../../../api/student/fetchSubmitStudentQualifications';


vi.mock('../../../../../api/student/fetchAllStudentQualifications', () => ({
  fetchAllStudentQualifications: vi.fn().mockResolvedValue([1]),
}));
vi.mock('../../../../../api/student/fetchSubmitStudentQualifications', () => ({
  fetchSubmitStudentQualifications: vi.fn(),
}));

const qualificationList = [
  {
    qualification: { id: 2, description: 'Do advanced math' },
    course: { deptCode: 'MATH', courseNum: '125' },
  },
  {
    qualification: { id: 1, description: 'Write code in JS' },
    course: { deptCode: 'COSC', courseNum: '111' },
  },
];

describe('<StudentQualificationTable />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders rows in sorted order with correct initial checks', async () => {
    render(
      <MemoryRouter>
        <StudentQualificationTable
          qualificationList={qualificationList}
          studentId={42}
        />
      </MemoryRouter>
    );

    const checkboxes = await screen.findAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3);

    const firstData = within(rows[1]).getAllByRole('cell');
    expect(firstData[1]).toHaveTextContent('Write code in JS');
    expect(firstData[2]).toHaveTextContent('COSC 111');
    expect(within(rows[1]).getByRole('checkbox')).toBeChecked();

    const secondData = within(rows[2]).getAllByRole('cell');
    expect(secondData[1]).toHaveTextContent('Do advanced math');
    expect(secondData[2]).toHaveTextContent('MATH 125');
    expect(within(rows[2]).getByRole('checkbox')).not.toBeChecked();
  });

  it('toggles a checkbox and submits updated list', async () => {
    render(
      <MemoryRouter>
        <StudentQualificationTable
          qualificationList={qualificationList}
          studentId={99}
        />
      </MemoryRouter>
    );

    const [cb1, cb2] = await screen.findAllByRole('checkbox');
    expect(cb1).toBeChecked();
    expect(cb2).not.toBeChecked();

    fireEvent.click(cb2);
    expect(cb2).toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(fetchSubmitStudentQualifications).toHaveBeenCalledWith(99, [1, 2]);
  });
});
