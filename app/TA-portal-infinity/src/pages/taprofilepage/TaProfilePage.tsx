import type Section from '../../interfaces/section/Section';
import ProfileSection from '../../components/features/profile/ProfileSection';
import { useParams, } from 'react-router-dom';

import { fetchStudentDetails } from '../../api/student/fetchStudentDetails';
import { type Student, studentProfileFields, studentFieldLabels } from '../../interfaces/user/Student';
import { fetchAllStudentSectionsHasCompleted } from '../../api/student/fetchAllStudentSectionsHasCompleted';
import { type ProfileQuestion } from '../../interfaces/question/ProfileQuestion';
import { fetchAllStudentQuestions } from '../../api/question/fetchAllStudentQuestion';
import SectionsColumn from '../../components/features/section/sectionscolumn/SectionsColumn';

import { GenericAPIContainer } from '../../utility/genericapicontainer/GenericAPIContainer';
import Comparer from './comparer/Comparer';
import ProfileQuestionsSection from './profilequestionssection/ProfileQuestionsSection';


export default function TaProfilePage() {
  const { studentId } = useParams();
  const sId = Number(studentId);
  /*need to do the following:   
    -small visualization at the bottom on which courses he is currently taking. When you press a button, it would switch or add the allocations the TA has.
    */
  const filteredFields = studentProfileFields.filter(
    (key) => key !== "id" && key !== "firstName" && key !== "lastName"
  );
  return (
    <div className="mx-auto bg-white flex flex-col md:gap-3">
      <div className="order-0">
        <GenericAPIContainer<Student>
          fetchFunction={() => fetchStudentDetails(sId)}
          render={(data) => (
            <ProfileSection user={data} profileFields={filteredFields} fieldLabels={studentFieldLabels} className="flex flex-col" />
          )}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 w-full">
        <div className=" space-y-4  mt-6 md:mt-0">
          <h2 className="text-lg font-bold">Allocation History</h2>
          <GenericAPIContainer<Section[]>
            fetchFunction={() => fetchAllStudentSectionsHasCompleted(sId, true)}
            render={(data) => (
              <SectionsColumn sections={data ? data : []} className="" />
            )}
          />
        </div>
        <div className=" space-y-4  mt-6 md:mt-0">
          <h2 className="text-lg font-bold">Sections Taking</h2>
          <GenericAPIContainer<Section[]>
            fetchFunction={() => fetchAllStudentSectionsHasCompleted(sId, false)}
            render={(data) => (
              <SectionsColumn sections={data ? data : []} className="" />
            )}
          />
        </div>
        <div className=" space-y-4  mt-6 md:mt-0">
          <h2 className="text-lg font-bold">Sections Taken</h2>
          <GenericAPIContainer<Section[]>
            fetchFunction={() => fetchAllStudentSectionsHasCompleted(sId, true)}
            render={(data) => (
              <SectionsColumn sections={data ? data : []} className="" />
            )}
          />
        </div>
      </div>
      <div>
        <h2 className="text-lg font-bold">Answers to questions</h2>
        <GenericAPIContainer<ProfileQuestion[]>
          fetchFunction={() => fetchAllStudentQuestions(sId)}
          render={(data) => (
            <ProfileQuestionsSection profileQuestions={data} className="" />
          )}
        />
      </div>
      <div>
        <h2 className="text-lg font-bold">Compare a section to the student's profile </h2>
        <Comparer studentId={sId} className="flex flex-wrap lg:grid lg:grid-cols-[1fr_auto_1fr] gap-3" />
      </div>
    </div>
  );
}


