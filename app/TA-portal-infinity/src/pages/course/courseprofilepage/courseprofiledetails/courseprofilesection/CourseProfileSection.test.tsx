import { render, screen } from "@testing-library/react";
import type { Course, CourseProfile } from "../../../../../interfaces/course/Course";
import CourseProfileSection, { createProfileDetails } from "./CourseProfileSection";

describe('CourseProfileSection and createProfileDetails', () => {
  const fields: (keyof CourseProfile)[] = ['deptCode', 'courseNum', 'name'];
  const labels: Record<keyof CourseProfile, string> = { deptCode: 'Department', courseNum: 'Course Number', name: 'Course Name' };
  const course: Course = { id: 1, deptCode: 'MATH', courseNum: '202', name: 'Calculus II' };

  it('createProfileDetails returns correct array', () => {
    const details = createProfileDetails(course, fields, labels);
    expect(details).toEqual([
      { label: 'Department', value: 'MATH' },
      { label: 'Course Number', value: '202' },
      { label: 'Course Name', value: 'Calculus II' },
    ]);
  });

  it('renders course header and fields', () => {
    render(
      <CourseProfileSection
        course={course}
        profileFields={fields}
        fieldLabels={labels}
        isCoordinator={true}
      />
    );
    expect(screen.getByText('MATH 202 — Calculus II')).toBeInTheDocument();
    fields.forEach(field => {
      expect(screen.getByText(`${labels[field]}:`)).toBeInTheDocument();
      expect(screen.getByText(String(course[field]))).toBeInTheDocument();
    });
  });
});