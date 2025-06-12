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
import { GenericAPIContainer } from '../../utility/genericapicontainer/GenericAPIContainer';


interface ContainerProps {
  studentId: number;
  navigate?: NavigateFunction;
  className: string;
  highlightCourseIds?: number[];
  exactMatchId?: number | null;
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
   const filteredFields = studentProfileFields.filter(
    (key) => key !== "id" && key !== "firstName" && key !== "lastName"
  );
  return (
    <div className="mx-auto bg-white flex flex-col md:gap-3">
      <div className="order-0">
        <GenericAPIContainer<Student, null>
          fetchFunction={() => fetchStudentDetails(sId)}
          render={(data) => (
            <ProfileSection
              user={data}  
              profileFields={filteredFields}
              fieldLabels={studentFieldLabels}
              className="flex flex-col"
            />
          )}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 w-full">
        <div className=" space-y-4  mt-6 md:mt-0">
          <h2 className="text-lg font-bold">Allocation History</h2>
          <GenericAPIContainer<Section[], null>
            fetchFunction={() => fetchAllStudentSectionsHasCompleted(sId,true)}
            render={(data) => (
              <SectionsColumn sections={data ? data : []}className=""/>
            )}
          />
        </div>
        <div className=" space-y-4  mt-6 md:mt-0">
          <h2 className="text-lg font-bold">Sections Taking</h2>
          <GenericAPIContainer<Section[], null>
            fetchFunction={() => fetchAllStudentSectionsHasCompleted(sId,true)}
            render={(data) => (
              <SectionsColumn sections={data ? data : []} className="" />
            )}
          />
        </div>
        <div className=" space-y-4  mt-6 md:mt-0">
          <h2 className="text-lg font-bold">Sections Taken</h2>
          <GenericAPIContainer<Section[], null>
            fetchFunction={() => fetchAllStudentSectionsHasCompleted(sId,true)}
            render={(data) => (
              <SectionsColumn sections={data ? data : []} className="" />
            )}
          />
        </div>
      </div>
      <div>
          <h2 className="text-lg font-bold">Answers to questions</h2>
          <GenericAPIContainer<ProfileQuestion[], null>
            fetchFunction={() => fetchAllStudentQuestions(sId)}
            render={(data) => (
              <ProfileQuestionsSection profileQuestions={data} className="" />
            )}
          />
      </div>
      <div>
        <h2 className="text-lg font-bold">Compare a course to the student's profile </h2>
        <p className="text-xs text-slate-500">Search for a course, choose a course, and click compare</p>
        <ComparerContainer studentId={sId} navigate={navigate} className="flex flex-wrap lg:grid lg:grid-cols-[1fr_auto_1fr] gap-3" />
      </div>
    </div>
  );
}

function ComparerContainer({ studentId, className }: ContainerProps) {
  const [selectedOption, setSelectedOption] = useState("sectionsTaken");
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section>();
  const [highlightCourseIds, setHighlightCourseIds] = useState<number[]>([]);
  const [exactMatchId, setExactMatchId] = useState<number | null>(null);

  const optionComponents: Record<string, () => JSX.Element> = {
    allocationHistory: ()=> <GenericAPIContainer<Section[], null>
            fetchFunction={() => fetchAllStudentSectionsHasCompleted(studentId,true)}
            render={(data) => (
              <SectionsColumn
                sections={data ? data : []}
                className=""
                highlightCourseIds={highlightCourseIds} exactMatchId={exactMatchId}
              />
            )}
          />,
    sectionsTaking: ()=> <GenericAPIContainer<Section[], null>
            fetchFunction={() => fetchAllStudentSectionsHasCompleted(studentId,true)}
            render={(data) => (
              <SectionsColumn
                sections={data ? data : []}
                className=""
                highlightCourseIds={highlightCourseIds} exactMatchId={exactMatchId}
              />
            )}
          />,
          sectionsTaken: ()=> <GenericAPIContainer<Section[], null>
            fetchFunction={() => fetchAllStudentSectionsHasCompleted(studentId,true)}
            render={(data) => (
              <SectionsColumn
                sections={data ? data : []}
                className=""
                highlightCourseIds={highlightCourseIds} exactMatchId={exactMatchId}
              />
            )}
          />,
  }

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
  };

  const handleSearch = () => {
    setFiltered([mockSectionCOSC111, mockSectionCOSC121]);
  };

  const handleClickSection = (section: Section) => {
    setSelectedSection(section);
    setHighlightCourseIds([]);
    setExactMatchId(null);
  }

  const handleCompareClick = () => {
    setExactMatchId(null);
    if (!selectedSection?.need) {
      setHighlightCourseIds([]);
      return;
    }
    setHighlightCourseIds(
      selectedSection.need.courseNeeds.map((c) => c.id)
    );
  }

  const handleExactMatch = () => {
    if (selectedSection) {
      console.log("asdf");
      setExactMatchId(selectedSection.sectionDetails.id);
    }
  }

  return (
    <div className={className}>
      <div>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search for a course, click on a course, and click compare"
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
              const cardClass = `cursor-pointer ${isSelected ? "outline-1 outline-yellow-400" : ""}`;
              return <span key={sectionKey(sec)} onClick={() => handleClickSection(sec)}><SectionCard section={sec} className={cardClass} /></span>
            })}
          </div>
        ) : (
          <div className="p-4 text-slate-400 italic border border-dashed border-slate-200 rounded-lg">
            No courses to display
          </div>
        )}
      </div>
      <div className="grid">
        <button onClick={handleCompareClick} disabled={!selectedSection} className="mt-3 text-blue-600 underline disabled:text-slate-400">Compare Needs</button>
        <button onClick={handleExactMatch} disabled={!selectedSection} className="mt-3 text-blue-600 underline disabled:text-slate-400">Exact Match </button>
      </div>
      <div className="flex flex-col">
        <select id="columnSelect" value={selectedOption} onChange={handleChange} className="border rounded px-2 py-1">
          <option value="allocationHistory">Allocation History</option>
          <option value="sectionsTaking">Courses Taking</option>
          <option value="sectionsTaken">Courses Taken</option>
        </select>
        <p className="text-xs text-slate-500 text-grey">A green or blue outline means it is matched</p>
        {optionComponents[selectedOption]()}
      </div>
    </div>
  );
}

const sectionKey = (s: Section) => `${s.sectionDetails.deptCode}-${s.sectionDetails.courseNum}-${s.sectionDetails.section}`;

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