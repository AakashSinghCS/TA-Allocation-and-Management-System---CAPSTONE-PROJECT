import { useParams } from 'react-router-dom';
// import ProfileSection from '../../components/features/user/profilesection/ProfileSection';
import { GenericAPIContainer } from '../../../utility/genericapicontainer/GenericAPIContainer';

import { fetchInstructorDetails } from '../../../api/instructor/fetchInstructorDetails'
import {
  type Instructor,
  instructorProfileFields,
  instructorFieldLabels,
} from '../../../interfaces/user/Instructor';

import InstructorTabNav from '../../../components/layout/tabnav/instructortabnav/InstructorTabNav';
import ProfileDetailsSection from '../../../components/features/user/profiledetailssection/ProfileDetailsSection';

export default function InstructorProfilePage() {
  const { instructorId } = useParams();
  const iId = Number(instructorId);
  const filteredFields = instructorProfileFields.filter(
    key => key !== 'id' && key !== 'firstName' && key !== 'lastName'
  );

  return (
    <div className=" mx-auto space-y-6 p-4">
      <InstructorTabNav />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <div className="lg:col-span-1 max-h-[40vh]">
          <GenericAPIContainer<Instructor>
            fetchFunction={() => fetchInstructorDetails(iId)}
            render={inst => (
              <ProfileDetailsSection
                user={inst}
                fields={filteredFields}
                labels={instructorFieldLabels}
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
