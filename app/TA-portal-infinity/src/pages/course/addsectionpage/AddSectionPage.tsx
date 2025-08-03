import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateSectionForm, { type CreateSectionData } from '../../../components/features/course/createsectionform/CreateSectionForm';
import { fetchCreateSection, type SectionAddDtoRequest } from '../../../api/section/fetchCreateSection';
import { fetchCreateCourse, type CourseAddDtoRequest } from '../../../api/course/fetchCreateCourse';
import SectionCsvImportInline from '../../../components/features/section/SectionCsvImportInline';
import type { CourseProfile } from '../../../interfaces/course/Course';
import { validateCourseProfile } from '../../../utility/validation/course/validateCourseProfile';
import { validateSectionProfile } from '../../../utility/validation/section/validateSectionProfile';
import type { SectionProfile } from '../../../interfaces/section/Section';

export default function AddSectionPage() {
  const navigate = useNavigate();
  const [refreshSectionOptions, setRefreshSectionOptions] = useState<number>(0);
  const [sectionCreated, setSectionCreated] = useState(false);
  // const sectionCreatedTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleCreateSection = async (data: CreateSectionData, setSectionErrors?: (e: any) => void): Promise<boolean | void> => {
    const courseProfile = extractCourseProfile(data);
    // For section creation, skip course name validation
    const { ok, sanitized, errors } = validateCourseProfile(courseProfile, { skipName: !data.isCourse });
    if (!ok) {
      alert(`Please fix the following:\n• ${errors.join("\n• ")}`);
      return;
    }

    if (data.isCourse) {
      const courseAddDtoRequest: CourseAddDtoRequest = {
        ...sanitized,
      }

      const success = await fetchCreateCourse(courseAddDtoRequest);

      if (success) {
        alert("Course is created!");
        setRefreshSectionOptions((v) => v + 1); // trigger refresh for Section Creation form
        navigate('/user/coordinator/sections', { replace: true });
      } else {
        alert("Failed to create course. Are you sure it's not a duplicate?")
      }
    } else if (!data.isCourse) {
      const sectionProfile = extractSectionProfile(data);
      const { ok, sanitized: sanitizedSections, errors } = validateSectionProfile(sectionProfile);
      if (!ok) {
        alert(`Please fix the following:\n• ${errors.join("\n• ")}`);
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
        alert(msg);
        return false;
      }
    }
  };

  return (
    <div className="container ml-0 mr-auto p-2 w-full max-w-5xl z-10">
      <h1 className="text-2xl font-bold mb-8">Course & Section Creation</h1>
      
      {/* If we want to force vertical stacking for all screen sizes, use: */}
        {/* 
          <div className="flex flex-col gap-8"> 
        */}
      {/* (This will stack Course Creation and Section Creation vertically on all devices.) */}


      {/* flex-col md:flex-row: vertical on mobile, horizontal (side-by-side) on desktop */}
      <div className="flex flex-col xl:grid xl:grid-cols-[420px_1fr] gap-8">
        {/* Course Creation Area */}
        <div className="bg-white shadow-lg p-6 rounded-2xl border border-blue-200">
          <h2 className="text-xl font-semibold mb-2 text-blue-700">Course Creation</h2>
          <p className="mb-4 text-gray-600 text-sm">Create a new course. This is for adding a new course to the system. If the course already exists, use the section creation form instead.</p>
          <CreateSectionForm onCreateSection={handleCreateSection} mode="course" />
        </div>
        {/* Section Creation Area */}
        <div className="bg-white shadow-lg p-6 rounded-2xl border border-green-200">
          <h2 className="text-xl font-semibold mb-2 text-green-700">Section Creation</h2>
          <p className="mb-4 text-gray-600 text-sm">Add a section to an existing course. Make sure the course already exists before adding a section.</p>
          {sectionCreated && (
            <div className="mb-4 text-green-700 bg-green-100 border border-green-300 rounded px-4 py-2 text-center transition-opacity duration-500">
              Section created!
            </div>
          )}
          <CreateSectionForm onCreateSection={handleCreateSection} mode="section" refreshOptions={refreshSectionOptions} />
        </div>
      </div>
      <div className="mt-10 w-full max-w-none">
        <SectionCsvImportInline />
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