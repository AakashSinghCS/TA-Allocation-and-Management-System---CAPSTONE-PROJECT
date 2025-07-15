import { useParams } from "react-router-dom";

import InstructorQualificationViewer from "./qualificationviewer/InstructorQualificationViewer";
import TabNav from "../../../../components/layout/tabnav/TabNav";
import { fetchUserDetails } from "../../../../api/user/fetchUserDetails";
import type { StudentOrInstructorOrCoordinator } from "../../../../interfaces/user/User";
import { GenericAPIContainer } from "../../../../utility/genericapicontainer/GenericAPIContainer";
import { useEffect, useState } from "react";
import type { DeadlineDto } from "../../../../interfaces/admin/Deadline";
import { useAuth } from "../../../../context/AuthContext";
import { fetchDeadlines } from "../../../../api/admin/FetchDeadline";

export default function InstructorQualificationPage (){
    const { userId } = useParams();
    const iId = Number(userId);

    const [needDeadline, setNeedDeadline] = useState<DeadlineDto | null>(null);
    const [deadlineError, setDeadlineError] = useState("");

    const { token } = useAuth();
    
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
    
    const deadlinePassed =
    !!needDeadline &&
    new Date(needDeadline.endTime) < new Date();

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
            <p className="text-xs text-slate-600">The qualifications you see below is a list accumulated by previous instructors.
                 Deleting or adding a qualification will <span className="italic text-red-400">permanently </span> 
                  delete or add a qualification to all future and ongoing courses.</p>
            <InstructorQualificationViewer instructorId={iId} deadlinePassed={deadlinePassed} />
        </div>
    )
}