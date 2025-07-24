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
import { fetchAllExistingDeptCodes } from "../../../../api/course/sectionfilter/fetchAllExistingDeptCodes";
import { fetchAllExistingYears } from "../../../../api/course/sectionfilter/fetchAllExistingYears";
import { fetchSectionNeedAndAllocations } from "../../../../api/instructor/fetchSectionNeedAndAllocations";
import { fetchConfirmedAllocationsForSections } from "../../../../api/instructor/fetchConfirmedAllocations";
import type { Course } from "../../../../interfaces/course/Course";
import { fetchAllInstructorCourses } from "../../../../api/instructor/fetchAllInstructorCourses";
import { FaRegClock } from "react-icons/fa";

export interface NeedViewerResponse {
  sections: Section[] | null;
  existingYears: string[];
  allAssignedCourses: Course[];
}

export default function InstructorNeedPage() {
  const { userId } = useParams();
  const iId = Number(userId);
  const [needDeadline, setNeedDeadline] = useState<DeadlineDto | null>(null);
  const [deadlineError, setDeadlineError] = useState("");

  const { token, userRoles } = useAuth();

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

  return (
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
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">TA Information</h1>
          <p className="text-gray-600 text-lg">Manage your sections and TA requirements</p>
        </div>
        
        {/* Deadline Information */}
        <div className="mb-4 -mt-2">
          {needDeadline ? (
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded border-l-3 border-blue-400">
              <FaRegClock className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
          <h3 className="text-base font-medium text-blue-900">TA Requirements Deadline</h3>
          <p className="text-blue-800 text-sm">
            {new Date(needDeadline.endTime).toLocaleString()}
          </p>
          <p className="text-blue-700 text-sm mt-1">Please submit your TA requirements before this deadline</p>
              </div>
            </div>
          ) : deadlineError ? (
            <div className="flex items-center space-x-3 p-3 bg-red-50 rounded border-l-3 border-red-400">
              <FaRegClock className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
          <h3 className="text-base font-medium text-red-800">Error Loading Deadline</h3>
          <p className="text-red-700 text-sm">{deadlineError}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded border-l-3 border-gray-400">
              <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
          <h3 className="text-base font-medium text-gray-700">No Deadline Set</h3>
          <p className="text-gray-600 text-sm">No requirements deadline configured.</p>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <GenericAPIContainer<NeedViewerResponse | null>
          fetchFunction={async () => {
            const years = await fetchAllExistingYears();
            const mostRecent = years ? Math.max(...years.map(Number)) : -1;
            const defaultSemester = "W1";

            const token = localStorage.getItem("token");
            const sectionsWithNeeds = await fetchSectionNeedAndAllocations(iId, null, mostRecent, defaultSemester) ?? [];
            const sectionsWithAllocations = await fetchConfirmedAllocationsForSections(sectionsWithNeeds, token || undefined);
            const allAssignedCourses = await fetchAllInstructorCourses(iId);
            const response: NeedViewerResponse = {
              sections: sectionsWithAllocations,
              existingYears: years ?? [""],
              allAssignedCourses
            }
            return response;
          }}
          render={(sections) => (
            <NeedViewer instructorId={iId} initial={sections} />
          )}
        />
      </div>
    </div>
  )
}