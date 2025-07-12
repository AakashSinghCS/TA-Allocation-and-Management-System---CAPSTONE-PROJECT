import { Link, useParams } from "react-router-dom";
// import { fetchStudentAllocationHistory } from "../../../api/allocation/fetchStudentAllocationHistory";
import SectionsColumn from "../../../components/features/section/sectionscolumn/SectionsColumn";
import { useAuth } from "../../../context/AuthContext";
import type Section from "../../../interfaces/section/Section";
import { GenericAPIContainer } from "../../../utility/genericapicontainer/GenericAPIContainer";
import { fetchStudentAllocationHistory } from "../../../api/student/allocation/fetchStudentAllocationHistory";
import type { StudentOrInstructorOrCoordinator } from "../../../interfaces/user/User";
import { fetchUserDetails } from "../../../api/user/fetchUserDetails";
import TabNav from "../../../components/layout/tabnav/TabNav";

export default function AllocationHistoryPage() {
    const { userId } = useParams();
    const sId = Number(userId);
    const isStudent = useAuth().userRoles.includes('STUDENT');
    // const isCoordinator = useAuth().userRoles.includes('COORDINATOR')
    return (
        <div className="grid grid-cols-1 gap-4 items-start mx-auto space-y-6 p-4">
            {/* <Accordion title="Allocation History"> */}
            <GenericAPIContainer<StudentOrInstructorOrCoordinator>
                fetchFunction={() => fetchUserDetails(sId)}
                render={(record) => (
                    <TabNav
                        roles={record.roles ?? []}
                    />
                )}
            />
            <h2 className="text-xl font-semibold mb-4" >Allocation History</h2>
            <GenericAPIContainer<Section[]>
                fetchFunction={() => fetchStudentAllocationHistory(sId)}
                render={secs => (
                    <div className="space-y-2">
                        <SectionsColumn sections={secs ?? []} isStudentView={true} />
                    </div>
                )}
            />
            {isStudent && <Link to="/user/student/addallocation">
                <div className="cursor-pointer italic text-slate-500 border border-dashed border-slate-200 rounded-lg p-2">
                    Add a section
                </div>
            </Link>}
            {/* </Accordion> */}
        </div>
    )
}