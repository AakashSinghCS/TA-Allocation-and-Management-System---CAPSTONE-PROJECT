import { useCallback, useEffect, useState } from 'react';
import { fetchAllExistingDeptCodes } from '../../../../api/course/sectionfilter/fetchAllExistingDeptCodes';
import { type FilterSectionsProps } from '../../../../api/course/sectionfilter/fetchFilteredSections';
import { sectionTypeOptions, type SectionType } from '../../../../interfaces/section/SectionDetails';
import { GenericAPIContainer } from '../../../../utility/genericapicontainer/GenericAPIContainer';
import DaySelector from '../../../ui/section/dayselector/DaySelector';
import TimeSelector from '../../../ui/section/timeselector/TimeSelector';
import DropdownContainer, { type AllExistingDeptCodesAndYears } from '../dropdowncontainer/DropdownContainer';
import { fetchAllExistingYears } from '../../../../api/course/sectionfilter/fetchAllExistingYears';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
type Mode = 'small' | 'large';

interface CourseFilterProps {
  onFilterChange: (filters: FilterSectionsProps) => void;
  mode?: Mode;
  loading?: boolean
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
  loading = false
}: CourseFilterProps) {
  const [name, setName] = useState<string | null>(null);
  const [type, setType] = useState<SectionType | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [rawSearchText, setRawSearchText] = useState<string>('');
  const [searchText, setSearchText] = useState<string | null>(null);
  const [times, setTimes] = useState<SearchTimes>({ startTime: null, endTime: null });
  const [dCCNSYS, setdCCNSYS] = useState<DeptCodeCourseNumSectionYearSemesterProps>({
    deptCode: null,
    courseNum: null,
    section: null,
    year: null,
    semester: null,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    onFilterChange({
      deptCode: dCCNSYS.deptCode,
      name,
      courseNum: dCCNSYS.courseNum,
      section: dCCNSYS.section,
      year: dCCNSYS.year,
      semester: dCCNSYS.semester,
      type,
      day,
      startTime: times.startTime,
      endTime: times.endTime,
      searchText,
    });
  }, [
    name,
    dCCNSYS.deptCode, dCCNSYS.courseNum, dCCNSYS.section,
    dCCNSYS.year, dCCNSYS.semester,
    type, day,
    times.startTime, times.endTime,
    searchText,
    onFilterChange
  ]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchText(rawSearchText.trim() === '' ? null : rawSearchText.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [rawSearchText]);


  // const smallStyle = "mt-1 block w-full rounded border border-gray-400 px-2 py-1"
  // const bigStyle = "mt-1 block w-full rounded border border-gray-400 px-3 py-2"
  // const smallOrBig = `${mode === 'small' ? smallStyle : bigStyle}`
  const loadDeptAndYears = useCallback<() => Promise<AllExistingDeptCodesAndYears>>(async () => {
    const deptCodes = await fetchAllExistingDeptCodes();
    const years = await fetchAllExistingYears();
    return { deptCodes: deptCodes ?? [], years: years ?? [] };
  }, []);

  const inputStyleSmall = 'px-2 py-1 border border-gray-400 rounded w-full mt-1';
  const inputStyleBig = 'px-3 py-2 border border-gray-400 rounded w-full mt-1';
  const toggleButtonStyleSmall = 'flex items-center justify-center border border-gray-400 rounded hover:bg-gray-100 transition';
  const toggleButtonStyleBig = 'flex items-center justify-center border border-gray-400 rounded px-1 hover:bg-gray-100 transition';

  return (
    <div className={mode === 'small' ? "space-y-1 text-sm" : "space-y-4"}>
      <input
        type="text"
        placeholder="Search courses (e.g. 'math 101 winter')"
        value={rawSearchText}
        onChange={(e) => setRawSearchText(e.target.value)}
        className={mode === 'small' ? inputStyleSmall : inputStyleBig}
      />


      {mode === 'small' ? (
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: showFilters ? '1fr 1fr auto' : '1fr auto' }}
        >
          <GenericAPIContainer<AllExistingDeptCodesAndYears | null>
            fetchFunction={loadDeptAndYears}
            render={(allDeptCodesAndYears) => (
              <DropdownContainer
                allExistingDeptCodesAndYears={allDeptCodesAndYears}
                mode={mode}
                onChange={(partial) => setdCCNSYS(prev => ({ ...prev, ...partial }))}
              />
            )}
          />
          
          {showFilters && (
          <div className="grid grid-cols-1 gap-2">
                <select
                  value={type ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setType(val === "" ? null : val as SectionType);
                  }}
                  className="mt-1 block w-full rounded border border-gray-400 px-2 py-1"
                >
                  <option value="">All Section Types</option>
                  {sectionTypeOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <DaySelector mode={mode} onChange={setDay} />
                <TimeSelector mode={mode} onChange={setTimes} />
             
                  <input
                  type="text"
                  placeholder="Course Name (e.g. 'Introduction to ...') "
                  value={name ?? ""}
                  onChange={(e) => setName(e.target.value)}
                  className={inputStyleSmall}
                />
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className={`${toggleButtonStyleSmall} h-full`}
            aria-label={showFilters ? 'Hide Section Filters' : 'Show Section Filters'}
          >
            {showFilters ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      ) : (
        <div
          className="grid gap-2"
          style={{ gridTemplateRows: showFilters ? 'auto auto auto' : 'auto auto' }}
        >
          <GenericAPIContainer<AllExistingDeptCodesAndYears | null>
            fetchFunction={loadDeptAndYears}
            render={(allDeptCodesAndYears) => (
              <DropdownContainer
                allExistingDeptCodesAndYears={allDeptCodesAndYears}
                mode={mode}
                onChange={(partial) => setdCCNSYS(prev => ({ ...prev, ...partial }))}
              />
            )}
          />
          <div>
            {!showFilters ? (
              <button
                type="button"
                onClick={() => setShowFilters(true)}
                className={`${toggleButtonStyleBig} w-full`}
                aria-label={'Show Section Filters'}
              >
                <ChevronDown size={20} />
              </button>
            ) : (
              <div className="flex gap-5">
                <select
                  value={type ?? ''}
                  onChange={(e) => setType(e.target.value === '' ? null : (e.target.value as SectionType))}
                  className="mt-1 block w-full rounded border border-gray-400 px-3 py-2"
                >
                  <option value="">All Section Types</option>
                  {sectionTypeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <DaySelector mode={mode} onChange={setDay} />
                <TimeSelector mode={mode} onChange={setTimes} />
                <input
                    type="text"
                    placeholder="Course Name (e.g. 'Introduction to ...') "
                    value={name ?? ""}
                    onChange={(e) => setName(e.target.value)}
                    className={inputStyleBig}
                    title="Course Name (e.g. 'Introduction to Computer Science...')"
                  />
              </div>
            )}
          </div>
          {showFilters && <button
            type="button"
            onClick={() => setShowFilters(false)}
            className={toggleButtonStyleBig}
            aria-label={'Hide Section Filters'}
          >
            <ChevronUp size={20} />
          </button>}
        </div>
      )}
    </div>
  );
}
