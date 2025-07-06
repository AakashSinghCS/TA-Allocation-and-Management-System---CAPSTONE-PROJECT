import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeptCodeCourseNumSectionYearSemesterDropdownContainer from '../deptcodecoursenumsectionyearsemesterdropdowncontainer/DeptCodeCourseNumSectionYearSemesterDropdownContainer';
import * as apiCourseNums from '../../../../api/course/sectionfilter/fetchAllExistingCourseNums';
import * as apiSections from '../../../../api/course/sectionfilter/fetchAllExistingSections';
import * as apiYears from '../../../../api/course/sectionfilter/fetchAllExistingYears';
import * as apiSemesters from '../../../../api/course/sectionfilter/fetchAllExistingSemesters';

vi.mock('../../../../api/course/sectionfilter/fetchAllExistingCourseNums', () => ({
  fetchAllExistingCourseNums: vi.fn(),
}));
vi.mock('../../../../api/course/sectionfilter/fetchAllExistingSections', () => ({
  fetchAllExistingSections: vi.fn(),
}));
vi.mock('../../../../api/course/sectionfilter/fetchAllExistingYears', () => ({
  fetchAllExistingYears: vi.fn(),
}));
vi.mock('../../../../api/course/sectionfilter/fetchAllExistingSemesters', () => ({
  fetchAllExistingSemesters: vi.fn(),
}));

describe('DeptCodeCourseNumSectionYearSemesterDropdownContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiCourseNums.fetchAllExistingCourseNums as any).mockResolvedValue(['101', '102']);
    (apiSections.fetchAllExistingSections as any).mockResolvedValue(['A', 'B']);
    (apiYears.fetchAllExistingYears as any).mockResolvedValue([2024, 2025]);
    (apiSemesters.fetchAllExistingSemesters as any).mockResolvedValue(['W1', 'S1']);
  });

  it('disables dependent selects until parent is chosen and loads course numbers', async () => {
    render(
      <DeptCodeCourseNumSectionYearSemesterDropdownContainer
        allExistingDeptCodes={['COSC', 'MATH']}
        mode="small"
        onChange={vi.fn()}
      />
    );

    const [deptSelect, courseNumSelect, sectionSelect, yearSelect, semesterSelect] =
      screen.getAllByRole('combobox');

    expect(deptSelect).toBeEnabled();
    expect(courseNumSelect).toBeDisabled();
    expect(sectionSelect).toBeDisabled();
    expect(yearSelect).toBeDisabled();
    expect(semesterSelect).toBeDisabled();

    fireEvent.change(deptSelect, { target: { value: 'COSC' } });
    expect(apiCourseNums.fetchAllExistingCourseNums).toHaveBeenCalledWith('COSC');

    await waitFor(() => {
      expect(courseNumSelect).toBeEnabled();
      expect(screen.getByRole('option', { name: '101' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '102' })).toBeInTheDocument();
    });
  });
});
