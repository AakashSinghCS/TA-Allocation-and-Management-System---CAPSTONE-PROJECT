import { fetchAllInstructorQualifications, type QualificationResponse } from "../../../../../api/instructor/fetchAllInstructorQualifications";
import { fetchGetInstructorSections } from "../../../../../api/instructor/fetchGetInstructorSections";
import InstructorQualificationCard from "../../../../../components/features/qualification/InstructorQualificationCard.tsx/InstructorQualificationCard";
import SectionCard from "../../../../../components/features/section/sectioncard/SectionCard";
import { useAuth } from "../../../../../context/AuthContext";
import type Section from "../../../../../interfaces/section/Section";
import { GenericAPIContainer } from "../../../../../utility/genericapicontainer/GenericAPIContainer";

export default function InstructorQualificationViewer({
  instructorId,
  deadlinePassed,
}: {
  instructorId: number;
  deadlinePassed : Boolean;
}) {
  const isInstructor = useAuth().userRoles.includes('INSTRUCTOR');
  return (
    <GenericAPIContainer<QualificationResponse[] | null>
      fetchFunction={async () => {
        const quals = (await fetchAllInstructorQualifications(instructorId)) ?? [];
        const sections = await fetchGetInstructorSections(instructorId);

        const qualsByCourse = new Map<number, typeof quals[0]["qualifications"]>();
        quals.forEach((qr) => {
          const cid = qr.section!.course!.id!;
          if (!qualsByCourse.has(cid)) {
            qualsByCourse.set(cid, qr.qualifications);
          }
        });

        const uniqueCourses = Array.from(
          sections.reduce<Map<number, Section>>((map, sec) => {
            const courseId = sec.course?.id;
            if (courseId != null) {
              map.set(courseId, sec);
            }
            return map;
          }, new Map()).values());
        return uniqueCourses.map(section => ({
          section,
          qualifications: qualsByCourse.get(section.course!.id!) ?? []
        }));
      }}
      render={(response) => (
        <div className="grid gap-3">
          {/* always show headers */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_2fr] font-medium text-lg text-slate-600">
            <span>Courses Teaching</span>
            <span>Qualifications of Course</span>
          </div>

          {/* one row per real section */}
          {response?.map((resp) => {
            const sd = resp.section!;
            if(!sd.course) return;
            resp.section.section = undefined;
            resp.section.year = undefined;
            resp.section.semester = undefined;
            resp.section.type = undefined;
            return (
              <div
                key={sd.id}
                className="grid gap-2 sm:grid-cols-1 lg:grid-cols-[1fr_2fr]"
              >
                <SectionCard section={resp.section} />

                <InstructorQualificationCard
                  course={{
                    id: sd.course.id,
                    deptCode: sd.course?.deptCode,
                  }}
                  initialQualifications={resp.qualifications}
                  authenticated = {isInstructor}
                  deadlinePassed={deadlinePassed}
                />
              </div>
            );
          })}
        </div>
      )}
    />
  );
}
