import type Student from '../../interfaces/Student';
import type TermCourse from '../../interfaces/TermCourse';
import formatDateForDisplay from '../../utility/formatdatefordisplay/formatDateForDisplay';

interface Props {
  student: Student;
  /** optional – page can render even if no course data is passed */
  termCourse?: TermCourse;
}

export default function TaProfilePage({ student, termCourse }: Props) {
  const {
    firstName,
    lastName,
    email,
    studentNumber,
    program,
    enrollmentYear,
    schoolYear,
    createdAt,
  } = student;

  return (
    <div className="max-w-5xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow flex flex-col md:flex-row md:gap-8">
      {/* Right‑hand pane on desktop, top pane on mobile */}
      <section className="space-y-4 order-1 md:order-2 md:w-1/2">
        <h1 className="text-2xl font-bold mb-4 text-center md:text-left">
          {firstName} {lastName}
        </h1>

        <div className="grid gap-2">
          <ProfileRow label="Email" value={email} />
          <ProfileRow label="Student #" value={studentNumber.toString()} />
          <ProfileRow label="Program" value={program} />
          <ProfileRow label="Enrollment Year" value={enrollmentYear.toString()} />
          <ProfileRow label="School Year" value={schoolYear.toString()} />
          <ProfileRow label="Joined" value={formatDateForDisplay(createdAt)} />
        </div>
      </section>

      {/* Left‑hand pane on desktop, bottom pane on mobile */}
      <section className="space-y-4 order-2 md:order-1 md:w-1/2 mt-6 md:mt-0">
        <h2 className="text-xl font-semibold mb-2">Courses</h2>

        {termCourse ? (
          <div className="grid gap-3">
            {[termCourse].map((course) => (
              <div
                key={`${course.deptCode}-${course.courseNum}-${course.section}`}
                className="rounded-lg border border-slate-200 p-4 space-y-1"
              >
                <h3 className="font-medium">{course.name}</h3>
                <p>{`${course.deptCode} ${course.courseNum} ${course.section}`}</p>
                <p className="text-slate-600">{course.term}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-slate-400 italic border border-dashed border-slate-200 rounded-lg">
            No courses to display
          </div>
        )}
      </section>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex justify-between rounded-lg bg-slate-50 px-3 py-1 text-sm">
      <span className="font-medium text-slate-700">{label}:</span>
      <span className="text-slate-900">{value}</span>
    </p>
  );
}
