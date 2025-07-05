import { useState, useEffect } from "react";
import DeptCodeDropdown from "../../../ui/section/deptcodedropdown/DeptCodeDropdown";
import SemesterDropdown from "../../../ui/section/semesterdropdown/SemesterDropdown";

import {
  fetchAllExistingCourseNums,
} from "../../../../api/course/sectionfilter/fetchAllExistingCourseNums";
import { fetchAllExistingSemesters } from "../../../../api/course/sectionfilter/fetchAllExistingSemesters";
import { fetchAllExistingYears } from "../../../../api/course/sectionfilter/fetchAllExistingYears";
import { fetchAllExistingSections } from "../../../../api/course/sectionfilter/fetchAllExistingSections";
import type { DeptCodeCourseNumSectionYearSemesterProps } from "../coursefilter/SectionFilter";
import CourseNumDropdown from "../../../ui/section/coursenumdropdown/CourseNumDropdown";
import SectionDropdown from "../../../ui/section/sectiondropdown/SectionDropdown";
import YearDropdown from "../../../ui/section/yeardropdown/YearDropdown";


interface Props {
  allExistingDeptCodes: string[] | null;
  mode?: string;
  onChange: (val: Partial<DeptCodeCourseNumSectionYearSemesterProps>) => void;
}

export default function DeptCodeCourseNumSectionYearSemesterDropdownContainer({ allExistingDeptCodes, mode, onChange }: Props) {
  const [selectedDeptCode, setSelectedDeptCode] = useState<string | null>(null);
  const [selectedCourseNum, setSelectedCourseNum] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

  const [courseNumData, setCourseNumData] = useState<string[] | null>(null);
  const [sectionData, setSectionData] = useState<string[] | null>(null);
  const [yearData, setYearData] = useState<number[] | null>(null);
  const [semesterData, setSemesterData] = useState<string[] | null>(null);

  useEffect(() => {
    setSelectedCourseNum(null);
    setCourseNumData(null);
    setSelectedSection(null);
    setSectionData(null);
    setSelectedYear(null);
    setYearData(null);
    setSelectedSemester(null);
    setSemesterData(null);

    if (!selectedDeptCode) return;
    onChange({ deptCode: selectedDeptCode })
    fetchAllExistingCourseNums(selectedDeptCode)
      .then((data) => setCourseNumData(data))
      .catch(() => setCourseNumData([]));
  }, [selectedDeptCode]);

  useEffect(() => {
    setSelectedSection(null);
    setSectionData(null);
    setSelectedYear(null);
    setYearData(null);
    setSelectedSemester(null);
    setSemesterData(null);

    if (!selectedDeptCode || !selectedCourseNum) return;
    onChange({ courseNum: selectedCourseNum });
    fetchAllExistingSections(selectedDeptCode, selectedCourseNum)
      .then((data) => setSectionData(data))
      .catch(() => setSectionData([]));
  }, [selectedDeptCode, selectedCourseNum]);

  useEffect(() => {
    setSelectedYear(null);
    setYearData(null);
    setSelectedSemester(null);
    setSemesterData(null);

    if (!selectedDeptCode || !selectedCourseNum || !selectedSection) return;
    onChange({ section: selectedSection });
    fetchAllExistingYears(
      selectedDeptCode,
      selectedCourseNum,
      selectedSection
    )
      .then((data) => setYearData(data))
      .catch(() => setYearData([]));
  }, [selectedDeptCode, selectedCourseNum, selectedSection]);

  useEffect(() => {
    setSelectedSemester(null);
    setSemesterData(null);

    if (
      !selectedDeptCode ||
      !selectedCourseNum ||
      !selectedSection ||
      selectedYear === null
    )
      return;
    onChange({ year: selectedYear });
    fetchAllExistingSemesters(
      selectedDeptCode,
      selectedCourseNum,
      selectedSection,
      selectedYear
    )
      .then((data) => setSemesterData(data))
      .catch(() => setSemesterData([]));
  }, [selectedDeptCode, selectedCourseNum, selectedSection, selectedYear]);

  useEffect(() => {
    if (!selectedSemester) return;
    onChange({ semester: selectedSemester });
  }, [selectedSemester]);

  if (allExistingDeptCodes === null) {
    return <p>Loading departments…</p>;
  }

  return (
    <div className={mode === 'small' ? "grid grid-cols-1 gap-2" : "flex gap-5"}>
      <DeptCodeDropdown
        deptCodes={allExistingDeptCodes}
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
        years={yearData}
        value={selectedYear !== null ? String(selectedYear) : null}
        onChange={(v) => setSelectedYear(v !== null ? Number(v) : null)}
        disabled={!selectedSection}
        mode={mode} />

      <SemesterDropdown
        semesters={semesterData}
        value={selectedSemester}
        onChange={setSelectedSemester}
        disabled={!selectedYear}
        mode={mode} />
    </div>
  );
}
