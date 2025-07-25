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
import { Clock, Info } from "lucide-react";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function InstructorQualificationPage (){
    const { userId } = useParams();
    const iId = Number(userId);

    const [needDeadline, setNeedDeadline] = useState<DeadlineDto | null>(null);
    const { token, userRoles } = useAuth();
    const isCoordinator = userRoles.includes("COORDINATOR");
    
    useEffect(() => {
        async function loadDeadline() {
          try {
            const allDeadlines = await fetchDeadlines(token || "");
            const needDeadline = allDeadlines.find(
              (d) => d.name === "instructor_need_update_deadline"
            );
            setNeedDeadline(needDeadline || null);
          } catch (err) {
            console.error("Failed to load deadline:", err);
          }
        }
      
        if (token) loadDeadline();
    }, [token]);

    return(
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8 p-6">
                <GenericAPIContainer<StudentOrInstructorOrCoordinator>
                    fetchFunction={() => fetchUserDetails(iId)}
                    render={(record) => (
                        <TabNav
                        roles={record.roles ?? []}
                        />
                    )}
                />
                
                {/* Header - only show when not viewed by coordinator */}
                {!isCoordinator && (
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Course Qualifications & Skills Management</h1>
                        <p className="text-gray-600 text-lg">Manage your sections and TA requirements</p>
                    </div>
                )}
                
                {/* Add spacing when coordinator is viewing and header is hidden */}
                {isCoordinator && <div className="mb-10"></div>}
                
                {/* Information Message with Deadline */}
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400 mb-4">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                        <h3 className="text-base font-medium text-blue-900">Reminder! TA Requirements</h3>
                        <p className="text-sm text-blue-800">Please update your TA requirements for your courses</p>
                    </div>
                    {needDeadline && (
                        <div className="flex items-center space-x-2 text-xs text-blue-700">
                            <Clock className="w-3 h-3" />
                            <span>Deadline: {new Date(needDeadline.endTime).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>

                {/* Important Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800">
                            <p className="font-medium mb-1">Important Notice</p>
                            <p>The qualifications you see below is a list accumulated by previous instructors. 
                            Deleting or adding a qualification will <span className="font-semibold text-amber-900">permanently</span> delete 
                            or add a qualification to all future and ongoing courses.</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <InstructorQualificationViewer instructorId={iId} deadlinePassed={false} />
            </div>
            
            {/* Toast Container */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    )
}