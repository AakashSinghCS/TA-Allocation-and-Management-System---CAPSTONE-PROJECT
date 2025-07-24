import { useParams } from "react-router-dom";
import type Section from "../../../../interfaces/section/Section";
import TabNav from "../../../../components/layout/tabnav/TabNav";
import { fetchUserDetails } from "../../../../api/user/fetchUserDetails";
import type { StudentOrInstructorOrCoordinator } from "../../../../interfaces/user/User";
import { useEffect, useState } from "react";
import { fetchAllExistingYears } from "../../../../api/course/sectionfilter/fetchAllExistingYears";
import { fetchSectionNeedAndAllocations } from "../../../../api/instructor/fetchSectionNeedAndAllocations";
import { fetchConfirmedAllocationsForSections } from "../../../../api/instructor/fetchConfirmedAllocations";
import type { Course } from "../../../../interfaces/course/Course";
import { fetchAllInstructorCourses } from "../../../../api/instructor/fetchAllInstructorCourses";
import { GenericAPIContainer } from "../../../../utility/genericapicontainer/GenericAPIContainer";
import { FaFileCsv, FaFilePdf, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function StudentsAllocatedPage() {
  const { userId } = useParams();
  const iId = Number(userId);
  const [sections, setSections] = useState<Section[]>([]);
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [existingYears, setExistingYears] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(-1);
  const [selectedSemester, setSelectedSemester] = useState<string>("W1");

  // With our new fetchConfirmedAllocationsForSections, we already have only CONFIRMED allocations
  const sectionsWithTAs = sections.filter(section => 
    section.allocations && section.allocations.length > 0
  );
  
  const sectionsWithConfirmedTAs = sectionsWithTAs;

  // Export functions
  const exportToCSV = () => {
    const csvData = sectionsWithConfirmedTAs.flatMap(section => 
      section.allocations?.map(allocation => ({
        'Course Code': `${section.course?.deptCode} ${section.course?.courseNum}`,
        'Course Name': section.course?.name || '',
        'Section': section.section || '',
        'Section Type': section.type || '',
        'Year': section.year || '',
        'Semester': section.semester || '',
        'Student First Name': allocation.student?.firstName || '',
        'Student Last Name': allocation.student?.lastName || '',
        'Student Email': allocation.student?.email || '',
        'Hours Allocated': allocation.numberOfHours || 0,
        'Instructor': section.instructor ? `${section.instructor.firstName} ${section.instructor.lastName}` : ''
      })) || []
    );

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `student-allocations-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    // Simple PDF export using browser print
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const content = `
      <html>
        <head>
          <title>Student Allocations Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #040941; margin-bottom: 20px; }
            .section { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; }
            .section-header { background: #f8f9fa; padding: 10px; margin: -15px -15px 15px -15px; }
            .student { margin: 10px 0; padding: 8px; background: #f8f9fa; }
            .no-students { color: #666; font-style: italic; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <h1>Confirmed Student Allocations Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          ${sectionsWithConfirmedTAs.map(section => `
            <div class="section">
              <div class="section-header">
                <h3>${section.course?.deptCode} ${section.course?.courseNum} ${section.section} - ${section.course?.name}</h3>
                <p><strong>Type:</strong> ${section.type} | <strong>Year:</strong> ${section.year} | <strong>Semester:</strong> ${section.semester}</p>
                ${section.instructor ? `<p><strong>Instructor:</strong> ${section.instructor.firstName} ${section.instructor.lastName}</p>` : ''}
              </div>
              <h4>Confirmed TAs (${section.allocations?.length || 0})</h4>
              ${section.allocations?.map(allocation => `
                <div class="student">
                  <strong>${allocation.student?.firstName} ${allocation.student?.lastName}</strong>
                  ${allocation.student?.email ? ` (${allocation.student.email})` : ''}
                  - ${allocation.numberOfHours || 0} hours
                </div>
              `).join('') || '<div class="no-students">No students allocated</div>'}
            </div>
          `).join('')}
        </body>
      </html>
    `;
    
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Initialize data on component mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const token = localStorage.getItem("token");
        const years = await fetchAllExistingYears();
        const mostRecent = years ? Math.max(...years.map(Number)) : -1;
        const defaultSemester = "W1";

        // First, fetch sections with their needs
        const sectionsWithNeeds = await fetchSectionNeedAndAllocations(iId, null, mostRecent, defaultSemester) ?? [];
        
        // Then fetch only confirmed allocations for these sections
        const sectionsWithConfirmedAllocations = await fetchConfirmedAllocationsForSections(
          sectionsWithNeeds, 
          token || undefined
        );
        
        // Fetch all courses assigned to this instructor
        const allAssignedCourses = await fetchAllInstructorCourses(iId);
        
        setSections(sectionsWithConfirmedAllocations);
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
      const token = localStorage.getItem("token");
      
      // First, fetch sections with their needs
      const sectionsWithNeeds = await fetchSectionNeedAndAllocations(
        iId,
        selectedCourse,
        selectedYear,
        selectedSemester
      ) ?? [];
      
      // Then fetch only confirmed allocations for these sections
      const sectionsWithConfirmedAllocations = await fetchConfirmedAllocationsForSections(
        sectionsWithNeeds, 
        token || undefined
      );
      
      setSections(sectionsWithConfirmedAllocations);
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
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Students Allocated</h1>
          <p className="text-gray-600 text-lg">View and manage student allocations for your courses</p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filter Sections</h3>
            <div className="flex space-x-2">
              <button
                onClick={exportToCSV}
                disabled={sectionsWithTAs.length === 0}
                className="inline-flex items-center px-3 py-2 text-xs bg-green-800 text-white rounded-md 
                  hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <FaFileCsv className="w-3 h-3 mr-1" />
                Export CSV
              </button>
              <button
                onClick={exportToPDF}
                disabled={sectionsWithTAs.length === 0}
                className="inline-flex items-center px-3 py-2 text-xs bg-red-800 text-white rounded-md 
                  hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <FaFilePdf className="w-3 h-3 mr-1" />
                Export PDF
              </button>
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Course */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                value={selectedCourse ?? ""}
                onChange={(e) =>
                  setSelectedCourse(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0089b2] 
                  focus:border-[#0089b2] bg-white text-gray-900 transition-colors hover:border-gray-400"
              >
                <option value="">All courses</option>
                {courseList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.deptCode} {c.courseNum}
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0089b2] 
                  focus:border-[#0089b2] bg-white text-gray-900 transition-colors hover:border-gray-400"
              >
                {existingYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0089b2] 
                  focus:border-[#0089b2] bg-white text-gray-900 transition-colors hover:border-gray-400"
              >
                {["W1", "W2", "S1", "S2"].map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <div>
              <label className="block text-sm font-medium text-transparent mb-1">Search</label>
              <button
                type="button"
                onClick={onSearch}
                className="w-full px-4 py-2 text-sm bg-[#040941] text-white rounded-md hover:bg-[#030735] 
                  transition-colors font-medium"
              >
                Search
              </button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{sections.length} total sections | {sectionsWithTAs.length} sections with TAs</span>
              {sectionsWithTAs.length > 0 && (
                <span>Showing only sections with student allocations</span>
              )}
            </div>
          </div>
        </div>

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
            <div key={section?.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              {/* Combined Section and Allocation Info */}
              <div className="p-6">
                {/* Section Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Link
                        to={`/user/sectionprofile/${section?.id}`}
                        className="text-lg font-semibold text-[#040941] hover:text-[#0089b2] transition-colors"
                      >
                        {section.course?.deptCode} {section.course?.courseNum} {section?.section}
                      </Link>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-600">{section.course?.name}</span>
                    </div>
                    
                    {/* Section Details */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-[#040941] text-white text-xs font-medium">
                        {section.type}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium">
                        {section.year}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded bg-[#0089b2] text-white text-xs font-medium">
                        {section.semester}
                      </span>
                      {section.need && (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-gray-50 text-gray-700 text-xs font-medium">
                          {section.need.numHoursCurrentlyAllocated || 0}/{section.need.requiredGradingHours || 0} hrs
                        </span>
                      )}
                    </div>

                    {/* Instructor */}
                    {section.instructor && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        <span>{section.instructor.firstName} {section.instructor.lastName}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {section.allocations?.length || 0} Confirmed TA{(section.allocations?.length || 0) !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-gray-500">
                      {section.allocations?.reduce((total, alloc) => total + (alloc.numberOfHours || 0), 0) || 0} Total Hours
                    </div>
                  </div>
                </div>

                {/* Students List */}
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Confirmed TAs</h4>
                  <div className="space-y-2">
                    {section.allocations?.map((allocation) => (
                      <div key={allocation.id} 
                        className="flex items-center justify-between p-3 rounded-md border border-gray-100 
                          hover:border-[#0089b2] hover:bg-blue-50 transition-all duration-200 group">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-[#040941] rounded-full 
                            flex items-center justify-center text-white font-bold text-xs">
                            {allocation.student?.firstName?.charAt(0)}{allocation.student?.lastName?.charAt(0)}
                          </div>
                          <div>
                            <Link 
                              to={`/user/profile/${allocation.student?.id}`} 
                              className="font-medium text-gray-900 hover:text-[#040941] transition-colors duration-200" 
                              title="Go to student's profile page"
                            >
                              {allocation.student?.firstName} {allocation.student?.lastName}
                            </Link>
                            {allocation.student?.email && (
                              <div className="text-xs text-gray-500">{allocation.student.email}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-1 rounded bg-[#0089b2] text-white 
                            text-xs font-medium">
                            {allocation.numberOfHours || 0}h
                          </span>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No students allocated to this section
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
