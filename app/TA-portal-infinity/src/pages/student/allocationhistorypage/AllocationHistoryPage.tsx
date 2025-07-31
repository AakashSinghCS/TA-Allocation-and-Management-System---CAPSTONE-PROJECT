import { Link, useParams } from "react-router-dom";
import SectionsColumn from "../../../components/features/section/sectionscolumn/SectionsColumn";
import { useAuth } from "../../../context/AuthContext";
import type Section from "../../../interfaces/section/Section";
import { GenericAPIContainer } from "../../../utility/genericapicontainer/GenericAPIContainer";
import { fetchStudentAllocationHistory } from "../../../api/student/allocation/fetchStudentAllocationHistory";
import type { StudentOrInstructorOrCoordinator } from "../../../interfaces/user/User";
import { fetchUserDetails } from "../../../api/user/fetchUserDetails";
import TabNav from "../../../components/layout/tabnav/TabNav";
import { Info , Trash2 , SquarePen , NotebookPen, University} from 'lucide-react';

export default function AllocationHistoryPage() {
    const { userId } = useParams();
    const sId = Number(userId);
    const { userRoles, userId: loggedInUserId } = useAuth();
    const isLoggedInUser = sId === loggedInUserId;
    const isCoordinator = userRoles.includes("COORDINATOR");

    return (
        <section className="px-4 py-6 md:px-8 md:py-8 min-h-screen">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 py-8 -mt-12">
                <GenericAPIContainer<StudentOrInstructorOrCoordinator>
                    fetchFunction={() => fetchUserDetails(sId)}
                    render={(record) => (
                        <TabNav roles={record.roles ?? []} />
                    )}
                />
                <GenericAPIContainer<Section[]>
                    fetchFunction={() => fetchStudentAllocationHistory(sId)}
                    render={(secs: Section[] = []) => {
                        const safeSecs = Array.isArray(secs) ? secs : [];
                        return (
                            <>
                                {!isCoordinator && (
                                    <>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex-1">
                                                <h1 className="text-2xl md:text-3xl font-bold text-[#040941] mb-1">Teaching Experience</h1>
                                                <p className="text-slate-600 text-base">Manage and view your TA allocation history</p>
                                            </div>
                                            {isLoggedInUser && (
                                                <Link to="/user/student/addallocation">
                                                    <button className="bg-[#040941] hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl text-base shadow transition">
                                                        + Add Experience
                                                    </button>
                                                </Link>
                                            )}
                                        </div>
                                        <div className="bg-amber-100 border border-amber-200 rounded-xl p-5 mb-8 flex items-center gap-4">
                                            <Info className="w-6 h-6 text-amber-500 flex-shrink-0" />
                                            <div className="text-amber-900 text-base">
                                                <b>Important:</b> Please keep your TA experience up to date. All information you add here is visible to course coordinators and will be used to determine your eligibility for new TA allocations. Providing truthful and complete information ensures fair and efficient assignment of TA positions.
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div className={`space-y-6${isCoordinator ? ' mt-8' : ''}`}> 
                                    {safeSecs.length === 0 ? (
                                        <div className="bg-white rounded-xl p-16 text-center">
                                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <NotebookPen className="w-12 h-12 text-slate-400" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-slate-600 mb-3">No Courses Yet</h3>
                                            <p className="text-slate-500 mb-6 max-w-md mx-auto">
                                                Your TA journey starts here. Add your first course experience.
                                            </p>
                                        </div>
                                    ) : (
                                        safeSecs.map((section: any, idx: number) => (
                                            <div key={section.id || idx} className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow transition">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-16 h-16 bg-[#040941] rounded-lg flex items-center justify-center">
                                                        <span className="text-white text-2xl font-bold">{section.course?.deptCode?.charAt(0)}</span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-[#040941] text-lg md:text-xl">{section.course?.deptCode} {section.course?.courseNum}</span>
                                                        </div>
                                                        <div className="text-slate-600 text-base mb-2">{section.course?.name}</div>
                                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                            <University className="w-4 h-4" />
                                                            Department: {section.course?.deptCode}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className="bg-slate-100 text-slate-700 rounded-full px-3 py-1 text-base">{section.year}</span>
                                                    <span className="bg-blue-100 text-blue-900 rounded-full px-3 py-1 text-base font-semibold">{section.semester}</span>
                                                </div>
                                                {isLoggedInUser && (
                                                    <div className="flex gap-2 ml-4">
                                                        <Link to="/user/student/addallocation">
                                                            <button className="bg-[#040941] hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg transition flex items-center gap-2">
                                                                <SquarePen className="w-4 h-4" />
                                                                Edit
                                                            </button>
                                                        </Link>
                                                        <Link to="/user/student/addallocation">
                                                            <button className="bg-red-900 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition flex items-center gap-2">
                                                                <Trash2 className="w-4 h-4" />
                                                                Remove
                                                            </button>
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        );
                    }}
                />
            </div>
        </section>
    );
}