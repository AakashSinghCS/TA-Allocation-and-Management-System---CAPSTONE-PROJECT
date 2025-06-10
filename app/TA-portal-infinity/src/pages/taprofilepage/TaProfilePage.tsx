import type Section from '../../interfaces/section/Section';
import ProfileSection from '../../components/features/profile/ProfileSection';
import SectionCard from '../../components/features/section/SectionCard';
import { useParams, useNavigate, type NavigateFunction } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchStudentDetails } from '../../api/student/fetchStudentDetails';
import {type Student,studentProfileFields,studentFieldLabels} from '../../interfaces/user/Student';
import { fetchAllStudentSectionsHasCompleted } from '../../api/student/fetchAllStudentSectionsHasCompleted';

interface containerProps{
  studentId: number;
  navigate: NavigateFunction;
  className: string;
}

interface SectionProps {
  sections?: Section[];
  className?: string;
}

export default function TaProfilePage() {
  const { studentId } = useParams();
  const sId = Number(studentId);
  const navigate = useNavigate();
  /*need to do the following:
    - show the times for each of the courses ex: Wed~Fridya 2:30 etc.
    - make the card smaller, or make it into more of a list so that the coordinator doesn't have to scroll.
    - divide Courses into the following: courses currently taking (which is most important), and courses with previous TA-experience
    - MAYBE have a list of all the courses taken, which will be long, can should not be in the form of cards.
    
    - Finally, add the profile questions and answers.
    -small visualization at the bottom on which courses he is currently taking. When you press a button, it would switch or add the allocations the TA has.
    - don't let each column take up more than a certain height. Make it scrollable.
    */
  return (
    <div className="items-center mx-auto bg-white flex flex-col md:gap-3">
      <div className = "order-0">
        <ProfileSectionContainer studentId = {sId} navigate={navigate} className="flex flex-col"/>
      </div>
      <div className ="flex flex-col md:flex-row flex-wrap order-1 gap-3">
        <AllocationHistoryContainer studentId = {sId} navigate={navigate} className="order-0 mx-w-1/3 space-y-4 flex-1 mt-6 md:mt-0"/>
        <SectionsTakenContainer studentId = {sId} navigate={navigate} className="order-1 mx-w-1/3 space-y-4 flex-1 mt-6 md:mt-0"/>
        <SectionsTakingContainer studentId = {sId} navigate={navigate} className="order-2 mx-w-1/3 space-y-4 flex-1 mt-6 md:mt-0"/>
      </div>
    </div>
  );
}

function ProfileSectionContainer({studentId, navigate, className}:containerProps) {
  const [data, setData] = useState<Student>();

  useEffect(() => {
    if (Number.isNaN(studentId)) {
      navigate("/error", { replace: true, state: { message: "Invalid student ID" } });
      return;
    }

    fetchStudentDetails(studentId)
      .then((resp: Student) => {
        setData(resp);
      })
      .catch((e: Error) => {
        navigate("/error", { replace: true, state: { message: e.message } });
      });
    /* To test if the Navigate component leading you to error works, uncomment the comment below.*/
    // navigate("/error", { replace: true, state: { message: "Test error redirection" } });
  }, [studentId, navigate]);

  const filteredFields = studentProfileFields.filter(
      (key) => key !== "id" && key !== "firstName" && key !== "lastName"
    );

  return (
    data ? <ProfileSection
        user={data}
        profileFields = {filteredFields}
        fieldLabels = {studentFieldLabels}
        className={className}
      /> : <p>Is Loading! {/* replace the is loading later by a seperate component which is more user-friendly*/}</p> 
  );
}

function SectionsTakenContainer({studentId, navigate, className}:containerProps){
  const [data, setData] = useState<Section[]>();

  useEffect(() => {
    if (Number.isNaN(studentId)) {
      navigate("/error", { replace: true, state: { message: "Invalid student ID" } });
      return;
    }

    fetchAllStudentSectionsHasCompleted(studentId,true)
      .then((resp: Section[]) => {
        setData(resp);
      })
      .catch((e: Error) => {
        navigate("/error", { replace: true, state: { message: e.message } });
      });

  }, [studentId, navigate]);


  return (
    <div className={className}>
      <h2 className="text-lg font-bold">Courses Taken</h2>
      <SectionSection
        sections={data ? data : []}
        className=""
      />
    </div>
    
  );
}

function SectionsTakingContainer({studentId, navigate, className}:containerProps){
  const [data, setData] = useState<Section[]>();

  useEffect(() => {
    if (Number.isNaN(studentId)) {
      navigate("/error", { replace: true, state: { message: "Invalid student ID" } });
      return;
    }

    fetchAllStudentSectionsHasCompleted(studentId,true)
      .then((resp: Section[]) => {
        setData(resp);
      })
      .catch((e: Error) => {
        navigate("/error", { replace: true, state: { message: e.message } });
      });

  }, [studentId, navigate]);


  return (
    <div className={className}>
      <h2 className="text-lg font-bold">Courses Taking</h2>
      <SectionSection
        sections={data ? data : []}
        className=""
      />
    </div>
  );
}

function AllocationHistoryContainer({studentId, navigate,className}:containerProps){
  const [data, setData] = useState<Section[]>();

  useEffect(() => {
    if (Number.isNaN(studentId)) {
      navigate("/error", { replace: true, state: { message: "Invalid student ID" } });
      return;
    }

    fetchAllStudentSectionsHasCompleted(studentId,true)
      .then((resp: Section[]) => {
        setData(resp);
      })
      .catch((e: Error) => {
        navigate("/error", { replace: true, state: { message: e.message } });
      });

  }, [studentId, navigate]);


  return (
    <div className={className}>
      <h2 className="text-lg font-bold">Allocation History</h2>
      <SectionSection
        sections={data ? data : []}
        className=""
      />
    </div>
    
  );
}


function SectionSection({ sections = [], className = "" }: SectionProps) {
  return (
    <section className={className}>
      {sections.length ? (
        <div className="grid gap-1">
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