import { useParams } from "react-router-dom";
import type Section from "../../../../interfaces/section/Section";
import TabNav from "../../../../components/layout/tabnav/TabNav";
import { fetchUserDetails } from "../../../../api/user/fetchUserDetails";
import type { StudentOrInstructorOrCoordinator } from "../../../../interfaces/user/User";
import { useEffect, useState } from "react";
import type { DeadlineDto } from "../../../../interfaces/admin/Deadline";
import { fetchDeadlines } from "../../../../api/admin/FetchDeadline";
import { useAuth } from "../../../../context/AuthContext";
import { fetchAllExistingYears } from "../../../../api/course/sectionfilter/fetchAllExistingYears";
import { fetchSectionNeedAndAllocations } from "../../../../api/instructor/fetchSectionNeedAndAllocations";
import type { Course } from "../../../../interfaces/course/Course";
import { fetchAllInstructorCourses } from "../../../../api/instructor/fetchAllInstructorCourses";
import AllocationCard from "../../../../components/features/allocation/AllocationCard";
import { GenericAPIContainer } from "../../../../utility/genericapicontainer/GenericAPIContainer";

export default function StudentsAllocatedPage() {
  const { userId } = useParams();
  const iId = Number(userId);
  const [needDeadline, setNeedDeadline] = useState<DeadlineDto | null>(null);
  const [deadlineError, setDeadlineError] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [existingYears, setExistingYears] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(-1);
  const [selectedSemester, setSelectedSemester] = useState<string>("W1");

  const { token } = useAuth();

  // Initialize data on component mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const years = await fetchAllExistingYears();
        const mostRecent = years ? Math.max(...years.map(Number)) : -1;
        const defaultSemester = "W1";

        const [initialSections, allAssignedCourses] = await Promise.all([
          fetchSectionNeedAndAllocations(iId, null, mostRecent, defaultSemester) ?? [],
          fetchAllInstructorCourses(iId)
        ]);

        setSections(initialSections ?? []);
        setCourseList(allAssignedCourses);
        setExistingYears(years ?? []);
        setSelectedYear(mostRecent);
        setSelectedSemester(defaultSemester);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    }

    loadInitialData();
  }, [iId]);

  const onSearch = async () => {
    try {
      const result = await fetchSectionNeedAndAllocations(
        iId,
        selectedCourse,
        selectedYear,
        selectedSemester
      );
      setSections(result ?? []);
    } catch (error) {
      console.error("Failed to search sections:", error);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        <GenericAPIContainer<StudentOrInstructorOrCoordinator>
          fetchFunction={() => fetchUserDetails(iId)}
          render={(record) => (
            <TabNav
              roles={record.roles ?? []}
            />
          )}
        />
        
        {/* Simple Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Students Allocated</h1>
          <p className="text-gray-600 text-lg">View and manage student allocations for your courses</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-8">
            {/* Deadline Information */}
            {needDeadline && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-1">Application Deadline</h3>
                    <p className="text-blue-700 text-lg font-medium">
                      {new Date(needDeadline.endTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {!needDeadline && !deadlineError && (
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">No Deadline Set</h3>
                    <p className="text-gray-600">No application deadline found.</p>
                  </div>
                </div>
              </div>
            )}
            
            {deadlineError && (
              <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-6 mb-8 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-800 mb-1">Error Loading Deadline</h3>
                    <p className="text-red-600">{deadlineError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Filter Section */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200 shadow-sm mb-8">
              <div className="flex items-center mb-4">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                </svg>
                <h3 className="text-lg font-semibold text-gray-800">Filter Sections</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Course</label>
                  <select
                    value={selectedCourse ?? ""}
                    onChange={(e) =>
                      setSelectedCourse(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 
                      focus:border-blue-500 bg-white text-gray-900 shadow-sm transition-all duration-200
                      hover:border-gray-400"
                  >
                    <option value="">All courses</option>
                    {courseList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.deptCode} {c.courseNum}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 
                      focus:border-blue-500 bg-white text-gray-900 shadow-sm transition-all duration-200
                      hover:border-gray-400"
                  >
                    {existingYears.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Semester</label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 
                      focus:border-blue-500 bg-white text-gray-900 shadow-sm transition-all duration-200
                      hover:border-gray-400"
                  >
                    {["W1", "W2", "S1", "S2"].map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={onSearch}
                  className="w-full px-6 py-2.5 bg-gradient-to-r from-[#040941] to-[#0089b2] text-white 
                    rounded-lg hover:from-[#030735] hover:to-[#007299] transition-all duration-200 
                    shadow-md hover:shadow-lg transform hover:scale-105 font-medium flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  Search
                </button>
              </div>
            </div>

            {/* Sections Display */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-1 shadow-inner">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                {sections.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No students allocated</h3>
                    <p className="text-gray-500">No student allocations found for the selected criteria.</p>
                  </div>
                )}

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {sections.map((section) => (
                    <div key={section.id} className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {section.course?.deptCode} {section.course?.courseNum} {section.section}
                        </h4>
                        <p className="text-sm text-gray-600 mb-1">{section.course?.name}</p>
                        <div className="flex flex-wrap gap-1 text-xs">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{section.type}</span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">{section.year}</span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">{section.semester}</span>
                        </div>
                      </div>
                      <AllocationCard allocations={section.allocations} className="" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
