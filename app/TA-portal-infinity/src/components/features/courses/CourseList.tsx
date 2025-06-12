import type { Course } from '../../../interfaces/course/Course';

interface CourseListProps {
  courses: Course[];
}

export default function CourseList({ courses }: CourseListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course) => (
        <div key={course.id} className="border p-4 rounded-md shadow-sm">
          <h3 className="font-bold">{course.name}</h3>
          <p>{course.deptCode} {course.courseNum} - {course.section}</p>
          <p>Term: {course.term}</p>
          <p>Instructor ID: {course.instructorId}</p>
          <p>Prerequisites: {course.prerequisites.join(', ')}</p>
        </div>
      ))}
    </div>
  );
}