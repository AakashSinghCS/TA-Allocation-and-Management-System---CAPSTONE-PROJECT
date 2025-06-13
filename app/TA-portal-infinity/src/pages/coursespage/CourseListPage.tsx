import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CourseList from '../../components/features/courses/CourseList';
import CourseFilter from '../../components/features/courses/CourseFilter';
import type { Course } from '../../interfaces/course/Course';

// STEP 1: Import the corrected API function
import { fetchFilteredCourses } from '../../api/section/postSectionByFilter'; // Consider renaming this file

// Mock data can be removed or used for initial state if desired.
const mockCourses: Course[] = [
  // ... mock data
];

export default function CourseListPage() {
  const navigate = useNavigate();
  // A single state to hold the courses to be displayed.
  const [courses, setCourses] = useState<Course[]>([]);
  // Add a loading state for better user experience
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Set initial courses if needed, or leave empty.
    setCourses(mockCourses);
  }, []);

  //  STEP 2: Update handleFilterChange to be an async function
  //  that uses the API response to update the state.

  const handleFilterChange = async (filters: {
    term: string;
    searchQuery: string;
    deptCode: string;
    type: string;
  }) => {
    setIsLoading(true); // Set loading to true before the API call
    console.log("Fetching courses with filters:", filters);
    
    // Call the API and wait for the results
    const fetchedCourses = await fetchFilteredCourses(filters);
    
    // Update the state with the data from the backend
    setCourses(fetchedCourses);
    setIsLoading(false); // Set loading to false after the API call completes
  };

  return (
    <div className="container mx-auto p-4">
      {/* ... (header JSX) */}
      <div>
        {/* ... (sub-header JSX) */}
        <div className="border p-4 rounded-md shadow-sm mb-4">
          <CourseFilter onFilterChange={handleFilterChange} />
        </div>
        {/* ★ STEP 3: Conditionally render a loading message or the course list */}
        {isLoading ? (
          <p>Loading courses...</p>
        ) : (
          <CourseList courses={courses} />
        )}
      </div>
    </div>
  );
}