import { fetchAllInstructorQualifications, type QualificationResponse } from "../../../../api/instructor/fetchAllInstructorQualifications";
import QualificationCard from "../../../../components/features/qualification/QualificationCard";
import SectionCard from "../../../../components/features/section/sectioncard/SectionCard";
import { GenericAPIContainer } from "../../../../utility/genericapicontainer/GenericAPIContainer";

export default function InstructorQualificationViewer ({instructorId,}:{instructorId : number}){
    return (
    <GenericAPIContainer<QualificationResponse[] | null>
      fetchFunction={() => fetchAllInstructorQualifications(instructorId)}
      render={(response) => (
        <div className={"grid gap-3 "}>
          <div className="hidden lg:grid lg:grid-cols-2 font-medium text-sm text-slate-600">
            <span>Sections Teaching</span>
            <span>Qualifications of Course</span>
          </div>

          {response && response.map((resp) => (
            <div
              key={resp.section.sectionDetails?.id}
              className="grid gap-2 sm:grid-cols-1 lg:grid-cols-[1fr_2fr]">
              <SectionCard
                section={resp.section}
                className=""/>
              <QualificationCard course= {{id : resp.section.sectionDetails?.id, deptCode: resp.section.sectionDetails?.deptCode}} 
                initialQualifications = {resp.qualifications}/>
            </div>
          ))}
        </div>
      )}
    />
  );
}