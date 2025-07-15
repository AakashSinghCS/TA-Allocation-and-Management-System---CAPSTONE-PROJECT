import { useParams } from "react-router-dom";
import StudentQualificationViewer from "./qualificationviewer/StudentQualificationViewer";
import TabNav from "../../../../components/layout/tabnav/TabNav";
import { fetchUserDetails } from "../../../../api/user/fetchUserDetails";
import type { StudentOrInstructorOrCoordinator } from "../../../../interfaces/user/User";
import { GenericAPIContainer } from "../../../../utility/genericapicontainer/GenericAPIContainer";


export default function StudentQualificationPage (){
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
            <h2 className="text-xl font-semibold mb-4">Students's lab skills (qualifications)</h2>
            <p className="text-xs text-slate-600">The qualifications you see below is a list ....</p>
            <StudentQualificationViewer studentId={sId} />
        </div>
    )
}