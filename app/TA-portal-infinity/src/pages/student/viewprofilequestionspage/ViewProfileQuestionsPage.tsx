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
            <h2 className="text-xl font-semibold mb-4">Students's Profile Questions</h2>
            <p className="text-xs text-slate-600">Answers to personal questions about the student</p>
            <GenericAPIContainer<ProfileQuestion[] | null>
                fetchFunction={() => fetchAllStudentQuestions(sId)}
                render={qs => <ProfileQuestionsSection profileQuestions={qs} />}
            />
        </div>
    )
}