import{ useState, useEffect } from "react";
import DeptCodeDropdown from "../../../ui/deptcodedropdown/DeptCodeDropdown";
import CourseNumDropdown from "../../../ui/coursenumdropdown/CourseNumDropdown";
import SectionDropdown from "../../../ui/sectiondropdown/SectionDropdown";
import YearDropdown from "../../../ui/yeardropdown/YearDropdown";
import SemesterDropdown from "../../../ui/semesterdropdown/SemesterDropdown";

import {
  fetchAllExistingCourseNums,
} from "../../../../api/sectionfilter/fetchAllExistingCourseNums";  
import { fetchAllExistingSemesters } from "../../../../api/sectionfilter/fetchAllExistingSemesters";
import { fetchAllExistingYears } from "../../../../api/sectionfilter/fetchAllExistingYears";
import { fetchAllExistingSections } from "../../../../api/sectionfilter/fetchAllExistingSections";
interface Props {
  allExistingDeptCodes: string[] | null;
}

export default function DeptCodeCourseNumSectionYearSemesterDropdownContainer({
  allExistingDeptCodes,
}: Props) {
  // Selections
  const [selectedDeptCode, setSelectedDeptCode] = useState<string | null>(
    null
  );
  const [selectedCourseNum, setSelectedCourseNum] = useState<number | null>(
    null
  );
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(
    null
  );

  // Option lists
  const [courseNumData, setCourseNumData] = useState<number[] | null>(null);
  const [sectionData, setSectionData] = useState<string[] | null>(null);
  const [yearData, setYearData] = useState<number[] | null>(null);
  const [semesterData, setSemesterData] = useState<string[] | null>(null);

  // 1) Dept → CourseNums
  useEffect(() => {
    // reset downstream
    setSelectedCourseNum(null);
    setCourseNumData(null);
    setSelectedSection(null);
    setSectionData(null);
    setSelectedYear(null);
    setYearData(null);
    setSelectedSemester(null);
    setSemesterData(null);

    if (!selectedDeptCode) return;
    fetchAllExistingCourseNums(selectedDeptCode)
      .then((data) => setCourseNumData(data))
      .catch(() => setCourseNumData([]));
  }, [selectedDeptCode]);

  // 2) CourseNum → Sections
  useEffect(() => {
    setSelectedSection(null);
    setSectionData(null);
    setSelectedYear(null);
    setYearData(null);
    setSelectedSemester(null);
    setSemesterData(null);

    if (!selectedDeptCode || !selectedCourseNum) return;
    fetchAllExistingSections(selectedDeptCode, selectedCourseNum)
      .then((data) => setSectionData(data))
      .catch(() => setSectionData([]));
  }, [selectedDeptCode, selectedCourseNum]);

  // 3) Section → Years
  useEffect(() => {
    setSelectedYear(null);
    setYearData(null);
    setSelectedSemester(null);
    setSemesterData(null);

    if (!selectedDeptCode || !selectedCourseNum || !selectedSection) return;
    fetchAllExistingYears(
      selectedDeptCode,
      selectedCourseNum,
      selectedSection
    )
      .then((data) => setYearData(data))
      .catch(() => setYearData([]));
  }, [selectedDeptCode, selectedCourseNum, selectedSection]);

  // 4) Year → Semesters
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
    fetchAllExistingSemesters(
      selectedDeptCode,
      selectedCourseNum,
      selectedSection,
      selectedYear
    )
      .then((data) => setSemesterData(data))
      .catch(() => setSemesterData([]));
  }, [selectedDeptCode, selectedCourseNum, selectedSection, selectedYear]);

  if (allExistingDeptCodes === null) {
    return <p>Loading departments…</p>;
  }

  return (
    <div className="space-y-4">
      <DeptCodeDropdown deptCodes={allExistingDeptCodes} value={selectedDeptCode} onChange={setSelectedDeptCode} />

      <CourseNumDropdown courseNums={courseNumData} value={selectedCourseNum} onChange={setSelectedCourseNum}/>

      <SectionDropdown sections={sectionData} value={selectedSection} onChange={setSelectedSection} />

      <YearDropdown
        years={yearData}
        value={selectedYear !== null ? String(selectedYear) : null}
        onChange={(v) => setSelectedYear(v !== null ? Number(v) : null)}
      />

      <SemesterDropdown
        semesters={semesterData}
        value={selectedSemester}
        onChange={setSelectedSemester}
      />
    </div>
  );
}
