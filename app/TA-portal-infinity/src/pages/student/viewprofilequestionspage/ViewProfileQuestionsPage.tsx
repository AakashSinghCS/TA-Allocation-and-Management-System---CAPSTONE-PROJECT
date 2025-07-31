import { useParams } from "react-router-dom";
import { GenericAPIContainer } from "../../../utility/genericapicontainer/GenericAPIContainer";
import type { StudentOrInstructorOrCoordinator } from "../../../interfaces/user/User";
import { fetchUserDetails } from "../../../api/user/fetchUserDetails";
import TabNav from "../../../components/layout/tabnav/TabNav";
import type { ProfileQuestion } from "../../../interfaces/question/ProfileQuestion";
import { fetchAllStudentQuestions } from "../../../api/question/fetchAllStudentQuestion";
import ProfileQuestionsSection from "../taprofilepage/profilequestionssection/ProfileQuestionsSection";



export default function ViewProfileQuestionsPage (){
    const { userId } = useParams();
    const sId = Number(userId);
    return(
        <div className='mx-auto space-y-6 p-4'>
            <GenericAPIContainer<StudentOrInstructorOrCoordinator>
                fetchFunction={() => fetchUserDetails(sId)}
                render={(record) => (
                    <TabNav
                    roles={record.roles ?? []}
                    />
                )}
            />
            <h2 className="text-xl font-semibold mb-4 mt-8">Answers for Profile Questions</h2>
            <p className="text-gray-600 mb-6">
                Below are the answers provided by the student for the profile questions. These answers help in understanding the student's background and preferences.
            </p>
            <GenericAPIContainer<ProfileQuestion[] | null>
                fetchFunction={() => fetchAllStudentQuestions(sId)}
                render={qs => <ProfileQuestionsSection profileQuestions={qs} />}
            />
        </div>
    )
}