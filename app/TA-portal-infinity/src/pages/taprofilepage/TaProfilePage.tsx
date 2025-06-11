import type Section from '../../interfaces/section/Section';
import ProfileSection from '../../components/features/profile/ProfileSection';
import { useParams, useNavigate, type NavigateFunction } from 'react-router-dom';
import { useEffect, useState, type JSX } from 'react';
import { fetchStudentDetails } from '../../api/student/fetchStudentDetails';
import { type Student, studentProfileFields, studentFieldLabels } from '../../interfaces/user/Student';
import { fetchAllStudentSectionsHasCompleted } from '../../api/student/fetchAllStudentSectionsHasCompleted';
import { type ProfileQuestion } from '../../interfaces/question/ProfileQuestion';
import { fetchAllStudentQuestions } from '../../api/question/fetchAllStudentQuestion';
import SectionsColumn from '../../components/features/section/SectionsColumn';

interface ContainerProps {
  studentId: number;
  navigate: NavigateFunction;
  className: string;
}

interface ProfileQuestionsProps {
  profileQuestions?: ProfileQuestion[];
  className: string;
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
    <div className="mx-auto bg-white flex flex-col md:gap-3">
      <div className="order-0">
        <ProfileSectionContainer studentId={sId} navigate={navigate} className="flex flex-col" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 w-full">
        <AllocationHistoryContainer studentId={sId} navigate={navigate} className=" space-y-4  mt-6 md:mt-0" />
        <SectionsTakingContainer studentId={sId} navigate={navigate} className=" space-y-4  mt-6 md:mt-0" />
        <SectionsTakenContainer studentId={sId} navigate={navigate} className="space-y-4 mt-6 md:mt-0" />
      </div>
      <div>
        <ProfileQuestionsContainer studentId={sId} navigate={navigate} className="" />
      </div>
      <div>
        <ComparerContainer studentId={sId} navigate={navigate} className="" />
      </div>
    </div>
  );
}

function ComparerContainer({ studentId, navigate, className }: ContainerProps) {
  const [selectedOption, setSelectedOption] = useState("allocationHistory");

  const optionComponents: Record<string, JSX.Element> = {
    allocationHistory: <ProfileSectionContainer studentId={studentId} navigate={navigate} className = ""/>,
    sectionsTaking: <SectionsTakingContainer studentId={studentId} navigate={navigate} className = "" />,
    sectionsTaken: <SectionsTakenContainer studentId={studentId} navigate={navigate} className = "" />,
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
  };

  return (
    <div className={className}>
      <label htmlFor="columnSelect" className="block mb-2 font-medium">
        Choose:
      </label>
      <select id="columnSelect" value={selectedOption} onChange={handleChange} className="border rounded px-2 py-1">
        <option value="allocationHistory">Allocation History</option>
        <option value="coursesTaking">Courses Taking</option>
        <option value="coursesTaken">Courses Taken</option>
      </select>
      <h2 className="text-lg font-bold">{}</h2>
      {/* <SectionsColumn
        sections={data ? data : []}
        className=""
      /> */}
      {optionComponents[selectedOption]}
    </div>
  );
}

function ProfileSectionContainer({ studentId, navigate, className }: ContainerProps) {
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
      profileFields={filteredFields}
      fieldLabels={studentFieldLabels}
      className={className}
    /> : <p>Is Loading! {/* replace the is loading later by a seperate component which is more user-friendly*/}</p>
  );
}

function SectionsTakenContainer({ studentId, navigate, className }: ContainerProps) {
  const [data, setData] = useState<Section[]>();

  useEffect(() => {
    if (Number.isNaN(studentId)) {
      navigate("/error", { replace: true, state: { message: "Invalid student ID" } });
      return;
    }

    fetchAllStudentSectionsHasCompleted(studentId, true)
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
      <SectionsColumn
        sections={data ? data : []}
        className=""
      />
    </div>
  );
}

function SectionsTakingContainer({ studentId, navigate, className }: ContainerProps) {
  const [data, setData] = useState<Section[]>();

  useEffect(() => {
    if (Number.isNaN(studentId)) {
      navigate("/error", { replace: true, state: { message: "Invalid student ID" } });
      return;
    }

    fetchAllStudentSectionsHasCompleted(studentId, true)
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
      <SectionsColumn
        sections={data ? data : []}
        className=""
      />
    </div>
  );
}

function AllocationHistoryContainer({ studentId, navigate, className }: ContainerProps) {
  const [data, setData] = useState<Section[]>();

  useEffect(() => {
    if (Number.isNaN(studentId)) {
      navigate("/error", { replace: true, state: { message: "Invalid student ID" } });
      return;
    }

    fetchAllStudentSectionsHasCompleted(studentId, true)
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
      <SectionsColumn
        sections={data ? data : []}
        className=""
      />
    </div>
  );
}

function ProfileQuestionsContainer({ studentId, navigate, className }: ContainerProps) {
  const [data, setData] = useState<ProfileQuestion[]>();

  useEffect(() => {
    if (Number.isNaN(studentId)) {
      navigate("/error", { replace: true, state: { message: "Invalid student ID" } });
      return;
    }

    fetchAllStudentQuestions(studentId)
      .then((resp: ProfileQuestion[]) => {
        setData(resp);
      })
      .catch((e: Error) => {
        navigate("/error", { replace: true, state: { message: e.message } });
      });

  }, [studentId, navigate]);


  return (
    <div className={className}>
      <h2 className="text-lg font-bold">Answers to questions</h2>
      <ProfileQuestionsSection profileQuestions={data} className="" />
    </div>

  );
}

function ProfileQuestionsSection({ profileQuestions = [], className = "" }: ProfileQuestionsProps) {
  return (
    <section className={className}>
      {profileQuestions.length ? (
        <div className="grid gap-1">
          {profileQuestions.map(que => (
            // <SectionCard key={sectionKey(sec)} section={sec} />
            <></>
          ))}
        </div>
      ) : (
        <div className="p-4 text-slate-400 italic border border-dashed border-slate-200 rounded-lg">
          No questions to display
        </div>
      )}
    </section>
  );
}