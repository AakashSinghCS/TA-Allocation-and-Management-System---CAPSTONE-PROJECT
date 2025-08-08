import { useParams } from "react-router-dom";
import type Section from "../../../../interfaces/section/Section";
import TabNav from "../../../../components/layout/tabnav/TabNav";
import { fetchUserDetails } from "../../../../api/user/fetchUserDetails";
import type { StudentOrInstructorOrCoordinator } from "../../../../interfaces/user/User";
import { useEffect, useState } from "react";
import { fetchAllExistingYears } from "../../../../api/course/sectionfilter/fetchAllExistingYears";
import { fetchSectionNeedAndAllocations } from "../../../../api/instructor/fetchSectionNeedAndAllocations";
import { fetchAllInstructorCourses } from "../../../../api/instructor/fetchAllInstructorCourses";
import { GenericAPIContainer } from "../../../../utility/genericapicontainer/GenericAPIContainer";
import { FaUsers } from "react-icons/fa";
import { FilterSection, SectionCard, exportToCSV, exportToPDF } from "../../../../components/features/allocatedStudent";
import { useAuth } from "../../../../context/AuthContext";
import type { Course } from "../../../../interfaces/course/Course";
import type { Allocation } from "../../../../interfaces/allocation/Allocation";
import { fetchAllocationById } from "../../../../api/allocation/fetchAllocationById";

export default function StudentsAllocatedPage() {
  const { userId } = useParams();
  const iId = Number(userId);
  const { userRoles } = useAuth();
  const isCoordinator = userRoles.includes("COORDINATOR");
  const [sections, setSections] = useState<Section[]>([]);
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [existingYears, setExistingYears] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(-1);
  const [selectedSemester, setSelectedSemester] = useState<string>("W1");

  // Filter sections that have confirmed TAs (we already filtered for CONFIRMED status)
  const sectionsWithTAs = sections.filter(section =>
    section.allocations && section.allocations.length > 0
  );

  const sectionsWithConfirmedTAs = sectionsWithTAs;

  // Handler functions for filter section
  const handleExportCSV = () => exportToCSV(sectionsWithConfirmedTAs);
  const handleExportPDF = () => exportToPDF(sectionsWithConfirmedTAs);

  const getAllocations = async (mostRecent: number, defaultSemester: string) => {
    const sectionsWithNeeds = await fetchSectionNeedAndAllocations(iId, null, mostRecent, defaultSemester) ?? [];
    const allocIds = Array.from(
    new Set(
      sectionsWithNeeds.flatMap((section) =>
        section.allocatedSections?.map((as) => as.allocationId)
      )
    )
  );

    const fullAllocs: Allocation[] = await Promise.all(
      allocIds.map(id => fetchAllocationById(id!))
    );

    const confirmedAllocs = fullAllocs.filter((a) => a.status === "CONFIRMED");

    const allocMap = new Map<number, Allocation>(
      confirmedAllocs.map(a => [a.id as number, a])
    );

    return sectionsWithNeeds.map((section) => ({
    ...section,
    allocations: section.allocatedSections
      ?.map((stub) => allocMap.get(stub.allocationId))
      .filter((a): a is Allocation => !!a),
  }));

  }

  // Initialize data on component mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const years = await fetchAllExistingYears();
        const mostRecent = years ? Math.max(...years.map(Number)) : -1;
        const defaultSemester = "W1";
        const allAssignedCourses = await fetchAllInstructorCourses(iId);


        const enrichedSections = await getAllocations(mostRecent, defaultSemester);

        setSections(enrichedSections);
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
      // Filter allocations to show only CONFIRMED status
      const enrichedSections = await getAllocations(selectedYear, selectedSemester);
      setSections(enrichedSections);
    } catch (error) {
      console.error("Failed to search sections:", error);
    }
  };

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

        {/* Header - only show when not viewed by coordinator */}
        {!isCoordinator && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Students Allocated</h1>
            <p className="text-gray-600 text-lg">View and manage student allocations for your courses</p>
          </div>
        )}

        {/* Add spacing when coordinator is viewing and header is hidden */}
        {isCoordinator && <div className="mb-6"></div>}

        {/* Filter Section */}
        <FilterSection
          sections={sections}
          sectionsWithTAs={sectionsWithTAs}
          courseList={courseList}
          existingYears={existingYears}
          selectedCourse={selectedCourse}
          selectedYear={selectedYear}
          selectedSemester={selectedSemester}
          onCourseChange={setSelectedCourse}
          onYearChange={setSelectedYear}
          onSemesterChange={setSelectedSemester}
          onSearch={onSearch}
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
        />

        {/* Content Section */}
        <div className="space-y-4">
          {sectionsWithTAs.length === 0 && (
            <div className="text-center py-16 rounded-lg border border-gray-200">
              <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No students allocated</h3>
              <p className="mt-2 text-gray-500">No student allocations found for the selected criteria.</p>
              <p className="mt-1 text-sm text-gray-400">Try adjusting your filters or check back later.</p>
            </div>
          )}

          {sectionsWithConfirmedTAs.map((section) => (
            <SectionCard key={section?.id} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
}
