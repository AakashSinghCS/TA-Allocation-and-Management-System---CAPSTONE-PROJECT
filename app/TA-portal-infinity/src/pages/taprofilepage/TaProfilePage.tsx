import type Student from '../../interfaces/Student';
import type TermCourse from '../../interfaces/TermCourse';
import formatDateForDisplay from '../../utility/formatdatefordisplay/formatDateForDisplay';

interface Props {
  student: Student;
  termCourse? : TermCourse;
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

//   const {
//     name,
//     deptCode,
//     courseNum,
//     term,
//     section
//   } = termCourse;

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-2xl shadow space-y-4">
        <h2>This is an example page. The interface will be changed later.</h2>
        <h1 className="text-2xl font-bold text-center">
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
        <h2>Currently Taking Courses:</h2>
        <div>
            {termCourse && <ProfileTermCourseRow termCourse = {termCourse}/>}
        </div>
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

function ProfileTermCourseRow({termCourse} :{termCourse: TermCourse}){
    return (
        <div>
            <p>{termCourse.deptCode} {termCourse.courseNum} {termCourse.section}</p>
            <p>{termCourse.name}</p>
            <p>{termCourse.term}</p>
        </div>
    );
}