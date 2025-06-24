import { useState } from 'react';
import type Section from '../../interfaces/section/Section';
import { Link, useParams } from 'react-router-dom';

import { type Student, studentProfileFields, studentFieldLabels } from '../../interfaces/user/Student';
import { fetchAllStudentSectionsHasCompleted } from '../../api/student/fetchAllStudentSectionsHasCompleted';
import { type ProfileQuestion } from '../../interfaces/question/ProfileQuestion';
import { fetchAllStudentQuestions } from '../../api/question/fetchAllStudentQuestion';
import SectionsColumn from '../../components/features/section/sectionscolumn/SectionsColumn';
import { GenericAPIContainer } from '../../utility/genericapicontainer/GenericAPIContainer';
import ProfileQuestionsSection from './profilequestionssection/ProfileQuestionsSection';
import StudentTabNav from '../../components/layout/tabnav/studenttabnav/StudentTabNav';
import ProfileDetailsSection from './profiledetailssection/ProfileDetailsSection';
import { fetchStudentDetails } from '../../api/student/fetchStudentDetails';

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-2xl shadow-sm">
      <button
        data-testid={`accordion-toggle-${title.replace(/\s+/g, '-')}`}
        className="w-full flex justify-between items-center px-4 py-3 bg-slate-50 hover:bg-slate-100 transition"
        onClick={() => setOpen(o => !o)}
      >
        <span className="font-semibold">{title}</span>
        <svg
          className={`w-5 h-5 transform transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 pb-4 pt-2">{children}</div>}
    </div>
  );
}

export default function TaProfilePage() {
  const { studentId } = useParams();
  const sId = Number(studentId);
  
  const filteredFields = studentProfileFields.filter(
    key => key !== 'id' && key !== 'firstName' && key !== 'lastName'
  );

  return (
    <div className="mx-auto space-y-6 p-4">
      <StudentTabNav />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <div className="lg:col-span-1 max-h-[40vh]">
          <GenericAPIContainer<Student>
            fetchFunction={() => fetchStudentDetails(sId)}
            render={(stu) => (
              <ProfileDetailsSection
                user= {stu}
                fields={filteredFields}
                labels={studentFieldLabels}
                fetchDetailsFunction = {fetchStudentDetails}
              />
            )}
          />
        </div>
        <div className="lg:col-span-2 max-h-[40vh]">
          <GenericAPIContainer<ProfileQuestion[] | null>
            fetchFunction={() => fetchAllStudentQuestions(sId)}
            render={qs => <ProfileQuestionsSection profileQuestions={qs} />}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 items-start">
        <Accordion title="Allocation History">
          <GenericAPIContainer<Section[]>
            fetchFunction={() => fetchAllStudentSectionsHasCompleted(sId, true)}
            render={secs => (
              <div className="space-y-2">
                <SectionsColumn sections={secs ?? []} />
                <Link to="/">
                  <div className="cursor-pointer italic text-slate-500 border border-dashed border-slate-200 rounded-lg p-2">
                    Add a section
                  </div>
                </Link>
              </div>
            )}
          />
        </Accordion>
      </div>
    </div>
  );
}
