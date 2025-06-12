import type Section from '../../interfaces/section/Section';
import formatDateForDisplay from '../../utility/formatdatefordisplay/formatDateForDisplay';
import ProfileSection from '../../components/features/profile/ProfileSection';
import SectionCard from '../../components/features/section/SectionCard';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchStudentDetails } from '../../api/student/fetchStudentDetails';
import {type Student,studentProfileFields,studentFieldLabels} from '../../interfaces/user/Student';
import { fetchAllStudentSectionsHasCompleted } from '../../api/student/fetchAllStudentSectionsHasCompleted';

export default function TaProfilePage() {
  
  /*need to do the following:
    - show the times for each of the courses ex: Wed~Fridya 2:30 etc.
    - make the card smaller, or make it into more of a list so that the coordinator doesn't have to scroll.
    - divide Courses into the following: courses currently taking (which is most important), and courses with previous TA-experience
    - MAYBE have a list of all the courses taken, which will be long, can should not be in the form of cards.
    
    - Finally, add the profile questions and answers.
*/
  return (
    <div className="max-w-7xl mx-auto mt-8 p-6 bg-white rounded-2xl flex flex-col md:flex-row md:gap-8">
      <ProfileSectionContainer />
      <SectionSectionContainer/>
    </div>
  );
}

function ProfileSectionContainer() {
  const { studentId } = useParams();
  const sId = Number(studentId);
  const navigate = useNavigate();

  const [data, setData] = useState<Student>();

  useEffect(() => {
    if (Number.isNaN(sId)) {
      navigate("/error", { replace: true, state: { message: "Invalid student ID" } });
      return;
    }

    fetchStudentDetails(sId)
      .then((resp: Student) => {
        setData(resp);
      })
      .catch((e: Error) => {
        navigate("/error", { replace: true, state: { message: e.message } });
      });
    /* To test if the Navigate component leading you to error works, uncomment the comment below.*/
    // navigate("/error", { replace: true, state: { message: "Test error redirection" } });
  }, [sId, navigate]);

  const filteredFields = studentProfileFields.filter(
      (key) => key !== "id" && key !== "firstName" && key !== "lastName"
    );

  return (
    data ? <ProfileSection
        user={data}
        profileFields = {filteredFields}
        fieldLabels = {studentFieldLabels}
        className="max-w-xs space-y-4 order-1 md:order-2 md:w-1/3 md:ml-auto"
      /> : <p>Is Loading! {/* replace the is loading later by a seperate component which is more user-friendly*/}</p> 
  );
}

interface SectionProps {
  sections?: Section[];
  className?: string;
}

function SectionSectionContainer(){
  const { studentId } = useParams();
  const sId = Number(studentId);
  const navigate = useNavigate();

  const [data, setData] = useState<Section[]>();

  useEffect(() => {
    if (Number.isNaN(sId)) {
      navigate("/error", { replace: true, state: { message: "Invalid student ID" } });
      return;
    }

    fetchAllStudentSectionsHasCompleted(sId,true)
      .then((resp: Section[]) => {
        setData(resp);
      })
      .catch((e: Error) => {
        navigate("/error", { replace: true, state: { message: e.message } });
      });

  }, [sId, navigate]);


  return (
    <SectionSection
        sections={data ? data : []}
        className="space-y-4 order-2 md:order-1 md:w-2/3 mt-6 md:mt-0"
      />
  );
}

function SectionSection({ sections = [], className = "" }: SectionProps) {
  return (
    <section className={className}>
      <h2 className="text-xl font-semibold mb-2">Courses</h2>

      {sections.length ? (
        <div className="grid gap-3">
          {sections.map(sec => (
            <SectionCard key={sectionKey(sec)} section={sec} />
          ))}
        </div>
      ) : (
        <div className="p-4 text-slate-400 italic border border-dashed border-slate-200 rounded-lg">
          No courses to display
        </div>
      )}
    </section>
  );
}

const sectionKey = (s: Section) => `${s.sectionDetails.deptCode}-${s.sectionDetails.courseNum}-${s.sectionDetails.section}`;