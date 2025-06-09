import { useState, useEffect } from 'react';
import CourseList from '../../components/features/courses/CourseList';
import CourseFilter from '../../components/features/courses/CourseFilter';
import CreateCourseForm from '../../components/features/courses/CreateCourseForm';
import CsvUpload from '../../components/features/courses/CsvUpload';
import type { Course } from '../../interfaces/course/Course';

// Mock data for demonstration
const mockCourses: Course[] = [
  { id: 1, name: 'Intro to Programming', deptCode: 'COSC', courseNum: '101', section: '001', term: 'Fall 2024', instructorId: 10, prerequisites: [] },
  { id: 2, name: 'Data Structures', deptCode: 'COSC', courseNum: '211', section: '001', term: 'Fall 2024', instructorId: 12, prerequisites: ['COSC 101'] },
  { id: 3, name: 'Databases', deptCode: 'COSC', courseNum: '304', section: '001', term: 'Winter 2025', instructorId: 15, prerequisites: ['COSC 211'] },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  useEffect(() => {
    // In a real application, we would fetch this data from an API
    setCourses(mockCourses);
    setFilteredCourses(mockCourses);
  }, []);

  const handleFilterChange = (filters: { term: string; searchQuery: string }) => {
    let updatedCourses = courses;

    if (filters.term) {
      updatedCourses = updatedCourses.filter(course => course.term === filters.term);
    }

    if (filters.searchQuery) {
      updatedCourses = updatedCourses.filter(course =>
        course.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        `${course.deptCode} ${course.courseNum}`.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    setFilteredCourses(updatedCourses);
  };

  const handleCreateCourse = (newCourse: Omit<Course, 'id'>) => {
    // In a real application, we would send this to an API
    const courseWithId = { ...newCourse, id: courses.length + 1 };
    setCourses([...courses, courseWithId]);
    setFilteredCourses([...courses, courseWithId]);
  };

  const handleFileUpload = (file: File) => {
    // Handle CSV file parsing and course creation
    console.log('Uploaded file:', file);
    // We will use a library like Papaparse to handle CSV parsing
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Course Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <CourseFilter onFilterChange={handleFilterChange} />
          <CourseList courses={filteredCourses} />
        </div>
        <div className="space-y-8">
          <CreateCourseForm onCreateCourse={handleCreateCourse} />
          <CsvUpload onFileUpload={handleFileUpload} />
        </div>
      </div>
    </div>
  );
}