import type Student from '../../interfaces/Student';
import type TermCourse from '../../interfaces/TermCourse';
import formatDateForDisplay from '../../utility/formatdatefordisplay/formatDateForDisplay';

interface Props {
    student: Student;
    termCourse?: TermCourse;
}

export default function TaProfilePage({ student, termCourse }: Props) {


    return (
        <div className="max-w-7xl mx-auto mt-8 p-6 bg-white rounded-2xl flex flex-col md:flex-row md:gap-8">
            <ProfileSection student={student} className="max-w-xs space-y-4 order-1 md:order-2 md:w-1/3 md:ml-auto" />
            <TermCoursesSection termCourse={termCourse} className="space-y-4 order-2 md:order-1 md:w-2/3 mt-6 md:mt-0" />
            {/*need to do the following:
            - show the times for each of the courses ex: Wed~Fridya 2:30 etc.
            - make the card smaller, or make it into more of a list so that the coordinator doesn't have to scroll.
            - divide Courses into the following: courses currently taking (which is most important), and courses with previous TA-experience
            - MAYBE have a list of all the courses taken, which will be long, can should not be in the form of cards.
            
            - Finally, add the profile questions and answers.
        */}
        </div>
    );
}

function ProfileSection({ student, className = "" }: { student: Student; className?: string }) {
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
        <section className={className}>
            <h1 className="text-3xl font-bold mb-4 text-center md:text-right">
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
    );
}

function TermCoursesSection({ termCourse, className = "" }: { termCourse?: TermCourse; className?: string }) {
    return (
        <section className={className}>
            <h2 className="text-xl font-semibold mb-2">Courses</h2>

            {termCourse ? (
                <div className="grid gap-3">
                    {[termCourse].map((course) => (
                        <TermCourseCard key={termCourseKey(course)} termCourse={course} />
                    ))}
                </div>
            ) : (
                <div className="p-4 text-slate-400 italic border border-dashed border-slate-200 rounded-lg">
                    No courses to display
                </div>
            )}
        </section>
    );
}

function TermCourseCard({ termCourse }: { termCourse: TermCourse }) {
    return (
        <div
            className="rounded-lg border border-slate-200 p-4 space-y-1 bg-slate-50"
        >
            <h3 className="font-medium">{termCourse.name}</h3>
            <p>{`${termCourse.deptCode} ${termCourse.courseNum} ${termCourse.section}`}</p>
            <p className="text-slate-600">{termCourse.term}</p>
        </div>
    );
}

function termCourseKey(termCourse: TermCourse) {
    return `${termCourse.deptCode}-${termCourse.courseNum}-${termCourse.section}`;
}

function ProfileRow({ label, value }: { label: string; value: string }) {
    return (
        <p className="flex justify-between rounded-lg bg-slate-50 px-3 py-1 text-sm">
            <span className="font-medium text-slate-700 mr-1">{label}:</span>
            <span className="text-slate-900"> {value}</span>
        </p>
    );
}
