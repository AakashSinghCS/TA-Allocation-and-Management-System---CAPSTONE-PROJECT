import { useState } from 'react';
import { fetchAllExistingDeptCodes } from '../../../../api/course/sectionfilter/fetchAllExistingDeptCodes';
import { type FilterSectionsProps } from '../../../../api/course/sectionfilter/fetchFilteredSections';
import { sectionTypeOptions, type SectionType } from '../../../../interfaces/section/SectionDetails';
import { GenericAPIContainer } from '../../../../utility/genericapicontainer/GenericAPIContainer';
import DaySelector from '../../../ui/section/dayselector/DaySelector';
import TimeSelector from '../../../ui/section/timeselector/TimeSelector';
import DropdownContainer, { type AllExistingDeptCodesAndYears } from '../dropdowncontainer/DropdownContainer';
import { fetchAllExistingYears } from '../../../../api/course/sectionfilter/fetchAllExistingYears';
type Mode = 'small' | 'large';

interface CourseFilterProps {
  onFilterChange: (filters: FilterSectionsProps) => void;
  mode?: Mode;
}

export interface DeptCodeCourseNumSectionYearSemesterProps {
  deptCode: string | null;
  courseNum: string | null;
  section: string | null;
  year: number | null;
  semester: string | null;
}

export interface SearchTimes {
  startTime: string | null;
  endTime: string | null;
}

export default function SectionFilter({
  onFilterChange,
  mode = 'small',
}: CourseFilterProps) {
  const [name, setName] = useState<string | null>(null);
  const [type, setType] = useState<SectionType | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [times, setTimes] = useState<SearchTimes>({ startTime: null, endTime: null });
  const [dCCNSYS, setdCCNSYS] = useState<DeptCodeCourseNumSectionYearSemesterProps>({
    deptCode: null,
    courseNum: null,
    section: null,
    year: null,
    semester: null,
  });

  const handleFilter = () => {
    onFilterChange({
      deptCode: dCCNSYS.deptCode,
      name: name,
      courseNum: dCCNSYS.courseNum,
      section: dCCNSYS.section,
      year: dCCNSYS.year,
      semester: dCCNSYS.semester,
      type: type,
      day: day,
      startTime: times.startTime,
      endTime: times.endTime
    });
  };

  const smallStyle = "mt-1 block w-full rounded border border-gray-400 px-2 py-1"
  const bigStyle = "mt-1 block w-full rounded border border-gray-400 px-3 py-2"
  const smallOrBig = `${mode === 'small' ? smallStyle : bigStyle}`

  return (
    <div className={mode === 'small' ? "space-y-1 text-sm" : "space-y-4"}>
      <input
        type="text"
        placeholder="Search course name (e.g. 'Introduction to ...') "
        value={name ?? ""}
        onChange={(e) => setName(e.target.value)}
        className={mode === "small" ? "px-2 py-1 border border-gray-400 rounded-md w-full" : "px-3 py-2 border border-gray-400 rounded-md w-full"}
      />

      <div className={mode === 'small' ? "grid grid-cols-2 gap-2" : "grid grid-rows-2 gap-4"}>
        <div className="">
          <GenericAPIContainer<AllExistingDeptCodesAndYears | null>
            fetchFunction={async () =>{
              const deptCodes = await fetchAllExistingDeptCodes();

              const years = await fetchAllExistingYears();
              const returnVal : AllExistingDeptCodesAndYears = {
                deptCodes:deptCodes ?? [],
                years:years ??[]
              };
              return returnVal;
            }}
            render={(allDeptCodesAndYears) => (
              <DropdownContainer
                allExistingDeptCodesAndYears={allDeptCodesAndYears}
                mode={mode}
                onChange={(partial) => setdCCNSYS(prev => ({ ...prev, ...partial }))}
              />
            )}
          />
        </div>

        <div className={mode === 'small' ? "grid grid-cols-1 gap-2" : "flex gap-5"}>
          <select
            value={type ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setType(val === "" ? null : val as SectionType);
            }}
            className={smallOrBig}
          >
            <option value="">All Types</option>
            {sectionTypeOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <DaySelector mode={mode} onChange={setDay} />
          <TimeSelector mode={mode} onChange={setTimes} />
        </div>
      </div>

      <button
        type="button"
        onClick={handleFilter}
        className="bg-[#040941] text-white px-4 py-1 rounded hover:bg-[#040491] transition-colors text-white w-full"
      >
        Filter
      </button>
    </div>
  );
}
