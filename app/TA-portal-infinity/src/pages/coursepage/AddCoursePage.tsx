import { useNavigate } from 'react-router-dom';
import CreateCourseForm from '../../components/features/courses/CreateCourseForm';
import CsvUpload from '../../components/features/courses/CsvUpload';
import type { Course } from '../../interfaces/course/Course';

export default function AddCoursePage() {
  const navigate = useNavigate();

  /**
   * Handles the creation of a new course.
   * In a real application, this would send the new course data to an API.
   * @param newCourse - The course object to be created, without an id.
   */
  const handleCreateCourse = (newCourse: Omit<Course, 'id'>) => {
    // This is a placeholder. In a real app, you would send this to the backend API.
    console.log('Creating new course:', newCourse);
    // After successful creation, you might want to navigate back to the course list.
    navigate('/courses');
  };

  /**
   * Handles the file upload for CSV.
   * In a real application, this would parse the CSV and send the data to an API.
   * @param file - The uploaded CSV file.
   */
  const handleFileUpload = (file: File) => {
    // This is a placeholder. In a real app, you would handle CSV parsing and API calls here.
    console.log('Uploaded file:', file);
    // After successful upload, you might want to navigate back to the course list.
    navigate('/courses');
  };

  return (
    <div className="container mx-auto p-4">
      <div className='mb-6'>
        <button
          onClick={() => navigate('/courses')}
          className="text-sm font-semibold text-slate-600 hover:text-slate-800 flex items-center mb-2"
        >
          {/* Using a simple arrow character for the icon */}
          <span aria-hidden="true" className='text-lg mr-1'>←</span>
          <span>Back to Course List</span>
        </button>
        <h1 className="text-2xl font-bold">Add New Course</h1>
      </div>

      <div className="space-y-8">
        <div className="border p-4 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Add Course Manually</h2>
          <CreateCourseForm onCreateCourse={handleCreateCourse} />
        </div>
        <div className="border p-4 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Upload Courses via CSV</h2>
          <CsvUpload onFileUpload={handleFileUpload} />
        </div>
      </div>
    </div>
  );
}