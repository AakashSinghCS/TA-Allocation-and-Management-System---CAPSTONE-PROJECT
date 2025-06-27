// src/components/coursefilter/CourseFilter.tsx
import { useState } from 'react';
import DaySelector from '../../ui/dayselector/DaySelector';
import TimeSelector from '../../ui/timeselector/TimeSelector';
import { GenericAPIContainer } from '../../../utility/genericapicontainer/GenericAPIContainer';
import { fetchAllExistingDeptCodes } from '../../../api/sectionfilter/fetchAllExsitingDeptCodes';
import { sectionTypeOptions } from '../../../interfaces/section/SectionDetails';
import DeptCodeCourseNumSectionYearSemesterDropdownContainer from './deptcodecoursenumsectionyearsemesterdropdowncontainer/DeptCodeCourseNumSectionYearSemesterDropdownContainer';


interface CourseFilterProps {
  onFilterChange: (filters: {
    term: string;
    searchQuery: string;
    deptCode: string;
    type: string;
  }) => void;
}

export default function CourseFilter({ onFilterChange }: CourseFilterProps) {
  const [term, setTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [type, setType] = useState('');

  const handleFilter = () => {
    onFilterChange({ term, searchQuery, deptCode, type });
  };

  return (
    <div className="space-y-4">
      {/* Row 1: Free-text search */}
      <input
        type="text"
        placeholder="Search by course name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border p-2 rounded-md w-full"
      />

      {/* Row 2: All dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Dept → Course# → Section → Year → Semester */}
        <GenericAPIContainer<string[] | null>
          fetchFunction={fetchAllExistingDeptCodes}
          render={(allDeptCodes) => (
            <DeptCodeCourseNumSectionYearSemesterDropdownContainer
              allExistingDeptCodes={allDeptCodes}
            />
          )}
        />

        {/* Type */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border p-2 rounded-md w-full"
        >
          <option value="">All Types</option>
          {sectionTypeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Day of week */}
        <DaySelector />

        {/* Start & end time */}
        <TimeSelector />
      </div>

      {/* Submit */}
      <button
        onClick={handleFilter}
        className="bg-blue-500 text-white p-2 rounded-md w-full"
      >
        Filter
      </button>
    </div>
  );
}
