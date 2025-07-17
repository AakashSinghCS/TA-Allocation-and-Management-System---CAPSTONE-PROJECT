import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProfileDetailsSection from '../../../components/features/user/profiledetailssection/ProfileDetailsSection';
import {userFieldLabels, userProfileFields, type StudentOrInstructorOrCoordinator} from '../../../interfaces/user/User';
import { GenericAPIContainer } from '../../../utility/genericapicontainer/GenericAPIContainer';
import { fetchUserDetails } from '../../../api/user/fetchUserDetails';
// import ProfileQuestionsSection from './profilequestionssection/ProfileQuestionsSection';

export default function ProfilePage() {
  const { userId } = useParams();
  const uId = Number(userId);
//   const isStudent = useAuth().userRoles.includes('STUDENT');
  const filteredFields = userProfileFields.filter(
    key =>  key !== 'firstName' && key !== 'lastName'
  );

  return (
    <div className="mx-auto space-y-6 p-4">
      <GenericAPIContainer<StudentOrInstructorOrCoordinator>
        fetchFunction={() => fetchUserDetails(uId)}
        render={(u) => (
          <ProfileDetailsSection
            user= {u}
            fields={filteredFields}
            labels={userFieldLabels}
            fetchDetailsFunction = {fetchUserDetails}
          />
        )}
      />
    </div>
  );
}
