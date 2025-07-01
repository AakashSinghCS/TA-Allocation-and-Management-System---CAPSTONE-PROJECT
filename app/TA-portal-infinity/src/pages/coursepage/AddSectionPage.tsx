import { useNavigate } from 'react-router-dom';
import CreateSectionForm, { type CreateSectionData } from '../../components/features/course/createsectionform/CreateSectionForm';
import CsvUpload from '../../components/features/course/CsvUpload'; // stub
import { fetchCreateSection, type SectionAddDtoRequest } from '../../api/section/fetchCreateSection';
import { fetchCreateCourse, type CourseAddDtoRequest } from '../../api/course/fetchCreateCourse';

export default function AddSectionPage() {
  const navigate = useNavigate();

  const handleCreateSection = async (data: CreateSectionData) => {
    if(data.isCourse){
      const courseAddDtoRequest : CourseAddDtoRequest = {
                  deptCode: data.deptCode,
        name: data.name,
        courseNum : data.courseNum,
      }
      const ok = await fetchCreateCourse(courseAddDtoRequest);
      if(ok){
        alert("Course is created!");
        navigate('/user/coordinator/sections', { replace: true });
      }else{
        alert("Failed to create course")
      }
    }else if(!data.isCourse){
      const sectionAddDtoRequest : SectionAddDtoRequest = {
        deptCode: data.deptCode,
        name: data.name,
        courseNum : data.courseNum,
        section : data.section,
        type : data.type,
        year : data.year,
        semester : data.semester,
        sectionSchedules : data.sectionSchedules,
        instructorId : data.instructorId
      }

      const ok = await fetchCreateSection(sectionAddDtoRequest);
      if(ok){
        alert("Section is created!");
        navigate('/user/coordinator/sections', { replace: true });
      }else{
        alert("Failed to create section")
      }
    }
  };

  const handleFileUpload = (file: File) => {
    // TODO: implement CSV upload
    console.log('CSV file:', file);
  };

  return (
    <div className="container mx-auto p-4 w-full max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Add Section or Course</h1>
      <div className="space-y-8">
        <div className="border p-4 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Add Section or Course Manually</h2>
          <CreateSectionForm onCreateSection={handleCreateSection} />
        </div>
        <div className="border p-4 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Upload Sections via CSV</h2>
          <CsvUpload onFileUpload={handleFileUpload} />
        </div>
      </div>
    </div>
  );
}
