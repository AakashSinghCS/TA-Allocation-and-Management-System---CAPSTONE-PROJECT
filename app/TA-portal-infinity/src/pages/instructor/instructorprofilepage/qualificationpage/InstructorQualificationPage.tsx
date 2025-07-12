import { useParams } from "react-router-dom";

import InstructorQualificationViewer from "./qualificationviewer/InstructorQualificationViewer";
import TabNav from "../../../../components/layout/tabnav/TabNav";
import { fetchUserDetails } from "../../../../api/user/fetchUserDetails";
import type { StudentOrInstructorOrCoordinator } from "../../../../interfaces/user/User";
import { GenericAPIContainer } from "../../../../utility/genericapicontainer/GenericAPIContainer";

export default function InstructorQualificationPage (){
    const { userId } = useParams();
    const iId = Number(userId);
    return(
        <div className='mx-auto space-y-6 p-4'>
            <GenericAPIContainer<StudentOrInstructorOrCoordinator>
                fetchFunction={() => fetchUserDetails(iId)}
                render={(record) => (
                    <TabNav
                    roles={record.roles ?? []}
                    />
                )}
            />
            <h2 className="text-xl font-semibold mb-4">Instructor's required lab skills (qualifications)</h2>
            <p className="text-xs text-slate-600">The qualifications you see below is a list accumulated by previous instructors.
                 Deleting or adding a qualification will <span className="italic text-red-400">permanently </span> 
                  delete or add a qualification to all future and ongoing courses.</p>
            <InstructorQualificationViewer instructorId={iId} />
        </div>
    )
}