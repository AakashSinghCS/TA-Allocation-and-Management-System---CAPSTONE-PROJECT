import { useParams } from 'react-router-dom';
// import ProfileSection from '../../components/features/user/profilesection/ProfileSection';
import { GenericAPIContainer } from '../../../utility/genericapicontainer/GenericAPIContainer';

import { fetchInstructorDetails } from '../../../api/instructor/fetchInstructorDetails';
// import {
//   type Instructor,
//   instructorFieldLabels,
//   instructorProfileFields,
// } from '../../../interfaces/user/Instructor';

import ProfileDetailsSection from '../../../components/features/user/profiledetailssection/ProfileDetailsSection';
import InstructorTabNav from '../../../components/layout/tabnav/instructortabnav/InstructorTabNav';
import { userFieldLabels, userProfileFields, type StudentOrInstructorOrCoordinator } from '../../../interfaces/user/User';

export default function InstructorProfilePage() {
  const { instructorId } = useParams();
  const iId = Number(instructorId);
  const filteredFields = userProfileFields.filter(
    key => key !== 'id' && key !== 'firstName' && key !== 'lastName'
  );

  return (
    <div className=" mx-auto space-y-6 p-4">
      <InstructorTabNav />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <div className="lg:col-span-1 max-h-[40vh]">
          <GenericAPIContainer<StudentOrInstructorOrCoordinator>
            fetchFunction={() => fetchInstructorDetails(iId)}
            render={inst => (
              <ProfileDetailsSection
                user={inst}
                fields={filteredFields}
                labels={userFieldLabels}
                fetchDetailsFunction={fetchInstructorDetails}
              />
            )}
          />
        </div>
        <div className="lg:col-span-2 max-h-[40vh]"></div>
      </div>
    </div>
  );
}
