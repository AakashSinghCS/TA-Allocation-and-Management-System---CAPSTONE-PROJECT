import { useState, useEffect } from 'react';
import CourseList from '../../components/features/courses/CourseList';
import CourseFilter from '../../components/features/courses/CourseFilter';
import CreateCourseForm from '../../components/features/courses/CreateCourseForm';
import CsvUpload from '../../components/features/courses/CsvUpload';
import type { Course } from '../../interfaces/course/Course';

// Mock data for demonstration
const mockCourses: Course[] = [
  { id: 1, name: 'Intro to Programming', deptCode: 'COSC', courseNum: '101', section: '001', term: 'Fall 2024', type: 'Lecture', instructorId: 10, prerequisites: [] },
  { id: 2, name: 'Data Structures', deptCode: 'COSC', courseNum: '211', section: '001', term: 'Fall 2024', type: 'Lecture', instructorId: 12, prerequisites: ['COSC 101'] },
  { id: 3, name: 'Databases', deptCode: 'COSC', courseNum: '304', section: '001', term: 'Winter 2025', type: 'Laboratory', instructorId: 15, prerequisites: ['COSC 211'] },
  { id: 4, name: 'Intro to Programming Lab', deptCode: 'COSC', courseNum: '101', section: 'L01', term: 'Fall 2024', type: 'Laboratory', instructorId: 10, prerequisites: [] },
  { id: 5, name: 'Data Structures Tutorial', deptCode: 'COSC', courseNum: '211', section: 'T01', term: 'Fall 2024', type: 'Tutorial', instructorId: 12, prerequisites: ['COSC 101'] },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  useEffect(() => {
    // In a real application, we would fetch this data from an API
    setCourses(mockCourses);
    setFilteredCourses(mockCourses);
  }, []);

  const handleFilterChange = (filters: {
    term: string;
    searchQuery: string;
    deptCode: string;
    type: string;
  }) => {
    let updatedCourses = courses;

    // Filter by Term
    if (filters.term) {
      updatedCourses = updatedCourses.filter(course => course.term === filters.term);
    }

    // Filter by Search Query (Course Name)
    if (filters.searchQuery) {
      updatedCourses = updatedCourses.filter(course =>
        course.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    // Filter by Department Code
    if (filters.deptCode) {
      updatedCourses = updatedCourses.filter(course =>
        course.deptCode.toLowerCase().includes(filters.deptCode.toLowerCase())
      );
    }

    // Filter by Type
    if (filters.type) {
      updatedCourses = updatedCourses.filter(course => course.type === filters.type);
    }

    setFilteredCourses(updatedCourses);
  };

  const handleCreateCourse = (newCourse: Omit<Course, 'id'>) => {
    // In a real application, we willl send this to an API
    const courseWithId = { ...newCourse, id: courses.length + 1 };
    setCourses([...courses, courseWithId]);
    setFilteredCourses([...courses, courseWithId]); // Also update the filtered list
  };

  const handleFileUpload = (file: File) => {
    // Handle CSV file parsing and course creation
    console.log('Uploaded file:', file);
    // It's a good idea to use a library like Papaparse to handle CSV parsing
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Course Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Course List & Filters</h2>
          <div className="border p-4 rounded-md shadow-sm mb-4">
            <CourseFilter onFilterChange={handleFilterChange} />
          </div>
          <CourseList courses={filteredCourses} />
        </div>
        <div className="space-y-8">
          <div className="border p-4 rounded-md shadow-sm">
            <CreateCourseForm onCreateCourse={handleCreateCourse} />
          </div>
          <div className="border p-4 rounded-md shadow-sm">
            <CsvUpload onFileUpload={handleFileUpload} />
          </div>
        </div>
      </div>
    </div>
  );
}