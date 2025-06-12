import type Section from '../../interfaces/section/Section';
import ProfileSection from '../../components/features/profile/ProfileSection';
import { useParams, useNavigate, type NavigateFunction } from 'react-router-dom';
import { useEffect, useState, type JSX } from 'react';
import { fetchStudentDetails } from '../../api/student/fetchStudentDetails';
import { type Student, studentProfileFields, studentFieldLabels } from '../../interfaces/user/Student';
import { fetchAllStudentSectionsHasCompleted } from '../../api/student/fetchAllStudentSectionsHasCompleted';
import { type ProfileQuestion } from '../../interfaces/question/ProfileQuestion';
import { fetchAllStudentQuestions } from '../../api/question/fetchAllStudentQuestion';
import SectionsColumn from '../../components/features/section/sectionscolumn/SectionsColumn';
import SectionCard from '../../components/features/section/sectioncard/SectionCard';
import { mockSectionCOSC111 } from '../../mocked-objects/mockSectionCOSC111';
import { mockSectionCOSC121 } from '../../mocked-objects/mockSectionCOSC121';
import { type Need } from '../../interfaces/need/Need';

interface ContainerProps {
  studentId: number;
  navigate: NavigateFunction;
  className: string;
  highlightCourseIds? :number[];
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
        <ComparerContainer studentId={sId} navigate={navigate} className="grid grid-cols-[1fr_auto_1fr] gap-3" />
      </div>
    </div>
  );
}

function ComparerContainer({ studentId, navigate, className }: ContainerProps) {
  const [selectedOption, setSelectedOption] = useState("sectionsTaken");
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section>();
  const [highlightCourseIds, setHighlightCourseIds] = useState<number[]>([]); 

  const optionComponents: Record<string, () => JSX.Element> = {
    allocationHistory: () => <ProfileSectionContainer studentId={studentId} navigate={navigate} className="" highlightCourseIds={highlightCourseIds} />,
    sectionsTaking: () => <SectionsTakingContainer studentId={studentId} navigate={navigate} className="" highlightCourseIds={highlightCourseIds}/>,
    sectionsTaken: () => <SectionsTakenContainer studentId={studentId} navigate={navigate} className="" highlightCourseIds={highlightCourseIds}/>,
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
  };

  const handleSearch = () => {
    setFiltered([mockSectionCOSC111,mockSectionCOSC121]);
  };

  const handleClickSection = (section : Section) =>{
    setSelectedSection(section);
  }

  const handleCompareClick = () =>{
    if (!selectedSection?.need) {                                                  
      setHighlightCourseIds([]);
      return;
    }
    setHighlightCourseIds(
      selectedSection.need.courseNeeds.map((c) => c.id)        
    );
  }

  return (
    <div className={className}>
      <div>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search courses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
          >
            Search
          </button>
          </div>
          {filtered.length ? (
            <div className="grid gap-1">
              {filtered.map((sec) => {
                const isSelected = selectedSection && sec.sectionDetails.id === selectedSection.sectionDetails.id;
                const cardClass = `cursor-pointer ${isSelected ? "outline-1 outline-red-400" : ""}`;
                return <span key={sectionKey(sec)} onClick={()=>handleClickSection(sec)}><SectionCard section={sec} className={cardClass}/></span>
              })}
            </div>
          ) : (
            <div className="p-4 text-slate-400 italic border border-dashed border-slate-200 rounded-lg">
              No courses to display
            </div>
          )}
      </div>
      <div>
        <button onClick={handleCompareClick}  disabled={!selectedSection} className="mt-3 text-blue-600 underline disabled:text-slate-400">Compare Needs</button>
      </div>
          {/*add a feature to see if the id simply equals from left course to one of the right courses */}
      <div className="">
        <select id="columnSelect" value={selectedOption} onChange={handleChange} className="border rounded px-2 py-1">
          <option value="allocationHistory">Allocation History</option>
          <option value="sectionsTaking">Courses Taking</option>
          <option value="sectionsTaken">Courses Taken</option>
        </select>
        {optionComponents[selectedOption]()}
      </div>
    </div>
  );
}

const sectionKey = (s: Section) => `${s.sectionDetails.deptCode}-${s.sectionDetails.courseNum}-${s.sectionDetails.section}`;

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

function SectionsTakenContainer({ studentId, navigate, className, highlightCourseIds = [] }: ContainerProps) {
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
        highlightCourseIds={highlightCourseIds}  
      />
    </div>
  );
}

function SectionsTakingContainer({ studentId, navigate, className,highlightCourseIds=[] }: ContainerProps) {
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
        highlightCourseIds={highlightCourseIds} 
      />
    </div>
  );
}

function AllocationHistoryContainer({ studentId, navigate, className , highlightCourseIds=[]}: ContainerProps) {
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
        highlightCourseIds= {highlightCourseIds}
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