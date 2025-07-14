import { useParams } from "react-router-dom";
import NeedViewer from "./needviewer/NeedViewer";
import { fetchAllSectionsAndNeedAndAllocations } from "../../../../api/instructor/fetchAllSectionsAndNeedAndAllocations";
import { GenericAPIContainer } from "../../../../utility/genericapicontainer/GenericAPIContainer";
import type Section from "../../../../interfaces/section/Section";
import TabNav from "../../../../components/layout/tabnav/TabNav";
import { fetchUserDetails } from "../../../../api/user/fetchUserDetails";
import type { StudentOrInstructorOrCoordinator } from "../../../../interfaces/user/User";
import { useEffect, useState } from "react";
import type { DeadlineDto } from "../../../../interfaces/admin/Deadline";
import { fetchDeadlines } from "../../../../api/admin/FetchDeadline";
import { useAuth } from "../../../../context/AuthContext";


export default function InstructorNeedPage (){
    const { userId } = useParams();
    const iId = Number(userId);
    const [needDeadline, setNeedDeadline] = useState<DeadlineDto | null>(null);
    const [deadlineError, setDeadlineError] = useState("");

    const { token, userId, userRoles } = useAuth();
    
    useEffect(() => {
        async function loadDeadline() {
          setDeadlineError("");
          try {
            const allDeadlines = await fetchDeadlines(token || "");
            const needDeadline = allDeadlines.find(
              (d) => d.name === "instructor_need_update_deadline"
            );
            setNeedDeadline(needDeadline || null);
          } catch (err) {
            console.error("Failed to load deadline:", err);
            setDeadlineError("Could not load need update deadline.");
          }
        }
      
        if (token) loadDeadline();
      }, [token]);

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
            {needDeadline && (
            <p className="text-md text-gray-700 mb-6">
                Deadline:{" "}
                <span className="font-medium">
                {new Date(needDeadline.endTime).toLocaleString()}
                </span>
            </p>
            )}
            {!needDeadline && !deadlineError && (
                <p className="text-md text-gray-500 mb-6">
                No application deadline found.
                </p>
            )}
            {deadlineError && (
                <p className="text-md text-red-500 mb-6">
                {deadlineError}
                </p>
            )}
            <GenericAPIContainer<Section[] | null>
                  fetchFunction={() => fetchAllSectionsAndNeedAndAllocations(iId)}
                  render={(sections) => (
            <NeedViewer instructorId={iId} initial={sections}/>
                  )}/>
        </div>
    )
}