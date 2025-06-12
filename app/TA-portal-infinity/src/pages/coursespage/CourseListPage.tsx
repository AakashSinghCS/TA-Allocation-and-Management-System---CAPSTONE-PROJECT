import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CourseList from '../../components/features/courses/CourseList';
import CourseFilter from '../../components/features/courses/CourseFilter';
import type { Course } from '../../interfaces/course/Course';

// ★ STEP 1: import API
import { postSectionByFilter } from '../../api/section/postSectionByFilter';


// Mock data for demonstration - This will likely be replaced by API data later
const mockCourses: Course[] = [
  { id: 1, name: 'Intro to Programming', deptCode: 'COSC', courseNum: '101', section: '001', term: 'Fall 2024', type: 'Lecture', instructorId: 10, prerequisites: [] },
  { id: 2, name: 'Data Structures', deptCode: 'COSC', courseNum: '211', section: '001', term: 'Fall 2024', type: 'Lecture', instructorId: 12, prerequisites: ['COSC 101'] },
  { id: 3, name: 'Databases', deptCode: 'COSC', courseNum: '304', section: '001', term: 'Winter 2025', type: 'Laboratory', instructorId: 15, prerequisites: ['COSC 211'] },
  { id: 4, name: 'Intro to Programming Lab', deptCode: 'COSC', courseNum: '101', section: 'L01', term: 'Fall 2024', type: 'Laboratory', instructorId: 10, prerequisites: [] },
  { id: 5, name: 'Data Structures Tutorial', deptCode: 'COSC', courseNum: '211', section: 'T01', term: 'Fall 2024', type: 'Tutorial', instructorId: 12, prerequisites: ['COSC 101'] },
];

export default function CourseListPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  useEffect(() => {
    // In a real application, we would fetch this data from an API
    setCourses(mockCourses);
    setFilteredCourses(mockCourses);
  }, []);

  /**
   * ★ STEP 2: Update this 
   * Handles changes from the filter component.
   * Now it calls the API function instead of just filtering local data.
   * @param filters - An object containing all the active filter values.
   */
  const handleFilterChange = (filters: {
    term: string;
    searchQuery: string;
    deptCode: string;
    type: string;
  }) => {
    console.log("Filters received in CourseListPage:", filters);

    // Call the API function with the filter data
    postSectionByFilter(filters);

    // Note: The old local filtering logic is now bypassed.
    // You can remove it or keep it if you need it for other purposes.
    /*
    let updatedCourses = courses;
    // ... old filtering logic was here ...
    setFilteredCourses(updatedCourses);
    */
  };

  return (
    <div className="container mx-auto p-4">
      <div className='mb-6'>
        <button
          onClick={() => navigate('/')}
          className="text-sm font-semibold text-slate-600 hover:text-slate-800 flex items-center mb-2"
        >
          {/* Using a simple arrow character for the icon */}
          <span aria-hidden="true" className='text-lg mr-1'>←</span>
          <span>Back to Home</span>
        </button>
        <h1 className="text-2xl font-bold">Course Management</h1>
      </div>

      <div>
        <div className='flex justify-between items-center mb-4'>
            <h2 className="text-xl font-semibold">Course List & Filters</h2>
            <Link to="/courses/add" className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600">
              Add New Course
            </Link>
        </div>
        <div className="border p-4 rounded-md shadow-sm mb-4">
          <CourseFilter onFilterChange={handleFilterChange} />
        </div>
        <CourseList courses={filteredCourses} />
      </div>
    </div>
  );
}