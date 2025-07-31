import { useParams } from "react-router-dom";
import { useAuth } from '../../../../context/AuthContext';
import { UserRole } from '../../../../interfaces/enum/UserRole';
import StudentQualificationViewer from "./qualificationviewer/StudentQualificationViewer";
import TabNav from "../../../../components/layout/tabnav/TabNav";
import { fetchUserDetails } from "../../../../api/user/fetchUserDetails";
import type { StudentOrInstructorOrCoordinator } from "../../../../interfaces/user/User";
import { GenericAPIContainer } from "../../../../utility/genericapicontainer/GenericAPIContainer";
import { Info } from 'lucide-react';




export default function StudentQualificationPage (){
    const { userId } = useParams();
    const sId = Number(userId);
    const { userRoles } = useAuth();
    const isCoordinatorOrAdmin = userRoles.includes(UserRole.COORDINATOR) || userRoles.includes(UserRole.ADMIN);
    return(
        <section className="px-4 py-6 md:px-8 md:py-8 min-h-screen">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 py-8 -mt-12">
                <GenericAPIContainer<StudentOrInstructorOrCoordinator>
                    fetchFunction={() => fetchUserDetails(sId)}
                    render={(record) => (
                        <TabNav
                        roles={record.roles ?? []}
                        />
                    )}
                />
                {/* Sidebar + main content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
                    {/* Main Content */}
                    <main className="md:col-span-3">
                        <div className="mb-8">
                            {!isCoordinatorOrAdmin && (
                              <h1 className="text-2xl md:text-3xl font-bold text-[#040941] tracking-tight mb-8 -mt-8">
                                Skills & Qualifications
                              </h1>
                            )}
                            <div className="rounded-lg border border-orange-200 bg-orange-50 p-5 flex items-start gap-3 mb-2">
                                <Info className="w-6 h-6 text-orange-400 mt-1 flex-shrink-0" />
                                <div>
                                    <div className="font-semibold text-orange-800 mb-1">Important Notice</div>
                                    <div className="text-orange-800 text-sm">
                                        Select the departments and courses where you have the technical knowledge and skills to effectively assist students as a Teaching Assistant.
                                    </div>
                                </div>
                            </div>
                        </div>
                        <StudentQualificationViewer studentId={sId} />
                    </main>
                    {/* Sidebar */}
                    <aside className="md:col-span-1 bg-blue-50 border border-blue-100 rounded-lg p-6 flex flex-col items-start mt-10">
                        <h2 className="text-lg font-semibold text-[#040941] mb-2">How to Use</h2>
                        <ul className="text-sm text-blue-900 space-y-2 list-disc pl-4">
                            <li>Select the departments and courses where you have strong technical knowledge.</li>
                            <li>Use the checkboxes to indicate your qualifications.</li>
                            <li>Click 'Save Qualifications' when finished.</li>
                        </ul>
                        <div className="mt-6 p-3 bg-blue-100 rounded text-xs text-blue-700">
                            <strong>Tip:</strong> You can update your qualifications at any time.
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    )
}