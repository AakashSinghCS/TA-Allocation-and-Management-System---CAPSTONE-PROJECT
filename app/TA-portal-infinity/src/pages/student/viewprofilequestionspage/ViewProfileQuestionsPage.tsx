import { useParams } from "react-router-dom";
import { GenericAPIContainer } from "../../../utility/genericapicontainer/GenericAPIContainer";
import type { StudentOrInstructorOrCoordinator } from "../../../interfaces/user/User";
import { fetchUserDetails } from "../../../api/user/fetchUserDetails";
import TabNav from "../../../components/layout/tabnav/TabNav";
import type { ProfileQuestion } from "../../../interfaces/question/ProfileQuestion";
import { fetchAllStudentQuestions } from "../../../api/question/fetchAllStudentQuestion";
import ProfileQuestionsSection from "../taprofilepage/profilequestionssection/ProfileQuestionsSection";
import { Info } from 'lucide-react';


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
             <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 flex items-center gap-4 mt-8">
                    <Info className="w-6 h-6 text-blue-400 flex-shrink-0" />
                    <div className="text-blue-800 text-base">
                    Below are the answers provided by the student for the profile questions. These answers help in understanding the student's background and preferences.
                </div>
            </div>
            <GenericAPIContainer<ProfileQuestion[] | null>
                fetchFunction={() => fetchAllStudentQuestions(sId)}
                render={qs => <ProfileQuestionsSection profileQuestions={qs} />}
            />
        </div>
    )
}