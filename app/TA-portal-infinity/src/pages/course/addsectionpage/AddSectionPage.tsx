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


export default function AddSectionPage() {
  const navigate = useNavigate();
  const [refreshSectionOptions, setRefreshSectionOptions] = useState<number>(0);

  const handleCreateSection = async (data: CreateSectionData) => {
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
        // navigate('/user/coordinator/sections', { replace: true });
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

      const success = await fetchCreateSection(sectionAddDtoRequest);
      if (success) {
        alert("Section is created!");
        navigate('/user/coordinator/sections', { replace: true });
      } else {
        alert("Failed to create section. Are you sure it's not a duplicate?")
      }
    }
  };



  return (
    <div className="container ml-0 mr-auto p-2 w-full max-w-5xl z-10">
      <h1 className="text-2xl font-bold mb-8 text-center">Course & Section Creation</h1>
      
      {/* If we want to force vertical stacking for all screen sizes, use: */}
        {/* 
          <div className="flex flex-col gap-8"> 
        */}
      {/* (This will stack Course Creation and Section Creation vertically on all devices.) */}


      {/* flex-col md:flex-row: vertical on mobile, horizontal (side-by-side) on desktop */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Course Creation Area */}
        <div className="flex-1 md:basis-[420px] md:min-w-[380px] bg-white shadow-lg p-6 rounded-2xl border border-blue-200">
          <h2 className="text-xl font-semibold mb-2 text-blue-700">Course Creation</h2>
          <p className="mb-4 text-gray-600 text-sm">Create a new course. This is for adding a new course to the system. If the course already exists, use the section creation form instead.</p>
          <CreateSectionForm onCreateSection={handleCreateSection} mode="course" />
        </div>
        {/* Section Creation Area */}
        <div className="flex-1 bg-white shadow-lg p-6 rounded-2xl border border-green-200">
          <h2 className="text-xl font-semibold mb-2 text-green-700">Section Creation</h2>
          <p className="mb-4 text-gray-600 text-sm">Add a section to an existing course. Make sure the course already exists before adding a section.</p>
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