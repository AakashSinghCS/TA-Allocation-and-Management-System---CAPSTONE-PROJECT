import { fireEvent, render, screen } from "@testing-library/react";
import type { CourseProfile } from "../../../interfaces/course/Course";
import EditCourseDetails from "./EditCourseDetails";
import { courseFieldLabels } from "../../../interfaces/course/Course";
import { courseProfileFields } from "../../../interfaces/course/Course";

describe('EditCourseDetails', () => {
  const course: CourseProfile = { deptCode: 'COSC', courseNum: '101', name: 'Intro to CS' };
  const onSave = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders inputs and calls onSave with changed values', () => {
    render(
      <EditCourseDetails
        courseId={1}
        course={course}
        fields={courseProfileFields}
        labels={courseFieldLabels}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    const nameInput = screen.getByLabelText('Name');
    expect(nameInput).toHaveValue('Intro to CS');
    fireEvent.change(nameInput, { target: { value: 'CS Fundamentals' } });
    fireEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledWith({ courseNum: '101', deptCode: "COSC", name:"CS Fundamentals" });
  });

  it('calls onCancel when cancel clicked', () => {
    render(
      <EditCourseDetails
        courseId={1}
        course={course}
        fields={courseProfileFields}
        labels={courseFieldLabels}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });
});
