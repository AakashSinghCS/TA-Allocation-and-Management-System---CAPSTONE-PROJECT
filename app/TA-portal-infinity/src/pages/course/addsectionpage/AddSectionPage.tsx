import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateSectionForm, { type CreateSectionData } from '../../../components/features/course/createsectionform/CreateSectionForm';
import { fetchCreateSection, type SectionAddDtoRequest } from '../../../api/section/fetchCreateSection';
import { fetchCreateCourse, type CourseAddDtoRequest } from '../../../api/course/fetchCreateCourse';
import SectionCsvImportInline from '../../../components/features/section/SectionCsvImportInline';
import type { CourseProfile } from '../../../interfaces/course/Course';
import { validateCourseProfile } from '../../../utility/validation/course/validateCourseProfile';
import { validateSectionProfile } from '../../../utility/validation/section/validateSectionProfile';
import type { SectionProfile } from '../../../interfaces/section/Section';
import { Info } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Folder, BookOpen, BookOpenText } from 'lucide-react';

export default function AddSectionPage() {
  const navigate = useNavigate();
  const [refreshSectionOptions, setRefreshSectionOptions] = useState<number>(0);
  const [sectionCreated, setSectionCreated] = useState(false);
  const [activeTab, setActiveTab] = useState<'bulk' | 'course' | 'section'>('bulk');
  // const sectionCreatedTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleCreateSection = async (data: CreateSectionData, setSectionErrors?: (e: any) => void): Promise<boolean | void> => {
    const courseProfile = extractCourseProfile(data);
    // For section creation, skip course name validation
    const { ok, sanitized, errors } = validateCourseProfile(courseProfile, { skipName: !data.isCourse });
    if (!ok) {
      toast.error(`Please fix the following:\n• ${errors.join("\n• ")}`);
      return;
    }

    if (data.isCourse) {
      const courseAddDtoRequest: CourseAddDtoRequest = {
        ...sanitized,
      }

      const success = await fetchCreateCourse(courseAddDtoRequest);

      if (success) {
        toast.success("Course is created! You can proceed with section creation.");
        setRefreshSectionOptions((v) => v + 1); // trigger refresh for Section Creation form
      } else {
        toast.error("Failed to create course. Are you sure it's not a duplicate?")
      }
    } else if (!data.isCourse) {
      const sectionProfile = extractSectionProfile(data);
      const { ok, sanitized: sanitizedSections, errors } = validateSectionProfile(sectionProfile);
      if (!ok) {
        toast.error(`Please fix the following:\n• ${errors.join("\n• ")}`);
        return;
      }
      const sectionAddDtoRequest: SectionAddDtoRequest = {
        ...sanitized,
        ...sanitizedSections,
        sectionSchedules: data.sectionSchedules,
        instructorId: data.instructorId
      }

      const result = await fetchCreateSection(sectionAddDtoRequest);
      if (result && result.success) {
        setSectionCreated(true);
        toast.success("Section created!");
        // --- Auto-dismiss logic (commented out for now, can be restored if needed) ---
        // if (sectionCreatedTimeout.current) clearTimeout(sectionCreatedTimeout.current);
        // sectionCreatedTimeout.current = setTimeout(() => setSectionCreated(false), 3000);
        // ---------------------------------------------------------------------------
        // Success message will persist until user creates another section or navigates away
        return true;
      } else {
        let msg = "Failed to create section.";
        let errorMap: any = {};
        if (result?.error) {
          // Debug: log the actual error response
          console.log("Section creation error response:", result.error);
          if (result.error.toLowerCase().includes("semester doesn't exist")) {
            msg = "Failed to create section. The combination of Year and Semester does not exist.";
            errorMap.year = "Invalid year/semester combination.";
            errorMap.semester = "Invalid year/semester combination.";
          } else if (result.error.toLowerCase().includes("already exists") || result.error.toLowerCase().includes("duplicate")) {
            msg = "Failed to create section. Section already exists for this course and term.";
            errorMap.section = "Section already exists for this course and term.";
          } else {
            msg = `Failed to create section. ${result.error}`;
          }
        }
        if (setSectionErrors && Object.keys(errorMap).length > 0) {
          setSectionErrors(errorMap);
        }
        toast.error(msg);
        return false;
      }
    }
  };

  return (

    <div className="max-w-7xl w-full mx-auto px-4 md:px-8 -mt-4 p-4 z-10">
      <div className="flex justify-between items-stretch mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#040941]">Course & Section Management</h1>
      </div>
   
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('bulk')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'bulk'
                  ? 'border-[#040941] text-[#040941]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Folder className="inline-block mr-1" size={16} />
               Bulk Upload
            </button>
            <button
              onClick={() => setActiveTab('course')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'course'
                  ? 'border-[#040941] text-[#040941]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpen className="inline-block mr-1" size={16} />
               Create Course
            </button>
            <button
              onClick={() => setActiveTab('section')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'section'
                  ? 'border-[#040941] text-[#040941]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpenText className="inline-block mr-1" size={16} />
               Create Section
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow-lg p-6 rounded-2xl border border-gray-200">
        {activeTab === 'bulk' && (
          <>
            <h2 className="text-xl font-semibold mb-3 text-[#040941]">Bulk Upload Sections</h2>
            <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-300 rounded px-3 py-3 text-amber-900">
              <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Upload multiple sections at once using a CSV file. This is the fastest way to create multiple sections.</span>
            </div>
            <SectionCsvImportInline />
          </>
        )}


        {activeTab === 'course' && (
          <>
            <h2 className="text-xl font-semibold mb-3 text-[#040941]">Course Creation</h2>
            <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-300 rounded px-3 py-3 text-amber-900">
              <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Create a new course for the system. If the course already exists, use the section creation tab instead.</span>
            </div>
            <CreateSectionForm onCreateSection={handleCreateSection} mode="course" />
          </>
        )}

        {activeTab === 'section' && (
          <>
            <h2 className="text-xl font-semibold mb-3 text-[#040941]">Section Creation</h2>
            <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-300 rounded px-3 py-3 text-amber-900">
              <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Add a section to an existing course. Make sure the course already exists before adding a section.</span>
            </div>
            {sectionCreated && (
              <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
            )}
            <CreateSectionForm onCreateSection={handleCreateSection} mode="section" refreshOptions={refreshSectionOptions} />
          </>
        )}
      </div>
    </div>
  );
}

function extractCourseProfile(data: CreateSectionData): Partial<CourseProfile> {
  return {
    name: data.name ?? undefined,
    deptCode: data.deptCode,
    courseNum: data.courseNum,
  };
}

function extractSectionProfile(data: CreateSectionData): Partial<SectionProfile> {
  return {
    section: data.section ?? undefined,
    year: data.year ?? undefined,
    semester: data.semester ?? undefined,
    type: data.type ?? undefined
  };
}