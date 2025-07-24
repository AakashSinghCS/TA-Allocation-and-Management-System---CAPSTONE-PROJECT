import { FaFileCsv, FaFilePdf } from "react-icons/fa";
import type Section from "../../../../../interfaces/section/Section";
import type { Course } from "../../../../../interfaces/course/Course";

interface FilterSectionProps {
  sections: Section[];
  sectionsWithTAs: Section[];
  courseList: Course[];
  existingYears: string[];
  selectedCourse: number | null;
  selectedYear: number;
  selectedSemester: string;
  onCourseChange: (courseId: number | null) => void;
  onYearChange: (year: number) => void;
  onSemesterChange: (semester: string) => void;
  onSearch: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export default function FilterSection({
  sections,
  sectionsWithTAs,
  courseList,
  existingYears,
  selectedCourse,
  selectedYear,
  selectedSemester,
  onCourseChange,
  onYearChange,
  onSemesterChange,
  onSearch,
  onExportCSV,
  onExportPDF,
}: FilterSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filter Sections</h3>
        <div className="flex space-x-2">
          <button
            onClick={onExportCSV}
            disabled={sectionsWithTAs.length === 0}
            className="inline-flex items-center px-3 py-2 text-xs bg-green-800 text-white rounded-md 
              hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <FaFileCsv className="w-3 h-3 mr-1" />
            Export CSV
          </button>
          <button
            onClick={onExportPDF}
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
              onCourseChange(
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
            onChange={(e) => onYearChange(Number(e.target.value))}
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
            onChange={(e) => onSemesterChange(e.target.value)}
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
  );
}
