import React, { useEffect, useState } from "react";
import { fetchStudentAllocationHistory } from "../../../api/allocation/fetchStudentAllocationHistory";
import { fetchSectionSchedule } from "../../../api/section/fetchSectionSchedule";
import { useAuth } from "../../../context/AuthContext";
import type SectionSchedule from "../../../interfaces/section/SectionSchedule";
import { fetchSectionIncludeInstructorId } from "../../../api/section/fetchSectionIncludeInstructorId";
import type { ScheduleRow } from "../../../components/features/scheduleviewer/ScheduleViewer.types";
import { flattenAllocation, getAllocationDate } from "../../../components/features/scheduleviewer/ScheduleUtils";
import ScheduleExport from "../../../components/features/scheduleviewer/ScheduleExport";
import ScheduleCalendar from "../../../components/features/scheduleviewer/ScheduleCalendar";
import ScheduleViewerTable from "../../../components/features/scheduleviewer/ScheduleViewerTable";
import { CalendarX2 } from "lucide-react";
import { fetchExamAssignmentsByStudentId } from "../../../api/exam/fetchExamAssignmentsByStudentId";
import type ExamAssignmentDto from "../../../interfaces/exam/ExamAssignment";
import { fetchExamById } from "../../../api/exam/fetchExamById";
import { fetchCourse } from "../../../api/course/fetchCourse";
import type { ExamDto } from "../../../interfaces/exam/Exam";
import type { Course } from "../../../interfaces/course/Course";
import { fetchSectionInfo } from "../../../api/section/fetchSectionInfo";


const ScheduleViewer: React.FC<{ scheduleRows: ScheduleRow[] }> = ({ scheduleRows }) => {
  // Week selector state
  const getInitialWeekStart = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0,0,0,0);
    return weekStart;
  };
  const [weekOffset, setWeekOffset] = useState(0);
  const getStartOfWeek = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() + weekOffset * 7);
    start.setHours(0,0,0,0);
    return start;
  };
  const getEndOfWeek = (startOfWeek: Date) => {
    const end = new Date(startOfWeek);
    end.setDate(startOfWeek.getDate() + 6);
    end.setHours(23,59,59,999);
    return end;
  };
  const startOfWeek = getStartOfWeek();
  const endOfWeek = getEndOfWeek(startOfWeek);

  // Filter allocations for this week
  const weekAllocs = scheduleRows.filter(a => {
    const d = getAllocationDate(a, startOfWeek);
    return d && d >= startOfWeek && d <= endOfWeek;
  });
  // Completed = status CONFIRMED, Upcoming = not CONFIRMED
  const completed = weekAllocs.filter(a => a.status === 'CONFIRMED');
  const percent = weekAllocs.length === 0 ? 100 : Math.round((completed.length / weekAllocs.length) * 100);

  return (
    <div className="min-h-screen p-4 md:p-8 ">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#040941] mb-8 tracking-tight">
              Schedule - Calendar View
            </h1>
            <ScheduleExport scheduleRows={scheduleRows} />
          </div>
          <ScheduleCalendar scheduleRows={scheduleRows} />
            {/* confirmed allocations list */}
            <div className="mt-8">
              {scheduleRows.length === 0 ? (
                <div className="text-gray-500 text-center text-lg py-8 flex flex-col items-center">
                  <div className="mb-4 flex justify-center ">
                    <CalendarX2 className="w-12 h-12 text-gray-400" />
                  </div>
                  Sit back, relax! No Confirmed Allocations yet.
                </div>
              ) : (
                <ScheduleViewerTable scheduleRows={scheduleRows} startOfWeek={startOfWeek} />
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

const StudentSchedulePage: React.FC = () => {
  const { userId, token } = useAuth();
  const [scheduleRows, setScheduleRows] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!userId || !token) return;
      setLoading(true);

      try {
        const all = await fetchStudentAllocationHistory(Number(userId), token);
        const confirmed = all.filter(a => a.status === "CONFIRMED");
        const allocationsWithSchedule = await Promise.all(
          confirmed.map(async (alloc: any) => {
            if (!alloc.section || typeof alloc.section.id !== "number") {
              return [flattenAllocation(alloc)];
            }
            // Fetch section details including instructorId
            let sectionDetails = null;
            try {
              sectionDetails = await fetchSectionIncludeInstructorId(alloc.section.id);
            } catch (err) {
              console.error("Error fetching section details:", err);
            }
            let sectionSchedule: SectionSchedule[] = [];
            if (sectionDetails && Array.isArray(sectionDetails.sectionSchedule)) {
              sectionSchedule = sectionDetails.sectionSchedule;
            } else {
              try {
                const rawSectionSchedule = await fetchSectionSchedule(alloc.section.id, token);
                sectionSchedule = Array.isArray(rawSectionSchedule)
                  ? rawSectionSchedule
                  : [];
              } catch {
                // no schedule
              }
            }
            // Fetch instructor details using instructorId from sectionDetails
            let instructorName = "N/A";
            if (sectionDetails && sectionDetails.instructor && sectionDetails.instructor.firstName && sectionDetails.instructor.lastName) {
              instructorName = `${sectionDetails.instructor.firstName} ${sectionDetails.instructor.lastName}`;
            } else {
              console.warn("No instructor info found in sectionDetails", sectionDetails);
            }
            // ScheduleRow
            const makeRow = (sch?: { day: string; startTime: string; endTime: string }) => ({
              id: typeof alloc.id === "number" ? alloc.id : 0,
              course: sectionDetails && sectionDetails.course ? `${sectionDetails.course.deptCode} ${sectionDetails.course.courseNum}` : "N/A",
              section: sectionDetails && sectionDetails.section ? sectionDetails.section : "N/A",
              instructor: instructorName,
              day: sch?.day || "",
              startTime: sch?.startTime || "",
              endTime: sch?.endTime || "",
              status: alloc.status ?? "",
              semester: sectionDetails && sectionDetails.semester ? sectionDetails.semester : "N/A",
              year: sectionDetails && typeof sectionDetails.year === "number" ? sectionDetails.year : 0,
              numberOfHours: alloc.numberOfHours ?? 0,
            });
            return sectionSchedule.length > 0
              ? sectionSchedule.map(sch => makeRow({
                  day: sch.day ?? "",
                  startTime: sch.startTime ?? "",
                  endTime: sch.endTime ?? ""
                }))
              : [makeRow()];
          })
        );
        const examAssignments: ExamAssignmentDto[] = await fetchExamAssignmentsByStudentId(Number(userId), token);
        const examRows: ScheduleRow[] = [];
        for (const assign of examAssignments) {
          const exam = await fetchExamById(assign.examId, token);
          if (!exam) continue;
          const sectionInfo = await fetchSectionInfo(exam.sectionId, token);
          const courseLabel = sectionInfo?.course
            ? `${sectionInfo.course.deptCode} ${sectionInfo.course.courseNum}`
            : "Unknown Course";
          const [year, month, dayNum] = assign.date.split("-").map(Number);
          const localDate = new Date(year, month - 1, dayNum);

          examRows.push({
            id: assign.id,
            course: `${courseLabel}: Exam - ${assign.task}`,
            section: sectionInfo?.section ?? "N/A",
            instructor: "N/A",
            day: localDate.toLocaleDateString("en-US", { weekday: "long" }),
            startTime: assign.startTime,
            endTime: assign.endTime,
            status: "CONFIRMED",
            semester: sectionInfo?.semester ?? "Finals",
            year: new Date(assign.date).getFullYear(),
            numberOfHours: 0,
            date: assign.date,
          });
        }

        setScheduleRows([...allocationsWithSchedule.flat(), ...examRows]);

      } catch (err) {
        console.error("Error loading schedule:", err);
        setScheduleRows([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId, token]);

  if (loading) return <div>Loading schedule...</div>;

  return <ScheduleViewer scheduleRows={scheduleRows} />;
};

export default StudentSchedulePage;