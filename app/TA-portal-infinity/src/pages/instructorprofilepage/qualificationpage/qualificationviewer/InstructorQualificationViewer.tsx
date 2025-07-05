import { fetchAllInstructorQualifications, type QualificationResponse } from "../../../../api/instructor/fetchAllInstructorQualifications";
import { fetchGetInstructorSections } from "../../../../api/instructor/fetchGetInstructorSections";
import InstructorQualificationCard from "../../../../components/features/qualification/InstructorQualificationCard.tsx/InstructorQualificationCard";
import SectionCard from "../../../../components/features/section/sectioncard/SectionCard";
import { GenericAPIContainer } from "../../../../utility/genericapicontainer/GenericAPIContainer";

export default function InstructorQualificationViewer({
  instructorId,
}: {
  instructorId: number;
}) {
  return (
    <GenericAPIContainer<QualificationResponse[] | null>
      fetchFunction={async () => {
        // 1. get all the quals, grouped by section
        const quals = (await fetchAllInstructorQualifications(instructorId)) ?? [];

        // 2. get every section the instructor teaches
        const sections = await fetchGetInstructorSections(instructorId);

        // 3. merge: one QualificationResponse per section, with [] if none
        return sections.map((section) => {
          const sid = section.sectionDetails!.sectionId!;
          const match = quals.find(
            (q) => q.section.sectionDetails!.sectionId === sid
          );
          return {
            section,
            qualifications: match?.qualifications ?? [],
          };
        });
      }}
      render={(response) => (
        <div className="grid gap-3">
          {/* always show headers */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_2fr] font-medium text-lg text-slate-600">
            <span>Sections Teaching</span>
            <span>Qualifications of Course</span>
          </div>

          {/* one row per real section */}
          {response?.map((resp) => {
            const sd = resp.section.sectionDetails!;
            return (
              <div
                key={sd.sectionId}
                className="grid gap-2 sm:grid-cols-1 lg:grid-cols-[1fr_2fr]"
              >
                <SectionCard section={resp.section} />

                <InstructorQualificationCard
                  course={{
                    id: sd.id,
                    deptCode: sd.deptCode,
                  }}
                  initialQualifications={resp.qualifications}
                />
              </div>
            );
          })}
        </div>
      )}
    />
  );
}
