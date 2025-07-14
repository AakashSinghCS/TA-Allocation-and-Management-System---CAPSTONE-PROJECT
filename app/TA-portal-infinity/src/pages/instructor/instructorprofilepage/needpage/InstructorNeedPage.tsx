import { useParams } from "react-router-dom";
import NeedViewer from "./needviewer/NeedViewer";
import { fetchAllSectionsAndNeedAndAllocations } from "../../../../api/instructor/fetchAllSectionsAndNeedAndAllocations";
import { GenericAPIContainer } from "../../../../utility/genericapicontainer/GenericAPIContainer";
import type Section from "../../../../interfaces/section/Section";
import TabNav from "../../../../components/layout/tabnav/TabNav";
import { fetchUserDetails } from "../../../../api/user/fetchUserDetails";
import type { StudentOrInstructorOrCoordinator } from "../../../../interfaces/user/User";


export default function InstructorNeedPage (){
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
            <h2 className="text-xl font-semibold mb-4">TA Information</h2>
            <GenericAPIContainer<Section[] | null>
                  fetchFunction={() => fetchAllSectionsAndNeedAndAllocations(iId)}
                  render={(sections) => (
            <NeedViewer instructorId={iId} initial={sections}/>
                  )}/>
        </div>
    )
}