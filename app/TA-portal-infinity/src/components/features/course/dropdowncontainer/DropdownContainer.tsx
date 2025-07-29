import { useState, useEffect } from "react";
import DeptCodeDropdown from "../../../ui/section/deptcodedropdown/DeptCodeDropdown";
import SemesterDropdown from "../../../ui/section/semesterdropdown/SemesterDropdown";
import { useRef, useMemo } from 'react';
import {
  fetchAllExistingCourseNums,
} from "../../../../api/course/sectionfilter/fetchAllExistingCourseNums";
import { fetchAllExistingSections } from "../../../../api/course/sectionfilter/fetchAllExistingSections";
import type { DeptCodeCourseNumSectionYearSemesterProps } from "../coursefilter/SectionFilter";
import CourseNumDropdown from "../../../ui/section/coursenumdropdown/CourseNumDropdown";
import SectionDropdown from "../../../ui/section/sectiondropdown/SectionDropdown";
import YearDropdown from "../../../ui/section/yeardropdown/YearDropdown";

export interface AllExistingDeptCodesAndYears{
  deptCodes : string[];
  years : string[];
}


interface Props {
  allExistingDeptCodesAndYears: AllExistingDeptCodesAndYears | null;
  mode?: string;
  onChange: (val: Partial<DeptCodeCourseNumSectionYearSemesterProps>) => void;
}

export default function DropdownContainer({ allExistingDeptCodesAndYears, mode, onChange }: Props) {
  const [selectedDeptCode, setSelectedDeptCode] = useState<string | null>(null);
  const [selectedCourseNum, setSelectedCourseNum] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

  const [courseNumData, setCourseNumData] = useState<string[] | null>(null);
  const [sectionData, setSectionData] = useState<string[] | null>(null);
  // const [semesterData, setSemesterData] = useState<string[] | null>(null);
  const semesterData = ["W1","W2","S1","S2"];
  const initializedYear = useRef(false);

  const maxYear = useMemo(() => {
    const ys = allExistingDeptCodesAndYears?.years ?? [];
    const nums = ys.map(Number).filter(n => !Number.isNaN(n));
    return nums.length ? Math.max(...nums) : null;
  }, [allExistingDeptCodesAndYears?.years]);

  useEffect(() => {
    if (!initializedYear.current && maxYear !== null) {
      setSelectedYear(String(maxYear));
      onChange({ year: maxYear });
      initializedYear.current = true;
    }
  }, [maxYear, onChange]);
  
  useEffect(() => {
    setSelectedCourseNum(null);
    setCourseNumData(null);
    setSelectedSection(null);
    setSectionData(null);
    onChange({
      deptCode: selectedDeptCode,
      courseNum: null,
      section: null
    });
    if (!selectedDeptCode) return;
    fetchAllExistingCourseNums(selectedDeptCode)
      .then((data) => setCourseNumData(data))
      .catch(() => setCourseNumData([]));
  }, [selectedDeptCode]);

  useEffect(() => {
    setSelectedSection(null);
    setSectionData(null);
    onChange({ deptCode: selectedDeptCode, courseNum: selectedCourseNum , section: null});

    if (!selectedDeptCode || !selectedCourseNum) return;
    fetchAllExistingSections(selectedDeptCode, selectedCourseNum)
      .then((data) => setSectionData(data))
      .catch(() => setSectionData([]));
  }, [selectedDeptCode, selectedCourseNum]);

  useEffect(() => {
     onChange({ deptCode: selectedDeptCode, courseNum: selectedCourseNum , section: selectedSection});
  }, [selectedDeptCode, selectedCourseNum, selectedSection]);

  //Not erased because it's possible we allow coordinators to create more semesters than W1 W2 S1 S2.
  // useEffect(() => {
  //   setSelectedSemester(null);
  //   // setSemesterData(null);

  //   if (
  //     !selectedDeptCode ||
  //     !selectedCourseNum ||
  //     !selectedSection ||
  //     selectedYear === null
  //   )
  //     return;
  //   onChange({ year: selectedYear });
  //   fetchAllExistingSemesters(
  //     selectedDeptCode,
  //     selectedCourseNum,
  //     selectedSection,
  //     selectedYear
  //   )
  //     .then((data) => setSemesterData(data))
  //     .catch(() => setSemesterData([]));
  // }, [selectedDeptCode, selectedCourseNum, selectedSection, selectedYear]);
useEffect(() => {
  onChange({
    year: selectedYear !== null ? Number(selectedYear) : null
  });
}, [selectedYear]);

  useEffect(() => {
    onChange({ semester: selectedSemester });
  }, [selectedSemester]);

  if (allExistingDeptCodesAndYears === null) {
    return <p>Loading departments…</p>;
  }

  return (
    <div className={mode === 'small' ? "grid grid-cols-1 gap-2" : "flex gap-5"}>
      <DeptCodeDropdown
        deptCodes={allExistingDeptCodesAndYears.deptCodes}
        value={selectedDeptCode}
        onChange={setSelectedDeptCode}
        mode={mode} />

      <CourseNumDropdown
        courseNums={courseNumData}
        value={selectedCourseNum}
        onChange={setSelectedCourseNum}
        disabled={!selectedDeptCode}
        mode={mode} />

      <SectionDropdown
        sections={sectionData}
        value={selectedSection}
        onChange={setSelectedSection}
        disabled={!selectedCourseNum}
        mode={mode} />

      <YearDropdown
        years={allExistingDeptCodesAndYears.years}
        value={selectedYear !== null ? String(selectedYear) : null}
        onChange={setSelectedYear}
        mode={mode} />

      <SemesterDropdown
        semesters={semesterData}
        value={selectedSemester}
        onChange={setSelectedSemester}
        mode={mode} />
    </div>
  );
}
