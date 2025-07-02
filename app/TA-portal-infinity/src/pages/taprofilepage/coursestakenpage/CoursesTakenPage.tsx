import { GenericAPIContainer } from '../../../utility/genericapicontainer/GenericAPIContainer';
import { Link, useParams } from 'react-router-dom';
import StudentTabNav from '../../../components/layout/tabnav/studenttabnav/StudentTabNav';
import type {
  CourseEnrollmentOverview,
  CourseActive,
  CourseEnrollment
} from '../../../interfaces/course/CourseEnrollment';
import { fetchAllStudentEnrollmentOverview } from '../../../api/student/fetchAllStudentCompletedCourses';

export default function CoursesTakenPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const sId = Number(studentId);

  return (
    <div className="mx-auto space-y-6 p-4">
      <StudentTabNav />
      <h2 className="text-xl font-semibold mb-4">Courses Taken</h2>

      <GenericAPIContainer<CourseEnrollmentOverview | null>
        fetchFunction={() => fetchAllStudentEnrollmentOverview(sId)}
        render={overview => {
          if (!overview) return <div>No data.</div>;

          type Row = {
            courseLabel: string;
            status: 'In Progress' | 'Completed';
            semester?: string;
            year?: number;
            grade?: number;
            classAverage: number;
            linkTo?: string;
          };

          // 1) Active courses → "In Progress"
          const activeRows: Row[] = (overview.currentCourses || []).map(
            (c: CourseActive) => ({
              courseLabel: `${c.course.deptCode} ${c.course.courseNum} ${c.section.section} – ${c.course.name}`,
              status: 'In Progress',
              semester: c.section.semester,
              year: c.section.year,
              classAverage: c.classAverage,
              linkTo: `/courses/${c.course.id}` /* adjust as needed */
            })
          );

          // 2) Completed courses → "Completed"
          const completedRows: Row[] = (overview.completedCourses || []).map(
            (c: CourseEnrollment) => ({
              courseLabel: `${c.course.deptCode} ${c.course.courseNum} – ${c.course.name}`,
              status: 'Completed',
              // NOTE: if you need semester/year for completed, you’ll have
              // to have the backend send them in CompletedCourseDto
              classAverage: c.classAverage,
              grade: c.grade,
              linkTo: `/courses/${c.course.id}`
            })
          );

          const rows = [...activeRows, ...completedRows];

          return (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="px-4 py-2 text-left">Course</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Semester</th>
                    <th className="px-4 py-2 text-left">Year</th>
                    <th className="px-4 py-2 text-left">Grade</th>
                    <th className="px-4 py-2 text-left">Class Average</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                    >
                      <td className="px-4 py-2">
                        {r.linkTo ? (
                          <Link
                            to={r.linkTo}
                            className="font-medium whitespace-nowrap hover:text-blue-600"
                          >
                            {r.courseLabel}
                          </Link>
                        ) : (
                          r.courseLabel
                        )}
                      </td>
                      <td className="px-4 py-2">{r.status}</td>
                      <td className="px-4 py-2">{r.semester ?? '-'}</td>
                      <td className="px-4 py-2">{r.year ?? '-'}</td>
                      <td className="px-4 py-2">
                        {r.grade != null ? r.grade : '-'}
                      </td>
                      <td className="px-4 py-2">{r.classAverage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }}
      />

      <div className="w-full">
        <Link to="/user/student/addenrollment">
          <div className="cursor-pointer italic text-slate-500 border border-dashed border-slate-200 rounded-lg p-2">
            Add a course
          </div>
        </Link>
      </div>
    </div>
  );
}
