import { useNavigate } from 'react-router-dom';
import CreateSectionForm, { type CreateSectionData } from '../../../components/features/course/createsectionform/CreateSectionForm';
import { fetchCreateSection, type SectionAddDtoRequest } from '../../../api/section/fetchCreateSection';
import { fetchCreateCourse, type CourseAddDtoRequest } from '../../../api/course/fetchCreateCourse';
import CsvUpload from '../../../components/features/csv/csvupload/CsvUpload';
import type { CourseProfile } from '../../../interfaces/course/Course';
import { validateCourseProfile } from '../../../utility/validation/course/validateCourseProfile';
import { validateSectionProfile } from '../../../utility/validation/section/validateSectionProfile';
import type { SectionProfile } from '../../../interfaces/section/Section';

export default function AddSectionPage() {
  const navigate = useNavigate();

  const handleCreateSection = async (data: CreateSectionData) => {
    const courseProfile = extractCourseProfile(data);
    const { ok, sanitized, errors } = validateCourseProfile(courseProfile);

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
        navigate('/user/coordinator/sections', { replace: true });
      } else {
        alert("Failed to create course")
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
        alert("Failed to create section")
      }
    }
  };

  const handleFileUpload = (file: File) => {
    // TODO: implement CSV upload
    console.log('CSV file:', file);
  };

  return (
    <div className="container mx-auto p-4 w-full max-w-3xl z-10">
      <h1 className="text-2xl font-bold mb-4">Add Section or Course</h1>
      <div className="space-y-8">
        <div className="shadow-lg p-4 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Add Section or Course Manually</h2>
          <CreateSectionForm onCreateSection={handleCreateSection} />
        </div>
        <div className="shadow-lg p-4 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Upload Sections via CSV</h2>
          <CsvUpload onFileUpload={handleFileUpload} />
        </div>
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