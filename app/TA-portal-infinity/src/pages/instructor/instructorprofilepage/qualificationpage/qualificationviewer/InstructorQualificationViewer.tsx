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
        <div className="space-y-4">
          {/* Course rows with card layout matching NeedViewer */}
          {response?.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-500">You are not currently teaching any courses.</p>
            </div>
          ) : (
            response?.map((resp, index) => {
              const sd = resp.section!;
              if(!sd.course) return null;
              resp.section.section = undefined;
              resp.section.year = undefined;
              resp.section.semester = undefined;
              resp.section.type = undefined;
              return (
                <div key={sd.id || index} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  {/* Horizontal Section Header */}
                  <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-[#040941] text-white rounded-md flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {sd.course?.deptCode} {sd.course?.courseNum}
                        </h3>
                        <span className="text-gray-500 text-sm">•</span>
                        <span className="text-gray-600 text-sm">
                          {resp.qualifications.length} qualification{resp.qualifications.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-4">
                    <div className="grid lg:grid-cols-2 gap-4">
                      {/* Section Information Panel */}
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm mb-3 flex items-center">
                          <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                          </svg>
                          Section Details
                        </h4>
                        <SectionCard 
                          section={resp.section} 
                          authenticated={isInstructor}
                        />
                      </div>

                      {/* Course Qualifications Panel */}
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm mb-3 flex items-center">
                          <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Course Qualifications/Skills
                        </h4>
                        <InstructorQualificationCard
                          course={{
                            id: sd.course.id,
                            deptCode: sd.course?.deptCode,
                          }}
                          initialQualifications={resp.qualifications}
                          authenticated={isInstructor}
                          deadlinePassed={deadlinePassed}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    />
  );
}
