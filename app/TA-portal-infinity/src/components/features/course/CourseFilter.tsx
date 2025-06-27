import { useState } from 'react';
import DaySelector from '../../ui/dayselector/DaySelector';
import TimeSelector from '../../ui/timeselector/TimeSelector';
import { GenericAPIContainer } from '../../../utility/genericapicontainer/GenericAPIContainer';
import { fetchAllExistingDeptCodes } from '../../../api/sectionfilter/fetchAllExsitingDeptCodes';
import { sectionTypeOptions } from '../../../interfaces/section/SectionDetails';
import DeptCodeCourseNumSectionYearSemesterDropdownContainer from './deptcodecoursenumsectionyearsemesterdropdowncontainer/DeptCodeCourseNumSectionYearSemesterDropdownContainer';

type Mode = 'small' | 'large';

interface CourseFilterProps {
  onFilterChange: (filters: {
    term: string;
    searchQuery: string;
    deptCode: string;
    type: string;
  }) => void;
  mode?: Mode;
}

export default function CourseFilter({
  onFilterChange,
  mode = 'small',
}: CourseFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [type, setType] = useState('');

  const handleFilter = () => {
    onFilterChange({ term: '', searchQuery, deptCode: '', type });
  };

  const smallStyle = "mt-1 block w-full rounded border border-gray-400 px-2 py-1"
  const bigStyle ="mt-1 block w-full rounded border border-gray-400 px-3 py-2"
  const smallOrBig = `${mode ==='small'?smallStyle:bigStyle}`

  return (
    <div className={mode === 'small' ? "space-y-1 text-sm" : "space-y-4"}>
      <input
        type="text"
        placeholder="Search... e.g. '2024', '001', '121', 'L01', 'COSC 111 001'"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={mode === "small" ? "px-2 py-1 border rounded-md w-full" : "px-3 py-2 border rounded-md w-full"}
      />

      <div className={mode === 'small'?"grid grid-cols-2 gap-2": "grid grid-rows-2 gap-4"}>
        <div className="">
          <GenericAPIContainer<string[] | null>
            fetchFunction={fetchAllExistingDeptCodes}
            render={(allDeptCodes) => (
              <DeptCodeCourseNumSectionYearSemesterDropdownContainer
                allExistingDeptCodes={allDeptCodes}
                mode={mode}
              />
            )}
          />
        </div>

        <div className={mode === 'small'?"grid grid-cols-1 gap-2":"flex gap-5"}>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={smallOrBig}
          >
            <option value="">All Types</option>
            {sectionTypeOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <DaySelector mode={mode} />
          <TimeSelector mode={mode} />
        </div>
      </div>

      <button
        onClick={handleFilter}
        className="bg-blue-500 text-white p-2 rounded-md w-full"
      >
        Filter
      </button>
    </div>
  );
}
